<?php

namespace App\Http\Middleware;

use App\Models\Offre;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOffreOwnership
{
    /**
     * Vérifier que le coach ne peut accéder qu'à ses propres offres
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = $request->user();
            
            // Admin peut tout faire
            if ($user && $user->hasRole('admin')) {
                return $next($request);
            }

            // Si c'est une action sur une offre spécifique (show, update, delete)
            $offreId = $request->route('offre');
            if ($offreId) {
                $offre = Offre::find($offreId);
                
                // Si l'offre n'existe pas, laisser passer (le contrôleur s'en chargera)
                if (!$offre) {
                    return $next($request);
                }

                // Charger les relations si nécessaire
                if (!$user->relationLoaded('coach')) {
                    $user->load('coach');
                }

                // Vérifier que le coach est propriétaire
                if ($user && $user->coach && $user->coach->id === $offre->coach_id) {
                    return $next($request);
                }

                // Accès refusé
                throw new AuthorizationException('Vous n\'avez pas accès à cette offre.');
            }

            // Pour les listes (index), le middleware laisse passer
            return $next($request);
        } catch (AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('CheckOffreOwnership error: ' . $e->getMessage());
            throw $e;
        }
    }
}
