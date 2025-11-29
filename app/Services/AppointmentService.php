<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AppointmentService
{
    public function getAvailableSlots(?Carbon $date = null, ?Service $service = null): Collection
    {
        $date = $date ?? Carbon::today();

        if ($service) {
            // Filtrer par service si nécessaire (peut être utilisé pour des créneaux spécifiques)
            // Pour l'instant, tous les créneaux sont disponibles pour tous les services
        }

        $slots = $this->availableSlotsQuery($date)->get();

        if ($slots->isEmpty() && ! $this->slotsExistForDate($date)) {
            $this->generateSlotsForDate($date);
            $slots = $this->availableSlotsQuery($date)->get();
        }

        return $slots->filter(fn (AppointmentSlot $slot) => $slot->isAvailable());
    }

    public function bookSlot(User $user, AppointmentSlot $slot, ?Order $order = null, ?Service $service = null, ?string $notes = null): Appointment
    {
        if (! $slot->isAvailable()) {
            throw new \Exception('Ce créneau n\'est plus disponible.');
        }

        // Vérifier si l'utilisateur a déjà un rendez-vous à cette date/heure
        $existingAppointment = Appointment::where('user_id', $user->id)
            ->where('appointment_slot_id', $slot->id)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->first();

        if ($existingAppointment) {
            throw new \Exception('Vous avez déjà un rendez-vous à ce créneau.');
        }

        // Créer le rendez-vous
        $appointment = Appointment::create([
            'user_id' => $user->id,
            'appointment_slot_id' => $slot->id,
            'order_id' => $order?->id,
            'service_id' => $service?->id ?? $order?->service_id,
            'status' => 'scheduled',
            'notes' => $notes,
        ]);

        // Incrémenter le compteur de réservations
        $slot->incrementBookings();

        Log::info('Appointment booked', [
            'appointment_id' => $appointment->id,
            'user_id' => $user->id,
            'slot_id' => $slot->id,
        ]);

        return $appointment;
    }

    public function cancelAppointment(Appointment $appointment, ?string $reason = null): bool
    {
        if (! in_array($appointment->status, ['scheduled', 'confirmed'])) {
            throw new \Exception('Ce rendez-vous ne peut pas être annulé.');
        }

        $appointment->update([
            'status' => 'cancelled',
            'notes' => $appointment->notes ? ($appointment->notes."\n\nAnnulé: ".$reason) : "Annulé: {$reason}",
        ]);

        // Décrémenter le compteur de réservations
        if ($appointment->appointmentSlot) {
            $appointment->appointmentSlot->decrementBookings();
        }

        Log::info('Appointment cancelled', [
            'appointment_id' => $appointment->id,
            'reason' => $reason,
        ]);

        return true;
    }

    public function sendReminder(Appointment $appointment, ?int $hoursBefore = null): bool
    {
        if (! in_array($appointment->status, ['scheduled', 'confirmed'])) {
            return false; // Rendez-vous annulé ou terminé
        }

        // Vérifier si le rappel a déjà été envoyé pour cette heure spécifique
        // On permet d'envoyer plusieurs rappels (24h et 2h avant) mais pas le même rappel deux fois
        if ($appointment->reminder_sent_at && $hoursBefore) {
            $slot = $appointment->appointmentSlot;
            $appointmentDateTime = Carbon::parse($slot->date->format('Y-m-d').' '.$slot->start_time->format('H:i:s'));
            $lastReminderTime = Carbon::parse($appointment->reminder_sent_at);
            $hoursSinceLastReminder = $lastReminderTime->diffInHours($appointmentDateTime, false);

            // Si le dernier rappel était pour la même heure, ne pas renvoyer
            if (abs($hoursSinceLastReminder - $hoursBefore) < 2) {
                return false;
            }
        }

        // Envoyer la notification de rappel
        $appointment->user->notify(
            new \App\Notifications\AppointmentReminderNotification($appointment)
        );

        // Marquer comme envoyé (mettre à jour même si déjà envoyé pour permettre plusieurs rappels)
        $appointment->update([
            'reminder_sent_at' => now(),
        ]);

        Log::info('Appointment reminder sent', [
            'appointment_id' => $appointment->id,
            'hours_before' => $hoursBefore,
        ]);

        return true;
    }

    public function generateSlotsForDate(Carbon $date, ?array $timeSlots = null): int
    {
        $config = config('appointments');
        $timeSlots = $timeSlots ?? $this->getDefaultTimeSlots();

        // Vérifier si c'est un jour fermé
        $dayName = strtolower($date->format('l'));
        if (in_array($dayName, $config['closed_days'])) {
            return 0;
        }

        // Vérifier si c'est un jour férié
        $dateString = $date->format('Y-m-d');
        if (isset($config['holidays'][$dateString])) {
            return 0;
        }

        $generated = 0;
        $maxBookings = $config['max_bookings_per_slot'] ?? 1;

        foreach ($timeSlots as $timeSlot) {
            $startTime = Carbon::parse($date->format('Y-m-d').' '.$timeSlot['start']);
            $endTime = Carbon::parse($date->format('Y-m-d').' '.$timeSlot['end']);

            // Vérifier si le créneau existe déjà
            $existing = AppointmentSlot::where('date', $date->format('Y-m-d'))
                ->whereTime('start_time', $timeSlot['start'])
                ->whereTime('end_time', $timeSlot['end'])
                ->first();

            if (! $existing) {
                AppointmentSlot::create([
                    'date' => $date->toDateString(),
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'is_available' => true,
                    'max_bookings' => $maxBookings,
                    'current_bookings' => 0,
                ]);
                $generated++;
            }
        }

        return $generated;
    }

    protected function getDefaultTimeSlots(): array
    {
        $config = config('appointments');
        $workHours = $config['default_work_hours'];
        $duration = $config['slot_duration_minutes'] ?? 30;

        $slots = [];
        $start = Carbon::parse($workHours['start']);
        $end = Carbon::parse($workHours['end']);
        $lunchStart = Carbon::parse($workHours['lunch_break_start'] ?? '12:00');
        $lunchEnd = Carbon::parse($workHours['lunch_break_end'] ?? '13:00');

        $current = $start->copy();

        while ($current->copy()->addMinutes($duration)->lte($end)) {
            $slotEnd = $current->copy()->addMinutes($duration);

            // Ignorer les créneaux pendant la pause déjeuner
            if (! ($current->lt($lunchEnd) && $slotEnd->gt($lunchStart))) {
                $slots[] = [
                    'start' => $current->format('H:i'),
                    'end' => $slotEnd->format('H:i'),
                ];
            }

            $current->addMinutes($duration);
        }

        return $slots;
    }

    public function generateRecurringSlots(?int $daysAhead = null): int
    {
        $config = config('appointments');
        $daysAhead = $daysAhead ?? $config['recurring_slots']['generate_days_ahead'] ?? 30;

        if (! ($config['recurring_slots']['enabled'] ?? true)) {
            return 0;
        }

        $totalGenerated = 0;
        $startDate = Carbon::today();
        $endDate = $startDate->copy()->addDays($daysAhead);

        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $generated = $this->generateSlotsForDate($currentDate);
            $totalGenerated += $generated;
            $currentDate->addDay();
        }

        return $totalGenerated;
    }

    protected function availableSlotsQuery(Carbon $date): Builder
    {
        return AppointmentSlot::whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
            ->where('is_available', true)
            ->whereColumn('current_bookings', '<', 'max_bookings')
            ->orderBy('start_time');
    }

    protected function slotsExistForDate(Carbon $date): bool
    {
        return AppointmentSlot::whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])->exists();
    }
}
