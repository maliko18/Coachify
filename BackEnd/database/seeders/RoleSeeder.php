<?php

namespace Database\Seeders;
namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
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
                'description' => 'Personne ayant acheté une prestation',
            ],
            [
                'name' => Role::COACH,
                'description' => 'Prestataire principal de services sportifs',
            ],
            [
                'name' => Role::GYM_MANAGER,
                'description' => 'Gestionnaire d\'une structure sportive',
            ],
            [
                'name' => Role::ADMIN,
                'description' => 'Administrateur système avec tous les droits',
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
