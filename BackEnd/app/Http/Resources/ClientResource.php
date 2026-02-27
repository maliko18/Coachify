<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
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
            'user_id' => $this->user_id,
            'coach_id' => $this->coach_id,
            'objectives' => $this->objectives,
            'medical_conditions' => $this->medical_conditions,
            'injuries_history' => $this->injuries_history,
            'fitness_level' => $this->fitness_level,
            'fitness_level_label' => $this->resource::FITNESS_LEVELS[$this->fitness_level] ?? $this->fitness_level,
            'preferred_activities' => $this->preferred_activities,
            'subscription_status' => $this->subscription_status,
            'subscription_status_label' => $this->resource::SUBSCRIPTION_STATUSES[$this->subscription_status] ?? $this->subscription_status,
            'start_date' => $this->start_date?->toDateString(),
            'sessions_remaining' => $this->sessions_remaining,
            'weight' => $this->weight,
            'height' => $this->height,
            'age' => $this->age,
            'bmi' => $this->bmi,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relations conditionnelles
            'user' => new UserResources($this->whenLoaded('user')),
            'coach' => new CoachResource($this->whenLoaded('coach')),
        ];
    }
}
