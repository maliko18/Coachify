<?php

namespace App\Http\Controllers;

use App\Services\SportsDataImporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SportsDataController extends Controller
{
    public function __construct(private readonly SportsDataImporter $importer)
    {
    }

    public function import(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('client') || !$user->client) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux clients.',
            ], 403);
        }

        $validated = $request->validate([
            'source' => 'required|in:garmin,strava',
            'count' => 'nullable|integer|min:1|max:50',
        ]);

        $result = $this->importer->importMockForClient(
            $user->client,
            $validated['source'],
            (int) ($validated['count'] ?? 10)
        );

        return response()->json([
            'success' => true,
            'message' => 'Données sportives importées avec succès.',
            'data' => $result,
        ], 201);
    }

    public function analyticsProgression(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('client') || !$user->client) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux clients.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $user->client->getProgressionMetrics(),
        ]);
    }
}
