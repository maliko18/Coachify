<?php

namespace Database\Factories;

use App\Models\Coach;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exercice>
 */
class ExerciceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categorie = fake()->randomElement([
            'musculation', 'cardio', 'stretching', 'yoga', 'pilates',
            'crossfit', 'boxe', 'fonctionnel', 'equilibre', 'plyometrie',
        ]);

        return [
            'coach_id' => Coach::factory(),
            'nom' => $this->nomParCategorie($categorie),
            'description' => fake()->paragraph(),
            'consignes' => fake()->paragraph(),
            'categorie' => $categorie,
            'niveau' => fake()->randomElement(['debutant', 'intermediaire', 'avance', 'expert']),
            'materiel' => $this->materielParCategorie($categorie),
            'medias' => null,
            'muscles_cibles' => $this->musclesParCategorie($categorie),
            'duree_estimee' => fake()->randomElement([30, 45, 60, 90, 120, 180]),
            'series_defaut' => fake()->numberBetween(2, 5),
            'repetitions_defaut' => fake()->randomElement([8, 10, 12, 15, 20]),
            'repos_defaut' => fake()->randomElement([30, 45, 60, 90, 120]),
            'est_public' => fake()->boolean(60),
            'est_actif' => true,
        ];
    }

    /**
     * Générer un nom cohérent par catégorie
     */
    private function nomParCategorie(string $categorie): string
    {
        $noms = [
            'musculation' => [
                'Développé couché', 'Squat barre', 'Soulevé de terre', 'Curl biceps',
                'Press militaire', 'Rowing barre', 'Leg press', 'Extension triceps',
                'Élévations latérales', 'Tirage vertical',
            ],
            'cardio' => [
                'Course fractionnée', 'Burpees', 'Mountain climbers', 'Jumping jacks',
                'Corde à sauter', 'Sprint 100m', 'Vélo HIIT', 'Rameur intervalles',
            ],
            'stretching' => [
                'Étirement ischio-jambiers', 'Étirement quadriceps', 'Ouverture de hanches',
                'Étirement dorsaux', 'Rotation thoracique', 'Étirement mollets',
            ],
            'yoga' => [
                'Salutation au soleil', 'Posture du guerrier', 'Posture de l\'arbre',
                'Chien tête en bas', 'Posture du cobra', 'Posture du pigeon',
            ],
            'pilates' => [
                'The Hundred', 'Roll Up', 'Leg Circle', 'Rolling Like a Ball',
                'Single Leg Stretch', 'Teaser',
            ],
            'crossfit' => [
                'Clean and Jerk', 'Snatch', 'Thrusters', 'Wall Balls',
                'Box Jumps', 'Toes to Bar', 'Muscle-Up', 'Handstand Push-Up',
            ],
            'boxe' => [
                'Jab-Cross combo', 'Uppercuts au sac', 'Crochet-esquive',
                'Shadow boxing', 'Sparring léger', 'Travail au speed bag',
            ],
            'fonctionnel' => [
                'Turkish Get-Up', 'Farmer Walk', 'Kettlebell Swing',
                'Bear Crawl', 'Sled Push', 'Battle Ropes',
            ],
            'equilibre' => [
                'Planche sur Bosu', 'Fente bulgare instable', 'Pistol Squat',
                'Marche sur poutre', 'Flamingo debout',
            ],
            'plyometrie' => [
                'Box Jump', 'Depth Jump', 'Broad Jump', 'Tuck Jump',
                'Split Jump Lunge', 'Plyo Push-Up',
            ],
        ];

        return fake()->randomElement($noms[$categorie] ?? ['Exercice personnalisé']);
    }

    /**
     * Matériel adapté par catégorie
     */
    private function materielParCategorie(string $categorie): ?array
    {
        $materiel = [
            'musculation' => ['haltères', 'barre', 'banc', 'rack'],
            'cardio' => ['tapis de course', 'vélo', 'rameur', 'corde à sauter'],
            'stretching' => ['tapis', 'sangle'],
            'yoga' => ['tapis de yoga', 'blocs', 'sangle'],
            'pilates' => ['tapis', 'ballon', 'anneau'],
            'crossfit' => ['barre olympique', 'box', 'anneaux', 'kettlebell'],
            'boxe' => ['gants', 'sac de frappe', 'protège-dents'],
            'fonctionnel' => ['kettlebell', 'sled', 'battle rope'],
            'equilibre' => ['bosu', 'swiss ball', 'planche instable'],
            'plyometrie' => ['box', 'tapis'],
        ];

        $items = $materiel[$categorie] ?? null;
        if (!$items) {
            return null;
        }

        return fake()->randomElements($items, fake()->numberBetween(1, min(3, count($items))));
    }

    /**
     * Muscles ciblés par catégorie
     */
    private function musclesParCategorie(string $categorie): ?array
    {
        $muscles = [
            'musculation' => ['pectoraux', 'dorsaux', 'quadriceps', 'biceps', 'triceps', 'épaules', 'ischio-jambiers'],
            'cardio' => ['cœur', 'jambes', 'abdominaux'],
            'stretching' => ['ischio-jambiers', 'quadriceps', 'dorsaux', 'hanches'],
            'yoga' => ['core', 'jambes', 'épaules', 'dos'],
            'pilates' => ['core', 'abdominaux', 'fessiers'],
            'crossfit' => ['corps entier', 'épaules', 'jambes', 'dos'],
            'boxe' => ['épaules', 'bras', 'core', 'cardio'],
            'fonctionnel' => ['corps entier', 'core', 'grip'],
            'equilibre' => ['core', 'chevilles', 'jambes'],
            'plyometrie' => ['jambes', 'fessiers', 'mollets'],
        ];

        $items = $muscles[$categorie] ?? null;
        if (!$items) {
            return null;
        }

        return fake()->randomElements($items, fake()->numberBetween(1, min(3, count($items))));
    }

    /**
     * Exercice de niveau débutant
     */
    public function debutant(): static
    {
        return $this->state(fn (array $attributes) => [
            'niveau' => 'debutant',
            'series_defaut' => 3,
            'repetitions_defaut' => 12,
        ]);
    }

    /**
     * Exercice avancé
     */
    public function avance(): static
    {
        return $this->state(fn (array $attributes) => [
            'niveau' => 'avance',
            'series_defaut' => 5,
            'repetitions_defaut' => 8,
        ]);
    }

    /**
     * Exercice de musculation
     */
    public function musculation(): static
    {
        return $this->state(fn (array $attributes) => [
            'categorie' => 'musculation',
            'nom' => $this->nomParCategorie('musculation'),
            'materiel' => $this->materielParCategorie('musculation'),
            'muscles_cibles' => $this->musclesParCategorie('musculation'),
        ]);
    }

    /**
     * Exercice de cardio
     */
    public function cardio(): static
    {
        return $this->state(fn (array $attributes) => [
            'categorie' => 'cardio',
            'nom' => $this->nomParCategorie('cardio'),
            'materiel' => $this->materielParCategorie('cardio'),
            'muscles_cibles' => $this->musclesParCategorie('cardio'),
        ]);
    }

    /**
     * Exercice inactif
     */
    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'est_actif' => false,
            'est_public' => false,
        ]);
    }
}
