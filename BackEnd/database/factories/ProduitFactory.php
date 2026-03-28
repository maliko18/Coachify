<?php

namespace Database\Factories;

use App\Models\Coach;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Produit>
 */
class ProduitFactory extends Factory
{
    protected $model = Produit::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coach_id' => Coach::factory(),
            'nom' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'type' => fake()->randomElement(Produit::TYPES),
            'prix' => fake()->randomFloat(2, 5, 500),
            'stock_quantite' => fake()->numberBetween(0, 50),
            'alerte_stock' => fake()->numberBetween(0, 10),
            'visible' => true,
        ];
    }

    public function physique(): static
    {
        return $this->state(fn () => [
            'type' => 'physique',
            'stock_quantite' => fake()->numberBetween(1, 50),
            'alerte_stock' => fake()->numberBetween(1, 10),
        ]);
    }
}
