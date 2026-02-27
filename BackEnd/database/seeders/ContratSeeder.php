<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ContratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = \App\Models\Client::whereNotNull('coach_id')->get();
        $offres = \App\Models\Offre::all();

        if ($clients->isEmpty()) {
            $this->command->warn('Aucun client trouvé. Exécutez ClientSeeder d\'abord.');
            return;
        }

        if ($offres->isEmpty()) {
            $this->command->warn('Aucune offre trouvée. Exécutez OffreSeeder d\'abord.');
            return;
        }

        foreach ($clients as $client) {
            // Récupérer les offres du coach du client
            $offresCoach = $offres->where('coach_id', $client->coach_id);

            if ($offresCoach->isEmpty()) {
                continue;
            }

            // Créer 1 à 3 contrats par client
            $nbContrats = fake()->numberBetween(1, 3);

            for ($i = 0; $i < $nbContrats; $i++) {
                $offre = $offresCoach->random();

                $seancesTotales = $offre->nombre_seances ?? fake()->randomElement([5, 10]);
                $seancesConsommees = fake()->numberBetween(0, $seancesTotales);

                \App\Models\Contrat::factory()->create([
                    'client_id' => $client->id,
                    'offre_id' => $offre->id,
                    'coach_id' => $client->coach_id,
                    'montant_total' => $offre->prix,
                    'seances_totales' => $seancesTotales,
                    'seances_consommees' => $seancesConsommees,
                    'seances_restantes' => $seancesTotales - $seancesConsommees,
                ]);
            }
        }

        $totalContrats = \App\Models\Contrat::count();
        $this->command->info("{$totalContrats} contrats créés avec succès.");
    }
}
