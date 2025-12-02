<?php

namespace App\Http\Controllers;

use App\Models\CompanyInfo;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function terms(): Response
    {
        $company = CompanyInfo::first();

        return Inertia::render('Terms/Index', [
            'company' => $company ? [
                'name' => $company->name,
            ] : null,
        ]);
    }

    public function privacy(): Response
    {
        $company = CompanyInfo::first();

        return Inertia::render('Privacy/Index', [
            'company' => $company ? [
                'name' => $company->name,
            ] : null,
        ]);
    }

    public function help(): Response
    {
        $company = CompanyInfo::first();

        return Inertia::render('Help/Index', [
            'company' => $company ? [
                'name' => $company->name,
            ] : null,
        ]);
    }

    public function faq(): Response
    {
        $company = CompanyInfo::first();

        return Inertia::render('Faq/Index', [
            'company' => $company ? [
                'name' => $company->name,
            ] : null,
        ]);
    }
}


