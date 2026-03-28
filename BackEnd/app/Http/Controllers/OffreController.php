<?php

namespace App\Http\Controllers;

use App\Http\Resources\OffreResource;
use App\Models\Offre;
use Illuminate\Http\Request;

class OffreController extends Controller
{
    /**
     * Export CSV des offres du coach connecté
     */
    public function exportCsv(Request $request)
    {
        $user = $request->user();
        // Charger la relation coach si elle n'est pas chargée
        if (!$user->relationLoaded('coach')) {
            $user->load('coach');
        }
        $coachId = $user->coach?->id;

        if (!$coachId) {
            abort(403, 'Vous n\'êtes pas un coach.');
        }

        $offres = Offre::query()
            ->where('coach_id', $coachId)
            ->with(['contrats' => function ($query) {
                $query->where('statut', '!=', 'annule');
            }])
            ->orderBy('nom')
            ->get();

        $fileName = 'offres_export_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($offres) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['nom', 'type', 'prix', 'nombre contrats', 'CA total'], ';');

            foreach ($offres as $offre) {
                $nombreContrats = $offre->contrats->count();
                $caTotal = round((float) $offre->contrats->sum('montant_paye'), 2);

                fputcsv($handle, [
                    $offre->nom,
                    $offre->type,
                    (float) $offre->prix,
                    $nombreContrats,
                    $caTotal,
                ], ';');
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Liste les offres du coach connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Offre::with('coach.user')->withCount('contrats');

        // Coach : uniquement ses offres
        if ($user->hasRole('coach')) {
            if (!$user->relationLoaded('coach')) {
                $user->load('coach');
            }
            $coachId = $user->coach?->id;
            if ($coachId) {
                $query->where('coach_id', $coachId);
            }
        }

        // Filtre par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $offres = $query->orderBy('created_at', 'desc')->get();

        return OffreResource::collection($offres);
    }

    /**
     * Affiche une offre spécifique
     */
    public function show(Offre $offre)
    {
        return new OffreResource(
            $offre->load('coach.user')->loadCount('contrats')
        );
    }

    /**
     * Crée une nouvelle offre
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'                   => 'required|string|max:255',
            'description'           => 'nullable|string',
            'type'                  => 'required|in:pack_seance,abonnement,collectif,programme_numerique,produit',
            'prix'                  => 'required|numeric|min:0',
            'tva'                   => 'nullable|numeric|min:0|max:100',
            'devise'                => 'nullable|string|max:3',
            'nombre_seances'        => 'nullable|integer|min:1',
            'duree_jours'           => 'nullable|integer|min:1',
            'capacite_max'          => 'nullable|integer|min:1',
            'options'               => 'nullable|array',
            'statut'                => 'nullable|in:active,inactive,archivee',
            'est_visible'           => 'nullable|boolean',
            'prix_promotion'        => 'nullable|numeric|min:0',
            'date_debut_promotion'  => 'nullable|date',
            'date_fin_promotion'    => 'nullable|date|after_or_equal:date_debut_promotion',
        ]);

        // Assigner le coach connecté
        $user = $request->user();
        if (!$user->relationLoaded('coach')) {
            $user->load('coach');
        }
        $validated['coach_id'] = $user->coach?->id;

        if (!$validated['coach_id']) {
            abort(403, 'Vous n\'êtes pas un coach.');
        }

        $offre = Offre::create($validated);

        return new OffreResource($offre->load('coach.user'));
    }

    /**
     * Met à jour une offre
     */
    public function update(Request $request, Offre $offre)
    {
        // Vérifier que le coach est propriétaire
        $this->authorizeCoachOwnership($request, $offre);

        $validated = $request->validate([
            'nom'                   => 'nullable|string|max:255',
            'description'           => 'nullable|string',
            'type'                  => 'nullable|in:pack_seance,abonnement,collectif,programme_numerique,produit',
            'prix'                  => 'nullable|numeric|min:0',
            'tva'                   => 'nullable|numeric|min:0|max:100',
            'nombre_seances'        => 'nullable|integer|min:1',
            'duree_jours'           => 'nullable|integer|min:1',
            'capacite_max'          => 'nullable|integer|min:1',
            'options'               => 'nullable|array',
            'statut'                => 'nullable|in:active,inactive,archivee',
            'est_visible'           => 'nullable|boolean',
            'prix_promotion'        => 'nullable|numeric|min:0',
            'date_debut_promotion'  => 'nullable|date',
            'date_fin_promotion'    => 'nullable|date|after_or_equal:date_debut_promotion',
        ]);

        $offre->update($validated);

        return new OffreResource($offre->load('coach.user'));
    }

    /**
     * Supprime une offre (soft delete)
     */
    public function destroy(Request $request, Offre $offre)
    {
        $this->authorizeCoachOwnership($request, $offre);

        $offre->delete();

        return response()->json([
            'message' => 'Offre supprimée avec succès',
        ], 200);
    }

    /**
     * Vérifie que le coach est propriétaire de l'offre
     */
    private function authorizeCoachOwnership(Request $request, Offre $offre): void
    {
        $user = $request->user();

        if ($user->hasRole('coach')) {
            if (!$user->relationLoaded('coach')) {
                $user->load('coach');
            }
            $coachId = $user->coach?->id;
            if (!$coachId || $offre->coach_id !== $coachId) {
                abort(403, 'Vous n\'êtes pas autorisé à modifier cette offre.');
            }
        }
    }
}
