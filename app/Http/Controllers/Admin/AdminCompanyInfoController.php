<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyInfoRequest;
use App\Models\CompanyInfo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminCompanyInfoController extends Controller
{
    public function edit(): Response
    {
        $companyInfo = CompanyInfo::first();

        return Inertia::render('Admin/Settings/CompanyInfo', [
            'companyInfo' => $companyInfo,
        ]);
    }

    public function update(UpdateCompanyInfoRequest $request): RedirectResponse
    {
        $companyInfo = CompanyInfo::firstOrCreate([]);
        $data = $request->validated();

        // Handle uploads
        if ($request->hasFile('logo')) {
            if (! empty($companyInfo->logo_path)) {
                $old = str_replace('/storage/', '', $companyInfo->logo_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('logo')->store('company', 'public');
            $data['logo_path'] = '/storage/'.$path;
        }

        if ($request->hasFile('hero_image')) {
            if (! empty($companyInfo->hero_image_path)) {
                $old = str_replace('/storage/', '', $companyInfo->hero_image_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('hero_image')->store('company/hero', 'public');
            $data['hero_image_path'] = '/storage/'.$path;
            $data['hero_video_path'] = null;
            $data['hero_media_type'] = 'image';
        }

        if ($request->hasFile('hero_video')) {
            if (! empty($companyInfo->hero_video_path)) {
                $old = str_replace('/storage/', '', $companyInfo->hero_video_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('hero_video')->store('company/hero', 'public');
            $data['hero_video_path'] = '/storage/'.$path;
            $data['hero_image_path'] = null;
            $data['hero_media_type'] = 'video';
        }

        foreach ([1, 2, 3] as $i) {
            $key = "info_section{$i}_image";
            if ($request->hasFile($key)) {
                $current = $companyInfo->getAttribute($key);
                if (! empty($current)) {
                    $old = str_replace('/storage/', '', $current);
                    if (Storage::disk('public')->exists($old)) {
                        Storage::disk('public')->delete($old);
                    }
                }
                $path = $request->file($key)->store("company/info_sections", 'public');
                $data[$key] = '/storage/'.$path;
            }
        }

        unset(
            $data['logo'],
            $data['hero_image'],
            $data['hero_video']
        );

        $companyInfo->update($data);

        return back()->with('success', 'Informations de l\'entreprise mises à jour avec succès.');
    }
}
