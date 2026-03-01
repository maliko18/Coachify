<?php

namespace Database\Factories;

use App\Models\Coach;
use App\Models\Programme;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Programme>
 */
class ProgrammeFactory extends Factory
{
    protected $model = Programme::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titres = [
            'Programme perte de poids 8 semaines',
            'Prise de masse débutant',
            'Remise en forme express 4 semaines',
            'Programme endurance marathon',
            'Force et puissance',
            'Programme full body',
            'HIIT 30 jours',
            'Yoga et souplesse',
            'Musculation progressive',
            'Transformation physique 12 semaines',
            'Cardio intense',
            'Programme tonification',
        ];

        return [
            'coach_id' => Coach::factory(),
            'titre' => fake()->randomElement($titres),
            'description' => fake()->paragraphs(2, true),
            'duree_semaines' => fake()->randomElement([4, 6, 8, 10, 12]),
            'type' => fake()->randomElement(Programme::TYPES),
            'statut' => 'brouillon',
            'prix' => fake()->optional(0.7)->randomFloat(2, 29.99, 199.99),
        ];
    }

    /**
     * Programme publié
     */
    public function publie(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'publie',
        ]);
    }

    /**
     * Programme archivé
     */
    public function archive(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'archive',
        ]);
    }

    /**
     * Programme gratuit
     */
    public function gratuit(): static
    {
        return $this->state(fn (array $attributes) => [
            'prix' => null,
        ]);
    }

    /**
     * Programme perte de poids
     */
    public function perteDePoids(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'perte_de_poids',
            'titre' => 'Programme perte de poids ' . fake()->randomElement([4, 8, 12]) . ' semaines',
        ]);
    }

    /**
     * Programme prise de masse
     */
    public function priseDeMasse(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'prise_de_masse',
            'titre' => 'Programme prise de masse ' . fake()->randomElement(['débutant', 'intermédiaire', 'avancé']),
        ]);
    }

    /**
     * Programme court (4 semaines)
     */
    public function court(): static
    {
        return $this->state(fn (array $attributes) => [
            'duree_semaines' => 4,
        ]);
    }

    /**
     * Programme long (12 semaines)
     */
    public function long(): static
    {
        return $this->state(fn (array $attributes) => [
            'duree_semaines' => 12,
        ]);
    }
}
