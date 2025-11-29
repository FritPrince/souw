<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookAppointmentRequest;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\CompanyInfo;
use App\Models\EventRegistration;
use App\Models\Order;
use App\Models\Service;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(
        protected AppointmentService $appointmentService
    ) {
    }

    public function index(): Response
    {
        $appointments = Appointment::where('user_id', Auth::id())
            ->with(['appointmentSlot', 'service', 'order'])
            ->latest()
            ->paginate(10);

        $eventRegistrations = EventRegistration::where('user_id', Auth::id())
            ->with(['event', 'pack'])
            ->latest()
            ->get();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'eventRegistrations' => $eventRegistrations,
        ]);
    }

    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'service_id' => ['nullable', 'exists:services,id'],
        ]);

        $date = Carbon::parse($request->date);
        $service = $request->service_id ? Service::findOrFail($request->service_id) : null;

        if ($service && ! $service->requires_appointment) {
            return response()->json(['message' => 'Ce service ne nécessite pas de rendez-vous.'], 400);
        }

        $slots = $this->appointmentService->getAvailableSlots($date, $service);

        return response()->json($slots->values());
    }

    public function book(Request $request): Response|RedirectResponse
    {
        $request->validate([
            'service_id' => ['required', 'exists:services,id'],
        ]);

        $service = Service::with(['category', 'subServices', 'processingTimes', 'destinations'])
            ->findOrFail($request->service_id);

        if (! $service->requires_appointment) {
            return redirect()->route('services.show', $service)
                ->with('error', 'Ce service ne nécessite pas de rendez-vous.');
        }

        // Récupérer les créneaux disponibles pour les 60 prochains jours
        $today = Carbon::today();
        $availableDates = [];
        $slotsByDate = [];

        for ($i = 0; $i < 60; $i++) {
            $date = $today->copy()->addDays($i);
            $slots = $this->appointmentService->getAvailableSlots($date, $service);
            if ($slots->isNotEmpty()) {
                $dateKey = $date->format('Y-m-d');
                $availableDates[] = $dateKey;
                $slotsByDate[$dateKey] = $slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'start_time' => $slot->start_time,
                            'end_time' => $slot->end_time,
                            'available' => $slot->isAvailable(),
                        ];
                })->values()->toArray();
            }
        }

        // Récupérer le prix des rendez-vous
        $company = CompanyInfo::first();
        $appointmentPrice = (float) ($company?->appointment_price ?? 0);

        return Inertia::render('Services/BookAppointment', [
            'service' => $service,
            'availableDates' => $availableDates,
            'slotsByDate' => $slotsByDate,
            'appointmentPrice' => $appointmentPrice,
        ]);
    }

    public function store(BookAppointmentRequest $request): RedirectResponse
    {
        try {
            $user = Auth::user();
            $slot = AppointmentSlot::findOrFail($request->appointment_slot_id);

            if (! $slot->isAvailable()) {
                return back()->with('error', 'Ce créneau n\'est plus disponible.');
            }

            $service = Service::findOrFail($request->service_id);

            // Récupérer le prix des rendez-vous depuis les paramètres de l'entreprise
            $company = CompanyInfo::first();
            $appointmentPrice = (float) ($company?->appointment_price ?? 0);
            
            // Utiliser le mode de tarification du service
            $pricingMode = $service->appointment_pricing_mode ?? 'service_plus_appointment';

            // Calculer le prix total selon le mode de tarification du service
            if ($pricingMode === 'appointment_only') {
                // Mode: Prix du rendez-vous uniquement (frais de service non facturés)
                $totalAmount = $appointmentPrice;
            } else {
                // Mode: Prix du service + Prix du rendez-vous
            $totalAmount = $service->price;

            // Calcul du prix selon la destination si spécifiée
            if ($request->destination_id) {
                $destinationPrice = $service->destinations()
                    ->where('destinations.id', $request->destination_id)
                    ->first()?->pivot->price_override;

                if ($destinationPrice) {
                    $totalAmount = $destinationPrice;
                }
            }

            // Calcul du prix selon le sous-service si spécifié
            if ($request->sub_service_id) {
                $subService = \App\Models\SubService::findOrFail($request->sub_service_id);
                $totalAmount = $subService->price;
            }

            // Calcul du prix selon le délai de traitement si spécifié
            if ($request->processing_time_id) {
                $processingTime = \App\Models\ServiceProcessingTime::findOrFail($request->processing_time_id);
                $totalAmount *= $processingTime->price_multiplier;
                }

                // Ajouter le prix du rendez-vous
                $totalAmount += $appointmentPrice;
            }

            // Créer la commande si elle n'existe pas
            $order = $request->order_id ? Order::find($request->order_id) : null;

            if (! $order) {
                $order = Order::create([
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                    'sub_service_id' => $request->sub_service_id,
                    'destination_id' => $request->destination_id,
                    'order_number' => 'ORD-'.Str::upper(Str::random(8)),
                    'status' => 'pending',
                    'total_amount' => $totalAmount,
                    'payment_status' => 'pending',
                    'notes' => $request->notes,
                ]);
            }

            // Créer le rendez-vous
            $appointment = $this->appointmentService->bookSlot(
                $user,
                $slot,
                $order,
                $service,
                $request->notes
            );

            // Rediriger vers le paiement
            return redirect()->route('orders.show', $order)
                ->with('success', 'Rendez-vous réservé avec succès. Veuillez procéder au paiement.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Appointment $appointment): Response
    {
        if ($appointment->user_id !== Auth::id()) {
            abort(403);
        }

        $appointment->load(['appointmentSlot', 'service', 'order', 'user']);

        return Inertia::render('Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        if ($appointment->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $this->appointmentService->cancelAppointment($appointment, 'Annulé par l\'utilisateur');

            return back()->with('success', 'Rendez-vous annulé avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
