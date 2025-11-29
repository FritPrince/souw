<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourismPackageRequest;
use App\Http\Requests\UpdateTourismPackageRequest;
use App\Http\Requests\UpdateTourismBookingStatusRequest;
use App\Models\TourismBooking;
use App\Models\TourismPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminTourismController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TourismPackage::query();

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            });
        }

        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $packages = $query->latest()->paginate(20);

        return Inertia::render('Admin/Tourism/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Tourism/Packages/Create');
    }

    public function store(StoreTourismPackageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tourism', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        TourismPackage::create($data);

        return redirect()->route('admin.tourism.packages.index')
            ->with('success', 'Package touristique créé avec succès.');
    }

    public function edit(TourismPackage $package): Response
    {
        return Inertia::render('Admin/Tourism/Packages/Edit', [
            'package' => $package,
        ]);
    }

    public function update(UpdateTourismPackageRequest $request, TourismPackage $package): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if (! empty($package->image_path)) {
                $old = str_replace('/storage/', '', $package->image_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('image')->store('tourism', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        // Only update fields that are present in validated data
        if (! empty($data)) {
            $package->update($data);
        }

        return redirect()->route('admin.tourism.packages.index')
            ->with('success', 'Package touristique mis à jour avec succès.');
    }

    public function destroy(TourismPackage $package): RedirectResponse
    {
        $package->delete();

        return redirect()->route('admin.tourism.packages.index')
            ->with('success', 'Package touristique supprimé avec succès.');
    }

    public function bookings(Request $request): Response
    {
        $query = TourismBooking::with(['tourismPackage', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%'.$request->search.'%')
                        ->orWhere('email', 'like', '%'.$request->search.'%');
                })
                    ->orWhereHas('tourismPackage', function ($q) use ($request) {
                        $q->where('name', 'like', '%'.$request->search.'%');
                    });
            });
        }

        $bookings = $query->latest()->paginate(20);

        return Inertia::render('Admin/Tourism/Bookings', [
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function updateBookingStatus(UpdateTourismBookingStatusRequest $request, TourismBooking $booking): RedirectResponse
    {
        $booking->update([
            'status' => $request->validated()['status'],
        ]);

        return back()->with('success', 'Statut de la réservation mis à jour.');
    }

    public function destroyBooking(TourismBooking $booking): RedirectResponse
    {
        if ($booking->status !== 'completed') {
            return back()->with('error', 'Seules les réservations terminées peuvent être supprimées.');
        }

        $booking->delete();

        return back()->with('success', 'Réservation supprimée avec succès.');
    }
}
