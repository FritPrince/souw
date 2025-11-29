<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Laravel\Fortify\Contracts\RegisterResponse;

class CustomRegisterResponse implements RegisterResponse
{
    public function toResponse($request)
    {
        $user = $request->user();

        // Seuls les admins peuvent être redirigés vers le dashboard admin
        if ($user && Gate::forUser($user)->allows('access-admin')) {
            // Pour les admins, on peut utiliser intended() car ils ont accès à l'admin
            $target = route('admin.dashboard');
            return redirect()->intended($target);
        }

        // Pour les non-admins, toujours rediriger vers la page publique
        // Ne pas utiliser intended() pour éviter de rediriger vers des pages admin
        return redirect()->route('home');
    }
}












