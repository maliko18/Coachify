<?php

namespace App\Http\Controllers;

use App\Http\Resources\ContratResource;
use App\Models\Contrat;
use Illuminate\Http\Request;

class ContratController extends Controller
{
    /**
     * Liste les contrats du coach connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Contrat::with(['client.user', 'offre', 'coach.user']);

        // Coach : uniquement ses contrats
        if ($user->hasRole('coach')) {
            $query->where('coach_id', $user->coach->id);
        }

        // Client : uniquement ses contrats
        if ($user->hasRole('client')) {
            $query->where('client_id', $user->client->id);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filtre par offre
        if ($request->has('offre_id')) {
            $query->where('offre_id', $request->offre_id);
        }

        $contrats = $query->orderBy('created_at', 'desc')->get();

        return ContratResource::collection($contrats);
    }

    /**
     * Affiche un contrat spécifique
     */
    public function show(Contrat $contrat)
    {
        return new ContratResource(
            $contrat->load(['client.user', 'offre', 'coach.user'])
        );
    }

    /**
     * Crée un nouveau contrat
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id'                     => 'required|exists:clients,id',
            'offre_id'                      => 'required|exists:offres,id',
            'date_debut'                    => 'required|date',
            'date_fin'                      => 'nullable|date|after_or_equal:date_debut',
            'statut'                        => 'nullable|in:en_attente,actif,suspendu,termine,annule',
            'seances_totales'               => 'nullable|integer|min:0',
            'montant_total'                 => 'required|numeric|min:0',
            'montant_paye'                  => 'nullable|numeric|min:0',
            'notes'                         => 'nullable|string',
            'renouvellement_auto'           => 'nullable|boolean',
            'date_prochain_renouvellement'  => 'nullable|date',
        ]);

        // Assigner le coach connecté
        $validated['coach_id'] = $request->user()->coach->id;

        // Calculer les séances restantes
        $validated['seances_restantes'] = $validated['seances_totales'] ?? 0;
        $validated['seances_consommees'] = 0;

        $contrat = Contrat::create($validated);

        return new ContratResource(
            $contrat->load(['client.user', 'offre', 'coach.user'])
        );
    }

    /**
     * Met à jour un contrat
     */
    public function update(Request $request, Contrat $contrat)
    {
        $this->authorizeCoachOwnership($request, $contrat);

        $validated = $request->validate([
            'date_debut'                    => 'nullable|date',
            'date_fin'                      => 'nullable|date|after_or_equal:date_debut',
            'statut'                        => 'nullable|in:en_attente,actif,suspendu,termine,annule',
            'seances_totales'               => 'nullable|integer|min:0',
            'seances_consommees'            => 'nullable|integer|min:0',
            'seances_restantes'             => 'nullable|integer|min:0',
            'montant_total'                 => 'nullable|numeric|min:0',
            'montant_paye'                  => 'nullable|numeric|min:0',
            'notes'                         => 'nullable|string',
            'renouvellement_auto'           => 'nullable|boolean',
            'date_prochain_renouvellement'  => 'nullable|date',
        ]);

        $contrat->update($validated);

        return new ContratResource(
            $contrat->load(['client.user', 'offre', 'coach.user'])
        );
    }

    /**
     * Supprime un contrat (soft delete)
     */
    public function destroy(Request $request, Contrat $contrat)
    {
        $this->authorizeCoachOwnership($request, $contrat);

        $contrat->delete();

        return response()->json([
            'message' => 'Contrat supprimé avec succès',
        ], 200);
    }

    /**
     * Liste les contrats arrivant à expiration
     */
    public function expirationProche(Request $request)
    {
        $user = $request->user();
        $jours = $request->input('jours', 7);

        $query = Contrat::with(['client.user', 'offre'])
            ->expirationProche($jours);

        if ($user->hasRole('coach')) {
            $query->where('coach_id', $user->coach->id);
        }

        return ContratResource::collection($query->get());
    }

    /**
     * Vérifie que le coach est propriétaire du contrat
     */
    private function authorizeCoachOwnership(Request $request, Contrat $contrat): void
    {
        $user = $request->user();

        if ($user->hasRole('coach') && $contrat->coach_id !== $user->coach->id) {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce contrat.');
        }
    }
}
