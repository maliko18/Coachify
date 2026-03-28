<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => Role::COACH], ['description' => 'Coach']);
    $clientRole = Role::firstOrCreate(['name' => Role::CLIENT], ['description' => 'Client']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole->id);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->otherCoachUser = User::factory()->create();
    $this->otherCoachUser->roles()->attach($coachRole->id);
    $this->otherCoach = Coach::factory()->create(['user_id' => $this->otherCoachUser->id]);

    $this->clientUser = User::factory()->create();
    $this->clientUser->roles()->attach($clientRole->id);
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
    ]);

    $this->otherClientUser = User::factory()->create();
    $this->otherClientUser->roles()->attach($clientRole->id);
    $this->otherClient = Client::factory()->create([
        'user_id' => $this->otherClientUser->id,
        'coach_id' => $this->otherCoach->id,
    ]);
});

it('cree une commande client et decremente le stock', function () {
    $produit = Produit::factory()->physique()->create([
        'coach_id' => $this->coach->id,
        'stock_quantite' => 10,
        'prix' => 25,
        'visible' => true,
    ]);

    $response = $this->actingAs($this->clientUser)->postJson('/api/commandes', [
        'items' => [
            ['produit_id' => $produit->id, 'quantite' => 3],
        ],
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.total', '75.00');

    $this->assertDatabaseHas('commandes', [
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
        'statut' => 'attente',
    ]);

    $this->assertDatabaseHas('produits', [
        'id' => $produit->id,
        'stock_quantite' => 7,
    ]);
});

it('refuse la creation de commande si stock insuffisant', function () {
    $produit = Produit::factory()->physique()->create([
        'coach_id' => $this->coach->id,
        'stock_quantite' => 1,
        'visible' => true,
    ]);

    $this->actingAs($this->clientUser)->postJson('/api/commandes', [
        'items' => [
            ['produit_id' => $produit->id, 'quantite' => 2],
        ],
    ])->assertUnprocessable();

    $this->assertDatabaseCount('commandes', 0);
    $this->assertDatabaseHas('produits', [
        'id' => $produit->id,
        'stock_quantite' => 1,
    ]);
});

it('liste uniquement les commandes du client connecte', function () {
    Commande::factory()->create([
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
    ]);

    Commande::factory()->create([
        'client_id' => $this->otherClient->id,
        'coach_id' => $this->otherCoach->id,
    ]);

    $response = $this->actingAs($this->clientUser)->getJson('/api/commandes');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.client_id', $this->client->id);
});

it('liste uniquement les commandes du coach connecte', function () {
    Commande::factory()->create([
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
    ]);

    Commande::factory()->create([
        'client_id' => $this->otherClient->id,
        'coach_id' => $this->otherCoach->id,
    ]);

    $response = $this->actingAs($this->coachUser)->getJson('/api/commandes');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.coach_id', $this->coach->id);
});

it('met a jour le statut dune commande par son coach', function () {
    $commande = Commande::factory()->create([
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
        'statut' => 'attente',
    ]);

    $this->actingAs($this->coachUser)
        ->putJson('/api/commandes/' . $commande->id . '/status', ['statut' => 'envoye'])
        ->assertOk();

    $this->assertDatabaseHas('commandes', [
        'id' => $commande->id,
        'statut' => 'envoye',
    ]);
});

it('refuse transition de statut invalide', function () {
    $commande = Commande::factory()->create([
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
        'statut' => 'attente',
    ]);

    $this->actingAs($this->coachUser)
        ->putJson('/api/commandes/' . $commande->id . '/status', ['statut' => 'livre'])
        ->assertUnprocessable();
});

it('refuse mise a jour du statut par un autre coach', function () {
    $commande = Commande::factory()->create([
        'client_id' => $this->client->id,
        'coach_id' => $this->coach->id,
        'statut' => 'attente',
    ]);

    $this->actingAs($this->otherCoachUser)
        ->putJson('/api/commandes/' . $commande->id . '/status', ['statut' => 'envoye'])
        ->assertForbidden();
});
