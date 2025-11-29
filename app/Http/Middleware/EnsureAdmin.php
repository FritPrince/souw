<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Vérifier si l'utilisateur est connecté et est admin
        if ($user && Gate::forUser($user)->allows('access-admin')) {
            return $next($request);
        }

        // Si l'utilisateur est connecté mais n'est pas admin, le rediriger vers l'accueil
        if ($user) {
            return redirect()->route('home')
                ->with('error', 'Vous n\'avez pas les droits d\'accès à cette section.');
        }

        // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
        return redirect()->route('login')
            ->with('error', 'Vous devez être connecté en tant qu\'administrateur pour accéder à cette section.');
    }
}












