<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Paiement;
use App\Models\Produit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    foreach (Role::getAllRoles() as $roleName) {
        Role::firstOrCreate(['name' => $roleName]);
    }

    $this->coachUser = User::factory()->create();
    $this->coachUser->assignRole(Role::COACH);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->clientUser = User::factory()->create();
    $this->clientUser->assignRole(Role::CLIENT);
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
        'subscription_status' => 'active',
    ]);
});

test('shop catalog pagination is capped at 100 per page', function () {
    Produit::factory()->count(120)->create([
        'coach_id' => $this->coach->id,
        'visible' => true,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/produits?per_page=200');

    $response->assertOk();
    expect(count($response->json('data.data')))->toBe(100);
    expect((int) $response->json('data.per_page'))->toBe(100);
});

test('dashboard responses are cached for coach kpis', function () {
    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'montant' => 120,
        'date_paiement' => now(),
    ]);

    $version = (int) Cache::get('perf:dashboard:coach:' . $this->coach->id . ':version', 1);
    $cacheKey = 'perf:dashboard:coach:' . $this->coach->id . ':kpis:month:v' . $version;

    Cache::forget($cacheKey);

    $this->actingAs($this->coachUser)->getJson('/api/coach/dashboard/kpis?period=month')->assertOk();

    expect(Cache::has($cacheKey))->toBeTrue();
});

test('user role cache is filled after permission check', function () {
    $cacheKey = 'user:' . $this->coachUser->id . ':roles';
    Cache::forget($cacheKey);

    expect($this->coachUser->hasRole(Role::COACH))->toBeTrue();
    expect(Cache::has($cacheKey))->toBeTrue();
});

test('api response contains monitoring header', function () {
    $response = $this->actingAs($this->coachUser)->getJson('/api/user');

    $response->assertOk();
    $response->assertHeader('X-Response-Time-ms');
});

test('benchmark key endpoint remains below 500ms in local baseline', function () {
    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'montant' => 75,
        'date_paiement' => now(),
    ]);

    $start = microtime(true);

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/coach/dashboard/kpis?period=month');

    $durationMs = (microtime(true) - $start) * 1000;

    $response->assertOk();
    expect($durationMs)->toBeLessThan(500.0);
});

test('load baseline average remains under 500ms over 100 requests', function () {
    $durations = [];
    $rateLimitKey = 'api-rate-limit:' . $this->coachUser->id;

    for ($i = 0; $i < 100; $i++) {
        if ($i > 0 && $i % 55 === 0) {
            RateLimiter::clear($rateLimitKey);
        }

        $start = microtime(true);

        $this->actingAs($this->coachUser)
            ->getJson('/api/user')
            ->assertOk();

        $durations[] = (microtime(true) - $start) * 1000;
    }

    $average = array_sum($durations) / max(1, count($durations));

    expect($average)->toBeLessThan(500.0);
});
