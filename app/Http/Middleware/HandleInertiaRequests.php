<?php

namespace App\Http\Middleware;

use App\Models\CompanyInfo;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $company = CompanyInfo::first();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'company' => $company ? [
                'name' => $company->name,
                'address' => $company->address,
                'phone_primary' => $company->phone_primary,
                'phone_secondary' => $company->phone_secondary,
                'email' => $company->email,
                'whatsapp_number' => $company->whatsapp_number,
                'logo_path' => $company->logo_path,
                'hero_media_type' => $company->hero_media_type,
                'hero_image_path' => $company->hero_image_path,
                'hero_video_path' => $company->hero_video_path,
                'info_section_badges' => [
                    'first' => $company->info_section1_badge,
                    'second' => $company->info_section2_badge,
                    'third' => $company->info_section3_badge,
                ],
                'social_media' => $company->social_media,
            ] : null,
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
