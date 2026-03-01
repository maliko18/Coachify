<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ExerciceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coaches = \App\Models\Coach::all();

        if ($coaches->isEmpty()) {
            $this->command->warn('Aucun coach trouvé. Exécutez CoacheSeeder d\'abord.');
            return;
        }

        foreach ($coaches as $coach) {
            // Exercices de musculation (5 par coach)
            \App\Models\Exercice::factory()
                ->count(5)
                ->musculation()
                ->create(['coach_id' => $coach->id]);

            // Exercices de cardio (3 par coach)
            \App\Models\Exercice::factory()
                ->count(3)
                ->cardio()
                ->create(['coach_id' => $coach->id]);

            // Exercices débutant (2 par coach)
            \App\Models\Exercice::factory()
                ->count(2)
                ->debutant()
                ->create(['coach_id' => $coach->id]);

            // Exercices avancés (2 par coach)
            \App\Models\Exercice::factory()
                ->count(2)
                ->avance()
                ->create(['coach_id' => $coach->id]);

            // Exercices variés (3 par coach)
            \App\Models\Exercice::factory()
                ->count(3)
                ->create(['coach_id' => $coach->id]);
        }

        $total = \App\Models\Exercice::count();
        $this->command->info("{$total} exercices créés avec succès.");
    }
}
