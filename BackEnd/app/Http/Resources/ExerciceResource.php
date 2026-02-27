<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciceResource extends JsonResource
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
            'nom' => $this->nom,
            'description' => $this->description,
            'consignes' => $this->consignes,

            // Classification
            'categorie' => $this->categorie,
            'categorie_label' => $this->categorie ? (\App\Models\Exercice::CATEGORIES[$this->categorie] ?? $this->categorie) : null,
            'niveau' => $this->niveau,
            'niveau_label' => $this->niveau ? (\App\Models\Exercice::NIVEAUX[$this->niveau] ?? $this->niveau) : null,

            // Matériel & médias
            'materiel' => $this->materiel ?? [],
            'medias' => $this->medias ?? [],
            'muscles_cibles' => $this->muscles_cibles ?? [],

            // Paramètres par défaut
            'duree_estimee' => $this->duree_estimee,
            'duree_formatee' => $this->duree_formatee,
            'series_defaut' => $this->series_defaut,
            'repetitions_defaut' => $this->repetitions_defaut,
            'repos_defaut' => $this->repos_defaut,

            // Statut
            'est_public' => $this->est_public,
            'est_actif' => $this->est_actif,

            // Relations
            'coach' => new CoachResource($this->whenLoaded('coach')),

            // Dates
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
