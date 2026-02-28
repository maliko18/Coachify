<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class OffreSeeder extends Seeder
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
            // Pack de séances
            \App\Models\Offre::factory()->packSeance(5)->create([
                'coach_id' => $coach->id,
                'prix' => 200.00,
                'nom' => 'Pack Découverte 5 séances',
            ]);

            \App\Models\Offre::factory()->packSeance(10)->create([
                'coach_id' => $coach->id,
                'prix' => 350.00,
                'nom' => 'Pack Standard 10 séances',
            ]);

            \App\Models\Offre::factory()->packSeance(20)->create([
                'coach_id' => $coach->id,
                'prix' => 600.00,
                'nom' => 'Pack Premium 20 séances',
            ]);

            // Abonnements
            \App\Models\Offre::factory()->abonnement(30)->create([
                'coach_id' => $coach->id,
                'prix' => 89.00,
                'nom' => 'Abonnement Mensuel',
            ]);

            \App\Models\Offre::factory()->abonnement(90)->create([
                'coach_id' => $coach->id,
                'prix' => 239.00,
                'nom' => 'Abonnement Trimestriel',
            ]);

            // Cours collectifs
            \App\Models\Offre::factory()->collectif()->create([
                'coach_id' => $coach->id,
                'prix' => 15.00,
                'nom' => 'Cours collectif HIIT',
            ]);

            \App\Models\Offre::factory()->collectif()->create([
                'coach_id' => $coach->id,
                'prix' => 12.00,
                'nom' => 'Cours collectif Yoga',
            ]);

            // Programme numérique
            \App\Models\Offre::factory()->create([
                'coach_id' => $coach->id,
                'type' => 'programme_numerique',
                'nom' => 'Programme Perte de Poids 12 semaines',
                'prix' => 49.00,
            ]);
        }

        $totalOffres = \App\Models\Offre::count();
        $this->command->info("{$totalOffres} offres créées avec succès.");
    }
}
