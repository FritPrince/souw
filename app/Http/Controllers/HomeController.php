<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CompanyInfo;
use App\Models\Destination;
use App\Models\Event;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $companyInfo = CompanyInfo::first();

        return Inertia::render('Home', [
            'featuredServices' => Service::with(['category'])
                ->where('is_active', true)
                ->latest()
                ->limit(6)
                ->get(),
            'featuredDestinations' => Destination::where('is_active', true)
                ->latest()
                ->limit(8)
                ->get(),
            'categories' => Category::where('is_active', true)
                ->orderBy('order')
                ->get(),
            'heroMedia' => $companyInfo ? [
                'image_path' => $companyInfo->hero_image_path ?? '/storage/front/images/hero-bg.jpg',
                'video_path' => $companyInfo->hero_video_path,
                'media_type' => $companyInfo->hero_media_type ?? 'image',
            ] : [
                'image_path' => '/storage/front/images/hero-bg.jpg',
                'video_path' => null,
                'media_type' => 'image',
            ],
            'infoSections' => $companyInfo ? [
                'section1' => [
                    'image' => $companyInfo->info_section1_image,
                    'title' => 'Vous ne voyagerez jamais seul',
                    'description' => 'Notre équipe vous accompagne à chaque étape de votre voyage',
                    'icon' => 'las la-bullhorn',
                    'badge' => $companyInfo->info_section1_badge,
                ],
                'section2' => [
                    'image' => $companyInfo->info_section2_image,
                    'title' => 'Un monde de choix - à tout moment, partout',
                    'description' => 'Accédez à nos services depuis n\'importe où dans le monde',
                    'icon' => 'las la-globe',
                    'badge' => $companyInfo->info_section2_badge,
                ],
                'section3' => [
                    'image' => $companyInfo->info_section3_image,
                    'title' => 'Tranquillité d\'esprit, où que vous alliez',
                    'description' => 'Des services fiables et sécurisés pour votre tranquillité',
                    'icon' => 'las la-thumbs-up',
                    'badge' => $companyInfo->info_section3_badge,
                ],
            ] : null,
            'testimonials' => Testimonial::where('is_active', true)->latest()->limit(6)->get(),
            'events' => Event::where('is_active', true)
                ->withCount('activePacks')
                ->orderBy('is_featured', 'desc')
                ->orderBy('start_date', 'asc')
                ->limit(6)
                ->get(),
        ]);
    }
}


