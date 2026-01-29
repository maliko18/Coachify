<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoachResource extends JsonResource
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
            'bio' => $this->bio,
            'specialties' => $this->specialties ?? [],
            'certifications' => $this->certifications ?? [],
            'experience_years' => $this->experience_years,
            'hourly_rate' => $this->formatPrice($this->hourly_rate),
            'is_available' => $this->is_available,
            
            // Relation utilisateur conditionnelle
            'user' => new UserResources($this->whenLoaded('user')),
            
            // Dates formatées
            'created_at' => $this->formatDate($this->created_at),
            'updated_at' => $this->formatDate($this->updated_at),
        ];
    }

    /**
     * Formater une date en format ISO 8601
     */
    private function formatDate($date): ?string
    {
        return $date?->toISOString();
    }

    /**
     * Formater le prix avec 2 décimales
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
