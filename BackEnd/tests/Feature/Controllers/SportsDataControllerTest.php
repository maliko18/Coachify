<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Role;
use App\Models\Seance;
use App\Models\SportsData;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => Role::COACH], ['description' => 'Coach']);
    $clientRole = Role::firstOrCreate(['name' => Role::CLIENT], ['description' => 'Client']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole->id);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->clientUser = User::factory()->create();
    $this->clientUser->roles()->attach($clientRole->id);
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
    ]);
});

it('importe des donnees sportives mock pour un client', function () {
    $response = $this->actingAs($this->clientUser)
        ->postJson('/api/sports-data/import', [
            'source' => 'garmin',
            'count' => 5,
        ]);

    $response->assertCreated();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.count', 5);

    $this->assertDatabaseCount('sports_data', 5);
    $this->assertDatabaseCount('workout_sessions', 5);
});

it('refuse import sports data pour un non client', function () {
    $this->actingAs($this->coachUser)
        ->postJson('/api/sports-data/import', [
            'source' => 'strava',
            'count' => 3,
        ])
        ->assertForbidden();
});

it('correle une donnee sportive a une seance proche', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'date' => now()->subDay()->toDateString(),
        'heure_debut' => now()->format('H:i'),
    ]);

    $seance->clients()->attach($this->client->id, [
        'statut_presence' => 'present',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->postJson('/api/sports-data/import', [
            'source' => 'garmin',
            'count' => 1,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('workout_sessions', [
        'client_id' => $this->client->id,
        'seance_id' => $seance->id,
    ]);
});

it('retourne les analytics progression du client', function () {
    SportsData::factory()->create([
        'client_id' => $this->client->id,
        'distance_km' => 5.5,
        'duration_minutes' => 45,
        'calories' => 420,
        'heart_rate_avg' => 140,
        'recorded_at' => now()->subDays(2),
    ]);

    SportsData::factory()->create([
        'client_id' => $this->client->id,
        'distance_km' => 7.0,
        'duration_minutes' => 52,
        'calories' => 510,
        'heart_rate_avg' => 150,
        'recorded_at' => now()->subDays(1),
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/client/analytics/progression');

    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.summary.samples', 2);
    $response->assertJsonPath('data.summary.total_calories', 930);
});

it('retourne 422 quand la source import est invalide', function () {
    $this->actingAs($this->clientUser)
        ->postJson('/api/sports-data/import', [
            'source' => 'polar',
            'count' => 2,
        ])
        ->assertUnprocessable();
});
