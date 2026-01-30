<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => Role::PROSPECT,
                'description' => 'Utilisateur non inscrit ou sans contrat actif',
            ],
            [
                'name' => Role::CLIENT,
                'description' => 'Client avec un abonnement actif',
            ],
            [
                'name' => Role::COACH,
                'description' => 'Coach sportif certifié',
            ],
            [
                'name' => Role::GYM_MANAGER,
                'description' => 'Responsable de salle de sport',
            ],
            [
                'name' => Role::ADMIN,
                'description' => 'Administrateur de la plateforme',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                ['description' => $role['description']]
            );
        }
    }
}
