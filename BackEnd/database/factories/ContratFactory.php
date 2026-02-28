<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Coach;
use App\Models\Offre;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contrat>
 */
class ContratFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateDebut = fake()->dateTimeBetween('-6 months', 'now');
        $seancesTotales = fake()->randomElement([5, 10, 15, 20]);
        $seancesConsommees = fake()->numberBetween(0, $seancesTotales);
        $montantTotal = fake()->randomFloat(2, 100, 800);
        $montantPaye = fake()->randomElement([$montantTotal, round($montantTotal * 0.5, 2), 0]);

        return [
            'client_id' => Client::factory(),
            'offre_id' => Offre::factory(),
            'coach_id' => Coach::factory(),
            'date_debut' => $dateDebut,
            'date_fin' => fake()->optional(0.7)->dateTimeBetween($dateDebut, '+1 year'),
            'statut' => fake()->randomElement(['actif', 'en_attente', 'termine']),
            'seances_totales' => $seancesTotales,
            'seances_consommees' => $seancesConsommees,
            'seances_restantes' => $seancesTotales - $seancesConsommees,
            'montant_total' => $montantTotal,
            'montant_paye' => $montantPaye,
            'notes' => fake()->optional(0.3)->sentence(),
            'renouvellement_auto' => fake()->boolean(30),
            'date_prochain_renouvellement' => null,
        ];
    }

    /**
     * Contrat actif
     */
    public function actif(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'actif',
            'date_debut' => now()->subDays(fake()->numberBetween(1, 60)),
            'date_fin' => now()->addDays(fake()->numberBetween(30, 180)),
        ]);
    }

    /**
     * Contrat terminé
     */
    public function termine(): static
    {
        return $this->state(function (array $attributes) {
            $total = $attributes['seances_totales'];
            return [
                'statut' => 'termine',
                'seances_consommees' => $total,
                'seances_restantes' => 0,
                'montant_paye' => $attributes['montant_total'],
                'date_fin' => now()->subDays(fake()->numberBetween(1, 30)),
            ];
        });
    }

    /**
     * Contrat en attente
     */
    public function enAttente(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'en_attente',
            'seances_consommees' => 0,
            'seances_restantes' => $attributes['seances_totales'],
            'montant_paye' => 0,
        ]);
    }

    /**
     * Contrat expirant bientôt (dans 7 jours)
     */
    public function expirationProche(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'actif',
            'date_fin' => now()->addDays(fake()->numberBetween(1, 7)),
        ]);
    }
}
