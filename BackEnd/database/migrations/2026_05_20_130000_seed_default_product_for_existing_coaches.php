<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The BookCoachPage relies on `GET /produits?coach_id=X` to find a
     * product to attach to the order. Coaches signed up before the registration
     * flow auto-created a default "Séance de coaching" product have no row in
     * the `produits` table, which produces:
     *     "Aucun produit actif pour ce coach. Impossible de finaliser l'achat."
     *
     * This migration creates one default `service` product per coach who has
     * none, so that existing accounts can immediately accept bookings.
     */
    public function up(): void
    {
        if (!Schema::hasTable('coaches') || !Schema::hasTable('produits') || !Schema::hasTable('users')) {
            return;
        }

        $now = now();

        $coachIdsWithProduct = DB::table('produits')
            ->whereNull('deleted_at')
            ->pluck('coach_id')
            ->unique()
            ->all();
        $coachIdsWithProduct = array_flip($coachIdsWithProduct);

        $coaches = DB::table('coaches')
            ->leftJoin('users', 'users.id', '=', 'coaches.user_id')
            ->select(
                'coaches.id as coach_id',
                'coaches.hourly_rate',
                'users.first_name',
                'users.last_name'
            )
            ->get();

        $rows = [];

        foreach ($coaches as $coach) {
            if (isset($coachIdsWithProduct[$coach->coach_id])) {
                continue;
            }

            $fullName = trim(
                (string) ($coach->first_name ?? '') . ' ' . (string) ($coach->last_name ?? '')
            );
            $hourlyRate = (float) ($coach->hourly_rate ?? 0);
            $prix = $hourlyRate > 0 ? round($hourlyRate, 2) : 60.00;

            $rows[] = [
                'coach_id'       => $coach->coach_id,
                'nom'            => 'Séance de coaching',
                'description'    => $fullName !== ''
                    ? 'Séance individuelle de coaching avec ' . $fullName . '.'
                    : 'Séance individuelle de coaching.',
                'type'           => 'service',
                'prix'           => $prix,
                'stock_quantite' => 0,
                'alerte_stock'   => 0,
                'visible'        => true,
                'created_at'     => $now,
                'updated_at'     => $now,
            ];
        }

        if (!empty($rows)) {
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table('produits')->insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Non-destructive: we don't remove the backfilled products because they
     * may already be referenced by orders/commande_items.
     */
    public function down(): void
    {
        // Intentionally left empty.
    }
};
