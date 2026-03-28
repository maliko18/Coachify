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
                        'jour' => fake()->randomElement(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']),
                        'semaine' => fake()->randomElement([1, 2, 3, 4]),
                        'sets' => fake()->numberBetween(3, 5),
                        'reps' => fake()->randomElement(['8', '10', '12', '15', '20']),
                        'repos' => fake()->randomElement(['30s', '45s', '60s', '90s', '2min']),
                        'notes' => fake()->optional(0.5)->sentence(),
                    ]);
                    $ordre++;
                }
            }
        }

        $this->command->info('ProgrammeSeeder: ' . Programme::count() . ' programmes créés avec exercices attachés.');
    }
}
