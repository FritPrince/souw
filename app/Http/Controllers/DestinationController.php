<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DestinationController extends Controller
{
    public function index(): Response
    {
        $destinations = Destination::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Destinations/Index', [
            'destinations' => $destinations,
            'heroImage' => '/storage/front/images/hero-bg4.jpg',
        ]);
    }

    public function show(Destination $destination): Response
    {
        $destination->load(['services' => fn ($q) => $q->where('services.is_active', true)->with('category')]);

        return Inertia::render('Destinations/Show', [
            'destination' => $destination,
        ]);
    }

    public function getServices(Destination $destination)
    {
        $services = $destination->services()
            ->where('services.is_active', true)
            ->with('category')
            ->get();

        return response()->json($services);
    }
}