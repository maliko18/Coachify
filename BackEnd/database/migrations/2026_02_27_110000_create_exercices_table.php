<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exercices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');

            // Informations de l'exercice
            $table->string('nom');
            $table->text('description')->nullable();
            $table->text('consignes')->nullable(); // Instructions détaillées

            // Classification
            $table->enum('categorie', [
                'musculation',
                'cardio',
                'stretching',
                'yoga',
                'pilates',
                'crossfit',
                'boxe',
                'fonctionnel',
                'equilibre',
                'plyometrie',
                'autre',
            ])->default('musculation');

            $table->enum('niveau', [
                'debutant',
                'intermediaire',
                'avance',
                'expert',
            ])->default('debutant');

            // Matériel & médias
            $table->json('materiel')->nullable();     // Ex: ["haltères", "tapis", "barre"]
            $table->json('medias')->nullable();        // Ex: [{"type":"video","url":"..."}, {"type":"image","url":"..."}]
            $table->json('muscles_cibles')->nullable(); // Ex: ["pectoraux", "triceps", "épaules"]

            // Paramètres par défaut
            $table->integer('duree_estimee')->nullable();     // Durée en secondes
            $table->integer('series_defaut')->nullable();     // Nombre de séries par défaut
            $table->integer('repetitions_defaut')->nullable(); // Nombre de répétitions par défaut
            $table->integer('repos_defaut')->nullable();       // Temps de repos en secondes

            // Statut
            $table->boolean('est_public')->default(false); // Visible par les clients
            $table->boolean('est_actif')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercices');
    }
};
