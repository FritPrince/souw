<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFedaPayConfigRequest;
use App\Models\FedaPayConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AdminFedaPayController extends Controller
{
    public function edit(): Response
    {
        $config = FedaPayConfig::first();

        return Inertia::render('Admin/Settings/FedaPay', [
            'config' => $config,
        ]);
    }

    public function update(UpdateFedaPayConfigRequest $request): RedirectResponse
    {
        $config = FedaPayConfig::firstOrCreate([]);
        $config->update($request->validated());

        return back()->with('success', 'Configuration FedaPay mise à jour avec succès.');
    }

    public function test(Request $request): RedirectResponse
    {
        $request->validate([
            'mode' => ['required', 'in:live,sandbox'],
        ]);

        $config = FedaPayConfig::first();
        if (! $config) {
            return back()->with('error', 'Configuration FedaPay non trouvée.');
        }

        $isSandbox = $request->mode === 'sandbox';
        $secretKey = $isSandbox ? $config->secret_key_sandbox : $config->secret_key_live;
        $apiUrl = $isSandbox ? 'https://sandbox-api.fedapay.com' : 'https://api.fedapay.com';

        if (! $secretKey) {
            return back()->with('error', 'Clé secrète manquante pour le mode '.$request->mode.'.');
        }

        // Vérifier le format des clés
        if (strlen($secretKey) < 10) {
            return back()->with('error', 'La clé secrète semble invalide (trop courte).');
        }

        // Vérifier que la clé commence par le bon préfixe selon le mode
        $expectedPrefix = $isSandbox ? 'sk_sandbox_' : 'sk_live_';
        if (!str_starts_with($secretKey, $expectedPrefix)) {
            return back()->with('error', 'Le format de la clé secrète ne correspond pas au mode '.$request->mode.'. La clé doit commencer par "'.$expectedPrefix.'".');
        }

        // Test de connexion simplifié : valider uniquement le format des clés
        // La validation complète se fera lors de la création d'une transaction réelle
        // Mettre à jour le mode actif car le format est correct
        if ($isSandbox) {
            $config->update(['is_sandbox' => true]);
        } else {
            $config->update(['is_sandbox' => false]);
        }

        return back()->with('success', 'Format des clés validé pour le mode '.$request->mode.'. Le mode a été activé. La validation complète des clés se fera lors de la création d\'une transaction.');
    }
}