<?php

use App\Models\Client;
use App\Models\Coach;
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
    ]);

    $this->clientUserB = User::factory()->create();
    $this->clientUserB->roles()->attach($clientRole->id);
    $this->clientB = Client::factory()->create([
        'user_id' => $this->clientUserB->id,
        'coach_id' => $this->coachB->id,
    ]);
});

function seancePayload(array $overrides = []): array
{
    return array_merge([
        'titre' => 'Seance test API',
        'date' => now()->addDay()->toDateString(),
        'heure_debut' => '10:00',
        'duree' => 60,
        'type' => 'collective',
        'capacite_max' => 5,
        'lieu' => 'Salle A',
        'notes' => 'Notes test',
    ], $overrides);
}

it('liste uniquement les seances du coach connecte', function () {
    $own = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $response = $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/seances');

    $response->assertOk();
    $response->assertJsonPath('meta.total', 1);
    $response->assertJsonPath('data.0.id', $own->id);
});

it('affiche une seance appartenant au coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);

    $response = $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/seances/' . $seance->id);

    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.id', $seance->id);
});

it('refuse la consultation dune seance dun autre coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $this->actingAs($this->coachUserA)
        ->getJson('/api/coach/seances/' . $seance->id)
        ->assertForbidden();
});

it('cree une seance avec le coach connecte', function () {
    $response = $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances', seancePayload());

    $response->assertCreated();
    $response->assertJsonPath('success', true);

    $this->assertDatabaseHas('seances', [
        'coach_id' => $this->coachA->id,
        'titre' => 'Seance test API',
        'statut' => 'planifiee',
    ]);
});

it('valide les donnees a la creation dune seance', function () {
    $response = $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances', seancePayload([
            'titre' => '',
            'date' => now()->subDay()->toDateString(),
            'duree' => 10,
        ]));

    $response->assertUnprocessable();
});

it('met a jour une seance du coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);

    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/seances/' . $seance->id, [
            'titre' => 'Seance modifiee',
            'statut' => 'en_cours',
        ])
        ->assertOk()
        ->assertJsonPath('data.titre', 'Seance modifiee');

    $this->assertDatabaseHas('seances', [
        'id' => $seance->id,
        'titre' => 'Seance modifiee',
        'statut' => 'en_cours',
    ]);
});

it('refuse la mise a jour dune seance dun autre coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/seances/' . $seance->id, ['titre' => 'Nope'])
        ->assertForbidden();
});

it('supprime en soft delete une seance du coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);

    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/seances/' . $seance->id)
        ->assertOk();

    $this->assertSoftDeleted('seances', ['id' => $seance->id]);
});

it('refuse la suppression dune seance dun autre coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/seances/' . $seance->id)
        ->assertForbidden();
});

it('inscrit un client en confirme quand il reste de la place', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coachA->id,
        'capacite_max' => 2,
    ]);

    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances/' . $seance->id . '/inscrire', [
            'client_id' => $this->clientA->id,
        ])
        ->assertOk();

    $this->assertDatabaseHas('seance_client', [
        'seance_id' => $seance->id,
        'client_id' => $this->clientA->id,
        'statut_presence' => 'inscrit',
        'en_liste_attente' => 0,
    ]);
});

it('inscrit en liste dattente quand la seance est complete', function () {
    $seance = Seance::factory()->create([
        'coach_id' => $this->coachA->id,
        'capacite_max' => 1,
    ]);

    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances/' . $seance->id . '/inscrire', [
            'client_id' => $this->clientB->id,
        ])
        ->assertOk();

    $this->assertDatabaseHas('seance_client', [
        'seance_id' => $seance->id,
        'client_id' => $this->clientB->id,
        'en_liste_attente' => 1,
    ]);
});

it('refuse linscription dun client deja inscrit', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances/' . $seance->id . '/inscrire', [
            'client_id' => $this->clientA->id,
        ])
        ->assertUnprocessable();
});

it('refuse linscription sur une seance dun autre coach', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $this->actingAs($this->coachUserA)
        ->postJson('/api/coach/seances/' . $seance->id . '/inscrire', [
            'client_id' => $this->clientA->id,
        ])
        ->assertForbidden();
});

it('desinscrit un client dune seance', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/seances/' . $seance->id . '/desinscrire/' . $this->clientA->id)
        ->assertOk();

    $this->assertDatabaseMissing('seance_client', [
        'seance_id' => $seance->id,
        'client_id' => $this->clientA->id,
    ]);
});

it('retourne 404 si desinscription dun client non inscrit', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);

    $this->actingAs($this->coachUserA)
        ->deleteJson('/api/coach/seances/' . $seance->id . '/desinscrire/' . $this->clientA->id)
        ->assertNotFound();
});

it('marque la presence dun client inscrit', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => true,
    ]);

    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/seances/' . $seance->id . '/presence/' . $this->clientA->id, [
            'statut_presence' => 'present',
        ])
        ->assertOk();

    $this->assertDatabaseHas('seance_client', [
        'seance_id' => $seance->id,
        'client_id' => $this->clientA->id,
        'statut_presence' => 'present',
        'en_liste_attente' => 0,
    ]);
});

it('retourne 422 sur un statut de presence invalide', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    $seance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/seances/' . $seance->id . '/presence/' . $this->clientA->id, [
            'statut_presence' => 'invalid',
        ])
        ->assertUnprocessable();
});

it('retourne 404 pour marquer la presence dun client non inscrit', function () {
    $seance = Seance::factory()->create(['coach_id' => $this->coachA->id]);

    $this->actingAs($this->coachUserA)
        ->putJson('/api/coach/seances/' . $seance->id . '/presence/' . $this->clientA->id, [
            'statut_presence' => 'present',
        ])
        ->assertNotFound();
});

it('liste les seances du client connecte', function () {
    $mySeance = Seance::factory()->create(['coach_id' => $this->coachA->id]);
    $otherSeance = Seance::factory()->create(['coach_id' => $this->coachB->id]);

    $mySeance->clients()->attach($this->clientA->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);
    $otherSeance->clients()->attach($this->clientB->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $response = $this->actingAs($this->clientUserA)
        ->getJson('/api/client/seances');

    $response->assertOk();
    $response->assertJsonPath('meta.total', 1);
    $response->assertJsonPath('data.0.id', $mySeance->id);
});

it('interdit a un client dacceder aux routes coach seances', function () {
    $this->actingAs($this->clientUserA)
        ->getJson('/api/coach/seances')
        ->assertForbidden();
});

it('interdit a un coach dacceder aux routes client seances', function () {
    $this->actingAs($this->coachUserA)
        ->getJson('/api/client/seances')
        ->assertForbidden();
});
