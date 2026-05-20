<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\app\Http\Controllers\Auth\RegisterController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResources;
use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Offre;
use App\Models\Produit;
use App\Models\Programme;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            // 1. Créer l'utilisateur
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // 2. Assigner le rôle et créer le profil si coach
            if ($data['role'] === Role::COACH) {
                $user->assignRole(Role::COACH);
                $coach = Coach::create(['user_id' => $user->id]);

                $this->seedDefaultCoachContent($coach, $user);
                $user->load('coach');
            } else {
                $user->assignRole(Role::PROSPECT);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => new UserResources($user->load('roles')),
            'token' => $token,
        ], 201);
    }

    /**
     * Crée le contenu par défaut pour un nouveau coach :
     * un produit (pour les réservations), un exercice, une offre
     * et un programme brouillon contenant l'exercice.
     */
    private function seedDefaultCoachContent(Coach $coach, User $user): void
    {
        $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        $coachLabel = $fullName !== '' ? $fullName : 'votre coach';

        // Produit "service" pour débloquer la page Book A Coach
        Produit::create([
            'coach_id' => $coach->id,
            'nom' => 'Séance de coaching',
            'description' => 'Séance individuelle de coaching avec ' . $coachLabel . '.',
            'type' => 'service',
            'prix' => 60.00,
            'stock_quantite' => 0,
            'alerte_stock' => 0,
            'visible' => true,
        ]);

        // Exercice par défaut (squat poids du corps, débutant)
        $exercice = Exercice::create([
            'coach_id' => $coach->id,
            'nom' => 'Squat au poids du corps',
            'description' => 'Mouvement fondamental pour renforcer les jambes et les fessiers.',
            'consignes' => "Pieds écartés largeur d'épaules, gainage actif, descends en gardant le dos droit jusqu'à ce que tes cuisses soient parallèles au sol, puis remonte en poussant sur les talons. Garde les genoux alignés avec les pointes de pieds.",
            'categorie' => 'musculation',
            'niveau' => 'debutant',
            'materiel' => [],
            'medias' => [],
            'muscles_cibles' => ['quadriceps', 'fessiers', 'ischio-jambiers'],
            'duree_estimee' => 60,
            'series_defaut' => 3,
            'repetitions_defaut' => 12,
            'repos_defaut' => 60,
            'est_public' => true,
            'est_actif' => true,
        ]);

        // Offre par défaut (pack de 5 séances)
        Offre::create([
            'coach_id' => $coach->id,
            'nom' => 'Pack 5 séances découverte',
            'description' => "Pack d'introduction : 5 séances individuelles de 60 minutes pour démarrer ton parcours coaching avec " . $coachLabel . '.',
            'type' => 'pack_seance',
            'prix' => 250.00,
            'tva' => 20.00,
            'devise' => 'EUR',
            'nombre_seances' => 5,
            'duree_jours' => 60,
            'capacite_max' => 1,
            'statut' => 'active',
            'est_visible' => true,
        ]);

        // Programme par défaut (brouillon, remise en forme 8 semaines)
        $programme = Programme::create([
            'coach_id' => $coach->id,
            'titre' => 'Programme Remise en Forme - 8 semaines',
            'description' => "Programme d'introduction de 8 semaines à raison de 3 séances par semaine pour reprendre une activité physique régulière. Modifie-le pour l'adapter à tes clients.",
            'duree_semaines' => 8,
            'type' => 'remise_en_forme',
            'statut' => 'brouillon',
            'prix' => 49.00,
        ]);

        // Lien programme <-> exercice (semaine 1, lundi) pour que
        // le programme soit publiable d'office (estPubliable() exige >= 1 exo).
        DB::table('programme_exercice')->insert([
            'programme_id' => $programme->id,
            'exercice_id' => $exercice->id,
            'ordre' => 1,
            'semaine' => 1,
            'jour' => 'lundi',
            'sets' => 3,
            'reps' => '12',
            'repos' => '60s',
            'notes' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
