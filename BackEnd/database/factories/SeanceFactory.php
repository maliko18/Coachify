<?php

namespace Database\Factories;

use App\Models\Coach;
use App\Models\Seance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Seance>
 */
class SeanceFactory extends Factory
{
    protected $model = Seance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coach_id' => Coach::factory(),
            'titre' => fake()->randomElement([
                'Séance musculation full body',
                'Cours de yoga matinal',
                'HIIT cardio intense',
                'Séance de stretching',
                'CrossFit WOD du jour',
                'Boxing fitness',
                'Pilates débutant',
                'Running coaching',
                'Renforcement musculaire',
                'Circuit training',
                'Séance abdos-fessiers',
                'Cardio boxing',
            ]),
            'date' => fake()->dateTimeBetween('now', '+2 months'),
            'heure_debut' => fake()->randomElement([
                '08:00', '09:00', '09:30', '10:00', '11:00',
                '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '19:30',
            ]),
            'duree' => fake()->randomElement([30, 45, 60, 90, 120]),
            'type' => fake()->randomElement(Seance::TYPES),
            'capacite_max' => fake()->numberBetween(1, 20),
            'statut' => 'planifiee',
            'lieu' => fake()->randomElement([
                'Salle principale',
                'Studio yoga',
                'Espace cardio',
                'Salle de musculation',
                'Extérieur - Parc',
                'En ligne (Zoom)',
                'Studio pilates',
                null,
            ]),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Séance individuelle (1 seul client)
     */
    public function individuelle(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'individuelle',
            'capacite_max' => 1,
        ]);
    }

    /**
     * Séance collective (plusieurs clients)
     */
    public function collective(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'collective',
            'capacite_max' => fake()->numberBetween(5, 20),
        ]);
    }

    /**
     * Séance en ligne
     */
    public function enLigne(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'en_ligne',
            'lieu' => 'En ligne (Zoom)',
            'capacite_max' => fake()->numberBetween(5, 30),
        ]);
    }

    /**
     * Séance terminée (dans le passé)
     */
    public function terminee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'terminee',
            'date' => fake()->dateTimeBetween('-3 months', '-1 day'),
        ]);
    }

    /**
     * Séance annulée
     */
    public function annulee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'annulee',
        ]);
    }

    /**
     * Séance en cours
     */
    public function enCours(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'en_cours',
            'date' => now()->toDateString(),
        ]);
    }
}
