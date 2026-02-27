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
        Schema::create('offres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');

            // Informations de l'offre
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('type', [
                'pack_seance',
                'abonnement',
                'collectif',
                'programme_numerique',
                'produit',
            ]);

            // Tarification
            $table->decimal('prix', 8, 2);
            $table->decimal('tva', 5, 2)->default(20.00); // Taux TVA en %
            $table->string('devise', 3)->default('EUR');

            // Détails selon le type
            $table->integer('nombre_seances')->nullable();         // Pour pack_seance
            $table->integer('duree_jours')->nullable();            // Pour abonnement (durée en jours)
            $table->integer('capacite_max')->nullable();           // Pour collectif
            $table->json('options')->nullable();                   // Options supplémentaires

            // Statut
            $table->enum('statut', ['active', 'inactive', 'archivee'])->default('active');
            $table->boolean('est_visible')->default(true);         // Visible publiquement

            // Promotion
            $table->decimal('prix_promotion', 8, 2)->nullable();
            $table->date('date_debut_promotion')->nullable();
            $table->date('date_fin_promotion')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offres');
    }
};
