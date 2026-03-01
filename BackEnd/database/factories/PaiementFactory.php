<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Paiement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Paiement>
 */
class PaiementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'contrat_id' => null,
            'coach_id' => Coach::factory(),
            'montant' => fake()->randomFloat(2, 15, 500),
            'devise' => 'EUR',
            'date_paiement' => fake()->dateTimeBetween('-6 months', 'now'),
            'methode' => fake()->randomElement([
                'carte_bancaire', 'virement', 'especes', 'cheque', 'paypal', 'stripe',
            ]),
            'statut' => fake()->randomElement(['en_attente', 'valide', 'valide', 'valide']), // 75% validé
            'reference' => fn () => Paiement::genererReference(),
            'reference_externe' => fake()->optional(0.5)->uuid(),
            'description' => fake()->optional(0.4)->randomElement([
                'Paiement pack 10 séances',
                'Abonnement mensuel',
                'Séance individuelle',
                'Programme numérique',
                'Cours collectif',
            ]),
            'notes' => fake()->optional(0.2)->sentence(),
            'montant_rembourse' => 0.00,
            'date_remboursement' => null,
            'motif_remboursement' => null,
        ];
    }

    /**
     * Paiement validé
     */
    public function valide(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'valide',
        ]);
    }

    /**
     * Paiement en attente
     */
    public function enAttente(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'en_attente',
        ]);
    }

    /**
     * Paiement refusé
     */
    public function refuse(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'refuse',
        ]);
    }

    /**
     * Paiement remboursé
     */
    public function rembourse(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'rembourse',
            'montant_rembourse' => $attributes['montant'],
            'date_remboursement' => fake()->dateTimeBetween($attributes['date_paiement'], 'now'),
            'motif_remboursement' => fake()->randomElement([
                'Demande du client',
                'Séance annulée',
                'Erreur de facturation',
                'Insatisfaction service',
            ]),
        ]);
    }

    /**
     * Paiement par carte bancaire
     */
    public function carteBancaire(): static
    {
        return $this->state(fn (array $attributes) => [
            'methode' => 'carte_bancaire',
            'reference_externe' => 'ch_' . fake()->uuid(),
        ]);
    }

    /**
     * Paiement en espèces
     */
    public function especes(): static
    {
        return $this->state(fn (array $attributes) => [
            'methode' => 'especes',
            'reference_externe' => null,
        ]);
    }

    /**
     * Paiement Stripe
     */
    public function stripe(): static
    {
        return $this->state(fn (array $attributes) => [
            'methode' => 'stripe',
            'reference_externe' => 'pi_' . fake()->uuid(),
        ]);
    }
}
