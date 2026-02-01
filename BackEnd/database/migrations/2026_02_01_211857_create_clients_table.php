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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('coach_id')->nullable()->constrained('coaches')->onDelete('set null');

            // Informations client
            $table->text('objectives')->nullable(); // Objectifs sportifs
            $table->text('medical_conditions')->nullable(); // Pathologies, restrictions médicales
            $table->json('injuries_history')->nullable(); // Historique des blessures
            $table->enum('fitness_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->json('preferred_activities')->nullable(); // Activités préférées

            // Statut et suivi
            $table->enum('subscription_status', ['active', 'paused', 'inactive'])->default('active');
            $table->date('start_date')->nullable(); // Date de début
            $table->integer('sessions_remaining')->default(0); // Séances restantes

            // Mesures physiques
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->decimal('height', 5, 2)->nullable(); // cm
            $table->integer('age')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
