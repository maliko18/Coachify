<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

describe('Inscription', function () {
    
    test('un utilisateur peut s\'inscrire comme prospect', function () {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean.dupont@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'prospect',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'roles',
                ],
                'token',
            ])
            ->assertJson([
                'message' => 'Inscription réussie',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jean.dupont@example.com',
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
        ]);

        $user = User::where('email', 'jean.dupont@example.com')->first();
        expect($user->hasRole(Role::PROSPECT))->toBeTrue();
    });

    test('un utilisateur peut s\'inscrire comme coach', function () {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Marie',
            'last_name' => 'Martin',
            'email' => 'marie.martin@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'coach',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'roles',
                    'coach',
                ],
                'token',
            ]);

        $user = User::where('email', 'marie.martin@example.com')->first();
        expect($user->hasRole(Role::COACH))->toBeTrue();
        expect($user->coach)->not->toBeNull();
    });

    test('l\'inscription échoue avec un email déjà utilisé', function () {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'prospect',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['email']]]);
    });

    test('l\'inscription échoue avec des données manquantes', function () {
        $response = $this->postJson('/api/register', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure([
                'error' => [
                    'errors' => ['first_name', 'last_name', 'password', 'role'],
                ],
            ]);
    });

    test('l\'inscription échoue avec un rôle invalide', function () {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin', // rôle non autorisé à l'inscription
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['role']]]);
    });

    test('l\'inscription échoue si les mots de passe ne correspondent pas', function () {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword!',
            'role' => 'prospect',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['errors' => ['password']]]);
    });
});
