<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Role;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => Role::COACH], ['description' => 'Coach']);
    $clientRole = Role::firstOrCreate(['name' => Role::CLIENT], ['description' => 'Client']);

    $this->coachUserA = User::factory()->create();
    $this->coachUserA->roles()->attach($coachRole->id);
    $this->coachA = Coach::factory()->create([
        'user_id' => $this->coachUserA->id,
    ]);

    $this->coachUserB = User::factory()->create();
    $this->coachUserB->roles()->attach($coachRole->id);
    $this->coachB = Coach::factory()->create([
        'user_id' => $this->coachUserB->id,
    ]);

    $this->clientUserA = User::factory()->create();
    $this->clientUserA->roles()->attach($clientRole->id);
    $this->clientA = Client::factory()->create([
        'user_id' => $this->clientUserA->id,
        'coach_id' => $this->coachA->id,
        'fitness_level' => 'beginner',
    ]);

    $this->clientUserB = User::factory()->create();
    $this->clientUserB->roles()->attach($clientRole->id);
    $this->clientB = Client::factory()->create([
        'user_id' => $this->clientUserB->id,
        'coach_id' => $this->coachB->id,
        'fitness_level' => 'intermediate',
    ]);
});

function clientPayload(array $overrides = []): array
{
    return array_merge([
        'user_id' => User::factory()->create()->id,
        'coach_id' => null,
        'objectives' => 'Objectifs test',
        'medical_conditions' => null,
        'fitness_level' => 'advanced',
        'weight' => 72.5,
        'height' => 178,
        'age' => 29,
    ], $overrides);
}

it('refuse laccès non authentifie aux routes clients coach', function () {
    $this->getJson('/api/coach/clients')->assertUnauthorized();
});

it('liste uniquement les clients du coach connecte', function () {
    $response = $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/clients');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonPath('0.id', $this->clientA->id);
});

it('affiche un client appartenant au coach', function () {
    $response = $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/clients/' . $this->clientA->id);

    $response->assertOk();
    $response->assertJsonPath('id', $this->clientA->id);
    $response->assertJsonPath('coach_id', $this->coachA->id);
});

it('refuse la consultation dun client dun autre coach', function () {
    $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/clients/' . $this->clientB->id)
        ->assertForbidden();
});

it('cree un client avec des donnees valides', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/clients', clientPayload([
            'user_id' => $user->id,
            'coach_id' => $this->coachA->id,
            'fitness_level' => 'beginner',
        ]));

    $response->assertCreated();
    $response->assertJsonPath('user_id', $user->id);
    $response->assertJsonPath('coach_id', $this->coachA->id);

    $this->assertDatabaseHas('clients', [
        'user_id' => $user->id,
        'coach_id' => $this->coachA->id,
        'fitness_level' => 'beginner',
    ]);
});

it('valide user_id existant lors de la creation client', function () {
    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/clients', clientPayload([
            'user_id' => 999999,
        ]))
        ->assertUnprocessable();
});

it('valide fitness_level lors de la creation client', function () {
    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/clients', clientPayload([
            'fitness_level' => 'expert',
        ]))
        ->assertUnprocessable();
});

it('met a jour un client du coach', function () {
    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/clients/' . $this->clientA->id, [
            'objectives' => 'Nouvel objectif',
            'subscription_status' => 'paused',
            'sessions_remaining' => 12,
        ])
        ->assertOk()
        ->assertJsonPath('objectives', 'Nouvel objectif')
        ->assertJsonPath('subscription_status', 'paused');

    $this->assertDatabaseHas('clients', [
        'id' => $this->clientA->id,
        'objectives' => 'Nouvel objectif',
        'subscription_status' => 'paused',
        'sessions_remaining' => 12,
    ]);
});

it('valide lage lors de la mise a jour client', function () {
    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/clients/' . $this->clientA->id, [
            'age' => 121,
        ])
        ->assertUnprocessable();
});

it('refuse la mise a jour dun client dun autre coach', function () {
    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/clients/' . $this->clientB->id, [
            'objectives' => 'Nope',
        ])
        ->assertForbidden();
});

it('supprime un client en soft delete', function () {
    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/clients/' . $this->clientA->id)
        ->assertOk();

    $this->assertSoftDeleted('clients', ['id' => $this->clientA->id]);
});

it('refuse la suppression dun client dun autre coach', function () {
    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/clients/' . $this->clientB->id)
        ->assertForbidden();
});

it('interdit a un client dacceder aux routes coach clients', function () {
    $this->actingAs($this->clientUserA)
        ->getJson('/api/coach/clients')
        ->assertForbidden();
});

it('retourne les informations du client connecte', function () {
    $response = $this->actingAs($this->clientUserA)
        ->getJson('/api/client/info');

    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.id', $this->clientA->id);
    $response->assertJsonPath('data.user.id', $this->clientUserA->id);
    $response->assertJsonPath('data.coach.id', $this->coachA->id);
});

it('retourne les relations contrats et seances dans info client', function () {
    $offre = Offre::factory()->create([
        'coach_id' => $this->coachA->id,
    ]);

    $contrat = Contrat::factory()->create([
        'client_id' => $this->clientA->id,
        'coach_id' => $this->coachA->id,
        'offre_id' => $offre->id,
    ]);

    $seance = Seance::factory()->create([
        'coach_id' => $this->coachA->id,
    ]);
    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->clientUserA)
        ->getJson('/api/client/info');

    $response->assertOk();
    $response->assertJsonPath('data.contrats.0.id', $contrat->id);
    $response->assertJsonPath('data.seances.0.id', $seance->id);
});

it('retourne 404 si le profil client est introuvable', function () {
    $clientRole = Role::where('name', Role::CLIENT)->first();

    $userWithoutProfile = User::factory()->create();
    $userWithoutProfile->roles()->attach($clientRole->id);

    $this->actingAs($userWithoutProfile)
        ->getJson('/api/client/info')
        ->assertNotFound();
});

it('interdit a un coach dacceder a info client', function () {
    $this->actingAs($this->coachUserA)
        ->getJson('/api/client/info')
        ->assertForbidden();
});
