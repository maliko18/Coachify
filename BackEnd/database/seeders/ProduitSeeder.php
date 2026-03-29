<?php

namespace Database\Seeders;

use App\Models\Coach;
use App\Models\Produit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class ProduitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coaches = Coach::query()->select('id')->get();

        if ($coaches->isEmpty()) {
            $this->command->warn('Aucun coach trouve. Lancez CoachSeeder avant ProduitSeeder.');
            return;
        }

        foreach ($coaches as $coach) {
            Produit::updateOrCreate(
                ['coach_id' => $coach->id, 'nom' => 'Seance coaching individuelle'],
                [
                    'description' => 'Session individuelle avec plan personnalise.',
                    'type' => 'service',
                    'prix' => 79.00,
                    'stock_quantite' => 9999,
                    'alerte_stock' => 10,
                    'visible' => true,
                ]
            );

            Produit::updateOrCreate(
                ['coach_id' => $coach->id, 'nom' => 'Programme PDF 4 semaines'],
                [
                    'description' => 'Programme numerique complet sur 4 semaines.',
                    'type' => 'numerique',
                    'prix' => 49.00,
                    'stock_quantite' => 9999,
                    'alerte_stock' => 10,
                    'visible' => true,
                ]
            );

            Produit::updateOrCreate(
                ['coach_id' => $coach->id, 'nom' => 'Pack accessoires training'],
                [
                    'description' => 'Pack elastiques + mini band + corde a sauter.',
                    'type' => 'physique',
                    'prix' => 35.00,
                    'stock_quantite' => 30,
                    'alerte_stock' => 5,
                    'visible' => true,
                ]
            );
        }

        // Invalide le cache catalogue afin que les nouveaux produits seeded soient visibles immediatement.
        Cache::forever(
            'perf:shop:catalog:version',
            ((int) Cache::get('perf:shop:catalog:version', 1)) + 1
        );

        $this->command->info('Produits coaches crees/mis a jour avec succes.');
    }
}
