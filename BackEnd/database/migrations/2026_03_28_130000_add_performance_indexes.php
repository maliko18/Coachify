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
        Schema::table('seances', function (Blueprint $table) {
            $table->index(['coach_id', 'date'], 'seances_coach_date_idx');
        });

        Schema::table('contrats', function (Blueprint $table) {
            $table->index(['coach_id', 'statut', 'date_fin'], 'contrats_coach_statut_date_fin_idx');
            $table->index(['client_id', 'statut'], 'contrats_client_statut_idx');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->index(['coach_id', 'statut', 'date_paiement'], 'paiements_coach_statut_date_idx');
            $table->index(['client_id', 'date_paiement'], 'paiements_client_date_idx');
            $table->index(['contrat_id', 'statut'], 'paiements_contrat_statut_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'notifications_user_created_at_idx');
        });

        Schema::table('seance_client', function (Blueprint $table) {
            $table->index(['client_id', 'statut_presence', 'en_liste_attente'], 'seance_client_presence_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seance_client', function (Blueprint $table) {
            $table->dropIndex('seance_client_presence_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_created_at_idx');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex('paiements_coach_statut_date_idx');
            $table->dropIndex('paiements_client_date_idx');
            $table->dropIndex('paiements_contrat_statut_idx');
        });

        Schema::table('contrats', function (Blueprint $table) {
            $table->dropIndex('contrats_coach_statut_date_fin_idx');
            $table->dropIndex('contrats_client_statut_idx');
        });

        Schema::table('seances', function (Blueprint $table) {
            $table->dropIndex('seances_coach_date_idx');
        });
    }
};
