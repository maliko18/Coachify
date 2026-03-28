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
        Schema::table('seance_client', function (Blueprint $table) {
            $table->boolean('en_liste_attente')->default(false)->after('statut_presence');
            $table->index(['seance_id', 'en_liste_attente']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seance_client', function (Blueprint $table) {
            $table->dropIndex(['seance_id', 'en_liste_attente']);
            $table->dropColumn('en_liste_attente');
        });
    }
};
