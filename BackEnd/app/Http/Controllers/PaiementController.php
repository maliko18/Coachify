<?php

namespace App\Http\Controllers;

use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Liste les paiements du coach connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Paiement::with(['client.user', 'contrat', 'coach.user']);

        // Coach : uniquement ses paiements
        if ($user->hasRole('coach')) {
            $query->where('coach_id', $user->coach->id);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filtre par méthode de paiement
        if ($request->has('methode')) {
            $query->methode($request->methode);
        }

        // Filtre par période
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->periode($request->date_debut, $request->date_fin);
        }

        // Filtre par contrat
        if ($request->has('contrat_id')) {
            $query->where('contrat_id', $request->contrat_id);
        }

        $paiements = $query->orderBy('date_paiement', 'desc')->get();

        return PaiementResource::collection($paiements);
    }

    /**
     * Affiche un paiement spécifique
     */
    public function show(Paiement $paiement)
    {
        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Crée un nouveau paiement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id'          => 'required|exists:clients,id',
            'contrat_id'         => 'nullable|exists:contrats,id',
            'montant'            => 'required|numeric|min:0.01',
            'devise'             => 'nullable|string|max:3',
            'date_paiement'      => 'required|date',
            'methode'            => 'required|in:carte_bancaire,virement,especes,cheque,paypal,stripe,prelevement,autre',
            'statut'             => 'nullable|in:en_attente,valide,refuse,rembourse,annule',
            'reference_externe'  => 'nullable|string|max:255',
            'description'        => 'nullable|string|max:500',
            'notes'              => 'nullable|string',
        ]);

        // Assigner le coach connecté
        $validated['coach_id'] = $request->user()->coach->id;

        // Statut par défaut
        if (!isset($validated['statut'])) {
            $validated['statut'] = 'en_attente';
        }

        $paiement = Paiement::create($validated);

        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Met à jour un paiement
     */
    public function update(Request $request, Paiement $paiement)
    {
        $this->authorizeCoachOwnership($request, $paiement);

        $validated = $request->validate([
            'montant'            => 'nullable|numeric|min:0.01',
            'devise'             => 'nullable|string|max:3',
            'date_paiement'      => 'nullable|date',
            'methode'            => 'nullable|in:carte_bancaire,virement,especes,cheque,paypal,stripe,prelevement,autre',
            'statut'             => 'nullable|in:en_attente,valide,refuse,rembourse,annule',
            'reference_externe'  => 'nullable|string|max:255',
            'description'        => 'nullable|string|max:500',
            'notes'              => 'nullable|string',
        ]);

        $paiement->update($validated);

        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Supprime un paiement (soft delete)
     */
    public function destroy(Request $request, Paiement $paiement)
    {
        $this->authorizeCoachOwnership($request, $paiement);

        $paiement->delete();

        return response()->json([
            'message' => 'Paiement supprimé avec succès',
        ], 200);
    }

    /**
     * Valider un paiement en attente
     */
    public function valider(Request $request, Paiement $paiement)
    {
        $this->authorizeCoachOwnership($request, $paiement);

        if (!$paiement->valider()) {
            return response()->json([
                'message' => 'Ce paiement ne peut pas être validé (statut actuel : ' . $paiement->statut . ').',
            ], 422);
        }

        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Rembourser un paiement (partiel ou total)
     */
    public function rembourser(Request $request, Paiement $paiement)
    {
        $this->authorizeCoachOwnership($request, $paiement);

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0.01',
            'motif'   => 'nullable|string|max:500',
        ]);

        if (!$paiement->rembourser($validated['montant'], $validated['motif'] ?? null)) {
            return response()->json([
                'message' => 'Ce paiement ne peut pas être remboursé.',
            ], 422);
        }

        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Annuler un paiement
     */
    public function annuler(Request $request, Paiement $paiement)
    {
        $this->authorizeCoachOwnership($request, $paiement);

        if (!$paiement->annuler()) {
            return response()->json([
                'message' => 'Ce paiement ne peut pas être annulé (statut actuel : ' . $paiement->statut . ').',
            ], 422);
        }

        return new PaiementResource(
            $paiement->load(['client.user', 'contrat', 'coach.user'])
        );
    }

    /**
     * Statistiques des paiements du coach
     */
    public function statistiques(Request $request)
    {
        $user = $request->user();
        $coachId = $user->coach->id;

        $debut = $request->input('date_debut', now()->startOfMonth()->toDateString());
        $fin = $request->input('date_fin', now()->endOfMonth()->toDateString());

        $paiements = Paiement::ofCoach($coachId)->periode($debut, $fin);

        $totalValide = (clone $paiements)->valide()->sum('montant');
        $totalRembourse = (clone $paiements)->where('statut', 'rembourse')->sum('montant_rembourse');
        $totalEnAttente = (clone $paiements)->enAttente()->sum('montant');
        $nbPaiements = (clone $paiements)->count();
        $nbValides = (clone $paiements)->valide()->count();

        // Répartition par méthode
        $parMethode = (clone $paiements)->valide()
            ->selectRaw('methode, COUNT(*) as nombre, SUM(montant) as total')
            ->groupBy('methode')
            ->get()
            ->mapWithKeys(fn ($item) => [
                $item->methode => [
                    'nombre' => $item->nombre,
                    'total' => round((float) $item->total, 2),
                    'label' => Paiement::METHODES[$item->methode] ?? $item->methode,
                ],
            ]);

        return response()->json([
            'periode' => [
                'debut' => $debut,
                'fin' => $fin,
            ],
            'chiffre_affaires' => round((float) $totalValide, 2),
            'total_rembourse' => round((float) $totalRembourse, 2),
            'ca_net' => round((float) $totalValide - (float) $totalRembourse, 2),
            'en_attente' => round((float) $totalEnAttente, 2),
            'nombre_paiements' => $nbPaiements,
            'nombre_valides' => $nbValides,
            'repartition_methode' => $parMethode,
        ]);
    }

    /**
     * Vérifie que le coach est propriétaire du paiement
     */
    private function authorizeCoachOwnership(Request $request, Paiement $paiement): void
    {
        $user = $request->user();

        if ($user->hasRole('coach') && $paiement->coach_id !== $user->coach->id) {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce paiement.');
        }
    }
}
