<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratResource extends JsonResource
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

            // Statut
            'statut' => $this->statut,
            'statut_label' => $this->statut ? (\App\Models\Contrat::STATUTS[$this->statut] ?? $this->statut) : null,

            // Dates
            'date_debut' => $this->date_debut?->toISOString(),
            'date_fin' => $this->date_fin?->toISOString(),

            // Séances
            'seances_totales' => $this->seances_totales,
            'seances_consommees' => $this->seances_consommees,
            'seances_restantes' => $this->seances_restantes,

            // Montants
            'montant_total' => $this->formatPrice($this->montant_total),
            'montant_paye' => $this->formatPrice($this->montant_paye),
            'montant_restant' => $this->formatPrice($this->montant_restant),
            'est_paye_integralement' => $this->isPayeIntegralement(),

            // Renouvellement
            'renouvellement_auto' => $this->renouvellement_auto,
            'date_prochain_renouvellement' => $this->date_prochain_renouvellement?->toISOString(),

            // Notes
            'notes' => $this->notes,

            // État calculé
            'is_actif' => $this->isActif(),
            'is_expire' => $this->isExpire(),

            // Relations
            'client' => new UserResources($this->whenLoaded('client.user', fn () => $this->client->user)),
            'offre' => new OffreResource($this->whenLoaded('offre')),
            'coach' => new CoachResource($this->whenLoaded('coach')),

            // Dates système
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
