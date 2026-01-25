<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$guards
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Pour les requêtes API, retourner une réponse JSON
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'message' => 'Already authenticated.'
                    ], 403);
                }

                // Pour les requêtes web, rediriger vers la page d'accueil
                return redirect('/');
            }
        }

        return $next($request);
    }
}
