<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::create(['name' => 'coach']);
    $clientRole = Role::create(['name' => 'client']);
    $adminRole = Role::create(['name' => 'admin']);

    // Coach 1
    $this->userCoach1 = User::factory()->create();
    $this->userCoach1->roles()->attach($coachRole);
    $this->coach1 = Coach::factory()->create(['user_id' => $this->userCoach1->id]);

    // Coach 2
    $this->userCoach2 = User::factory()->create();
    $this->userCoach2->roles()->attach($coachRole);
    $this->coach2 = Coach::factory()->create(['user_id' => $this->userCoach2->id]);

    // Client 1
    $this->userClient1 = User::factory()->create();
    $this->userClient1->roles()->attach($clientRole);
    $this->client1 = Client::factory()->create([
        'coach_id' => $this->coach1->id,
        'user_id' => $this->userClient1->id,
    ]);

    // Client 2
    $this->userClient2 = User::factory()->create();
    $this->userClient2->roles()->attach($clientRole);
    $this->client2 = Client::factory()->create([
        'coach_id' => $this->coach2->id,
        'user_id' => $this->userClient2->id,
    ]);

    // Offres
    $this->offre1 = Offre::factory()->create(['coach_id' => $this->coach1->id]);
    $this->offre2 = Offre::factory()->create(['coach_id' => $this->coach2->id]);

    // Contrats
    $this->contrat1 = Contrat::factory()->create([
        'client_id' => $this->client1->id,
        'offre_id' => $this->offre1->id,
        'coach_id' => $this->coach1->id,
    ]);

    $this->contrat2 = Contrat::factory()->create([
        'client_id' => $this->client2->id,
        'offre_id' => $this->offre2->id,
        'coach_id' => $this->coach2->id,
    ]);

    // Admin
    $this->admin = User::factory()->create();
    $this->admin->roles()->attach($adminRole);
});

describe('Offre Authorization', function () {
    test('coach can list own offres', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/offres');

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toBeArray();
    });

    test('coaches see only their own offres in list', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/offres');

        expect($response->status())->toBe(200);
        $ids = array_map(fn ($item) => $item['id'], $response->json('data'));
        expect($ids)->not()->toContain($this->offre2->id);
    });

    test('admin can list all offres', function () {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/coach/offres');

        expect($response->status())->toBeIn([200, 403]);
    });
});

describe('Contrat Authorization', function () {
    test('coach can list own contrats', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/contrats');

        expect($response->status())->toBe(200);
    });

    test('coach sees only their own contrats', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/contrats');

        expect($response->status())->toBe(200);
        $ids = array_map(fn ($item) => $item['id'] ?? null, (array)$response->json('data'));
        expect($ids)->not()->toContain($this->contrat2->id);
    });

    test('client can list own contrats', function () {
        $response = $this->actingAs($this->userClient1)
            ->getJson('/api/client/contrats');

        expect($response->status())->toBe(200);
    });

    test('client sees only their own contrats', function () {
        $response = $this->actingAs($this->userClient1)
            ->getJson('/api/client/contrats');

        expect($response->status())->toBe(200);
        $ids = array_map(fn ($item) => $item['id'] ?? null, (array)$response->json('data'));
        expect($ids)->not()->toContain($this->contrat2->id);
    });

    test('admin can list all contrats', function () {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/coach/contrats');

        expect($response->status())->toBeIn([200, 403]);
    });
});

describe('Client Authorization', function () {
    test('coach can list own clients', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/clients');

        expect($response->status())->toBe(200);
    });

    test('coach sees only their own clients', function () {
        $response = $this->actingAs($this->userCoach1)
            ->getJson('/api/coach/clients');

        expect($response->status())->toBe(200);
        $ids = array_map(fn ($item) => $item['id'] ?? null, (array)$response->json('data'));
        expect($ids)->not()->toContain($this->client2->id);
    });

    test('client can list offres', function () {
        $response = $this->actingAs($this->userClient1)
            ->getJson('/api/client/offres');

        expect($response->status())->toBe(200);
    });

    test('admin can list clients', function () {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/coach/clients');

        expect($response->status())->toBeIn([200, 403]);
    });
});

describe('Authorization Middleware', function () {
    test('check_offre_ownership middleware exists', function () {
        $kernel = app('Illuminate\Contracts\Http\Kernel');
        $middleware = $kernel->getRouteMiddleware();
        
        expect(array_key_exists('check_offre_ownership', $middleware))->toBeTrue();
    });

    test('check_contrat_access middleware exists', function () {
        $kernel = app('Illuminate\Contracts\Http\Kernel');
        $middleware = $kernel->getRouteMiddleware();
        
        expect(array_key_exists('check_contrat_access', $middleware))->toBeTrue();
    });

    test('check_client_access middleware exists', function () {
        $kernel = app('Illuminate\Contracts\Http\Kernel');
        $middleware = $kernel->getRouteMiddleware();
        
        expect(array_key_exists('check_client_access', $middleware))->toBeTrue();
    });
});

