<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Compte administration (role gym_manager)
        $gymManager = User::firstOrCreate(
            ['email' => 'admin@coachapp.fr'],
            [
            'first_name' => 'Gym',
            'last_name' => 'Manager',
                'password' => Hash::make('admin123'),
                'phone' => '0600000000',
                'address' => '1 rue de l\'Administration',
                'city' => 'Paris',
                'postal_code' => '75001',
                'email_verified_at' => now(),
                'rgpd_consent' => true,
                'rgpd_consent_date' => now(),
            ]
        );
        $gymManager->assignRole(Role::GYM_MANAGER);

        // Créer des coachs de démonstration
        $coaches = [
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'email' => 'coach.jean@coachapp.fr',
                'city' => 'Paris',
                'postal_code' => '75011',
            ],
            [
                'first_name' => 'Marie',
                'last_name' => 'Martin',
                'email' => 'coach.marie@coachapp.fr',
                'city' => 'Lyon',
                'postal_code' => '69001',
            ],
            [
                'first_name' => 'Pierre',
                'last_name' => 'Bernard',
                'email' => 'coach.pierre@coachapp.fr',
                'city' => 'Mulhouse',
                'postal_code' => '68100',
            ],
        ];

        foreach ($coaches as $coachData) {
            $coach = User::firstOrCreate(
                ['email' => $coachData['email']],
                array_merge($coachData, [
                    'password' => Hash::make('coach123'),
                    'phone' => fake()->phoneNumber(),
                    'address' => fake()->streetAddress(),
                    'email_verified_at' => now(),
                    'rgpd_consent' => true,
                    'rgpd_consent_date' => now(),
                ])
            );
            $coach->assignRole(Role::COACH);
        }

        // Créer des clients de démonstration
        $clients = [
            [
                'first_name' => 'Sophie',
                'last_name' => 'Leroy',
                'email' => 'client.sophie@example.com',
                'city' => 'Paris',
            ],
            [
                'first_name' => 'Thomas',
                'last_name' => 'Moreau',
                'email' => 'client.thomas@example.com',
                'city' => 'Lyon',
            ],
            [
                'first_name' => 'Camille',
                'last_name' => 'Simon',
                'email' => 'client.camille@example.com',
                'city' => 'Mulhouse',
            ],
        ];

        foreach ($clients as $clientData) {
            $client = User::firstOrCreate(
                ['email' => $clientData['email']],
                array_merge($clientData, [
                    'password' => Hash::make('client123'),
                    'phone' => fake()->phoneNumber(),
                    'address' => fake()->streetAddress(),
                    'postal_code' => fake()->postcode(),
                    'email_verified_at' => now(),
                    'rgpd_consent' => true,
                    'rgpd_consent_date' => now(),
                ])
            );
            $client->assignRole(Role::CLIENT);
        }

        // Créer des prospects
        $prospects = User::factory()
            ->count(5)
            ->withoutRgpdConsent()
            ->create();

        foreach ($prospects as $prospect) {
            $prospect->assignRole(Role::PROSPECT);
        }

        // Créer des utilisateurs aléatoires supplémentaires
        $randomClients = User::factory()
            ->count(10)
            ->create();

        foreach ($randomClients as $client) {
            $client->assignRole(Role::CLIENT);
        }
    }
}