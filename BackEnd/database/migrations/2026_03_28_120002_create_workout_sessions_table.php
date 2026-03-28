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
        Schema::create('workout_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('sports_data_id')->constrained('sports_data')->onDelete('cascade');
            $table->foreignId('seance_id')->nullable()->constrained('seances')->nullOnDelete();
            $table->decimal('performance_score', 5, 2)->nullable();
            $table->timestamp('matched_at')->nullable();
            $table->timestamps();

            $table->unique('sports_data_id');
            $table->index(['client_id', 'matched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_sessions');
    }
};
