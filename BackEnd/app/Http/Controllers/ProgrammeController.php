<?php

namespace App\Http\Controllers;

use App\Http\Requests\AjouterExerciceRequest;
use App\Http\Requests\StoreProgrammeRequest;
use App\Http\Requests\UpdateProgrammeRequest;
use App\Http\Resources\ProgrammeCollection;
use App\Http\Resources\ProgrammeResource;
use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Programme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgrammeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): ProgrammeCollection
    {
        $query = Programme::with(['coach', 'exercices']);

        // Filtrer par coach (si l'utilisateur est un coach, montrer seulement ses programmes)
        if ($request->user()->coach) {
            $query->where('coach_id', $request->user()->coach->id);
        }

        // Filtres optionnels
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Tri par défaut: plus récent en premier
        $programmes = $query->orderBy('created_at', 'desc')->get();

        return new ProgrammeCollection($programmes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProgrammeRequest $request): JsonResponse
    {
        $coach = $request->user()->coach;

        if (!$coach) {
            return response()->json([
                'message' => 'Vous devez être un coach pour créer un programme.',
            ], 403);
        }

        $programme = Programme::create([
            ...$request->validated(),
            'coach_id' => $coach->id,
        ]);

        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme créé avec succès.',
            'data' => new ProgrammeResource($programme),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Programme $programme): ProgrammeResource
    {
        $programme->load(['coach', 'exercices']);
        return new ProgrammeResource($programme);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProgrammeRequest $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        $programme->update($request->validated());
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme mis à jour avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à supprimer ce programme.',
            ], 403);
        }

        $programme->delete();

        return response()->json([
            'message' => 'Programme supprimé avec succès.',
        ]);
    }

    /**
     * Ajouter un exercice au programme.
     */
    public function ajouterExercice(AjouterExerciceRequest $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        $validated = $request->validated();
        $exerciceId = $validated['exercice_id'];
        unset($validated['exercice_id']);

        // Vérifier si l'exercice est déjà dans le programme
        if ($programme->exercices()->where('exercice_id', $exerciceId)->exists()) {
            return response()->json([
                'message' => 'Cet exercice est déjà dans le programme.',
            ], 422);
        }

        // Définir l'ordre automatiquement si non fourni
        if (!isset($validated['ordre'])) {
            $validated['ordre'] = $programme->exercices()->count() + 1;
        }

        $programme->exercices()->attach($exerciceId, $validated);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Exercice ajouté au programme avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Modifier un exercice dans le programme (données pivot).
     */
    public function modifierExercice(Request $request, Programme $programme, Exercice $exercice): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        $validated = $request->validate([
            'ordre' => ['sometimes', 'integer', 'min:1'],
            'jour_semaine' => ['sometimes', 'string', 'in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche'],
            'series' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'repetitions' => ['nullable', 'integer', 'min:1', 'max:100'],
            'duree_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
            'repos_secondes' => ['sometimes', 'integer', 'min:0', 'max:600'],
            'instructions' => ['nullable', 'string', 'max:1000'],
        ]);

        $programme->exercices()->updateExistingPivot($exercice->id, $validated);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Exercice mis à jour dans le programme avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Retirer un exercice du programme.
     */
    public function retirerExercice(Request $request, Programme $programme, Exercice $exercice): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        $programme->exercices()->detach($exercice->id);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Exercice retiré du programme avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Publier un programme.
     */
    public function publier(Request $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        if ($programme->statut === 'publie') {
            return response()->json([
                'message' => 'Ce programme est déjà publié.',
            ], 422);
        }

        // Vérifier qu'il y a au moins un exercice
        if ($programme->exercices()->count() === 0) {
            return response()->json([
                'message' => 'Le programme doit contenir au moins un exercice pour être publié.',
            ], 422);
        }

        $programme->update(['statut' => 'publie']);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme publié avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Dépublier un programme (repasser en brouillon).
     */
    public function depublier(Request $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        if ($programme->statut !== 'publie') {
            return response()->json([
                'message' => 'Ce programme n\'est pas publié.',
            ], 422);
        }

        $programme->update(['statut' => 'brouillon']);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme dépublié avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Archiver un programme.
     */
    public function archiver(Request $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce programme.',
            ], 403);
        }

        if ($programme->statut === 'archive') {
            return response()->json([
                'message' => 'Ce programme est déjà archivé.',
            ], 422);
        }

        $programme->update(['statut' => 'archive']);
        $programme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme archivé avec succès.',
            'data' => new ProgrammeResource($programme),
        ]);
    }

    /**
     * Dupliquer un programme.
     */
    public function dupliquer(Request $request, Programme $programme): JsonResponse
    {
        // Vérifier que le coach est propriétaire du programme
        $coach = $request->user()->coach;
        if (!$coach || $programme->coach_id !== $coach->id) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à dupliquer ce programme.',
            ], 403);
        }

        // Créer une copie du programme
        $nouveauProgramme = $programme->replicate();
        $nouveauProgramme->titre = $programme->titre . ' (copie)';
        $nouveauProgramme->statut = 'brouillon';
        $nouveauProgramme->save();

        // Copier les exercices avec les données pivot
        foreach ($programme->exercices as $exercice) {
            $nouveauProgramme->exercices()->attach($exercice->id, [
                'ordre' => $exercice->pivot->ordre,
                'jour_semaine' => $exercice->pivot->jour_semaine,
                'series' => $exercice->pivot->series,
                'repetitions' => $exercice->pivot->repetitions,
                'duree_minutes' => $exercice->pivot->duree_minutes,
                'repos_secondes' => $exercice->pivot->repos_secondes,
                'instructions' => $exercice->pivot->instructions,
            ]);
        }

        $nouveauProgramme->load(['coach', 'exercices']);

        return response()->json([
            'message' => 'Programme dupliqué avec succès.',
            'data' => new ProgrammeResource($nouveauProgramme),
        ], 201);
    }
}
