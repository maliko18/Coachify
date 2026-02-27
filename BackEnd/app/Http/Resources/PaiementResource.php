<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
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

            // Montant
            'montant' => $this->formatPrice($this->montant),
            'devise' => $this->devise,

            // Date
            'date_paiement' => $this->date_paiement?->toISOString(),

            // Méthode & statut
            'methode' => $this->methode,
            'methode_label' => $this->methode ? (\App\Models\Paiement::METHODES[$this->methode] ?? $this->methode) : null,
            'statut' => $this->statut,
            'statut_label' => $this->statut ? (\App\Models\Paiement::STATUTS[$this->statut] ?? $this->statut) : null,

            // Références
            'reference' => $this->reference,
            'reference_externe' => $this->reference_externe,
            'description' => $this->description,
            'notes' => $this->notes,

            // Remboursement
            'montant_rembourse' => $this->formatPrice($this->montant_rembourse),
            'montant_net' => $this->formatPrice($this->montant_net),
            'date_remboursement' => $this->date_remboursement?->toISOString(),
            'motif_remboursement' => $this->motif_remboursement,
            'is_remboursable' => $this->isRemboursable(),

            // États
            'is_valide' => $this->isValide(),

            // Relations
            'client' => new UserResources($this->whenLoaded('client.user', fn () => $this->client->user)),
            'contrat' => new ContratResource($this->whenLoaded('contrat')),
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
