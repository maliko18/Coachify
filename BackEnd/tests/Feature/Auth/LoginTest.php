<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

describe('Connexion', function () {

    test('un utilisateur peut se connecter avec des identifiants valides', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                ],
            ]);
    });

    test('la connexion échoue avec un mauvais mot de passe', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['email']]]);
    });

    test('la connexion échoue avec un email inexistant', function () {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['email']]]);
    });

    test('la connexion échoue sans email', function () {
        $response = $this->postJson('/api/login', [
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['email']]]);
    });

    test('la connexion échoue sans mot de passe', function () {
        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['password']]]);
    });
});

describe('Déconnexion', function () {

    test('un utilisateur connecté peut se déconnecter', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(204);

        // Vérifier que le token a été supprimé
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    });

    test('la déconnexion échoue sans authentification', function () {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    });
});

describe('Récupération utilisateur connecté', function () {

    test('un utilisateur authentifié peut récupérer ses informations', function () {
        $user = User::factory()->create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
        ]);
        
        $role = Role::findByName(Role::PROSPECT);
        $user->roles()->attach($role);
        
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'first_name' => 'Jean',
                    'last_name' => 'Dupont',
                ],
            ]);
    });

    test('la récupération échoue sans authentification', function () {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    });
});
