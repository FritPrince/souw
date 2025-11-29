<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateKkiaPayConfigRequest;
use App\Models\KkiaPayConfig;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AdminKkiaPayController extends Controller
{
    public function edit(): Response
    {
        $config = KkiaPayConfig::first();

        return Inertia::render('Admin/Settings/KkiaPay', [
            'config' => $config,
        ]);
    }

    public function update(UpdateKkiaPayConfigRequest $request): RedirectResponse
    {
        $config = KkiaPayConfig::firstOrCreate([]);
        $config->update($request->validated());

        return back()->with('success', 'Configuration KkiaPay mise à jour avec succès.');
    }

    public function test(Request $request): RedirectResponse
    {
        $request->validate([
            'mode' => ['required', 'in:live,sandbox'],
        ]);

        $config = KkiaPayConfig::first();
        if (! $config) {
            return back()->with('error', 'Configuration KkiaPay non trouvée.');
        }

        $isSandbox = $request->mode === 'sandbox';
        $publicKey = $isSandbox ? $config->public_key_sandbox : $config->public_key_live;
        $privateKey = $isSandbox ? $config->private_key_sandbox : $config->private_key_live;
        $apiUrl = $isSandbox ? 'https://api-sandbox.kkiapay.me' : 'https://api.kkiapay.me';

        if (! $publicKey || ! $privateKey) {
            return back()->with('error', 'Clés manquantes pour le mode '.$request->mode.'.');
        }

        try {
            // Vérifier le format des clés
            if (strlen($publicKey) < 10 || strlen($privateKey) < 10) {
                return back()->with('error', 'Les clés semblent invalides (trop courtes).');
            }

            // Test simple : vérifier que l'API répond avec les clés fournies
            // KkiaPay utilise la clé privée dans l'en-tête Authorization
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$privateKey,
                'Accept' => 'application/json',
            ])->timeout(10)->get($apiUrl.'/api/v1/transactions/invalid_test_id_'.time());

            // Si on obtient une réponse (même 404), cela signifie que l'API est accessible et les clés sont valides
            // Un 401/403 indiquerait des clés invalides
            $status = $response->status();

            if ($status === 404 || $status === 200) {
                // 404/200 signifie que l'API a répondu - les clés sont valides
                // Mettre à jour le mode actif si le test réussit
                if ($isSandbox) {
                    $config->update(['is_sandbox' => true]);
                } else {
                    $config->update(['is_sandbox' => false]);
                }
                return back()->with('success', 'Connexion réussie au mode '.$request->mode.' ! Les clés sont valides. Le mode a été activé.');
            }

            if ($status === 401 || $status === 403) {
                return back()->with('error', 'Clés invalides. Vérifiez que vous avez entré les bonnes clés pour le mode '.$request->mode.'.');
            }

            // Pour d'autres statuts, afficher le message d'erreur
            $errorMessage = $response->json()['message'] ?? $response->body() ?? 'Erreur inconnue';
            return back()->with('error', 'Échec de la connexion (Statut: '.$status.'): '.$errorMessage);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return back()->with('error', 'Impossible de se connecter à l\'API KkiaPay. Vérifiez votre connexion internet.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erreur lors du test : '.$e->getMessage());
        }
    }
}
