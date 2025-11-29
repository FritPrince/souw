<?php

namespace App\Http\Controllers;

use App\Mail\EventRegistrationNotification;
use App\Models\CompanyInfo;
use App\Models\Event;
use App\Models\EventPack;
use App\Models\EventRegistration;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::where('is_active', true)
            ->withCount('activePacks')
            ->orderBy('is_featured', 'desc')
            ->orderBy('start_date', 'asc')
            ->paginate(12);

        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'testimonials' => $testimonials,
            'heroImage' => '/storage/front/images/hero-bg6.jpg',
        ]);
    }

    public function show(Event $event): Response
    {
        if (! $event->is_active) {
            abort(404);
        }

        $event->load('activePacks');

        return Inertia::render('Events/Show', [
            'event' => $event,
        ]);
    }

    public function getPacks(Event $event): JsonResponse
    {
        $packs = $event->activePacks()
            ->get()
            ->map(function ($pack) {
                return [
                    'id' => $pack->id,
                    'name' => $pack->name,
                    'description' => $pack->description,
                    'features' => $pack->features,
                    'price' => $pack->price,
                    'currency' => $pack->currency,
                    'is_available' => $pack->isAvailable(),
                    'remaining_spots' => $pack->remainingSpots(),
                ];
            });

        return response()->json($packs);
    }

    public function register(Request $request, Event $event): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'event_pack_id' => ['required', 'exists:event_packs,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'birth_place' => ['required', 'string', 'max:255'],
            'birth_country' => ['required', 'string', 'max:255'],
            'nationality' => ['required', 'string', 'max:255'],
            'profession' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'residence_country' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        $pack = EventPack::findOrFail($validated['event_pack_id']);

        // Vérifier que le pack appartient à cet événement
        if ($pack->event_id !== $event->id) {
            return back()->with('error', 'Pack invalide pour cet événement.');
        }

        // Vérifier la disponibilité
        if (! $pack->isAvailable()) {
            return back()->with('error', 'Ce pack n\'est plus disponible.');
        }

        // Créer l'inscription
        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'event_pack_id' => $pack->id,
            'user_id' => auth()->id(),
            ...$validated,
        ]);

        // Incrémenter le compteur de participants
        $pack->increment('current_participants');

        // Envoyer l'email à l'admin
        try {
            $adminEmail = CompanyInfo::first()?->email;
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new EventRegistrationNotification($registration));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send event registration email', [
                'registration_id' => $registration->id,
                'error' => $e->getMessage(),
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Inscription enregistrée avec succès !',
                'reference' => $registration->reference,
            ]);
        }

        return back()->with('success', 'Inscription enregistrée avec succès ! Votre référence : '.$registration->reference);
    }
}

