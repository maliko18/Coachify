<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCoach
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur connecté est un coach.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'status' => 401,
                ],
            ], 401);
        }

        if (!$user->hasRole(Role::COACH)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux coachs.',
                'error' => [
                    'code' => 'FORBIDDEN',
                    'status' => 403,
                ],
            ], 403);
        }

        return $next($request);
    }
}
