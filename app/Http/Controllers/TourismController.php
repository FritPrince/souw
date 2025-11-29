<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookTourismPackageRequest;
use App\Models\TourismBooking;
use App\Models\TourismPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TourismController extends Controller
{
    public function index(): Response
    {
        $packages = TourismPackage::where('is_active', true)
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('Tourism/Index', [
            'packages' => $packages,
            'heroImage' => '/storage/front/images/hero-bg5.jpg',
        ]);
    }

    public function show(string $slug): Response
    {
        $package = TourismPackage::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Tourism/Show', [
            'package' => $package,
        ]);
    }

    public function book(BookTourismPackageRequest $request): RedirectResponse
    {
        $package = TourismPackage::findOrFail($request->tourism_package_id);

        $booking = TourismBooking::create([
            'user_id' => Auth::id(),
            'tourism_package_id' => $package->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'number_of_people' => $request->number_of_people,
            'total_amount' => $package->price * $request->number_of_people,
            'status' => 'pending',
        ]);

        return redirect()->route('tourism.my-bookings')
            ->with('success', 'Réservation créée avec succès. Vous recevrez une confirmation par email.');
    }

    public function myBookings(): Response
    {
        $bookings = TourismBooking::where('user_id', Auth::id())
            ->with('tourismPackage')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Tourism/MyBookings', [
            'bookings' => $bookings,
        ]);
    }
}
