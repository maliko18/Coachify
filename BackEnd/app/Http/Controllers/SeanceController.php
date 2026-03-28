<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSeanceRequest;
use App\Http\Requests\UpdateSeanceRequest;
use App\Models\Notification;
use App\Http\Resources\SeanceCollection;
use App\Http\Resources\SeanceResource;
use App\Models\Seance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeanceController extends Controller
{
    /**
     * Liste les séances du coach connecté
     */
    public function index(Request $request): JsonResponse
    {
        $coach = $request->user()->coach;

        $seances = Seance::with(['coach.user', 'clients.user'])
            ->withCount('clients')
            ->duCoach($coach->id)
            ->orderBy('date', 'asc')
            ->orderBy('heure_debut', 'asc')
            ->get();

        return response()->json(new SeanceCollection($seances));
    }

    /**
     * Affiche une séance spécifique
     */
    public function show(Request $request, Seance $seance): JsonResponse
    {
        // Vérifier que le coach est propriétaire de la séance
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $seance->load(['coach.user', 'clients.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'data' => new SeanceResource($seance),
        ]);
    }

    /**
     * Crée une nouvelle séance
     */
    public function store(StoreSeanceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['coach_id'] = $request->user()->coach->id;
        $validated['statut'] = 'planifiee';

        $seance = Seance::create($validated);
        $this->notifyCoachSeanceEvent($request->user()->id, $seance, 'seance_creee');
        $seance->load(['coach.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'message' => 'Séance créée avec succès.',
            'data' => new SeanceResource($seance),
        ], 201);
    }

    /**
     * Met à jour une séance
     */
    public function update(UpdateSeanceRequest $request, Seance $seance): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $oldData = [
            'date' => $seance->date?->toDateString(),
            'heure_debut' => (string) $seance->heure_debut,
            'lieu' => $seance->lieu,
            'statut' => $seance->statut,
        ];

        $seance->update($request->validated());

        $isCancelled = $seance->statut === 'annulee' && $oldData['statut'] !== 'annulee';
        $isScheduleChanged = $oldData['date'] !== $seance->date?->toDateString()
            || $oldData['heure_debut'] !== (string) $seance->heure_debut
            || $oldData['lieu'] !== $seance->lieu;

        if ($isCancelled) {
            $this->notifyClientsForSeance($seance, 'seance_annulee');
        } elseif ($isScheduleChanged) {
            $this->notifyClientsForSeance($seance, 'seance_modifiee');
        }

        $seance->load(['coach.user', 'clients.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'message' => 'Séance mise à jour avec succès.',
            'data' => new SeanceResource($seance),
        ]);
    }

    /**
     * Supprime une séance (soft delete)
     */
    public function destroy(Request $request, Seance $seance): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $seance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Séance supprimée avec succès.',
        ]);
    }

    // ──────────────────────────────────────────────
    // Gestion des inscriptions (clients)
    // ──────────────────────────────────────────────

    /**
     * Inscrire un client à une séance
     */
    public function inscrireClient(Request $request, Seance $seance): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
        ]);

        try {
            $resultat = $seance->inscrireClientAvecWaitingList($validated['client_id']);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $seance->load(['coach.user', 'clients.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'message' => $resultat === 'liste_attente'
                ? 'Séance complète: client ajouté à la liste d\'attente.'
                : 'Client inscrit à la séance avec succès.',
            'data' => new SeanceResource($seance),
        ]);
    }

    /**
     * Désinscrire un client d'une séance
     */
    public function desinscrireClient(Request $request, Seance $seance, int $clientId): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        // Vérifier si le client est inscrit
        if (!$seance->clientEstInscrit($clientId)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce client n\'est pas inscrit à cette séance.',
            ], 404);
        }

        $seance->clients()->detach($clientId);

        $seance->load(['coach.user', 'clients.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'message' => 'Client désinscrit de la séance avec succès.',
            'data' => new SeanceResource($seance),
        ]);
    }

    // ──────────────────────────────────────────────
    // Gestion de la présence
    // ──────────────────────────────────────────────

    /**
     * Marquer la présence d'un client (par le coach)
     */
    public function marquerPresence(Request $request, Seance $seance, int $clientId): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $validated = $request->validate([
            'statut_presence' => 'required|in:' . implode(',', Seance::STATUTS_PRESENCE),
        ]);

        // Vérifier si le client est inscrit
        if (!$seance->clientEstInscrit($clientId)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce client n\'est pas inscrit à cette séance.',
            ], 404);
        }

        try {
            $seance->marquerPresence($clientId, $validated['statut_presence']);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $seance->load(['coach.user', 'clients.user']);
        $seance->loadCount('clients');

        return response()->json([
            'success' => true,
            'message' => 'Présence mise à jour avec succès.',
            'data' => new SeanceResource($seance),
        ]);
    }

    // ──────────────────────────────────────────────
    // Gestion des feedbacks
    // ──────────────────────────────────────────────

    /**
     * Le coach laisse un feedback sur un client
     */
    public function feedbackCoach(Request $request, Seance $seance, int $clientId): JsonResponse
    {
        // Vérifier que le coach est propriétaire
        if ($seance->coach_id !== $request->user()->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette séance.',
            ], 403);
        }

        $validated = $request->validate([
            'feedback_coach' => 'required|string|max:2000',
            'note'           => 'nullable|integer|min:1|max:5',
        ]);

        // Vérifier si le client est inscrit
        if (!$seance->clientEstInscrit($clientId)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce client n\'est pas inscrit à cette séance.',
            ], 404);
        }

        $seance->clients()->updateExistingPivot($clientId, $validated);

        $seance->load(['coach.user', 'clients.user']);

        return response()->json([
            'success' => true,
            'message' => 'Feedback coach enregistré avec succès.',
            'data' => new SeanceResource($seance),
        ]);
    }

    /**
     * Un client laisse un feedback sur une séance
     */
    public function feedbackClient(Request $request, Seance $seance): JsonResponse
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas un client.',
            ], 403);
        }

        // Vérifier que le client est inscrit à cette séance
        if (!$seance->clientEstInscrit($client->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas inscrit à cette séance.',
            ], 403);
        }

        $validated = $request->validate([
            'feedback_client' => 'required|string|max:2000',
            'note'            => 'nullable|integer|min:1|max:5',
        ]);

        $seance->clients()->updateExistingPivot($client->id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Feedback enregistré avec succès.',
        ]);
    }

    // ──────────────────────────────────────────────
    // Routes côté client
    // ──────────────────────────────────────────────

    /**
     * Liste les séances du client connecté
     */
    public function mesSeances(Request $request): JsonResponse
    {
        $client = $request->user()->client;

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas un client.',
            ], 403);
        }

        $seances = $client->seances()
            ->with(['coach.user'])
            ->withCount('clients')
            ->orderBy('date', 'asc')
            ->orderBy('heure_debut', 'asc')
            ->get();

        return response()->json(new SeanceCollection($seances));
    }

    /**
     * Notification d'evenement seance pour le coach
     */
    private function notifyCoachSeanceEvent(int $userId, Seance $seance, string $type): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'lue' => false,
            'data' => [
                'seance_id' => $seance->id,
                'titre' => $seance->titre,
                'date' => $seance->date?->toDateString(),
                'heure_debut' => $seance->heure_debut,
            ],
        ]);
    }

    /**
     * Notifier tous les clients inscrits pour une seance
     */
    private function notifyClientsForSeance(Seance $seance, string $type): void
    {
        $clientUsers = $seance->clients()
            ->with('user')
            ->get()
            ->pluck('user')
            ->filter();

        foreach ($clientUsers as $user) {
            $key = $type . ':user:' . $user->id . ':seance:' . $seance->id . ':' . now()->format('YmdHi');

            Notification::firstOrCreate(
                ['unique_key' => $key],
                [
                    'user_id' => $user->id,
                    'type' => $type,
                    'lue' => false,
                    'data' => [
                        'seance_id' => $seance->id,
                        'titre' => $seance->titre,
                        'date' => $seance->date?->toDateString(),
                        'heure_debut' => $seance->heure_debut,
                        'lieu' => $seance->lieu,
                    ],
                ]
            );
        }
    }
}
