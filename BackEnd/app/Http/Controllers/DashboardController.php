<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * KPI globaux coach.
     */
    public function coachKpis(Request $request)
    {
        $coach = $request->user()->coach;

        if (!$coach) {
            return response()->json([
                'success' => false,
                'message' => 'Profil coach introuvable.',
            ], 403);
        }

        $period = (string) $request->query('period', 'month');

        return response()->json([
            'success' => true,
            'data' => [
                'ca' => $coach->getCATotal($period),
                'taux_remplissage' => $coach->getTauxRemplissage($period),
                'fidelisation' => $coach->getFidelisation(),
                'panier_moyen' => $coach->getPanierMoyen(),
                'top_offres' => $coach->getTopOffers(),
            ],
        ]);
    }

    /**
     * CA coach sur une période.
     */
    public function coachCA(Request $request)
    {
        $coach = $request->user()->coach;

        if (!$coach) {
            return response()->json([
                'success' => false,
                'message' => 'Profil coach introuvable.',
            ], 403);
        }

        $period = (string) $request->query('period', 'month');

        return response()->json([
            'success' => true,
            'data' => $coach->getCATotal($period),
        ]);
    }

    /**
     * Taux de remplissage coach sur une période.
     */
    public function coachTauxRemplissage(Request $request)
    {
        $coach = $request->user()->coach;

        if (!$coach) {
            return response()->json([
                'success' => false,
                'message' => 'Profil coach introuvable.',
            ], 403);
        }

        $period = (string) $request->query('period', 'month');

        return response()->json([
            'success' => true,
            'data' => $coach->getTauxRemplissage($period),
        ]);
    }

    /**
     * Progression client.
     */
    public function clientProgression(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Profil client introuvable.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'seances_consommees' => $client->getSeancesConsommees(),
                'progression' => $client->getProgressionData(),
                'facturation_totale' => $client->getFacturationTotal(),
            ],
        ]);
    }

    /**
     * Historique des achats client.
     */
    public function clientHistorique(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Profil client introuvable.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $client->getHistoriqueAchats(),
        ]);
    }
}
