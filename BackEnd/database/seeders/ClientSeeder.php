<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coaches = \App\Models\Coach::all();

        if ($coaches->isEmpty()) {
            $this->command->warn('Aucun coach trouvé. Exécutez CoachSeeder d\'abord.');
            return;
        }

        // Créer 20 clients et les assigner à des coachs
        \App\Models\User::factory()
            ->count(20)
            ->create()
            ->each(function ($user) use ($coaches) {
                // Assigner le rôle client
                $user->assignRole(\App\Models\Role::CLIENT);

                // Créer le profil client
                \App\Models\Client::factory()->create([
                    'user_id' => $user->id,
                    'coach_id' => $coaches->random()->id,
                ]);
            });

        // Créer quelques clients sans coach (prospects)
        \App\Models\User::factory()
            ->count(5)
            ->create()
            ->each(function ($user) {
                $user->assignRole(\App\Models\Role::CLIENT);

                \App\Models\Client::factory()->create([
                    'user_id' => $user->id,
                    'coach_id' => null,
                    'subscription_status' => 'inactive',
                ]);
            });

        $this->command->info('25 clients créés avec succès.');
    }
}
