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
        Schema::create('seance_client', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seance_id')->constrained('seances')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');

            // Suivi de présence et feedbacks
            $table->enum('statut_presence', ['inscrit', 'present', 'absent', 'excuse'])->default('inscrit');
            $table->text('feedback_client')->nullable();
            $table->text('feedback_coach')->nullable();
            $table->unsignedTinyInteger('note')->nullable(); // Note de 1 à 5

            $table->timestamps();

            // Un client ne peut être inscrit qu'une seule fois à une séance
            $table->unique(['seance_id', 'client_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seance_client');
    }
};
