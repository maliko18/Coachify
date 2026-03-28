<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Seance;
use App\Models\SportsData;
use App\Models\WorkoutSession;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SportsDataImporter
{
    /**
     * Importe des données mock Garmin/Strava et corrèle les séances proches.
     */
    public function importMockForClient(Client $client, string $source, int $count = 10): array
    {
        $created = collect();

        for ($i = 0; $i < $count; $i++) {
            $recordedAt = Carbon::now()->subDays($count - $i)->setTime(rand(6, 20), rand(0, 59));

            $sportsData = SportsData::create([
                'client_id' => $client->id,
                'source' => $source,
                'distance_km' => round(rand(200, 2000) / 100, 2),
                'duration_minutes' => rand(20, 120),
                'calories' => rand(120, 1200),
                'heart_rate_avg' => rand(90, 170),
                'recorded_at' => $recordedAt,
                'raw_payload' => [
                    'provider' => $source,
                    'mock' => true,
                    'device_id' => strtoupper($source) . '-' . rand(1000, 9999),
                ],
            ]);

            $workout = $this->correlateSportsDataToSeance($client, $sportsData);
            $created->push([
                'sports_data_id' => $sportsData->id,
                'workout_session_id' => $workout?->id,
                'seance_id' => $workout?->seance_id,
            ]);
        }

        return [
            'count' => $created->count(),
            'matched' => $created->filter(fn ($row) => !is_null($row['seance_id']))->count(),
            'items' => $created->all(),
        ];
    }

    public function correlateSportsDataToSeance(Client $client, SportsData $sportsData): WorkoutSession
    {
        $candidateSeances = $client->seances()
            ->whereDate('seances.date', $sportsData->recorded_at->toDateString())
            ->get(['seances.id', 'seances.date', 'seances.heure_debut']);

        $closestSeance = $this->findClosestSeance($candidateSeances, $sportsData->recorded_at);

        $score = $this->calculatePerformanceScore($sportsData);

        return WorkoutSession::create([
            'client_id' => $client->id,
            'sports_data_id' => $sportsData->id,
            'seance_id' => $closestSeance?->id,
            'performance_score' => $score,
            'matched_at' => now(),
        ]);
    }

    private function findClosestSeance(Collection $seances, Carbon $recordedAt): ?Seance
    {
        if ($seances->isEmpty()) {
            return null;
        }

        $closest = null;
        $closestDelta = null;

        foreach ($seances as $seance) {
            $seanceDateTime = Carbon::parse($seance->date->format('Y-m-d') . ' ' . substr((string) $seance->heure_debut, 0, 5));
            $deltaMinutes = abs($recordedAt->diffInMinutes($seanceDateTime, false));

            if ($closestDelta === null || $deltaMinutes < $closestDelta) {
                $closestDelta = $deltaMinutes;
                $closest = $seance;
            }
        }

        // Fenêtre de corrélation: même journée (jusqu'à 24h).
        return ($closestDelta !== null && $closestDelta <= 1440) ? $closest : null;
    }

    private function calculatePerformanceScore(SportsData $sportsData): float
    {
        $distanceScore = min(100, ((float) $sportsData->distance_km / 10) * 40);
        $durationScore = min(100, ((int) $sportsData->duration_minutes / 90) * 30);
        $caloriesScore = min(100, ((int) $sportsData->calories / 700) * 20);
        $hrScore = min(100, ((int) ($sportsData->heart_rate_avg ?? 0) / 170) * 10);

        return round($distanceScore + $durationScore + $caloriesScore + $hrScore, 2);
    }
}
