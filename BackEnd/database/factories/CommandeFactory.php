<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Coach;
use App\Models\Commande;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commande>
 */
class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'coach_id' => Coach::factory(),
            'date_commande' => now(),
            'statut' => 'attente',
            'total' => fake()->randomFloat(2, 10, 400),
        ];
    }
}
