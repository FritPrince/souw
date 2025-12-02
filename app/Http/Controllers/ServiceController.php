<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Service::where('is_active', true)
            ->with(['category', 'destinations' => function ($q) {
                $q->where('destinations.is_active', true);
            }]);

        // Filter by destination
        if ($request->has('destination')) {
            $query->whereHas('destinations', function ($q) use ($request) {
                $q->where('destinations.id', $request->destination);
            });
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            });
        }

        $services = $query->paginate(12);

        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get();

        $destinations = Destination::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'destinations' => $destinations,
            'destination' => $request->destination ? Destination::find($request->destination) : null,
            'filters' => [
                'search' => $request->search,
                'destination' => $request->destination,
            ],
            'heroImage' => '/storage/front/images/hero-bg3.jpg',
        ]);
    }

    public function show(Service $service): Response
    {
        $service->load([
            'category',
            'subServices' => fn ($q) => $q->where('sub_services.is_active', true),
            'destinations' => fn ($q) => $q->where('destinations.is_active', true),
            'requiredDocuments',
            'processingTimes',
            'images',
        ]);

        // Load formFields separately to ensure they're serialized (only active fields for client)
        $formFields = \App\Models\ServiceFormField::where('service_id', $service->id)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        // Convert service to array and explicitly add formFields and images
        $serviceArray = $service->toArray();
        $serviceArray['form_fields'] = $formFields->toArray();
        $serviceArray['images'] = $service->images->toArray();

        // Récupérer le prix des rendez-vous
        $company = \App\Models\CompanyInfo::first();
        $appointmentPrice = (float) ($company?->appointment_price ?? 0);

        // Charger les services similaires (même catégorie, excluant le service actuel)
        $relatedServices = Service::where('is_active', true)
            ->where('id', '!=', $service->id)
            ->when($service->category_id, function ($query) use ($service) {
                return $query->where('category_id', $service->category_id);
            })
            ->with(['category', 'destinations' => function ($q) {
                $q->where('destinations.is_active', true);
            }])
            ->limit(8)
            ->get();

        return Inertia::render('Services/Show', [
            'service' => $serviceArray,
            'appointmentPrice' => $appointmentPrice,
            'relatedServices' => $relatedServices,
        ]);
    }

    public function getByCategory(Category $category): Response
    {
        $services = Service::where('is_active', true)
            ->where('category_id', $category->id)
            ->with(['category', 'destinations' => function ($q) {
                $q->where('destinations.is_active', true);
            }])
            ->paginate(12);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => Category::where('is_active', true)->orderBy('order')->get(),
            'destinations' => Destination::where('is_active', true)->orderBy('name')->get(),
            'category' => $category,
            'filters' => [
                'category' => $category->id,
            ],
        ]);
    }

    public function getByDestination(Destination $destination): Response
    {
        $services = $destination->services()
            ->where('services.is_active', true)
            ->with(['category', 'destinations' => function ($q) {
                $q->where('destinations.is_active', true);
            }])
            ->paginate(12);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => Category::where('is_active', true)->orderBy('order')->get(),
            'destinations' => Destination::where('is_active', true)->orderBy('name')->get(),
            'destination' => $destination,
            'filters' => [
                'destination' => $destination->id,
            ],
        ]);
    }

    public function getSubServices(Service $service)
    {
        $subServices = $service->subServices()
            ->where('is_active', true)
            ->get();

        return response()->json($subServices);
    }

    public function getRequiredDocuments(Service $service)
    {
        $documents = $service->requiredDocuments()->get();

        return response()->json($documents);
    }

    public function getProcessingTimes(Service $service)
    {
        $processingTimes = $service->processingTimes()->get();

        return response()->json($processingTimes);
    }
}
