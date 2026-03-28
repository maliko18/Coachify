<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Paiement;
use App\Models\Role;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => 'coach']);
    $clientRole = Role::firstOrCreate(['name' => 'client']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole->id);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->clientUser = User::factory()->create();
    $this->clientUser->roles()->attach($clientRole->id);
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
        'subscription_status' => 'active',
    ]);

    $this->client2 = Client::factory()->create([
        'coach_id' => $this->coach->id,
        'subscription_status' => 'inactive',
    ]);
});

test('coach dashboard kpis returns aggregated payload', function () {
    $offreA = Offre::factory()->create(['coach_id' => $this->coach->id, 'nom' => 'Offre A']);
    $offreB = Offre::factory()->create(['coach_id' => $this->coach->id, 'nom' => 'Offre B']);

    Contrat::factory()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'offre_id' => $offreA->id,
        'statut' => 'actif',
        'montant_paye' => 120,
    ]);

    Contrat::factory()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client2->id,
        'offre_id' => $offreA->id,
        'statut' => 'termine',
        'montant_paye' => 80,
    ]);

    Contrat::factory()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client2->id,
        'offre_id' => $offreB->id,
        'statut' => 'termine',
        'montant_paye' => 50,
    ]);

    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'montant' => 100,
        'date_paiement' => now()->subDays(2),
    ]);

    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client2->id,
        'montant' => 200,
        'date_paiement' => now()->subDays(1),
    ]);

    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'capacite_max' => 4,
        'date' => now()->toDateString(),
    ]);

    $seance->clients()->attach($this->client->id, [
        'statut_presence' => 'present',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/coach/dashboard/kpis?period=month');

    $response->assertOk();
    $response->assertJsonPath('success', true);
    expect((float) $response->json('data.ca.total'))->toBe(300.0);
    expect((float) $response->json('data.panier_moyen.panier_moyen'))->toBe(150.0);
    $response->assertJsonPath('data.fidelisation.total_clients', 2);
    $response->assertJsonPath('data.fidelisation.clients_actifs', 1);
    $response->assertJsonPath('data.top_offres.0.nom', 'Offre A');
});

test('coach ca endpoint supports year period', function () {
    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'montant' => 90,
        'date_paiement' => now()->subMonths(2),
    ]);

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/coach/dashboard/ca?period=year');

    $response->assertOk();
    $response->assertJsonPath('data.period', 'year');
    expect((float) $response->json('data.total'))->toBe(90.0);
});

test('coach taux remplissage endpoint returns calculated ratio', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'capacite_max' => 2,
        'date' => now()->toDateString(),
    ]);

    $seance->clients()->attach($this->client->id, [
        'statut_presence' => 'present',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/coach/dashboard/taux-remplissage?period=month');

    $response->assertOk();
    $response->assertJsonPath('data.capacite_totale', 2);
    $response->assertJsonPath('data.participants_presents', 1);
    expect((float) $response->json('data.taux_remplissage'))->toBe(50.0);
});

test('client progression endpoint returns consumed sessions and billing total', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'date' => now()->subDays(3)->toDateString(),
    ]);

    $this->client->seances()->attach($seance->id, [
        'statut_presence' => 'present',
        'en_liste_attente' => false,
    ]);

    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'montant' => 120,
        'montant_rembourse' => 20,
        'date_paiement' => now()->subDays(2),
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/client/dashboard/progression');

    $response->assertOk();
    $response->assertJsonPath('data.seances_consommees', 1);
    expect((float) $response->json('data.facturation_totale'))->toBe(100.0);
});

test('client historique endpoint returns payment history with offer details', function () {
    $offre = Offre::factory()->create(['coach_id' => $this->coach->id, 'nom' => 'Pack Test']);
    $contrat = Contrat::factory()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'offre_id' => $offre->id,
    ]);

    Paiement::factory()->valide()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'contrat_id' => $contrat->id,
        'montant' => 150,
        'date_paiement' => now()->subDay(),
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/client/dashboard/historique');

    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.0.offre.nom', 'Pack Test');
    expect((float) $response->json('data.0.montant'))->toBe(150.0);
});
