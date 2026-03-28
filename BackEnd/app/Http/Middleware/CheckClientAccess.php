<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckClientAccess
{
    /**
     * Vérifier que le coach/client ne peuvent accéder qu'aux clients autorisés
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admin peut tout faire
        if ($user && $user->hasRole('admin')) {
            return $next($request);
        }

        // Si c'est une action sur un client spécifique (show, update, delete)
        $clientId = $request->route('client');
        if ($clientId) {
            $client = Client::find($clientId);
            
            // Si le client n'existe pas, laisser passer (le contrôleur s'en chargera)
            if (!$client) {
                return $next($request);
            }

            // Un coach ne voit que ses propres clients
            if ($user && $user->coach && $user->coach->id === $client->coach_id) {
                return $next($request);
            }

            // Un client ne voit que ses propres informations
            if ($user && $user->client && $user->client->id === $client->id) {
                return $next($request);
            }

            // Accès refusé
            throw new AuthorizationException('Vous n\'avez pas accès à ce client.');
        }

        // Pour les listes (index), le middleware laisse passer
        return $next($request);
    }
}
