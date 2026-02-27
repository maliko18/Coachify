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
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('offre_id')->constrained('offres')->onDelete('cascade');
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');

            // Dates du contrat
            $table->date('date_debut');
            $table->date('date_fin')->nullable();

            // Statut
            $table->enum('statut', [
                'en_attente',
                'actif',
                'suspendu',
                'termine',
                'annule',
            ])->default('en_attente');

            // Suivi consommation
            $table->integer('seances_totales')->default(0);
            $table->integer('seances_consommees')->default(0);
            $table->integer('seances_restantes')->default(0);

            // Montant
            $table->decimal('montant_total', 8, 2);
            $table->decimal('montant_paye', 8, 2)->default(0.00);

            // Notes
            $table->text('notes')->nullable();

            // Renouvellement
            $table->boolean('renouvellement_auto')->default(false);
            $table->date('date_prochain_renouvellement')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
