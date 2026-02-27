<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeanceResource extends JsonResource
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
            'titre' => $this->titre,
            'date' => $this->date?->format('Y-m-d'),
            'heure_debut' => $this->heure_debut,
            'duree' => $this->duree,
            'type' => $this->type,
            'capacite_max' => $this->capacite_max,
            'statut' => $this->statut,
            'lieu' => $this->lieu,
            'notes' => $this->notes,

            // Informations calculées
            'places_restantes' => $this->whenCounted('clients', function () {
                return max(0, $this->capacite_max - $this->clients_count);
            }),
            'est_complete' => $this->whenCounted('clients', function () {
                return $this->clients_count >= $this->capacite_max;
            }),

            // Relations conditionnelles
            'coach' => new CoachResource($this->whenLoaded('coach')),
            'clients' => $this->whenLoaded('clients', function () {
                return $this->clients->map(function ($client) {
                    return [
                        'id' => $client->id,
                        'user' => [
                            'id' => $client->user->id,
                            'full_name' => $client->user->full_name,
                            'email' => $client->user->email,
                        ],
                        'statut_presence' => $client->pivot->statut_presence,
                        'feedback_client' => $client->pivot->feedback_client,
                        'feedback_coach' => $client->pivot->feedback_coach,
                        'note' => $client->pivot->note,
                    ];
                });
            }),
            'clients_count' => $this->whenCounted('clients'),

            // Dates
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
}
