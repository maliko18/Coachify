<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\CommandeItem;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommandeItem>
 */
class CommandeItemFactory extends Factory
{
    protected $model = CommandeItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'commande_id' => Commande::factory(),
            'produit_id' => Produit::factory(),
            'quantite' => fake()->numberBetween(1, 5),
            'prix_unitaire' => fake()->randomFloat(2, 5, 300),
        ];
    }
}
