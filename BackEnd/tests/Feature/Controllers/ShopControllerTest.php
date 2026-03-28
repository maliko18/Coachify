<?php

use App\Models\Coach;
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
});

it('liste le catalogue des produits visibles', function () {
    $visible = Produit::factory()->create([
        'coach_id' => $this->coach->id,
        'visible' => true,
    ]);

    Produit::factory()->create([
        'coach_id' => $this->coach->id,
        'visible' => false,
    ]);

    $response = $this->actingAs($this->clientUser)->getJson('/api/produits');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.id', $visible->id);
});

it('cree un produit en tant que coach', function () {
    $response = $this->actingAs($this->coachUser)->postJson('/api/produits', [
        'nom' => 'Pack Proteines',
        'description' => 'Whey isolate',
        'type' => 'physique',
        'prix' => 39.90,
        'stock_quantite' => 20,
        'alerte_stock' => 5,
        'visible' => true,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('produits', [
        'coach_id' => $this->coach->id,
        'nom' => 'Pack Proteines',
        'type' => 'physique',
    ]);
});

it('refuse la creation produit pour un client', function () {
    $this->actingAs($this->clientUser)->postJson('/api/produits', [
        'nom' => 'Nope',
        'type' => 'physique',
        'prix' => 12,
        'stock_quantite' => 1,
        'alerte_stock' => 0,
    ])->assertForbidden();
});

it('met a jour son propre produit et refuse celui dun autre coach', function () {
    $ownProduit = Produit::factory()->create(['coach_id' => $this->coach->id]);
    $otherProduit = Produit::factory()->create(['coach_id' => $this->otherCoach->id]);

    $this->actingAs($this->coachUser)->putJson('/api/produits/' . $ownProduit->id, [
        'prix' => 55.5,
        'visible' => false,
    ])->assertOk();

    $this->assertDatabaseHas('produits', [
        'id' => $ownProduit->id,
        'prix' => 55.50,
        'visible' => 0,
    ]);

    $this->actingAs($this->coachUser)->putJson('/api/produits/' . $otherProduit->id, [
        'prix' => 12,
    ])->assertForbidden();
});

it('retourne letat du stock avec low_stock', function () {
    $produit = Produit::factory()->create([
        'coach_id' => $this->coach->id,
        'stock_quantite' => 2,
        'alerte_stock' => 5,
        'visible' => true,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/produits/' . $produit->id . '/stock');

    $response->assertOk();
    $response->assertJsonPath('data.low_stock', true);
    $response->assertJsonPath('data.stock_quantite', 2);
});

it('archive un produit en soft delete', function () {
    $produit = Produit::factory()->create(['coach_id' => $this->coach->id]);

    $this->actingAs($this->coachUser)
        ->deleteJson('/api/produits/' . $produit->id)
        ->assertOk();

    $this->assertSoftDeleted('produits', ['id' => $produit->id]);
});
