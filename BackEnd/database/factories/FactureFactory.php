<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Facture;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Facture>
 */
class FactureFactory extends Factory
{
    protected $model = Facture::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $montantHT = fake()->randomFloat(2, 50, 500);
        $tva = 20.00;
        $montantTTC = round($montantHT * (1 + $tva / 100), 2);

        $dateEmission = fake()->dateTimeBetween('-3 months', 'now');
        $dateEcheance = (clone $dateEmission)->modify('+30 days');

        return [
            'numero' => null, // Sera généré automatiquement par le modèle
            'client_id' => Client::factory(),
            'paiement_id' => null,
            'montant_ht' => $montantHT,
            'tva' => $tva,
            'montant_ttc' => $montantTTC,
            'date_emission' => $dateEmission,
            'date_echeance' => $dateEcheance,
            'statut' => 'brouillon',
            'pdf_path' => null,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Facture émise
     */
    public function emise(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'emise',
        ]);
    }

    /**
     * Facture payée
     */
    public function payee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'payee',
        ]);
    }

    /**
     * Facture annulée
     */
    public function annulee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'annulee',
        ]);
    }

    /**
     * Facture en retard
     */
    public function enRetard(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'en_retard',
            'date_echeance' => fake()->dateTimeBetween('-60 days', '-1 day'),
        ]);
    }

    /**
     * Facture avec TVA réduite (10%)
     */
    public function tvaReduite(): static
    {
        return $this->state(function (array $attributes) {
            $montantHT = $attributes['montant_ht'];
            $tva = 10.00;
            return [
                'tva' => $tva,
                'montant_ttc' => round($montantHT * (1 + $tva / 100), 2),
            ];
        });
    }

    /**
     * Facture sans TVA (0%)
     */
    public function sansTva(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'tva' => 0.00,
                'montant_ttc' => $attributes['montant_ht'],
            ];
        });
    }

    /**
     * Facture avec montant élevé
     */
    public function montantEleve(): static
    {
        return $this->state(function (array $attributes) {
            $montantHT = fake()->randomFloat(2, 500, 2000);
            $tva = $attributes['tva'] ?? 20.00;
            return [
                'montant_ht' => $montantHT,
                'montant_ttc' => round($montantHT * (1 + $tva / 100), 2),
            ];
        });
    }

    /**
     * Facture récente (cette semaine)
     */
    public function recente(): static
    {
        $dateEmission = fake()->dateTimeBetween('-7 days', 'now');
        $dateEcheance = (clone $dateEmission)->modify('+30 days');

        return $this->state(fn (array $attributes) => [
            'date_emission' => $dateEmission,
            'date_echeance' => $dateEcheance,
        ]);
    }
}
