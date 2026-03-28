<?php

use App\Models\Conversation;
use App\Models\Group;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => Role::COACH], ['description' => 'Coach']);
    $clientRole = Role::firstOrCreate(['name' => Role::CLIENT], ['description' => 'Client']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole->id);

    $this->clientUser = User::factory()->create();
    $this->clientUser->roles()->attach($clientRole->id);

    $this->otherUser = User::factory()->create();
    $this->otherUser->roles()->attach($clientRole->id);
});

it('cree une conversation 1-to-1', function () {
    $response = $this->actingAs($this->clientUser)
        ->postJson('/api/conversations', [
            'coach_id' => $this->coachUser->id,
        ]);

    $response->assertCreated();
    $response->assertJsonPath('success', true);

    $this->assertDatabaseHas('conversations', [
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coachUser->id,
    ]);
});

it('refuse la creation de conversation vers un non-coach', function () {
    $response = $this->actingAs($this->clientUser)
        ->postJson('/api/conversations', [
            'coach_id' => $this->otherUser->id,
        ]);

    $response->assertUnprocessable();
    $response->assertJsonPath('success', false);
});

it('liste uniquement les conversations de lutilisateur connecte', function () {
    Conversation::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coachUser->id,
    ]);

    Conversation::factory()->create([
        'user_id' => $this->otherUser->id,
        'coach_id' => $this->coachUser->id,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->getJson('/api/conversations');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.user_id', $this->clientUser->id);
});

it('envoie et recupere des messages dans une conversation', function () {
    $conversation = Conversation::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coachUser->id,
    ]);

    $send = $this->actingAs($this->clientUser)
        ->postJson('/api/conversations/' . $conversation->id . '/messages', [
            'contenu' => 'Bonjour coach',
        ]);

    $send->assertCreated();
    $send->assertJsonPath('data.contenu', 'Bonjour coach');

    $fetch = $this->actingAs($this->coachUser)
        ->getJson('/api/conversations/' . $conversation->id . '/messages');

    $fetch->assertOk();
    $fetch->assertJsonPath('data.data.0.contenu', 'Bonjour coach');
});

it('interdit l acces a une conversation non participante', function () {
    $conversation = Conversation::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coachUser->id,
    ]);

    $this->actingAs($this->otherUser)
        ->getJson('/api/conversations/' . $conversation->id . '/messages')
        ->assertForbidden();
});

it('pagine les messages de conversation', function () {
    $conversation = Conversation::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coachUser->id,
    ]);

    for ($i = 1; $i <= 25; $i++) {
        $conversation->messages()->create([
            'from_id' => $this->clientUser->id,
            'contenu' => 'Message #' . $i,
            'sent_at' => now()->subSeconds(26 - $i),
        ]);
    }

    $response = $this->actingAs($this->coachUser)
        ->getJson('/api/conversations/' . $conversation->id . '/messages?per_page=10');

    $response->assertOk();
    $response->assertJsonPath('data.per_page', 10);
    $response->assertJsonCount(10, 'data.data');
});

it('envoie et lit des messages de groupe pour un membre', function () {
    $group = Group::factory()->create([
        'coach_id' => $this->coachUser->id,
    ]);

    $group->members()->attach([$this->clientUser->id, $this->otherUser->id]);

    $send = $this->actingAs($this->clientUser)
        ->postJson('/api/groups/' . $group->id . '/messages', [
            'contenu' => 'Salut le groupe',
        ]);

    $send->assertCreated();

    $fetch = $this->actingAs($this->otherUser)
        ->getJson('/api/groups/' . $group->id . '/messages');

    $fetch->assertOk();
    $fetch->assertJsonPath('data.data.0.contenu', 'Salut le groupe');
});

it('interdit les messages de groupe pour un non membre', function () {
    $group = Group::factory()->create([
        'coach_id' => $this->coachUser->id,
    ]);
    $group->members()->attach([$this->clientUser->id]);

    $this->actingAs($this->otherUser)
        ->getJson('/api/groups/' . $group->id . '/messages')
        ->assertForbidden();

    $this->actingAs($this->otherUser)
        ->postJson('/api/groups/' . $group->id . '/messages', [
            'contenu' => 'intrusion',
        ])
        ->assertForbidden();
});
