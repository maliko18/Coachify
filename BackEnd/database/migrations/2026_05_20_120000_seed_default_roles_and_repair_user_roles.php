<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * - Seeds the 5 default application roles (idempotent).
     * - Repairs existing users that have no role attached:
     *     * users with a `coaches` row  -> coach
     *     * users with a `clients` row  -> client
     *     * otherwise                   -> prospect
     *
     * Required because the production container only runs `php artisan migrate`
     * (no seeders), which means previously the `roles` table stayed empty and
     * `Role::findByName('coach')` returned null during registration, leaving the
     * coach role unattached and triggering "Accès réservé aux coachs.".
     */
    public function up(): void
    {
        $now = now();

        $defaultRoles = [
            ['name' => 'prospect',    'description' => 'Utilisateur non inscrit ou sans contrat actif'],
            ['name' => 'client',      'description' => 'Personne ayant acheté une prestation'],
            ['name' => 'coach',       'description' => 'Prestataire principal de services sportifs'],
            ['name' => 'gym_manager', 'description' => 'Gestionnaire d\'une structure sportive'],
            ['name' => 'admin',       'description' => 'Administrateur système avec tous les droits'],
        ];

        foreach ($defaultRoles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name']],
                [
                    'description' => $role['description'],
                    'updated_at'  => $now,
                    'created_at'  => $now,
                ]
            );
        }

        $roleIds = DB::table('roles')->pluck('id', 'name');

        $coachRoleId    = $roleIds['coach']    ?? null;
        $clientRoleId   = $roleIds['client']   ?? null;
        $prospectRoleId = $roleIds['prospect'] ?? null;

        if (!Schema::hasTable('users') || !Schema::hasTable('user_roles')) {
            return;
        }

        $userIdsWithRole = DB::table('user_roles')->pluck('user_id')->unique();

        $usersWithoutRole = DB::table('users')
            ->whereNotIn('id', $userIdsWithRole)
            ->select('id')
            ->get();

        if ($usersWithoutRole->isEmpty()) {
            return;
        }

        $coachUserIds = Schema::hasTable('coaches')
            ? DB::table('coaches')->pluck('user_id')->all()
            : [];

        $clientUserIds = Schema::hasTable('clients')
            ? DB::table('clients')->pluck('user_id')->all()
            : [];

        $coachUserIds  = array_flip($coachUserIds);
        $clientUserIds = array_flip($clientUserIds);

        $rows = [];

        foreach ($usersWithoutRole as $user) {
            if (isset($coachUserIds[$user->id]) && $coachRoleId !== null) {
                $rows[] = [
                    'user_id'    => $user->id,
                    'role_id'    => $coachRoleId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } elseif (isset($clientUserIds[$user->id]) && $clientRoleId !== null) {
                $rows[] = [
                    'user_id'    => $user->id,
                    'role_id'    => $clientRoleId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } elseif ($prospectRoleId !== null) {
                $rows[] = [
                    'user_id'    => $user->id,
                    'role_id'    => $prospectRoleId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($rows)) {
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table('user_roles')->insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Non-destructive: we don't remove the default roles nor previously
     * repaired user_roles entries because other data depends on them.
     */
    public function down(): void
    {
        // Intentionally left empty.
    }
};
