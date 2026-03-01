<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsGymManager
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole(Role::GYM_MANAGER)) {
            return response()->json([
                'message' => 'Accès réservé aux responsables de salle',
                'error' => 'unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
