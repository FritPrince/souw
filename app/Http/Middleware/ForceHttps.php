<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force HTTPS en production
        if (app()->environment('production')) {
            // Vérifier si la requête n'est pas sécurisée
            $isSecure = $request->secure() || $request->header('X-Forwarded-Proto') === 'https';
            if (! $isSecure) {
                return redirect()->secure($request->getRequestUri());
            }
        }

        return $next($request);
    }
}
