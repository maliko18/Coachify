<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Notification;
use App\Models\Offre;
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

test('user can list notifications from inbox endpoint', function () {
    Notification::create([
        'user_id' => $this->coachUser->id,
        'type' => 'seance_modifiee',
        'lue' => false,
        'data' => ['titre' => 'Seance 1'],
    ]);

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/notifications');

    expect($response->status())->toBe(200);
    expect($response->json('success'))->toBeTrue();
    expect($response->json('data'))->toHaveCount(1);
});

test('user can mark own notification as read', function () {
    $notification = Notification::create([
        'user_id' => $this->coachUser->id,
        'type' => 'seance_annulee',
        'lue' => false,
        'data' => ['titre' => 'Seance 2'],
    ]);

    $response = $this->actingAs($this->coachUser)
        ->putJson("/api/notifications/{$notification->id}/read");

    expect($response->status())->toBe(200);
    expect($response->json('success'))->toBeTrue();
    expect($response->json('data.lue'))->toBeTrue();
});

test('user cannot mark another user notification as read', function () {
    $otherUser = User::factory()->create();
    $notification = Notification::create([
        'user_id' => $otherUser->id,
        'type' => 'seance_annulee',
        'lue' => false,
        'data' => ['titre' => 'Seance 3'],
    ]);

    $response = $this->actingAs($this->coachUser)
        ->putJson("/api/notifications/{$notification->id}/read");

    expect($response->status())->toBe(403);
});

test('client inbox generates j-1 reminder and imminent pack end notifications', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'date' => now()->addDay()->toDateString(),
    ]);

    $this->client->seances()->attach($seance->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $offre = Offre::factory()->create(['coach_id' => $this->coach->id]);

    Contrat::factory()->create([
        'coach_id' => $this->coach->id,
        'client_id' => $this->client->id,
        'offre_id' => $offre->id,
        'statut' => 'actif',
        'date_fin' => now()->addDays(3)->toDateString(),
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/notifications');

    expect($response->status())->toBe(200);

    $types = collect($response->json('data'))->pluck('type')->all();
    expect(in_array('rappel_seance_j_1', $types, true) || in_array('rappel_seance_jour_j', $types, true))->toBeTrue();
    expect($types)->toContain('fin_pack_imminente');
});

test('updating seance to annulee notifies enrolled clients', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coach->id,
        'date' => now()->addDays(2)->toDateString(),
        'statut' => 'planifiee',
    ]);

    $this->client->seances()->attach($seance->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->coachUser)
        ->putJson("/api/coach/seances/{$seance->id}", [
            'statut' => 'annulee',
        ]);

    expect($response->status())->toBe(200);

    $notif = Notification::where('user_id', $this->clientUser->id)
        ->where('type', 'seance_annulee')
        ->first();

    expect($notif)->not()->toBeNull();
});
