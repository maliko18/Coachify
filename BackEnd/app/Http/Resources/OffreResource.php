<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffreResource extends JsonResource
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
            'type' => $this->type,
            'type_label' => $this->type ? (\App\Models\Offre::TYPES[$this->type] ?? $this->type) : null,

            // Tarification
            'prix' => $this->formatPrice($this->prix),
            'prix_ttc' => $this->formatPrice($this->prix_ttc),
            'tva' => (float) $this->tva,
            'devise' => $this->devise,

            // Détails
            'nombre_seances' => $this->nombre_seances,
            'duree_jours' => $this->duree_jours,
            'capacite_max' => $this->capacite_max,
            'options' => $this->options,

            // Statut
            'statut' => $this->statut,
            'est_visible' => $this->est_visible,

            // Promotion
            'en_promotion' => $this->en_promotion,
            'prix_promotion' => $this->formatPrice($this->prix_promotion),
            'prix_effectif' => $this->formatPrice($this->prix_effectif),
            'date_debut_promotion' => $this->date_debut_promotion?->toISOString(),
            'date_fin_promotion' => $this->date_fin_promotion?->toISOString(),

            // Relations
            'coach' => new CoachResource($this->whenLoaded('coach')),
            'contrats_count' => $this->whenCounted('contrats'),

            // Dates
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Formater le prix
     */
    private function formatPrice($price): ?array
    {
        if ($price === null) {
            return null;
        }

        return [
            'amount' => (float) $price,
            'formatted' => number_format((float) $price, 2, ',', ' ') . ' €',
            'currency' => 'EUR',
        ];
    }
}
