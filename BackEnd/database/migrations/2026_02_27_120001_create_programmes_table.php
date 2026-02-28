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
        Schema::create('programmes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');

            // Informations du programme
            $table->string('titre');
            $table->text('description')->nullable();
            $table->integer('duree_semaines')->default(4);
            $table->enum('type', [
                'perte_de_poids',
                'prise_de_masse',
                'remise_en_forme',
                'endurance',
                'force',
                'personnalise'
            ])->default('personnalise');
            $table->enum('statut', ['brouillon', 'publie', 'archive'])->default('brouillon');
            $table->decimal('prix', 8, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programmes');
    }
};
