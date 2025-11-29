<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsultationRequest;
use App\Mail\ConsultationRequestNotification;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\CompanyInfo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function index(): Response
    {
        // Récupérer les créneaux disponibles pour les 60 prochains jours
        $today = Carbon::today()->format('Y-m-d');
        $endDate = Carbon::today()->addDays(60)->format('Y-m-d');

        $slots = AppointmentSlot::whereRaw("DATE(date) >= ?", [$today])
            ->whereRaw("DATE(date) <= ?", [$endDate])
            ->where('is_available', true)
            ->whereColumn('current_bookings', '<', 'max_bookings')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn ($slot) => Carbon::parse($slot->getRawOriginal('date'))->format('Y-m-d'))
            ->map(fn ($daySlots) => $daySlots->map(fn ($slot) => [
                'id' => $slot->id,
                'start_time' => substr((string) $slot->start_time, 0, 5),
                'end_time' => substr((string) $slot->end_time, 0, 5),
            ])->values());

        // Dates avec créneaux disponibles
        $availableDates = $slots->keys()->toArray();

        // Récupérer le prix des rendez-vous
        $company = CompanyInfo::first();
        $appointmentPrice = $company?->appointment_price ?? 0;

        return Inertia::render('Consultation/Index', [
            'availableDates' => $availableDates,
            'slotsByDate' => $slots,
            'appointmentPrice' => (float) $appointmentPrice,
        ]);
    }

    public function getSlotsForDate(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $date = Carbon::parse($request->date);

        $slots = AppointmentSlot::where('date', $date)
            ->where('is_available', true)
            ->whereColumn('current_bookings', '<', 'max_bookings')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($slot) => [
                'id' => $slot->id,
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
            ]);

        return response()->json($slots);
    }

    public function store(StoreConsultationRequest $request): RedirectResponse
    {
        $slot = AppointmentSlot::findOrFail($request->appointment_slot_id);

        // Vérifier que le créneau est toujours disponible
        if (! $slot->isAvailable()) {
            return back()->with('error', 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.');
        }

        // Créer le rendez-vous dans la base de données
        Appointment::create([
            'appointment_slot_id' => $slot->id,
            'guest_name' => $request->name,
            'guest_email' => $request->email,
            'status' => 'pending',
            'notes' => $request->message,
        ]);

        // Incrémenter le compteur de réservations
        $slot->increment('current_bookings');

        // Mettre à jour la disponibilité si nécessaire
        if ($slot->current_bookings >= $slot->max_bookings) {
            $slot->update(['is_available' => false]);
        }

        // Récupérer l'email de l'admin depuis CompanyInfo
        $company = CompanyInfo::first();
        $adminEmail = $company?->email ?? config('mail.from.address');

        // Envoyer l'email à l'admin
        Mail::to($adminEmail)->send(new ConsultationRequestNotification(
            name: $request->name,
            email: $request->email,
            message: $request->message,
            date: Carbon::parse($slot->getRawOriginal('date'))->format('d/m/Y'),
            startTime: substr((string) $slot->start_time, 0, 5),
            endTime: substr((string) $slot->end_time, 0, 5),
        ));

        return back()->with('success', 'Votre demande de consultation a été envoyée avec succès. Nous vous contacterons bientôt.');
    }
}
