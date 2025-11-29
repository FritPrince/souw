<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CompanyInfo;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        $company = CompanyInfo::first();

        // Récupérer quelques services actifs pour la section "Nos accompagnements"
        $services = Service::where('is_active', true)
            ->with(['category', 'destinations' => function ($q) {
                $q->where('destinations.is_active', true);
            }])
            ->has('category')
            ->orderBy('name')
            ->limit(6)
            ->get();

        return Inertia::render('About/Index', [
            'company' => $company ? [
                'name' => $company->name,
            ] : null,
            'heroImage' => $company?->hero_image_path ?? '/storage/front/images/hero-bg2.jpg',
            'illustrationImage' => $company?->info_section1_image,
            'ctaBackgroundImage' => $company?->info_section2_image,
            'services' => $services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'price' => $service->price,
                    'image_path' => $service->image_path,
                    'video_path' => $service->video_path,
                    'media_type' => $service->media_type,
                    'category' => $service->category ? [
                        'name' => $service->category->name,
                        'icon' => $service->category->icon,
                    ] : null,
                    'destinations' => $service->destinations->map(function ($destination) {
                        return [
                            'id' => $destination->id,
                            'name' => $destination->name,
                            'flag_emoji' => $destination->flag_emoji,
                        ];
                    })->values()->all(),
                ];
            })->values()->all(),
        ]);
    }
}
