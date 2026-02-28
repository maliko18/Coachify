<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsClient
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole(Role::CLIENT)) {
            return response()->json([
                'message' => 'Accès réservé aux clients',
                'error' => 'unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
