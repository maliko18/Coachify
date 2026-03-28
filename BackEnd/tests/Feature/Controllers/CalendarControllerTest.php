<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Role;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::create(['name' => 'coach']);
    $clientRole = Role::create(['name' => 'client']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->clientUser = User::factory()->create();
    $this->clientUser->roles()->attach($clientRole);
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
    ]);
});

test('coach can export seances to ics', function () {
    Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'titre' => 'Seance Test ICS',
        'date' => now()->addDay()->toDateString(),
        'heure_debut' => '10:00',
        'duree' => 60,
    ]);

    $response = $this->actingAs($this->coachUser)
        ->get('/api/seances/export/ics');

    expect($response->status())->toBe(200);
    expect($response->headers->get('content-type'))->toContain('text/calendar');
    expect($response->content())->toContain('BEGIN:VCALENDAR');
    expect($response->content())->toContain('SUMMARY:Seance Test ICS');
});

test('client can export own seances to ics', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'titre' => 'Seance Client',
        'date' => now()->addDay()->toDateString(),
        'heure_debut' => '09:00',
        'duree' => 45,
    ]);

    $this->client->seances()->attach($seance->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->get('/api/seances/export/ics');

    expect($response->status())->toBe(200);
    expect($response->content())->toContain('SUMMARY:Seance Client');
});

test('calendar sync endpoint returns mock payload', function () {
    Seance::factory()->count(2)->create([
        'coach_id' => $this->coach->id,
    ]);

    $response = $this->actingAs($this->coachUser)
        ->postJson('/api/calendar/sync', [
            'provider' => 'google',
            'full_sync' => true,
        ]);

    expect($response->status())->toBe(200);
    expect($response->json('success'))->toBeTrue();
    expect($response->json('data.mode'))->toBe('mock');
    expect($response->json('data.events_synced'))->toBe(2);
});
