<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAppointmentSlotRequest;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Appointment::with(['appointmentSlot', 'service', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereHas('appointmentSlot', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        $appointments = $query->latest()->paginate(20);

        // S'assurer que les données sont correctement formatées pour Inertia
        $formattedAppointments = $appointments->getCollection()->map(function ($appointment) {
            $formatted = [
                'id' => $appointment->id,
                'status' => $appointment->status,
                'notes' => $appointment->notes,
                'created_at' => $appointment->created_at?->toISOString(),
                'guest_name' => $appointment->guest_name,
                'guest_email' => $appointment->guest_email,
                'user' => $appointment->user ? [
                    'id' => $appointment->user->id,
                    'name' => $appointment->user->name,
                    'email' => $appointment->user->email,
                ] : null,
                'service' => $appointment->service ? [
                    'id' => $appointment->service->id,
                    'name' => $appointment->service->name,
                ] : null,
                'appointmentSlot' => null,
            ];

            if ($appointment->appointmentSlot) {
                $slot = $appointment->appointmentSlot;
                $date = $slot->date;
                
                // Formater la date
                if ($date instanceof \DateTime || $date instanceof \Carbon\Carbon) {
                    $formattedDate = $date->format('Y-m-d');
                } elseif (is_string($date)) {
                    try {
                        $carbonDate = \Carbon\Carbon::parse($date);
                        $formattedDate = $carbonDate->format('Y-m-d');
                    } catch (\Exception $e) {
                        $formattedDate = $date;
                    }
                } else {
                    $formattedDate = (string) $date;
                }
                
                // Formater les heures
                $startTime = $slot->start_time ? (string) $slot->start_time : '';
                $endTime = $slot->end_time ? (string) $slot->end_time : '';
                
                if (strlen($startTime) > 5) {
                    $startTime = substr($startTime, 0, 5);
                }
                if (strlen($endTime) > 5) {
                    $endTime = substr($endTime, 0, 5);
                }

                $formatted['appointmentSlot'] = [
                    'id' => $slot->id,
                    'date' => $formattedDate,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ];
            }

            return $formatted;
        });

        // Remplacer la collection dans la pagination
        $appointments->setCollection(collect($formattedAppointments));

        return Inertia::render('Admin/Appointments/Index', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'date']),
        ]);
    }

    public function createSlot(CreateAppointmentSlotRequest $request): RedirectResponse
    {
        AppointmentSlot::create($request->validated());

        return back()->with('success', 'Créneau créé avec succès.');
    }

    public function updateSlot(Request $request, AppointmentSlot $appointmentSlot): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'max_bookings' => ['required', 'integer', 'min:1'],
            'is_available' => ['boolean'],
        ]);

        $appointmentSlot->update($validated);

        return back()->with('success', 'Créneau mis à jour avec succès.');
    }

    public function destroySlot(AppointmentSlot $appointmentSlot): RedirectResponse
    {
        // Vérifier s'il y a des rendez-vous associés
        if ($appointmentSlot->appointments()->exists()) {
            return back()->with('error', 'Impossible de supprimer ce créneau car il a des rendez-vous associés.');
        }

        $appointmentSlot->delete();

        return back()->with('success', 'Créneau supprimé avec succès.');
    }

    public function clearSlots(): RedirectResponse
    {
        // Supprimer uniquement les créneaux sans rendez-vous
        $deletedCount = AppointmentSlot::doesntHave('appointments')->delete();

        return back()->with('success', "{$deletedCount} créneau(x) supprimé(s) avec succès.");
    }

    public function confirm(Appointment $appointment): RedirectResponse
    {
        $appointment->update(['status' => 'confirmed']);

        // Déclencher l'événement de confirmation
        event(new \App\Events\AppointmentConfirmed($appointment));

        return back()->with('success', 'Rendez-vous confirmé.');
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        $appointment->update(['status' => 'cancelled']);

        // Réduire le compteur
        $slot = $appointment->appointmentSlot;
        $slot->decrement('current_bookings');
        if ($slot->current_bookings < $slot->max_bookings) {
            $slot->update(['is_available' => true]);
        }

        return back()->with('success', 'Rendez-vous annulé.');
    }

    public function slots(Request $request): Response
    {
        $query = AppointmentSlot::query();

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }

        $slots = $query->orderBy('date')->orderBy('start_time')->paginate(30);

        // Formater les données pour le frontend
        $slots->getCollection()->transform(function ($slot) {
            return [
                'id' => $slot->id,
                'date' => $slot->date->format('Y-m-d'),
                'start_time' => substr((string) $slot->start_time, 0, 5),
                'end_time' => substr((string) $slot->end_time, 0, 5),
                'is_available' => $slot->is_available,
                'max_bookings' => $slot->max_bookings,
                'current_bookings' => $slot->current_bookings,
                'created_at' => $slot->created_at?->toISOString(),
            ];
        });

        return Inertia::render('Admin/Appointments/Slots', [
            'slots' => $slots,
            'filters' => $request->only(['date']),
        ]);
    }
}
