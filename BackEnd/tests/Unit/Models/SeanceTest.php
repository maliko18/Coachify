<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Seance;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('calcule la capacite restante hors liste attente', function () {
    $coach = Coach::factory()->create();
    $seance = Seance::factory()->create([
        'coach_id' => $coach->id,
        'capacite_max' => 2,
    ]);

    $client1 = Client::factory()->create(['coach_id' => $coach->id]);
    $client2 = Client::factory()->create(['coach_id' => $coach->id]);

    $seance->clients()->attach($client1->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => false,
    ]);

    $seance->clients()->attach($client2->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => true,
    ]);

    expect($seance->capaciteRestante())->toBe(1);
    expect($seance->capacite_restante())->toBe(1);
});

it('inscrit en confirme puis en liste attente quand capacite atteinte', function () {
    $coach = Coach::factory()->create();
    $seance = Seance::factory()->collective()->create([
        'coach_id' => $coach->id,
        'capacite_max' => 1,
    ]);

    $client1 = Client::factory()->create(['coach_id' => $coach->id]);
    $client2 = Client::factory()->create(['coach_id' => $coach->id]);

    $resultat1 = $seance->inscrireClientAvecWaitingList($client1->id);
    $resultat2 = $seance->inscrireClientAvecWaitingList($client2->id);

    expect($resultat1)->toBe('inscrit');
    expect($resultat2)->toBe('liste_attente');

    $pivotClient1 = $seance->clients()->where('client_id', $client1->id)->first()->pivot;
    $pivotClient2 = $seance->clients()->where('client_id', $client2->id)->first()->pivot;

    expect((bool) $pivotClient1->en_liste_attente)->toBeFalse();
    expect((bool) $pivotClient2->en_liste_attente)->toBeTrue();
});

it('marque la presence et retire de la liste attente', function () {
    $coach = Coach::factory()->create();
    $seance = Seance::factory()->create(['coach_id' => $coach->id]);
    $client = Client::factory()->create(['coach_id' => $coach->id]);

    $seance->clients()->attach($client->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => true,
    ]);

    $seance->marquer_presence($client->id, 'present');

    $pivot = $seance->clients()->where('client_id', $client->id)->first()->pivot;

    expect($pivot->statut_presence)->toBe('present');
    expect((bool) $pivot->en_liste_attente)->toBeFalse();
});

it('retourne participants absents et waiting list', function () {
    $coach = Coach::factory()->create();
    $seance = Seance::factory()->create([
        'coach_id' => $coach->id,
        'capacite_max' => 5,
    ]);

    $present = Client::factory()->create(['coach_id' => $coach->id]);
    $absent = Client::factory()->create(['coach_id' => $coach->id]);
    $excuse = Client::factory()->create(['coach_id' => $coach->id]);
    $waiting = Client::factory()->create(['coach_id' => $coach->id]);

    $seance->clients()->attach($present->id, [
        'statut_presence' => 'present',
        'en_liste_attente' => false,
    ]);
    $seance->clients()->attach($absent->id, [
        'statut_presence' => 'absent',
        'en_liste_attente' => false,
    ]);
    $seance->clients()->attach($excuse->id, [
        'statut_presence' => 'excuse',
        'en_liste_attente' => false,
    ]);
    $seance->clients()->attach($waiting->id, [
        'statut_presence' => 'inscrit',
        'en_liste_attente' => true,
    ]);

    $participants = $seance->get_participants();
    $absents = $seance->get_absents();
    $waitingList = $seance->get_waiting_list();

    expect($participants->pluck('id')->all())->toContain($present->id);
    expect($absents->pluck('id')->all())->toContain($absent->id, $excuse->id);
    expect($waitingList->pluck('id')->all())->toContain($waiting->id);
});
