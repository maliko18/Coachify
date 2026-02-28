<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgrammeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'coach_id' => $this->coach_id,
            'titre' => $this->titre,
            'description' => $this->description,
            'duree_semaines' => $this->duree_semaines,
            'type' => $this->type,
            'statut' => $this->statut,
            'prix' => $this->prix,
            'est_gratuit' => $this->prix === null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relations conditionnelles
            'coach' => new CoachResource($this->whenLoaded('coach')),
            'exercices' => $this->whenLoaded('exercices', function () {
                return $this->exercices->map(function ($exercice) {
                    return [
                        'id' => $exercice->id,
                        'nom' => $exercice->nom,
                        'description' => $exercice->description,
                        'categorie' => $exercice->categorie,
                        'niveau' => $exercice->niveau,
                        'duree_estimee' => $exercice->duree_estimee,
                        // Données du pivot
                        'pivot' => [
                            'ordre' => $exercice->pivot->ordre,
                            'jour_semaine' => $exercice->pivot->jour_semaine,
                            'series' => $exercice->pivot->series,
                            'repetitions' => $exercice->pivot->repetitions,
                            'duree_minutes' => $exercice->pivot->duree_minutes,
                            'repos_secondes' => $exercice->pivot->repos_secondes,
                            'instructions' => $exercice->pivot->instructions,
                        ],
                    ];
                });
            }),

            // Métadonnées calculées
            'nombre_exercices' => $this->whenLoaded('exercices', fn() => $this->exercices->count()),
        ];
    }
}
