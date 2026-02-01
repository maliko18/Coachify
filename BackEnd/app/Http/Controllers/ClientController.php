<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Liste tous les clients (pour un coach)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Si c'est un coach, retourner uniquement ses clients
        if ($user->hasRole('coach')) {
            $clients = Client::with(['user', 'coach.user'])
                ->where('coach_id', $user->coach->id)
                ->get();
        } else {
            // Admin voit tous les clients
            $clients = Client::with(['user', 'coach.user'])->get();
        }

        return response()->json($clients);
    }

    /**
     * Affiche un client spécifique
     */
    public function show(Client $client)
    {
        return response()->json(
            $client->load(['user', 'coach.user'])
        );
    }

    /**
     * Crée un nouveau client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'coach_id' => 'nullable|exists:coaches,id',
            'objectives' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'fitness_level' => 'required|in:beginner,intermediate,advanced',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'age' => 'nullable|integer|min:1|max:120',
        ]);

        $client = Client::create($validated);

        return response()->json($client->load('user', 'coach'), 201);
    }

    /**
     * Met à jour un client
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'coach_id' => 'nullable|exists:coaches,id',
            'objectives' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'fitness_level' => 'nullable|in:beginner,intermediate,advanced',
            'subscription_status' => 'nullable|in:active,paused,inactive',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'age' => 'nullable|integer|min:1|max:120',
            'sessions_remaining' => 'nullable|integer|min:0',
        ]);

        $client->update($validated);

        return response()->json($client->load('user', 'coach'));
    }

    /**
     * Supprime un client
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'message' => 'Client supprimé avec succès'
        ], 200);
    }
}
