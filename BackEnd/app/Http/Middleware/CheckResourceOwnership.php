<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckResourceOwnership
{
    /**
     * Vérifie l'appartenance d'une ressource route-model-bound.
     */
    public function handle(
        Request $request,
        Closure $next,
        string $routeParam,
        string $ownerType = 'coach',
        string $ownerField = 'coach_id'
    ): Response {
        $user = $request->user();

        if ($user && $user->hasRole('admin')) {
            return $next($request);
        }

        $routeResource = $request->route($routeParam);
        if (!$routeResource) {
            return $next($request);
        }

        if (!$routeResource instanceof Model) {
            throw new AuthorizationException('Ressource invalide pour controle de propriete.');
        }

        $ownerId = (int) data_get($routeResource, $ownerField);

        $isAuthorized = match ($ownerType) {
            'coach' => $user && $user->coach && $user->coach->id === $ownerId,
            'client' => $user && $user->client && $user->client->id === $ownerId,
            'user' => $user && $user->id === $ownerId,
            default => false,
        };

        if (!$isAuthorized) {
            throw new AuthorizationException('Acces non autorise a cette ressource.');
        }

        return $next($request);
    }
}
