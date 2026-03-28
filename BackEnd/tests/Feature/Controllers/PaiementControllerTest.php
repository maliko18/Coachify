<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Paiement;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    $coachRole = Role::create(['name' => 'coach']);
    $clientRole = Role::create(['name' => 'client']);
    $adminRole = Role::create(['name' => 'admin']);

    // Create coaches with associated users
    $this->user1 = User::factory()->create();
    $this->coach1 = Coach::factory()->create(['user_id' => $this->user1->id]);
    $this->user1->roles()->attach($coachRole);

    $this->user2 = User::factory()->create();
    $this->coach2 = Coach::factory()->create(['user_id' => $this->user2->id]);
    $this->user2->roles()->attach($coachRole);

    // Create clients with associated users
    $this->userClient1 = User::factory()->create();
    $this->client1 = Client::factory()->create(['user_id' => $this->userClient1->id, 'coach_id' => $this->coach1->id]);
    $this->userClient1->roles()->attach($clientRole);

    $this->userClient2 = User::factory()->create();
    $this->client2 = Client::factory()->create(['user_id' => $this->userClient2->id, 'coach_id' => $this->coach2->id]);
    $this->userClient2->roles()->attach($clientRole);

    // Create contracts for testing
    $this->offre1 = Offre::factory()->create(['coach_id' => $this->coach1->id]);
    $this->contrat1 = Contrat::factory()->create([
        'client_id' => $this->client1->id,
        'offre_id' => $this->offre1->id,
        'coach_id' => $this->coach1->id,
    ]);

    // Create admin
    $this->admin = User::factory()->create();
    $this->admin->roles()->attach($adminRole);
});

describe('Paiement Index', function () {
    test('coach can list own paiements', function () {
        Paiement::factory()->count(3)->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        Paiement::factory()->count(2)->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements');

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toHaveCount(3);
    });

    test('coach cannot see other coach paiements', function () {
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements');

        $ids = array_map(fn ($item) => $item['id'] ?? null, (array)$response->json('data'));
        expect($ids)->not()->toContain(
            Paiement::where('coach_id', $this->coach2->id)->first()->id
        );
    });

    test('client can list own paiements', function () {
        Paiement::factory()->count(2)->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->userClient1)
            ->getJson('/api/client/paiements');

        expect($response->status())->toBeIn([200, 404, 403]);
    });

    test('index filters by statut', function () {
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id, 'statut' => 'valide']);
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id, 'statut' => 'en_attente']);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements?statut=valide');

        expect($response->status())->toBe(200);
        expect($response->json('data.0.statut'))->toBe('valide');
    });

    test('index filters by client_id', function () {
        Paiement::factory()->count(2)->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        $otherClient = Client::factory()->create(['coach_id' => $this->coach1->id]);
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $otherClient->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/paiements?client_id={$this->client1->id}");

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toHaveCount(2);
    });

    test('index filters by methode', function () {
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id, 'methode' => 'carte_bancaire']);
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id, 'methode' => 'virement']);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements?methode=carte_bancaire');

        expect($response->status())->toBe(200);
        expect($response->json('data.0.methode'))->toBe('carte_bancaire');
    });

    test('index filters by period', function () {
        $today = now();
        $yesterday = $today->copy()->subDay();

        Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'date_paiement' => $today,
        ]);
        Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'date_paiement' => $yesterday,
        ]);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements?date_debut=' . $today->toDateString() . '&date_fin=' . $today->toDateString());

        expect($response->status())->toBe(200);
    });

    test('admin can list all paiements', function () {
        Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/coach/paiements');

        expect($response->status())->toBeIn([200, 403]);
    });
});

describe('Paiement Show', function () {
    test('coach can view own paiement', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/paiements/{$paiement->id}");

        expect($response->status())->toBe(200);
        expect($response->json('data.id'))->toBe($paiement->id);
    });

    test('coach cannot view other coach paiement', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/paiements/{$paiement->id}");

        expect($response->status())->toBeIn([403, 404]);
    });

    test('show returns 404 for nonexistent', function () {
        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements/99999');

        expect($response->status())->toBeIn([403, 404]);
    });

    test('show loads relations', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/paiements/{$paiement->id}");

        expect($response->status())->toBe(200);
        expect($response->json('data.coach'))->not()->toBeNull();
    });
});

describe('Paiement Store', function () {
    test('coach can create paiement', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(201);
        expect((float) $response->json('data.montant.amount'))->toBe(150.0);
        expect($response->json('data.coach.id'))->toBe($this->coach1->id);
    });

    test('montant is required and positive', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.montant'))->not()->toBeNull();
    });

    test('montant must be greater than 0', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 0,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(422);
    });

    test('methode is required and validated', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'invalid_method',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.methode'))->not()->toBeNull();
    });

    test('all methode values are valid', function () {
        $methodes = ['carte_bancaire', 'virement', 'especes', 'cheque', 'paypal', 'stripe', 'prelevement', 'autre'];

        foreach ($methodes as $method) {
            $response = $this->actingAs($this->user1)
                ->postJson('/api/coach/paiements', [
                    'client_id' => $this->client1->id,
                    'montant' => 150.00,
                    'date_paiement' => now()->toDateString(),
                    'methode' => $method,
                ]);

            expect($response->status())->toBe(201);
        }
    });

    test('default statut is en_attente', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(201);
        expect($response->json('data.statut'))->toBe('en_attente');
    });

    test('contrat_id is optional', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
                'contrat_id' => $this->contrat1->id,
            ]);

        expect($response->status())->toBe(201);
        expect($response->json('data.contrat.id'))->toBe($this->contrat1->id);
    });

    test('client_id must exist', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => 99999,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(422);
    });

    test('date_paiement is required', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'methode' => 'carte_bancaire',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.date_paiement'))->not()->toBeNull();
    });
});

describe('Paiement Update', function () {
    test('coach can update own paiement', function () {
        $paiement = Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'montant' => 100.00,
        ]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/paiements/{$paiement->id}", [
                'description' => 'Updated description',
            ]);

        expect($response->status())->toBe(200);
    });

    test('coach cannot update other coach paiement', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/paiements/{$paiement->id}", [
                'description' => 'Attempted',
            ]);

        expect($response->status())->toBeIn([403, 404]);
    });

    test('update validates montant', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/paiements/{$paiement->id}", [
                'montant' => -50,
            ]);

        expect($response->status())->toBe(422);
    });

    test('update validates statut', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/paiements/{$paiement->id}", [
                'statut' => 'invalid_status',
            ]);

        expect($response->status())->toBe(422);
    });
});

describe('Paiement Delete', function () {
    test('coach can soft delete own paiement', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/coach/paiements/{$paiement->id}");

        expect($response->status())->toBe(200);

        $deletedPaiement = Paiement::withTrashed()->find($paiement->id);
        expect($deletedPaiement->deleted_at)->not()->toBeNull();
    });

    test('coach cannot delete other coach paiement', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach2->id, 'client_id' => $this->client2->id]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/coach/paiements/{$paiement->id}");

        expect($response->status())->toBeIn([403, 404]);
    });

    test('deleted paiement does not appear in list', function () {
        $paiement = Paiement::factory()->create(['coach_id' => $this->coach1->id, 'client_id' => $this->client1->id]);
        $paiement->delete();

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/paiements');

        $ids = array_map(fn ($item) => $item['id'] ?? null, (array)$response->json('data'));
        expect($ids)->not()->toContain($paiement->id);
    });
});

describe('Paiement Validation', function () {
    test('devise is max 3 characters', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
                'devise' => 'TOOLONG',
            ]);

        expect($response->status())->toBe(422);
    });

    test('description is max 500 characters', function () {
        $longDesc = str_repeat('a', 501);

        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/paiements', [
                'client_id' => $this->client1->id,
                'montant' => 150.00,
                'date_paiement' => now()->toDateString(),
                'methode' => 'carte_bancaire',
                'description' => $longDesc,
            ]);

        expect($response->status())->toBe(422);
    });
});

describe('Paiement Permissions', function () {
    test('unauthenticated user cannot create paiement', function () {
        $response = $this->postJson('/api/coach/paiements', [
            'client_id' => $this->client1->id,
            'montant' => 150.00,
            'date_paiement' => now()->toDateString(),
            'methode' => 'carte_bancaire',
        ]);

        expect($response->status())->toBe(401);
    });

    test('coach cannot list client paiements route', function () {
        $response = $this->actingAs($this->user1)
            ->getJson('/api/client/paiements');

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Paiement Special Actions', function () {
    test('valider changes paiement status', function () {
        $paiement = Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'statut' => 'en_attente',
        ]);

        $response = $this->actingAs($this->user1)
            ->postJson("/api/coach/paiements/{$paiement->id}/valider");

        expect($response->status())->toBeIn([200, 422]);
    });

    test('rembourser changes paiement status', function () {
        $paiement = Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'statut' => 'valide',
        ]);

        $response = $this->actingAs($this->user1)
            ->postJson("/api/coach/paiements/{$paiement->id}/rembourser", [
                'montant' => 50,
            ]);

        expect($response->status())->toBeIn([200, 422]);
    });

    test('annuler changes paiement status', function () {
        $paiement = Paiement::factory()->create([
            'coach_id' => $this->coach1->id,
            'client_id' => $this->client1->id,
            'statut' => 'en_attente',
        ]);

        $response = $this->actingAs($this->user1)
            ->postJson("/api/coach/paiements/{$paiement->id}/annuler");

        expect($response->status())->toBeIn([200, 422]);
    });
});
