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
        Schema::create('sports_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->enum('source', ['garmin', 'strava']);
            $table->decimal('distance_km', 8, 2)->default(0);
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->unsignedInteger('calories')->default(0);
            $table->unsignedSmallInteger('heart_rate_avg')->nullable();
            $table->timestamp('recorded_at');
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'recorded_at']);
            $table->index(['source', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports_data');
    }
};
