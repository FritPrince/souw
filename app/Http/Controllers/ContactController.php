<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormNotification;
use App\Models\CompanyInfo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        $company = CompanyInfo::first();

        return Inertia::render('Contact/Index', [
            'company' => $company ? [
                'name' => $company->name,
                'email' => $company->email,
                'phone_primary' => $company->phone_primary,
                'phone_secondary' => $company->phone_secondary,
                'whatsapp_number' => $company->whatsapp_number,
                'address' => $company->address,
            ] : null,
            'heroImage' => '/storage/front/images/hero-bg7.jpg',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // Récupérer l'email de l'admin depuis CompanyInfo
        $company = CompanyInfo::first();
        $adminEmail = $company?->email ?? config('mail.from.address');

        if (! $adminEmail) {
            return back()->with('error', 'Erreur de configuration. Veuillez réessayer plus tard.');
        }

        // Envoyer l'email à l'admin
        try {
            Mail::to($adminEmail)->send(new ContactFormNotification(
                name: $validated['name'],
                phone: $validated['phone'],
                email: $validated['email'],
                subject: $validated['subject'],
                message: $validated['message'],
            ));

            return back()->with('success', 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send contact form email', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.');
        }
    }
}
