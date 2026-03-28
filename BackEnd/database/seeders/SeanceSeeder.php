<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Coach;
use App\Models\Seance;
use Illuminate\Database\Seeder;

class SeanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coaches = Coach::all();
        $clients = Client::all();

        if ($coaches->isEmpty()) {
            $this->command->warn('Aucun coach trouvé. Exécutez CoachSeeder d\'abord.');
            return;
        }

        // ── Séances individuelles (3 par coach) ──
        foreach ($coaches as $coach) {
            Seance::factory()
                ->count(3)
                ->individuelle()
                ->create(['coach_id' => $coach->id])
                ->each(function ($seance) use ($clients) {
                    if ($clients->isNotEmpty()) {
                        $randomClient = $clients->random();
                        // Vérifier si le client n'est pas déjà attaché
                        if (!$seance->clients()->where('client_id', $randomClient->id)->exists()) {
                            $seance->clients()->attach(
                                $randomClient->id,
                                ['statut_presence' => 'inscrit']
                            );
                        }
                    }
                });
        }

        // ── Séances collectives (2 par coach, max 3 coachs) ──
        foreach ($coaches->take(3) as $coach) {
            Seance::factory()
                ->count(2)
                ->collective()
                ->create(['coach_id' => $coach->id])
                ->each(function ($seance) use ($clients) {
                    if ($clients->count() >= 3) {
                        $inscrits = $clients->shuffle()->take(min(5, $clients->count()));
                        foreach ($inscrits as $client) {
                            // Vérifier unicité avant d'attacher
                            if (!$seance->clients()->where('client_id', $client->id)->exists()) {
                                $seance->clients()->attach($client->id, [
                                    'statut_presence' => fake()->randomElement(['inscrit', 'present']),
                                ]);
                            }
                        }
                    }
                });
        }

        // ── Séances en ligne (1 par coach, max 2 coachs) ──
        foreach ($coaches->take(2) as $coach) {
            Seance::factory()
                ->enLigne()
                ->create(['coach_id' => $coach->id])
                ->each(function ($seance) use ($clients) {
                    if ($clients->count() >= 2) {
                        $inscrits = $clients->shuffle()->take(min(4, $clients->count()));
                        foreach ($inscrits as $client) {
                            if (!$seance->clients()->where('client_id', $client->id)->exists()) {
                                $seance->clients()->attach($client->id, [
                                    'statut_presence' => 'inscrit',
                                ]);
                            }
                        }
                    }
                });
        }

        // ── Séances terminées avec feedbacks (5 séances) ──
        Seance::factory()
            ->count(5)
            ->terminee()
            ->create(['coach_id' => $coaches->random()->id])
            ->each(function ($seance) use ($clients) {
                if ($clients->isNotEmpty()) {
                    $nbClients = min(fake()->numberBetween(1, 3), $clients->count());
                    $selectedClients = $clients->shuffle()->take($nbClients);

                    foreach ($selectedClients as $client) {
                        if (!$seance->clients()->where('client_id', $client->id)->exists()) {
                            $seance->clients()->attach($client->id, [
                                'statut_presence' => 'present',
                                'feedback_coach' => fake()->randomElement([
                                    'Très bonne séance, bon effort !',
                                    'Progrès notable sur les exercices de base.',
                                    'À retravailler la posture sur le squat.',
                                    'Excellente endurance, on augmente la charge.',
                                ]),
                                'feedback_client' => fake()->optional(0.6)->randomElement([
                                    'Super séance, je me sens bien !',
                                    'Un peu difficile mais motivant.',
                                    'J\'ai adoré le programme du jour.',
                                    'Courbatures assurées demain !',
                                ]),
                                'note' => fake()->numberBetween(3, 5),
                            ]);
                        }
                    }
                }
            });

        // ── Séances annulées (2 séances) ──
        Seance::factory()
            ->count(2)
            ->annulee()
            ->create(['coach_id' => $coaches->random()->id]);

        $totalSeances = Seance::count();
        $this->command->info("$totalSeances séances créées avec succès.");
    }
}
