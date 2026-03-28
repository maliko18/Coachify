<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        $version = (int) Cache::get('perf:dashboard:coach:' . $coach->id . ':version', 1);
        $cacheKey = 'perf:dashboard:coach:' . $coach->id . ':kpis:' . $period . ':v' . $version;

        $data = Cache::remember($cacheKey, now()->addHour(), function () use ($coach, $period) {
            return [
                'ca' => $coach->getCATotal($period),
                'taux_remplissage' => $coach->getTauxRemplissage($period),
                'fidelisation' => $coach->getFidelisation(),
                'panier_moyen' => $coach->getPanierMoyen(),
                'top_offres' => $coach->getTopOffers(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
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
        $version = (int) Cache::get('perf:dashboard:coach:' . $coach->id . ':version', 1);
        $cacheKey = 'perf:dashboard:coach:' . $coach->id . ':ca:' . $period . ':v' . $version;

        $data = Cache::remember(
            $cacheKey,
            now()->addHour(),
            fn () => $coach->getCATotal($period)
        );

        return response()->json([
            'success' => true,
            'data' => $data,
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
        $version = (int) Cache::get('perf:dashboard:coach:' . $coach->id . ':version', 1);
        $cacheKey = 'perf:dashboard:coach:' . $coach->id . ':taux:' . $period . ':v' . $version;

        $data = Cache::remember(
            $cacheKey,
            now()->addHour(),
            fn () => $coach->getTauxRemplissage($period)
        );

        return response()->json([
            'success' => true,
            'data' => $data,
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

        $version = (int) Cache::get('perf:dashboard:client:' . $client->id . ':version', 1);
        $cacheKey = 'perf:dashboard:client:' . $client->id . ':progression:v' . $version;

        $data = Cache::remember($cacheKey, now()->addHour(), function () use ($client) {
            return [
                'seances_consommees' => $client->getSeancesConsommees(),
                'progression' => $client->getProgressionData(),
                'facturation_totale' => $client->getFacturationTotal(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
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

        $version = (int) Cache::get('perf:dashboard:client:' . $client->id . ':version', 1);
        $cacheKey = 'perf:dashboard:client:' . $client->id . ':historique:v' . $version;

        $data = Cache::remember(
            $cacheKey,
            now()->addHour(),
            fn () => $client->getHistoriqueAchats()
        );

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
