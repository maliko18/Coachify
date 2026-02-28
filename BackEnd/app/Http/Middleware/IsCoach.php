<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsCoach
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole(Role::COACH)) {
            return response()->json([
                'message' => 'Accès réservé aux coachs',
                'error' => 'unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
