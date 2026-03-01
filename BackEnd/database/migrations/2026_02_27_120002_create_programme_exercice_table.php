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
        Schema::create('programme_exercice', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programme_id')->constrained('programmes')->onDelete('cascade');
            $table->foreignId('exercice_id')->constrained('exercices')->onDelete('cascade');

            // Organisation de l'exercice dans le programme
            $table->integer('ordre')->default(0);
            $table->integer('semaine')->default(1);
            $table->enum('jour', [
                'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
            ])->nullable();

            // Paramètres de l'exercice
            $table->integer('sets')->nullable();
            $table->string('reps')->nullable();
            $table->string('repos')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Un exercice ne peut apparaître qu'une fois par programme/semaine/jour
            $table->unique(['programme_id', 'exercice_id', 'semaine', 'jour'], 'unique_prog_exo_sem_jour');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programme_exercice');
    }
};
