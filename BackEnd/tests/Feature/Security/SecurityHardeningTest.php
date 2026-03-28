<?php

use App\Models\Coach;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    foreach (Role::getAllRoles() as $roleName) {
        Role::firstOrCreate(['name' => $roleName]);
    }

    RateLimiter::clear('api-rate-limit:127.0.0.1');
});

function createUserWithRole(string $roleName): User
{
    $user = User::factory()->create();
    $user->assignRole($roleName);

    if ($roleName === Role::COACH) {
        Coach::factory()->create(['user_id' => $user->id]);
    }

    return $user;
}

test('security middleware aliases are registered', function () {
    $middleware = app('router')->getMiddleware();

    expect($middleware)->toHaveKeys([
        'check_resource_ownership',
        'api_rate_limit',
        'audit_api_actions',
    ]);
});

test('api rate limit blocks requests after 60 per minute', function () {
    $user = createUserWithRole(Role::COACH);
    Sanctum::actingAs($user);

    for ($i = 0; $i < 60; $i++) {
        $this->getJson('/api/user')->assertStatus(200);
    }

    $response = $this->getJson('/api/user');

    $response->assertStatus(429)
        ->assertHeader('X-RateLimit-Limit', '60')
        ->assertJsonPath('error.code', 'TOO_MANY_REQUESTS');
});

test('cors preflight returns configured allow-origin header', function () {
    $origin = 'http://localhost:5173';

    $response = $this->withHeaders([
        'Origin' => $origin,
        'Access-Control-Request-Method' => 'GET',
    ])->options('/api/user');

    $response->assertHeader('Access-Control-Allow-Origin', $origin);
});

test('notification ownership middleware blocks access to another user notification', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $notification = Notification::create([
        'user_id' => $owner->id,
        'type' => 'test_security',
        'lue' => false,
        'data' => ['message' => 'test'],
        'unique_key' => 'security-test-' . uniqid(),
    ]);

    Sanctum::actingAs($otherUser);

    $this->putJson('/api/notifications/' . $notification->id . '/read')
        ->assertStatus(403);
});

test('admin can read audit logs endpoint', function () {
    $admin = createUserWithRole(Role::ADMIN);
    Sanctum::actingAs($admin);

    $response = $this->getJson('/api/admin/audit-log');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data',
            'meta' => ['count', 'limit'],
        ]);
});

test('non-admin cannot read audit logs endpoint', function () {
    $coach = createUserWithRole(Role::COACH);
    Sanctum::actingAs($coach);

    $this->getJson('/api/admin/audit-log')
        ->assertStatus(403);
});

test('shop create endpoint enforces input validation', function () {
    $coach = createUserWithRole(Role::COACH);
    Sanctum::actingAs($coach);

    $response = $this->postJson('/api/produits', [
        'description' => 'Produit incomplet',
        'prix' => -1,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('audit endpoint exposes critical write actions', function () {
    $coach = createUserWithRole(Role::COACH);
    Sanctum::actingAs($coach);

    $response = $this->postJson('/api/produits', [
        'nom' => 'Produit Test Audit',
        'description' => 'Desc',
        'type' => 'physique',
        'prix' => 19.90,
        'stock_quantite' => 10,
        'alerte_stock' => 2,
        'visible' => true,
    ]);

    $response->assertStatus(201);

    $admin = createUserWithRole(Role::ADMIN);
    Sanctum::actingAs($admin);

    $auditResponse = $this->getJson('/api/admin/audit-log?limit=200');

    $auditResponse->assertStatus(200)
        ->assertJsonPath('success', true);

    $lines = $auditResponse->json('data') ?? [];
    $containsCriticalAction = collect($lines)->contains(
        fn ($line) => str_contains((string) $line, 'api_critical_action')
    );

    expect($containsCriticalAction)->toBeTrue();
});
