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
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');
            $table->dateTime('date_commande');
            $table->enum('statut', ['attente', 'envoye', 'livre', 'annule'])->default('attente');
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_id', 'date_commande']);
            $table->index(['coach_id', 'date_commande']);
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
