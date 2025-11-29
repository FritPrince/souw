<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPack;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminEventController extends Controller
{
    public function index(): Response
    {
        $events = Event::withCount(['packs', 'registrations'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Events/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        // Normalize boolean values from FormData
        $request->merge([
            'is_active' => filter_var($request->input('is_active', false), FILTER_VALIDATE_BOOLEAN),
            'is_featured' => filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:events,slug'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'max:4096'],
            'location' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'packs' => ['nullable', 'string'],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image_path'] = '/storage/'.$path;
        }

        unset($validated['image'], $validated['packs']);

        $event = Event::create($validated);

        // Create packs
        if ($request->has('packs')) {
            $packs = $request->input('packs', []);
            if (is_string($packs)) {
                $packs = json_decode($packs, true) ?? [];
            }

            foreach ($packs as $index => $packData) {
                if (! empty($packData['name'])) {
                    $event->packs()->create([
                        'name' => $packData['name'],
                        'slug' => Str::slug($packData['name']),
                        'description' => $packData['description'] ?? null,
                        'features' => $packData['features'] ?? [],
                        'price' => $packData['price'] ?? 0,
                        'max_participants' => $packData['max_participants'] ?? null,
                        'is_active' => $packData['is_active'] ?? true,
                        'order' => $index,
                    ]);
                }
            }
        }

        return redirect()->route('admin.events.index')
            ->with('success', 'Événement créé avec succès.');
    }

    public function edit(Event $event): Response
    {
        $event->load(['packs' => function ($query) {
            $query->withCount('registrations')->orderBy('order');
        }]);

        return Inertia::render('Admin/Events/Edit', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        // Normalize boolean values from FormData
        $request->merge([
            'is_active' => filter_var($request->input('is_active', false), FILTER_VALIDATE_BOOLEAN),
            'is_featured' => filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:events,slug,'.$event->id],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'max:4096'],
            'location' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'packs' => ['nullable', 'string'],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($event->image_path) {
                $oldPath = str_replace('/storage/', '', $event->image_path);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('events', 'public');
            $validated['image_path'] = '/storage/'.$path;
        }

        unset($validated['image'], $validated['packs']);

        $event->update($validated);

        // Update packs
        if ($request->has('packs')) {
            $packs = $request->input('packs', []);
            if (is_string($packs)) {
                $packs = json_decode($packs, true) ?? [];
            }

            $existingPackIds = [];

            foreach ($packs as $index => $packData) {
                if (! empty($packData['name'])) {
                    $packAttributes = [
                        'name' => $packData['name'],
                        'slug' => Str::slug($packData['name']),
                        'description' => $packData['description'] ?? null,
                        'features' => $packData['features'] ?? [],
                        'price' => $packData['price'] ?? 0,
                        'max_participants' => $packData['max_participants'] ?? null,
                        'is_active' => $packData['is_active'] ?? true,
                        'order' => $index,
                    ];

                    if (! empty($packData['id'])) {
                        $pack = EventPack::find($packData['id']);
                        if ($pack && $pack->event_id === $event->id) {
                            $pack->update($packAttributes);
                            $existingPackIds[] = $pack->id;
                        }
                    } else {
                        $pack = $event->packs()->create($packAttributes);
                        $existingPackIds[] = $pack->id;
                    }
                }
            }

            // Delete removed packs (only if they have no registrations)
            $event->packs()
                ->whereNotIn('id', $existingPackIds)
                ->whereDoesntHave('registrations')
                ->delete();
        }

        return redirect()->route('admin.events.index')
            ->with('success', 'Événement mis à jour avec succès.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        // Check if event has registrations
        if ($event->registrations()->exists()) {
            return back()->with('error', 'Impossible de supprimer un événement avec des inscriptions.');
        }

        // Delete image
        if ($event->image_path) {
            $path = str_replace('/storage/', '', $event->image_path);
            Storage::disk('public')->delete($path);
        }

        $event->delete();

        return redirect()->route('admin.events.index')
            ->with('success', 'Événement supprimé avec succès.');
    }

    public function registrations(Event $event): Response
    {
        $registrations = $event->registrations()
            ->with('pack')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Events/Registrations', [
            'event' => $event,
            'registrations' => $registrations,
        ]);
    }

    public function updateRegistrationStatus(Request $request, Event $event, $registration): RedirectResponse
    {
        $registration = $event->registrations()->findOrFail($registration);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled,completed'],
        ]);

        $registration->update($validated);

        return back()->with('success', 'Statut mis à jour avec succès.');
    }
}

