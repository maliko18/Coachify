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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('contrat_id')->nullable()->constrained('contrats')->onDelete('set null');
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');

            // Montant
            $table->decimal('montant', 10, 2);
            $table->string('devise', 3)->default('EUR');

            // Date du paiement
            $table->dateTime('date_paiement');

            // Méthode de paiement
            $table->enum('methode', [
                'carte_bancaire',
                'virement',
                'especes',
                'cheque',
                'paypal',
                'stripe',
                'prelevement',
                'autre',
            ])->default('carte_bancaire');

            // Statut
            $table->enum('statut', [
                'en_attente',
                'valide',
                'refuse',
                'rembourse',
                'annule',
            ])->default('en_attente');

            // Référence & traçabilité
            $table->string('reference')->unique(); // Référence unique du paiement
            $table->string('reference_externe')->nullable(); // Référence du prestataire (Stripe, PayPal, etc.)
            $table->text('description')->nullable();
            $table->text('notes')->nullable();

            // Remboursement
            $table->decimal('montant_rembourse', 10, 2)->default(0.00);
            $table->dateTime('date_remboursement')->nullable();
            $table->text('motif_remboursement')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
