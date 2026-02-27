<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Facture;
use Illuminate\Database\Seeder;

class FactureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = Client::all();

        if ($clients->isEmpty()) {
            $this->command->warn('Aucun client trouvé. Veuillez d\'abord exécuter ClientSeeder.');
            return;
        }

        foreach ($clients as $client) {
            // Créer 1-3 factures par client
            $nombreFactures = fake()->numberBetween(1, 3);

            for ($i = 0; $i < $nombreFactures; $i++) {
                // Varier les statuts
                $statut = fake()->randomElement(['brouillon', 'emise', 'emise', 'payee', 'payee', 'payee']);

                $montantHT = fake()->randomFloat(2, 50, 300);
                $tva = 20.00;
                $montantTTC = round($montantHT * (1 + $tva / 100), 2);

                $dateEmission = fake()->dateTimeBetween('-6 months', 'now');
                $dateEcheance = (clone $dateEmission)->modify('+30 days');

                Facture::create([
                    'client_id' => $client->id,
                    'montant_ht' => $montantHT,
                    'tva' => $tva,
                    'montant_ttc' => $montantTTC,
                    'date_emission' => $dateEmission,
                    'date_echeance' => $dateEcheance,
                    'statut' => $statut,
                    'notes' => fake()->optional(0.2)->sentence(),
                ]);
            }
        }

        // Créer quelques factures en retard
        $clientsAvecRetard = $clients->random(min(3, $clients->count()));
        foreach ($clientsAvecRetard as $client) {
            Facture::factory()
                ->enRetard()
                ->create(['client_id' => $client->id]);
        }

        $this->command->info('FactureSeeder: ' . Facture::count() . ' factures créées.');
    }
}
