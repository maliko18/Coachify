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
    public function exportPdf(Request $request, Facture $facture): JsonResponse
    {
        $facture->load(['client', 'client.user']);

        // Générer le contenu HTML de la facture
        $html = $this->genererHtmlFacture($facture);

        // Nom du fichier PDF
        $filename = "facture_{$facture->numero}.pdf";
        $pdfPath = "factures/{$filename}";

        // Note: Pour une implémentation complète, vous devriez utiliser
        // une bibliothèque comme DomPDF, TCPDF ou Snappy.
        // Ici, nous retournons les données pour permettre au frontend
        // de générer le PDF ou d'utiliser un service externe.

        // Sauvegarder le chemin du PDF (si généré)
        // $facture->update(['pdf_path' => $pdfPath]);

        return response()->json([
            'message' => 'Données de la facture pour export PDF.',
            'data' => [
                'facture' => new FactureResource($facture),
                'html' => $html,
                'filename' => $filename,
            ],
        ]);
    }

    /**
     * Générer le HTML pour la facture PDF.
     */
    private function genererHtmlFacture(Facture $facture): string
    {
        $client = $facture->client;
        $user = $client->user ?? null;
        $nomClient = $user ? "{$user->first_name} {$user->last_name}" : "Client #{$client->id}";
        $emailClient = $user->email ?? 'N/A';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture {$facture->numero}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #333; margin: 0; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { width: 45%; }
        .info-box h3 { color: #666; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .total-row { font-weight: bold; font-size: 1.1em; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
        .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
        .status-payee { background: #d4edda; color: #155724; }
        .status-emise { background: #cce5ff; color: #004085; }
        .status-brouillon { background: #f8f9fa; color: #6c757d; }
        .status-annulee { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FACTURE</h1>
        <p><strong>{$facture->numero}</strong></p>
        <p class="status status-{$facture->statut}">{$facture->resource::STATUTS[$facture->statut]}</p>
    </div>

    <div class="info-section">
        <div class="info-box">
            <h3>Client</h3>
            <p><strong>{$nomClient}</strong></p>
            <p>Email: {$emailClient}</p>
        </div>
        <div class="info-box">
            <h3>Détails</h3>
            <p><strong>Date d'émission:</strong> {$facture->date_emission->format('d/m/Y')}</p>
            <p><strong>Date d'échéance:</strong> {$facture->date_echeance->format('d/m/Y')}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Services de coaching</td>
                <td style="text-align: right;">{$facture->montant_ht} €</td>
            </tr>
            <tr>
                <td>TVA ({$facture->tva}%)</td>
                <td style="text-align: right;">{number_format($facture->montant_ttc - $facture->montant_ht, 2)} €</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL TTC</td>
                <td style="text-align: right;">{$facture->montant_ttc} €</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Merci pour votre confiance.</p>
        <p>Facture générée automatiquement - ArchiWeb Coaching Platform</p>
    </div>
</body>
</html>
HTML;
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
