<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\database\seeders\CoachSeeder.php

namespace Database\Seeders;

use App\Models\Coach;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CoachSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les utilisateurs coachs existants et créer leurs profils
        $coachUsers = User::whereHas('roles', function ($query) {
            $query->where('name', Role::COACH);
        })->get();

        // Profils de coachs prédéfinis
        $coachProfiles = [
            'coach.jean@coachapp.fr' => [
                'bio' => 'Coach sportif passionné avec plus de 10 ans d\'expérience. Spécialisé en musculation et préparation physique, j\'accompagne mes clients vers leurs objectifs avec des programmes personnalisés et un suivi rigoureux.',
                'specialties' => ['musculation', 'preparation_physique', 'prise_de_masse', 'nutrition'],
                'certifications' => ['BPJEPS Activités de la Forme', 'Licence STAPS', 'Certification NSCA-CPT'],
                'experience_years' => 12,
                'hourly_rate' => 75.00,
            ],
            'coach.marie@coachapp.fr' => [
                'bio' => 'Ancienne danseuse professionnelle reconvertie en coach fitness. Je propose des séances dynamiques alliant cardio, renforcement musculaire et souplesse. Mon approche bienveillante convient à tous les niveaux.',
                'specialties' => ['cardio', 'remise_en_forme', 'perte_de_poids', 'stretching', 'pilates'],
                'certifications' => ['BPJEPS Activités Gymniques', 'Formation Pilates Mat', 'CQP Instructeur Fitness'],
                'experience_years' => 8,
                'hourly_rate' => 65.00,
            ],
            'coach.pierre@coachapp.fr' => [
                'bio' => 'Expert en CrossFit et entraînement fonctionnel. Je prépare des athlètes de tous niveaux avec des programmes intensifs et variés. Également formé en nutrition sportive pour une approche globale.',
                'specialties' => ['crossfit', 'musculation', 'cardio', 'nutrition', 'preparation_physique'],
                'certifications' => ['Certification CrossFit Level 2', 'BPJEPS Activités de la Forme', 'Diplôme Universitaire Nutrition Sportive'],
                'experience_years' => 6,
                'hourly_rate' => 80.00,
            ],
        ];

        foreach ($coachUsers as $user) {
            $profile = $coachProfiles[$user->email] ?? [
                'bio' => fake()->paragraphs(2, true),
                'specialties' => fake()->randomElements(Coach::SPECIALTIES, 3),
                'certifications' => ['CQP Instructeur Fitness'],
                'experience_years' => fake()->numberBetween(1, 10),
                'hourly_rate' => fake()->randomFloat(2, 40, 100),
            ];

            Coach::firstOrCreate(
                ['user_id' => $user->id],
                $profile
            );
        }

        // Créer des coachs supplémentaires avec factory
        $additionalCoaches = [
            [
                'user' => [
                    'first_name' => 'Lucie',
                    'last_name' => 'Yoga',
                    'email' => 'coach.lucie@coachapp.fr',
                    'city' => 'Strasbourg',
                    'postal_code' => '67000',
                ],
                'coach' => [
                    'bio' => 'Professeure de yoga certifiée, j\'enseigne le Hatha et le Vinyasa depuis 5 ans. Mes cours allient postures, respiration et méditation pour un bien-être complet.',
                    'specialties' => ['yoga', 'pilates', 'stretching'],
                    'certifications' => ['Certification Yoga Alliance RYT 200', 'Formation Pilates Mat'],
                    'experience_years' => 5,
                    'hourly_rate' => 55.00,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Antoine',
                    'last_name' => 'Runner',
                    'email' => 'coach.antoine@coachapp.fr',
                    'city' => 'Bordeaux',
                    'postal_code' => '33000',
                ],
                'coach' => [
                    'bio' => 'Coach running et trail. Je prépare des coureurs pour leurs premiers 10km jusqu\'aux ultra-trails. Plans d\'entraînement personnalisés et suivi GPS.',
                    'specialties' => ['running', 'cardio', 'preparation_physique'],
                    'certifications' => ['BPJEPS Activités de la Forme', 'Diplôme d\'État de la Jeunesse'],
                    'experience_years' => 7,
                    'hourly_rate' => 60.00,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Sarah',
                    'last_name' => 'Boxe',
                    'email' => 'coach.sarah@coachapp.fr',
                    'city' => 'Marseille',
                    'postal_code' => '13001',
                ],
                'coach' => [
                    'bio' => 'Ancienne championne de boxe française, je propose des cours de boxe fitness et de boxe anglaise. Défoulement garanti !',
                    'specialties' => ['boxe', 'cardio', 'perte_de_poids', 'remise_en_forme'],
                    'certifications' => ['BPJEPS Activités Pugilistiques', 'CQP Instructeur Fitness'],
                    'experience_years' => 9,
                    'hourly_rate' => 70.00,
                ],
            ],
        ];

        foreach ($additionalCoaches as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['user']['email']],
                array_merge($data['user'], [
                    'password' => Hash::make('coach123'),
                    'phone' => fake()->phoneNumber(),
                    'address' => fake()->streetAddress(),
                    'email_verified_at' => now(),
                    'rgpd_consent' => true,
                    'rgpd_consent_date' => now(),
                ])
            );
            $user->assignRole(Role::COACH);

            Coach::firstOrCreate(
                ['user_id' => $user->id],
                $data['coach']
            );
        }

        // Créer des coachs aléatoires supplémentaires
        $randomUsers = User::factory()->count(5)->create();

        foreach ($randomUsers as $user) {
            $user->assignRole(Role::COACH);
            Coach::factory()->create(['user_id' => $user->id]);
        }
    }
}
