<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole(Role::ADMIN)) {
            return response()->json([
                'message' => 'Accès réservé aux administrateurs',
                'error' => 'unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
