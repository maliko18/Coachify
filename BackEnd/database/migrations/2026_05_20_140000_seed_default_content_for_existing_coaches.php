<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Backfills the default coach content for accounts created before the
     * RegisterController started seeding them automatically. Each existing
     * coach that has no exercice / offre / programme respectively will get
     * one default row. If both a default exercise and a default programme
     * are created, the exercise is linked to the programme so the programme
     * is immediately publishable.
     */
    public function up(): void
    {
        $required = ['coaches', 'users', 'exercices', 'offres', 'programmes', 'programme_exercice'];
        foreach ($required as $table) {
            if (!Schema::hasTable($table)) {
                return;
            }
        }

        $now = now();

        $coaches = DB::table('coaches')
            ->leftJoin('users', 'users.id', '=', 'coaches.user_id')
            ->select(
                'coaches.id as coach_id',
                'users.first_name',
                'users.last_name'
            )
            ->get();

        $existingExerciceCoachIds = array_flip(
            DB::table('exercices')->whereNull('deleted_at')->pluck('coach_id')->unique()->all()
        );
        $existingOffreCoachIds = array_flip(
            DB::table('offres')->whereNull('deleted_at')->pluck('coach_id')->unique()->all()
        );
        $existingProgrammeCoachIds = array_flip(
            DB::table('programmes')->whereNull('deleted_at')->pluck('coach_id')->unique()->all()
        );

        foreach ($coaches as $coach) {
            $coachId = (int) $coach->coach_id;
            $fullName = trim((string) ($coach->first_name ?? '') . ' ' . (string) ($coach->last_name ?? ''));
            $coachLabel = $fullName !== '' ? $fullName : 'votre coach';

            $exerciceId = null;
            $programmeId = null;

            if (!isset($existingExerciceCoachIds[$coachId])) {
                $exerciceId = DB::table('exercices')->insertGetId([
                    'coach_id'           => $coachId,
                    'nom'                => 'Squat au poids du corps',
                    'description'        => 'Mouvement fondamental pour renforcer les jambes et les fessiers.',
                    'consignes'          => "Pieds écartés largeur d'épaules, gainage actif, descends en gardant le dos droit jusqu'à ce que tes cuisses soient parallèles au sol, puis remonte en poussant sur les talons. Garde les genoux alignés avec les pointes de pieds.",
                    'categorie'          => 'musculation',
                    'niveau'             => 'debutant',
                    'materiel'           => json_encode([]),
                    'medias'             => json_encode([]),
                    'muscles_cibles'     => json_encode(['quadriceps', 'fessiers', 'ischio-jambiers']),
                    'duree_estimee'      => 60,
                    'series_defaut'      => 3,
                    'repetitions_defaut' => 12,
                    'repos_defaut'       => 60,
                    'est_public'         => true,
                    'est_actif'          => true,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ]);
            }

            if (!isset($existingOffreCoachIds[$coachId])) {
                DB::table('offres')->insert([
                    'coach_id'        => $coachId,
                    'nom'             => 'Pack 5 séances découverte',
                    'description'     => "Pack d'introduction : 5 séances individuelles de 60 minutes pour démarrer ton parcours coaching avec " . $coachLabel . '.',
                    'type'            => 'pack_seance',
                    'prix'            => 250.00,
                    'tva'             => 20.00,
                    'devise'          => 'EUR',
                    'nombre_seances'  => 5,
                    'duree_jours'     => 60,
                    'capacite_max'    => 1,
                    'statut'          => 'active',
                    'est_visible'     => true,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }

            if (!isset($existingProgrammeCoachIds[$coachId])) {
                $programmeId = DB::table('programmes')->insertGetId([
                    'coach_id'       => $coachId,
                    'titre'          => 'Programme Remise en Forme - 8 semaines',
                    'description'    => "Programme d'introduction de 8 semaines à raison de 3 séances par semaine pour reprendre une activité physique régulière. Modifie-le pour l'adapter à tes clients.",
                    'duree_semaines' => 8,
                    'type'           => 'remise_en_forme',
                    'statut'         => 'brouillon',
                    'prix'           => 49.00,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }

            if ($programmeId !== null) {
                // Récupérer un exercice du coach (celui qu'on vient de créer
                // ou un existant) pour rendre le programme publiable.
                $linkExerciceId = $exerciceId ?? DB::table('exercices')
                    ->where('coach_id', $coachId)
                    ->whereNull('deleted_at')
                    ->orderBy('id')
                    ->value('id');

                if ($linkExerciceId !== null) {
                    DB::table('programme_exercice')->insert([
                        'programme_id' => $programmeId,
                        'exercice_id'  => $linkExerciceId,
                        'ordre'        => 1,
                        'semaine'      => 1,
                        'jour'         => 'lundi',
                        'sets'         => 3,
                        'reps'         => '12',
                        'repos'        => '60s',
                        'notes'        => null,
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Non-destructive: backfilled rows may be referenced by other data.
     */
    public function down(): void
    {
        // Intentionally left empty.
    }
};
