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
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique(); // Format: FAC-2026-0001
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('paiement_id')->nullable(); // Nullable car le paiement n'existe peut-être pas encore
            $table->decimal('montant_ht', 10, 2);
            $table->decimal('tva', 5, 2)->default(20.00); // TVA en pourcentage
            $table->decimal('montant_ttc', 10, 2);
            $table->date('date_emission');
            $table->date('date_echeance');
            $table->enum('statut', ['brouillon', 'emise', 'payee', 'annulee', 'en_retard'])->default('brouillon');
            $table->string('pdf_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index pour les recherches fréquentes
            $table->index('statut');
            $table->index('date_emission');
            $table->index('date_echeance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
