<?php

namespace App\Http\Middleware;

use App\Models\Contrat;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckContratAccess
{
    /**
     * Vérifier que le coach/client ne peuvent accéder qu'aux contrats autorisés
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admin peut tout faire
        if ($user && $user->hasRole('admin')) {
            return $next($request);
        }

        // Si c'est une action sur un contrat spécifique (show, update, delete)
        $contratId = $request->route('contrat');
        if ($contratId) {
            $contrat = Contrat::find($contratId);
            
            // Si le contrat n'existe pas, laisser passer (le contrôleur s'en chargera)
            if (!$contrat) {
                return $next($request);
            }

            // Un coach ne voit que ses propres contrats
            if ($user && $user->coach && $user->coach->id === $contrat->coach_id) {
                return $next($request);
            }

            // Un client ne voit que ses propres contrats
            if ($user && $user->client && $user->client->id === $contrat->client_id) {
                return $next($request);
            }

            // Accès refusé
            throw new AuthorizationException('Vous n\'avez pas accès à ce contrat.');
        }

        // Pour les listes (index), le middleware laisse passer (filtrées au niveau du controller)
        return $next($request);
    }
}
