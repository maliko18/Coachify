<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            // UserSeeder::class,
            // CoachSeeder::class,
            // ClientSeeder::class,
            // OffreSeeder::class,
            // ContratSeeder::class,
            // ExerciceSeeder::class,
            // ProgrammeSeeder::class,
            // FactureSeeder::class,
            // PaiementSeeder::class,
            // Autres seeders...
        ]);
    }
}
