<?php

namespace App\Services\Coach;

use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Offre;
use App\Models\Produit;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CoachContentSeeder
{
    /**
     * Crée le contenu par défaut pour un nouveau coach :
     * un produit (pour les réservations), un exercice, une offre
     * et un programme brouillon contenant l'exercice.
     *
     * Méthode idempotente : ne recrée pas un produit/exercice/offre/programme
     * si le coach en possède déjà au moins un.
     */
    public static function seed(Coach $coach, User $user): void
    {
        $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        $coachLabel = $fullName !== '' ? $fullName : 'votre coach';

        if (! Produit::where('coach_id', $coach->id)->exists()) {
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
        }

        $exercice = Exercice::where('coach_id', $coach->id)->first();
        if (! $exercice) {
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
        }

        if (! Offre::where('coach_id', $coach->id)->exists()) {
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
        }

        $programme = Programme::where('coach_id', $coach->id)->first();
        if (! $programme) {
            $programme = Programme::create([
                'coach_id' => $coach->id,
                'titre' => 'Programme Remise en Forme - 8 semaines',
                'description' => "Programme d'introduction de 8 semaines à raison de 3 séances par semaine pour reprendre une activité physique régulière. Modifie-le pour l'adapter à tes clients.",
                'duree_semaines' => 8,
                'type' => 'remise_en_forme',
                'statut' => 'brouillon',
                'prix' => 49.00,
            ]);

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
}
