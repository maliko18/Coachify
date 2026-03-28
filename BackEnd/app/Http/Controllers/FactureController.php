<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFactureRequest;
use App\Http\Requests\UpdateFactureRequest;
use App\Http\Resources\FactureCollection;
use App\Http\Resources\FactureResource;
use App\Models\Client;
use App\Models\Facture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): FactureCollection
    {
        $query = Facture::with(['client', 'client.user']);

        // Si l'utilisateur est un coach, montrer seulement les factures de ses clients
        if ($request->user()->coach) {
            $clientIds = Client::where('coach_id', $request->user()->coach->id)->pluck('id');
            $query->whereIn('client_id', $clientIds);
        }

        // Filtres optionnels
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('en_retard') && $request->en_retard) {
            $query->enRetard();
        }

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->emisesEntre($request->date_debut, $request->date_fin);
        }

        // Tri par défaut: plus récent en premier
        $factures = $query->orderBy('date_emission', 'desc')->get();

        return new FactureCollection($factures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFactureRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Vérifier que le client appartient au coach
        $coach = $request->user()->coach;
        if ($coach) {
            $client = Client::find($validated['client_id']);
            if (!$client || $client->coach_id !== $coach->id) {
                return response()->json([
                    'message' => 'Ce client ne vous appartient pas.',
                ], 403);
            }
        }

        // Calculer le montant TTC
        $validated['montant_ttc'] = Facture::calculerMontantTTC(
            $validated['montant_ht'],
            $validated['tva'] ?? 20.00
        );

        $facture = Facture::create($validated);
        $facture->load(['client', 'client.user']);

        return response()->json([
            'message' => 'Facture créée avec succès.',
            'data' => new FactureResource($facture),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Facture $facture): FactureResource
    {
        $facture->load(['client', 'client.user']);
        return new FactureResource($facture);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFactureRequest $request, Facture $facture): JsonResponse
    {
        $validated = $request->validated();

        // Recalculer le montant TTC si le montant HT ou la TVA change
        if (isset($validated['montant_ht']) || isset($validated['tva'])) {
            $montantHT = $validated['montant_ht'] ?? $facture->montant_ht;
            $tva = $validated['tva'] ?? $facture->tva;
            $validated['montant_ttc'] = Facture::calculerMontantTTC($montantHT, $tva);
        }

        $facture->update($validated);
        $facture->load(['client', 'client.user']);

        return response()->json([
            'message' => 'Facture mise à jour avec succès.',
            'data' => new FactureResource($facture),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Facture $facture): JsonResponse
    {
        // Vérifier que la facture n'est pas payée
        if ($facture->statut === 'payee') {
            return response()->json([
                'message' => 'Impossible de supprimer une facture payée.',
            ], 422);
        }

        $facture->delete();

        return response()->json([
            'message' => 'Facture supprimée avec succès.',
        ]);
    }

    /**
     * Émettre une facture (passer de brouillon à émise).
     */
    public function emettre(Request $request, Facture $facture): JsonResponse
    {
        if ($facture->statut !== 'brouillon') {
            return response()->json([
                'message' => 'Seules les factures en brouillon peuvent être émises.',
            ], 422);
        }

        $facture->emettre();
        $facture->load(['client', 'client.user']);

        return response()->json([
            'message' => 'Facture émise avec succès.',
            'data' => new FactureResource($facture),
        ]);
    }

    /**
     * Marquer une facture comme payée.
     */
    public function payer(Request $request, Facture $facture): JsonResponse
    {
        if ($facture->statut === 'payee') {
            return response()->json([
                'message' => 'Cette facture est déjà payée.',
            ], 422);
        }

        if ($facture->statut === 'annulee') {
            return response()->json([
                'message' => 'Impossible de payer une facture annulée.',
            ], 422);
        }

        $facture->marquerPayee();
        $facture->load(['client', 'client.user']);

        return response()->json([
            'message' => 'Facture marquée comme payée.',
            'data' => new FactureResource($facture),
        ]);
    }

    /**
     * Annuler une facture.
     */
    public function annuler(Request $request, Facture $facture): JsonResponse
    {
        if ($facture->statut === 'annulee') {
            return response()->json([
                'message' => 'Cette facture est déjà annulée.',
            ], 422);
        }

        if ($facture->statut === 'payee') {
            return response()->json([
                'message' => 'Impossible d\'annuler une facture payée.',
            ], 422);
        }

        $facture->annuler();
        $facture->load(['client', 'client.user']);

        return response()->json([
            'message' => 'Facture annulée avec succès.',
            'data' => new FactureResource($facture),
        ]);
    }

    /**
     * Exporter une facture en PDF.
     */
    public function exportPdf(Request $request, Facture $facture): BinaryFileResponse
    {
        $path = $facture->pdf_path;
        if (!$path || !Storage::disk('local')->exists($path)) {
            $path = $facture->generer_pdf();
        }

        return response()->download(
            Storage::disk('local')->path($path),
            'facture_' . $facture->numero . '.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Envoyer une facture par email avec la pièce jointe PDF.
     */
    public function envoyerEmail(Request $request, Facture $facture): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email'],
        ]);

        $facture->send_email($validated['email'] ?? null);

        return response()->json([
            'message' => 'Facture envoyee par email avec succes.',
            'data' => new FactureResource($facture->fresh()->load(['client', 'client.user'])),
        ]);
    }

    /**
     * Obtenir les factures en retard.
     */
    public function enRetard(Request $request): FactureCollection
    {
        $query = Facture::with(['client', 'client.user'])->enRetard();

        // Filtrer par coach si applicable
        if ($request->user()->coach) {
            $clientIds = Client::where('coach_id', $request->user()->coach->id)->pluck('id');
            $query->whereIn('client_id', $clientIds);
        }

        $factures = $query->orderBy('date_echeance', 'asc')->get();

        return new FactureCollection($factures);
    }

    /**
     * Statistiques des factures.
     */
    public function statistiques(Request $request): JsonResponse
    {
        $query = Facture::query();

        // Filtrer par coach si applicable
        if ($request->user()->coach) {
            $clientIds = Client::where('coach_id', $request->user()->coach->id)->pluck('id');
            $query->whereIn('client_id', $clientIds);
        }

        $factures = $query->get();

        return response()->json([
            'total_factures' => $factures->count(),
            'total_ht' => $factures->sum('montant_ht'),
            'total_ttc' => $factures->sum('montant_ttc'),
            'par_statut' => [
                'brouillon' => $factures->where('statut', 'brouillon')->count(),
                'emise' => $factures->where('statut', 'emise')->count(),
                'payee' => $factures->where('statut', 'payee')->count(),
                'annulee' => $factures->where('statut', 'annulee')->count(),
                'en_retard' => $factures->where('statut', 'en_retard')->count(),
            ],
            'montant_paye' => $factures->where('statut', 'payee')->sum('montant_ttc'),
            'montant_en_attente' => $factures->whereIn('statut', ['emise', 'en_retard'])->sum('montant_ttc'),
        ]);
    }
}
