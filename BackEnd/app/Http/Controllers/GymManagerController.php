<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Coach;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Role;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GymManagerController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $upcomingSeances = Seance::query()
            ->whereDate('date', '>=', now()->toDateString())
            ->count();

        $todaySeances = Seance::query()
            ->whereDate('date', now()->toDateString())
            ->count();

        $lowStockEquipements = Produit::query()
            ->where('type', 'physique')
            ->whereColumn('stock_quantite', '<', 'alerte_stock')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => User::query()->withTrashed()->count(),
                'active_users' => User::query()->count(),
                'banned_users' => User::query()->onlyTrashed()->count(),
                'coaches_count' => Coach::query()->count(),
                'clients_count' => Client::query()->count(),
                'commandes_count' => Commande::query()->count(),
                'seances_today' => $todaySeances,
                'seances_upcoming' => $upcomingSeances,
                'low_stock_equipements' => $lowStockEquipements,
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 20), 100));
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));
        $status = trim((string) $request->query('status', 'all'));

        $query = User::query()->withTrashed()->with('roles');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role !== '') {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        if ($status === 'active') {
            $query->whereNull('deleted_at');
        } elseif ($status === 'banned') {
            $query->whereNotNull('deleted_at');
        }

        $users = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->through(fn (User $user) => $this->transformUser($user));

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function show(int $userId): JsonResponse
    {
        $user = User::withTrashed()->with(['roles', 'coach', 'client'])->findOrFail($userId);

        return response()->json([
            'success' => true,
            'data' => $this->transformUser($user, true),
        ]);
    }

    public function updateRoles(Request $request, int $userId): JsonResponse
    {
        $payload = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string'],
        ]);

        $roleNames = collect($payload['roles'])
            ->map(fn ($name) => trim((string) $name))
            ->map(fn ($name) => $name === Role::ADMIN ? Role::GYM_MANAGER : $name)
            ->filter()
            ->unique()
            ->values();

        $allowed = collect(Role::getAllRoles());
        $invalid = $roleNames->diff($allowed);

        if ($invalid->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Un ou plusieurs roles sont invalides.',
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'invalid_roles' => $invalid->values(),
                ],
            ], 422);
        }

        $user = User::withTrashed()->with('roles')->findOrFail($userId);

        $roleIds = Role::query()
            ->whereIn('name', $roleNames)
            ->pluck('id')
            ->values();

        $user->roles()->sync($roleIds);
        $user->forgetRoleCache();
        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Roles utilisateur mis a jour.',
            'data' => $this->transformUser($user),
        ]);
    }

    public function ban(Request $request, int $userId): JsonResponse
    {
        $manager = $request->user();
        $user = User::withTrashed()->with('roles')->findOrFail($userId);

        if ((int) $manager->id === (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de bannir votre propre compte.',
            ], 422);
        }

        if ($user->trashed()) {
            return response()->json([
                'success' => true,
                'message' => 'Utilisateur deja banni.',
                'data' => $this->transformUser($user),
            ]);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur banni.',
            'data' => $this->transformUser($user->fresh(['roles'])),
        ]);
    }

    public function unban(int $userId): JsonResponse
    {
        $user = User::withTrashed()->with('roles')->findOrFail($userId);

        if (!$user->trashed()) {
            return response()->json([
                'success' => true,
                'message' => 'Utilisateur deja actif.',
                'data' => $this->transformUser($user),
            ]);
        }

        $user->restore();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur reactive.',
            'data' => $this->transformUser($user->fresh(['roles'])),
        ]);
    }

    public function seances(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 20), 100));
        $statut = trim((string) $request->query('statut', ''));

        $query = Seance::query()
            ->with(['coach.user', 'clients'])
            ->orderByDesc('date')
            ->orderByDesc('heure_debut');

        if ($statut !== '') {
            $query->where('statut', $statut);
        }

        $seances = $query
            ->paginate($perPage)
            ->through(function (Seance $seance) {
                return [
                    'id' => $seance->id,
                    'titre' => $seance->titre,
                    'date' => $seance->date?->toDateString(),
                    'heure_debut' => $seance->heure_debut,
                    'type' => $seance->type,
                    'statut' => $seance->statut,
                    'lieu' => $seance->lieu,
                    'capacite_max' => $seance->capacite_max,
                    'inscrits' => $seance->clients->count(),
                    'places_restantes' => max(0, $seance->capacite_max - $seance->clients->count()),
                    'coach' => [
                        'id' => $seance->coach?->id,
                        'name' => trim(($seance->coach?->user?->first_name ?? '') . ' ' . ($seance->coach?->user?->last_name ?? '')),
                        'email' => $seance->coach?->user?->email,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $seances,
        ]);
    }

    public function equipements(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 20), 100));
        $lowStockOnly = $request->boolean('low_stock_only', false);

        $query = Produit::query()
            ->with(['coach.user'])
            ->where('type', 'physique')
            ->orderBy('nom');

        if ($lowStockOnly) {
            $query->whereColumn('stock_quantite', '<', 'alerte_stock');
        }

        $equipements = $query
            ->paginate($perPage)
            ->through(function (Produit $produit) {
                return [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'description' => $produit->description,
                    'prix' => (float) $produit->prix,
                    'stock_quantite' => (int) $produit->stock_quantite,
                    'alerte_stock' => (int) $produit->alerte_stock,
                    'visible' => (bool) $produit->visible,
                    'is_low_stock' => $produit->stock_quantite < $produit->alerte_stock,
                    'coach' => [
                        'id' => $produit->coach?->id,
                        'name' => trim(($produit->coach?->user?->first_name ?? '') . ' ' . ($produit->coach?->user?->last_name ?? '')),
                        'email' => $produit->coach?->user?->email,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $equipements,
        ]);
    }

    private function transformUser(User $user, bool $withRelations = false): array
    {
        $data = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => trim("{$user->first_name} {$user->last_name}"),
            'email' => $user->email,
            'phone' => $user->phone,
            'city' => $user->city,
            'roles' => $user->roles->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
            ])->values(),
            'is_banned' => $user->trashed(),
            'deleted_at' => $user->deleted_at?->toISOString(),
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];

        if ($withRelations) {
            $data['coach'] = $user->coach;
            $data['client'] = $user->client;
        }

        return $data;
    }
}
