<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\database\factories\CoachFactory.php

namespace Database\Factories;

use App\Models\Coach;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Coach>
 */
class CoachFactory extends Factory
{
    protected $model = Coach::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => fake()->paragraphs(2, true),
            'specialties' => fake()->randomElements(Coach::SPECIALTIES, fake()->numberBetween(2, 5)),
            'certifications' => $this->generateCertifications(),
            'experience_years' => fake()->numberBetween(1, 20),
            'hourly_rate' => fake()->randomFloat(2, 30, 150),
            'is_available' => true,
        ];
    }

    /**
     * Générer des certifications aléatoires
     */
    private function generateCertifications(): array
    {
        $certifications = [
            'BPJEPS Activités de la Forme',
            'BPJEPS Activités Gymniques',
            'CQP Instructeur Fitness',
            'Diplôme Universitaire Nutrition Sportive',
            'Certification CrossFit Level 1',
            'Certification CrossFit Level 2',
            'Diplôme d\'État de la Jeunesse',
            'Licence STAPS',
            'Master STAPS',
            'Certification TRX',
            'Certification Kettlebell',
            'Formation Pilates Mat',
            'Certification Yoga Alliance RYT 200',
            'Certification Personal Trainer ACE',
            'Certification NSCA-CPT',
        ];

        return fake()->randomElements($certifications, fake()->numberBetween(1, 4));
    }

    /**
     * Coach indisponible
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }

    /**
     * Coach débutant
     */
    public function beginner(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_years' => fake()->numberBetween(1, 3),
            'hourly_rate' => fake()->randomFloat(2, 30, 50),
            'certifications' => ['CQP Instructeur Fitness'],
        ]);
    }

    /**
     * Coach expérimenté
     */
    public function experienced(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_years' => fake()->numberBetween(8, 15),
            'hourly_rate' => fake()->randomFloat(2, 80, 120),
            'certifications' => [
                'BPJEPS Activités de la Forme',
                'Licence STAPS',
                'Certification CrossFit Level 2',
            ],
        ]);
    }

    /**
     * Coach expert
     */
    public function expert(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_years' => fake()->numberBetween(15, 25),
            'hourly_rate' => fake()->randomFloat(2, 100, 150),
            'certifications' => [
                'BPJEPS Activités de la Forme',
                'Master STAPS',
                'Diplôme Universitaire Nutrition Sportive',
                'Certification CrossFit Level 2',
            ],
        ]);
    }

    /**
     * Coach spécialisé musculation
     */
    public function musculation(): static
    {
        return $this->state(fn (array $attributes) => [
            'specialties' => ['musculation', 'prise_de_masse', 'nutrition'],
            'bio' => 'Coach spécialisé en musculation et développement musculaire. ' . fake()->paragraph(),
        ]);
    }

    /**
     * Coach spécialisé perte de poids
     */
    public function weightLoss(): static
    {
        return $this->state(fn (array $attributes) => [
            'specialties' => ['perte_de_poids', 'cardio', 'nutrition', 'remise_en_forme'],
            'bio' => 'Expert en perte de poids et remise en forme. ' . fake()->paragraph(),
        ]);
    }

    /**
     * Coach spécialisé yoga
     */
    public function yoga(): static
    {
        return $this->state(fn (array $attributes) => [
            'specialties' => ['yoga', 'pilates', 'stretching'],
            'certifications' => ['Certification Yoga Alliance RYT 200', 'Formation Pilates Mat'],
            'bio' => 'Professeur de yoga certifié. ' . fake()->paragraph(),
        ]);
    }

    /**
     * Coach avec tarif bas
     */
    public function lowRate(): static
    {
        return $this->state(fn (array $attributes) => [
            'hourly_rate' => fake()->randomFloat(2, 25, 40),
        ]);
    }

    /**
     * Coach avec tarif élevé
     */
    public function highRate(): static
    {
        return $this->state(fn (array $attributes) => [
            'hourly_rate' => fake()->randomFloat(2, 100, 200),
        ]);
    }
}
