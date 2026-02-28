<?php

namespace Database\Seeders;

use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Programme;
use Illuminate\Database\Seeder;

class ProgrammeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coaches = Coach::all();
        $exercices = Exercice::all();

        if ($coaches->isEmpty()) {
            $this->command->warn('Aucun coach trouvé. Veuillez d\'abord exécuter CoachSeeder.');
            return;
        }

        if ($exercices->isEmpty()) {
            $this->command->warn('Aucun exercice trouvé. Veuillez d\'abord exécuter ExerciceSeeder.');
            return;
        }

        foreach ($coaches as $coach) {
            // Créer 2-4 programmes par coach
            $nombreProgrammes = fake()->numberBetween(2, 4);

            for ($i = 0; $i < $nombreProgrammes; $i++) {
                // Déterminer le statut
                $statuts = ['brouillon', 'publie', 'publie', 'publie']; // Plus de publiés
                $statut = fake()->randomElement($statuts);

                $programme = Programme::factory()->create([
                    'coach_id' => $coach->id,
                    'statut' => $statut,
                ]);

                // Attacher 4-8 exercices au programme
                $exercicesSelectionnes = $exercices->random(fake()->numberBetween(4, min(8, $exercices->count())));

                $ordre = 1;
                foreach ($exercicesSelectionnes as $exercice) {
                    $programme->exercices()->attach($exercice->id, [
                        'ordre' => $ordre,
                        'jour_semaine' => fake()->randomElement(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']),
                        'series' => fake()->numberBetween(3, 5),
                        'repetitions' => fake()->randomElement([8, 10, 12, 15, 20]),
                        'duree_minutes' => fake()->optional(0.3)->numberBetween(5, 20),
                        'repos_secondes' => fake()->randomElement([30, 45, 60, 90, 120]),
                        'instructions' => fake()->optional(0.5)->sentence(),
                    ]);
                    $ordre++;
                }
            }
        }

        $this->command->info('ProgrammeSeeder: ' . Programme::count() . ' programmes créés avec exercices attachés.');
    }
}
