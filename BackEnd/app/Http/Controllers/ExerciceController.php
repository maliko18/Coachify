<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExerciceCollection;
use App\Http\Resources\ExerciceResource;
use App\Models\Exercice;
use Illuminate\Http\Request;

class ExerciceController extends Controller
{
    /**
     * Liste les exercices du coach connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Exercice::with('coach.user')->actif();

        // Coach : uniquement ses exercices
        if ($user->hasRole('coach')) {
            $query->where('coach_id', $user->coach->id);
        }

        // Filtre par catégorie
        if ($request->has('categorie')) {
            $query->categorie($request->categorie);
        }

        // Filtre par niveau
        if ($request->has('niveau')) {
            $query->niveau($request->niveau);
        }

        // Filtre par muscle ciblé
        if ($request->has('muscle')) {
            $query->muscleCible($request->muscle);
        }

        // Recherche par nom
        if ($request->has('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }

        $exercices = $query->orderBy('categorie')->orderBy('nom')->get();

        return new ExerciceCollection($exercices);
    }

    /**
     * Affiche un exercice spécifique
     */
    public function show(Exercice $exercice)
    {
        return new ExerciceResource(
            $exercice->load('coach.user')
        );
    }

    /**
     * Crée un nouvel exercice
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'                 => 'required|string|max:255',
            'description'         => 'nullable|string',
            'consignes'           => 'nullable|string',
            'categorie'           => 'required|in:musculation,cardio,stretching,yoga,pilates,crossfit,boxe,fonctionnel,equilibre,plyometrie,autre',
            'niveau'              => 'required|in:debutant,intermediaire,avance,expert',
            'materiel'            => 'nullable|array',
            'materiel.*'          => 'string',
            'medias'              => 'nullable|array',
            'medias.*.type'       => 'required_with:medias|string|in:video,image,gif',
            'medias.*.url'        => 'required_with:medias|string|url',
            'muscles_cibles'      => 'nullable|array',
            'muscles_cibles.*'    => 'string',
            'duree_estimee'       => 'nullable|integer|min:1',
            'series_defaut'       => 'nullable|integer|min:1|max:20',
            'repetitions_defaut'  => 'nullable|integer|min:1|max:100',
            'repos_defaut'        => 'nullable|integer|min:0',
            'est_public'          => 'nullable|boolean',
            'est_actif'           => 'nullable|boolean',
        ]);

        // Assigner le coach connecté
        $validated['coach_id'] = $request->user()->coach->id;

        $exercice = Exercice::create($validated);

        return new ExerciceResource($exercice->load('coach.user'));
    }

    /**
     * Met à jour un exercice
     */
    public function update(Request $request, Exercice $exercice)
    {
        $this->authorizeCoachOwnership($request, $exercice);

        $validated = $request->validate([
            'nom'                 => 'nullable|string|max:255',
            'description'         => 'nullable|string',
            'consignes'           => 'nullable|string',
            'categorie'           => 'nullable|in:musculation,cardio,stretching,yoga,pilates,crossfit,boxe,fonctionnel,equilibre,plyometrie,autre',
            'niveau'              => 'nullable|in:debutant,intermediaire,avance,expert',
            'materiel'            => 'nullable|array',
            'materiel.*'          => 'string',
            'medias'              => 'nullable|array',
            'muscles_cibles'      => 'nullable|array',
            'muscles_cibles.*'    => 'string',
            'duree_estimee'       => 'nullable|integer|min:1',
            'series_defaut'       => 'nullable|integer|min:1|max:20',
            'repetitions_defaut'  => 'nullable|integer|min:1|max:100',
            'repos_defaut'        => 'nullable|integer|min:0',
            'est_public'          => 'nullable|boolean',
            'est_actif'           => 'nullable|boolean',
        ]);

        $exercice->update($validated);

        return new ExerciceResource($exercice->load('coach.user'));
    }

    /**
     * Supprime un exercice (soft delete)
     */
    public function destroy(Request $request, Exercice $exercice)
    {
        $this->authorizeCoachOwnership($request, $exercice);

        $exercice->delete();

        return response()->json([
            'message' => 'Exercice supprimé avec succès',
        ], 200);
    }

    /**
     * Vérifie que le coach est propriétaire de l'exercice
     */
    private function authorizeCoachOwnership(Request $request, Exercice $exercice): void
    {
        $user = $request->user();

        if ($user->hasRole('coach') && $exercice->coach_id !== $user->coach->id) {
            abort(403, 'Vous n\'êtes pas autorisé à modifier cet exercice.');
        }
    }
}
