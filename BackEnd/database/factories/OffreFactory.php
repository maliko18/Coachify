<?php

namespace Database\Factories;

use App\Models\Coach;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Offre>
 */
class OffreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['pack_seance', 'abonnement', 'collectif', 'programme_numerique', 'produit']);

        return [
            'coach_id' => Coach::factory(),
            'nom' => $this->nomParType($type),
            'description' => fake()->paragraph(),
            'type' => $type,
            'prix' => fake()->randomFloat(2, 15, 500),
            'tva' => 20.00,
            'devise' => 'EUR',
            'nombre_seances' => $type === 'pack_seance' ? fake()->randomElement([5, 10, 15, 20]) : null,
            'duree_jours' => $type === 'abonnement' ? fake()->randomElement([30, 90, 180, 365]) : null,
            'capacite_max' => $type === 'collectif' ? fake()->numberBetween(5, 20) : null,
            'options' => null,
            'statut' => 'active',
            'est_visible' => true,
            'prix_promotion' => null,
            'date_debut_promotion' => null,
            'date_fin_promotion' => null,
        ];
    }

    /**
     * Générer un nom cohérent selon le type
     */
    private function nomParType(string $type): string
    {
        return match ($type) {
            'pack_seance' => fake()->randomElement([
                'Pack Découverte 5 séances',
                'Pack Standard 10 séances',
                'Pack Premium 20 séances',
                'Pack Duo 10 séances',
            ]),
            'abonnement' => fake()->randomElement([
                'Abonnement Mensuel',
                'Abonnement Trimestriel',
                'Abonnement Semestriel',
                'Abonnement Annuel',
            ]),
            'collectif' => fake()->randomElement([
                'Cours collectif HIIT',
                'Cours collectif Yoga',
                'Cours collectif Pilates',
                'Cours collectif CrossFit',
                'Boot Camp extérieur',
            ]),
            'programme_numerique' => fake()->randomElement([
                'Programme Perte de Poids 12 semaines',
                'Programme Prise de Masse 8 semaines',
                'Programme Remise en Forme 4 semaines',
                'Programme Running Débutant',
            ]),
            'produit' => fake()->randomElement([
                'T-shirt coach',
                'Shaker protéines',
                'Bandes élastiques',
                'Plan nutritionnel PDF',
            ]),
        };
    }

    /**
     * Offre de type pack de séances
     */
    public function packSeance(int $nbSeances = 10): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'pack_seance',
            'nom' => "Pack {$nbSeances} séances",
            'nombre_seances' => $nbSeances,
            'prix' => $nbSeances * fake()->randomFloat(2, 30, 60),
        ]);
    }

    /**
     * Offre de type abonnement
     */
    public function abonnement(int $dureeJours = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'abonnement',
            'nom' => 'Abonnement Mensuel',
            'duree_jours' => $dureeJours,
            'prix' => fake()->randomFloat(2, 49, 199),
        ]);
    }

    /**
     * Offre de type collectif
     */
    public function collectif(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'collectif',
            'nom' => 'Cours collectif HIIT',
            'capacite_max' => fake()->numberBetween(8, 15),
            'prix' => fake()->randomFloat(2, 10, 25),
        ]);
    }

    /**
     * Offre inactive
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'inactive',
            'est_visible' => false,
        ]);
    }

    /**
     * Offre en promotion
     */
    public function enPromotion(): static
    {
        return $this->state(fn (array $attributes) => [
            'prix_promotion' => round($attributes['prix'] * 0.8, 2),
            'date_debut_promotion' => now()->subDays(5),
            'date_fin_promotion' => now()->addDays(25),
        ]);
    }
}
