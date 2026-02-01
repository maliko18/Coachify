<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fitnessLevels = ['beginner', 'intermediate', 'advanced'];
        $activities = ['musculation', 'cardio', 'yoga', 'running', 'natation', 'crossfit', 'boxe'];

        return [
            'user_id' => \App\Models\User::factory(),
            'coach_id' => null, // À assigner manuellement
            'objectives' => fake()->randomElement([
                'Perdre du poids et améliorer ma condition physique',
                'Prendre de la masse musculaire',
                'Améliorer mon endurance',
                'Préparation pour un marathon',
                'Remise en forme générale',
                'Renforcement musculaire et tonification',
            ]),
            'medical_conditions' => fake()->optional(0.3)->randomElement([
                'Aucune condition particulière',
                'Problèmes de dos (lombaires)',
                'Asthme léger',
                'Hypertension contrôlée',
                null,
            ]),
            'injuries_history' => fake()->optional(0.4)->randomElements([
                'Entorse cheville droite (2023)',
                'Tendinite épaule (2022)',
                'Déchirure musculaire mollet (2021)',
            ], fake()->numberBetween(0, 2)),
            'fitness_level' => fake()->randomElement($fitnessLevels),
            'preferred_activities' => fake()->randomElements($activities, fake()->numberBetween(1, 3)),
            'subscription_status' => 'active',
            'start_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'sessions_remaining' => fake()->numberBetween(0, 20),
            'weight' => fake()->randomFloat(2, 50, 120),
            'height' => fake()->randomFloat(2, 150, 200),
            'age' => fake()->numberBetween(18, 65),
        ];
    }

    /**
     * Client débutant
     */
    public function beginner(): static
    {
        return $this->state(fn (array $attributes) => [
            'fitness_level' => 'beginner',
            'objectives' => 'Débuter dans le sport et améliorer ma condition physique',
        ]);
    }

    /**
     * Client intermédiaire
     */
    public function intermediate(): static
    {
        return $this->state(fn (array $attributes) => [
            'fitness_level' => 'intermediate',
            'sessions_remaining' => fake()->numberBetween(5, 15),
        ]);
    }

    /**
     * Client avancé
     */
    public function advanced(): static
    {
        return $this->state(fn (array $attributes) => [
            'fitness_level' => 'advanced',
            'objectives' => 'Améliorer mes performances et repousser mes limites',
            'sessions_remaining' => fake()->numberBetween(10, 20),
        ]);
    }

    /**
     * Client inactif
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'inactive',
            'sessions_remaining' => 0,
        ]);
    }
}
