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
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('coaches')->onDelete('cascade');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('type', ['physique', 'numerique', 'service']);
            $table->decimal('prix', 10, 2);
            $table->unsignedInteger('stock_quantite')->default(0);
            $table->unsignedInteger('alerte_stock')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['coach_id', 'visible']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
