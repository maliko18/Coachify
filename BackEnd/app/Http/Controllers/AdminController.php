<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
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

    public function statistics(): JsonResponse
    {
        $totalUsers = User::withTrashed()->count();
        $activeUsers = User::count();
        $bannedUsers = User::onlyTrashed()->count();

        $roles = Role::query()
            ->withCount('users')
            ->get()
            ->map(fn (Role $role) => [
                'name' => $role->name,
                'description' => $role->description,
                'users_count' => $role->users_count,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'banned_users' => $bannedUsers,
                'roles' => $roles,
            ],
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
        $admin = $request->user();
        $user = User::withTrashed()->with('roles')->findOrFail($userId);

        if ((int) $admin->id === (int) $user->id) {
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
