<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PaiementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contrats = \App\Models\Contrat::with(['client', 'offre'])->where('statut', 'actif')->get();

        if ($contrats->isEmpty()) {
            $this->command->warn('Aucun contrat actif trouvé. Exécutez ContratSeeder d\'abord.');
            return;
        }

        foreach ($contrats as $contrat) {
            // 1 à 3 paiements par contrat actif
            $nbPaiements = fake()->numberBetween(1, 3);
            $montantParPaiement = round((float) $contrat->montant_total / $nbPaiements, 2);

            for ($i = 0; $i < $nbPaiements; $i++) {
                \App\Models\Paiement::factory()->valide()->create([
                    'client_id' => $contrat->client_id,
                    'contrat_id' => $contrat->id,
                    'coach_id' => $contrat->coach_id,
                    'montant' => $montantParPaiement,
                    'date_paiement' => fake()->dateTimeBetween(
                        $contrat->date_debut,
                        now()
                    ),
                    'description' => "Paiement pour : {$contrat->offre->nom}",
                ]);
            }
        }

        // Quelques paiements en attente
        $contratsEnAttente = \App\Models\Contrat::where('statut', 'en_attente')->take(3)->get();
        foreach ($contratsEnAttente as $contrat) {
            \App\Models\Paiement::factory()->enAttente()->create([
                'client_id' => $contrat->client_id,
                'contrat_id' => $contrat->id,
                'coach_id' => $contrat->coach_id,
                'montant' => $contrat->montant_total,
                'date_paiement' => now(),
                'description' => "Paiement en attente : {$contrat->offre->nom}",
            ]);
        }

        // Quelques paiements remboursés
        \App\Models\Paiement::factory()
            ->count(2)
            ->rembourse()
            ->create([
                'client_id' => \App\Models\Client::inRandomOrder()->first()?->id ?? 1,
                'coach_id' => \App\Models\Coach::inRandomOrder()->first()?->id ?? 1,
            ]);

        $total = \App\Models\Paiement::count();
        $this->command->info("{$total} paiements créés avec succès.");
    }
}
