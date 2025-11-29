<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Models\Destination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminDestinationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Destinations/Index', [
            'destinations' => Destination::query()->orderBy('name')->paginate(20),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Destinations/Create');
    }

    public function store(StoreDestinationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        Destination::create($data);

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination créée avec succès.');
    }

    public function edit(Destination $destination): Response
    {
        return Inertia::render('Admin/Destinations/Edit', [
            'destination' => $destination,
        ]);
    }

    public function update(UpdateDestinationRequest $request, Destination $destination): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if (! empty($destination->image_path)) {
                $old = str_replace('/storage/', '', $destination->image_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('image')->store('destinations', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        // Only update fields that are present in validated data
        if (! empty($data)) {
            $destination->update($data);
        }

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination mise à jour avec succès.');
    }

    public function destroy(Destination $destination): RedirectResponse
    {
        $destination->delete();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination supprimée avec succès.');
    }

    public function clear(): RedirectResponse
    {
        Destination::query()->delete();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Toutes les destinations ont été supprimées.');
    }
}