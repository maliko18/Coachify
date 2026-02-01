<?php

use App\Models\Coach;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

describe('Middleware EnsureUserHasRole', function () {

    test('un utilisateur avec le bon rôle peut accéder à la route', function () {
        // Créer une route de test protégée
        Route::middleware(['auth:sanctum', 'role:coach'])->get('/api/test-role', function () {
            return response()->json(['message' => 'Accès autorisé']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::COACH);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-role');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Accès autorisé']);
    });

    test('un utilisateur sans le bon rôle reçoit une erreur 403', function () {
        Route::middleware(['auth:sanctum', 'role:admin'])->get('/api/test-admin-only', function () {
            return response()->json(['message' => 'Accès autorisé']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::PROSPECT);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-admin-only');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'status' => 403,
                ],
            ]);
    });

    test('un utilisateur avec l\'un des rôles autorisés peut accéder', function () {
        Route::middleware(['auth:sanctum', 'role:coach,admin'])->get('/api/test-multi-role', function () {
            return response()->json(['message' => 'Accès autorisé']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::COACH);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-multi-role');

        $response->assertStatus(200);
    });

    test('un utilisateur non authentifié reçoit une erreur 401', function () {
        Route::middleware(['auth:sanctum', 'role:coach'])->get('/api/test-auth-required', function () {
            return response()->json(['message' => 'Accès autorisé']);
        });

        $response = $this->getJson('/api/test-auth-required');

        $response->assertStatus(401);
    });
});

describe('Middleware EnsureUserIsCoach', function () {

    test('un coach peut accéder aux routes protégées par is_coach', function () {
        Route::middleware(['auth:sanctum', 'is_coach'])->get('/api/test-coach', function () {
            return response()->json(['message' => 'Bienvenue coach']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::COACH);
        Coach::create(['user_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-coach');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Bienvenue coach']);
    });

    test('un non-coach reçoit une erreur 403', function () {
        Route::middleware(['auth:sanctum', 'is_coach'])->get('/api/test-coach-only', function () {
            return response()->json(['message' => 'Bienvenue coach']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::PROSPECT);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-coach-only');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Accès réservé aux coachs.',
            ]);
    });
});

describe('Middleware EnsureUserIsAdmin', function () {

    test('un admin peut accéder aux routes protégées par is_admin', function () {
        Route::middleware(['auth:sanctum', 'is_admin'])->get('/api/test-admin', function () {
            return response()->json(['message' => 'Bienvenue admin']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::ADMIN);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-admin');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Bienvenue admin']);
    });

    test('un non-admin reçoit une erreur 403', function () {
        Route::middleware(['auth:sanctum', 'is_admin'])->get('/api/test-admin-only2', function () {
            return response()->json(['message' => 'Bienvenue admin']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::COACH);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-admin-only2');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Accès réservé aux administrateurs.',
            ]);
    });
});

describe('Middleware EnsureUserIsGymManager', function () {

    test('un gym manager peut accéder aux routes protégées', function () {
        Route::middleware(['auth:sanctum', 'is_gym_manager'])->get('/api/test-gym-manager', function () {
            return response()->json(['message' => 'Bienvenue responsable']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::GYM_MANAGER);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-gym-manager');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Bienvenue responsable']);
    });

    test('un non-gym-manager reçoit une erreur 403', function () {
        Route::middleware(['auth:sanctum', 'is_gym_manager'])->get('/api/test-gym-manager-only', function () {
            return response()->json(['message' => 'Bienvenue responsable']);
        });

        $user = User::factory()->create();
        $user->assignRole(Role::CLIENT);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/test-gym-manager-only');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Accès réservé aux responsables de salle.',
            ]);
    });
});
