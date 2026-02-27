<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FactureResource extends JsonResource
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
            'numero' => $this->numero,
            'client_id' => $this->client_id,
            'paiement_id' => $this->paiement_id,
            'montant_ht' => (float) $this->montant_ht,
            'tva' => (float) $this->tva,
            'montant_ttc' => (float) $this->montant_ttc,
            'date_emission' => $this->date_emission?->toDateString(),
            'date_echeance' => $this->date_echeance?->toDateString(),
            'statut' => $this->statut,
            'statut_label' => $this->resource::STATUTS[$this->statut] ?? $this->statut,
            'pdf_path' => $this->pdf_path,
            'notes' => $this->notes,
            'est_en_retard' => $this->estEnRetard(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relations conditionnelles
            'client' => new ClientResource($this->whenLoaded('client')),
        ];
    }
}
