<?php

use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Programme;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('ajoute et retire un exercice dans un programme', function () {
    $coach = Coach::factory()->create();
    $programme = Programme::factory()->create([
        'coach_id' => $coach->id,
        'statut' => 'brouillon',
    ]);

    $exercice = Exercice::factory()->create([
        'coach_id' => $coach->id,
    ]);

    $programme->ajouter_exercice($exercice->id, 1, [
        'semaine' => 1,
        'jour' => 'lundi',
        'sets' => 4,
        'reps' => '12',
        'repos' => '60s',
    ]);

    expect($programme->exercices()->count())->toBe(1);

    $pivot = $programme->exercices()->first()->pivot;
    expect($pivot->semaine)->toBe(1);
    expect($pivot->jour)->toBe('lundi');

    $programme->retirer_exercice($exercice->id);

    expect($programme->exercices()->count())->toBe(0);
});

it('refuse dajouter un exercice dun autre coach', function () {
    $coachProgramme = Coach::factory()->create();
    $autreCoach = Coach::factory()->create();

    $programme = Programme::factory()->create([
        'coach_id' => $coachProgramme->id,
    ]);

    $exerciceAutreCoach = Exercice::factory()->create([
        'coach_id' => $autreCoach->id,
    ]);

    expect(fn () => $programme->ajouter_exercice($exerciceAutreCoach->id, 1, [
        'semaine' => 1,
        'jour' => 'mardi',
    ]))->toThrow(InvalidArgumentException::class, 'meme coach');
});

it('publie un programme seulement sil est en brouillon et avec exercice', function () {
    $coach = Coach::factory()->create();

    $programmeVide = Programme::factory()->create([
        'coach_id' => $coach->id,
        'statut' => 'brouillon',
    ]);

    expect($programmeVide->publier())->toBeFalse();
    expect($programmeVide->fresh()->statut)->toBe('brouillon');

    $programme = Programme::factory()->create([
        'coach_id' => $coach->id,
        'statut' => 'brouillon',
    ]);

    $exercice = Exercice::factory()->create([
        'coach_id' => $coach->id,
    ]);

    $programme->ajouter_exercice($exercice->id, 1, ['semaine' => 1, 'jour' => 'jeudi']);

    expect($programme->publier())->toBeTrue();
    expect($programme->fresh()->statut)->toBe('publie');

    expect($programme->fresh()->publier())->toBeFalse();
});

it('groupe les exercices par semaine', function () {
    $coach = Coach::factory()->create();
    $programme = Programme::factory()->create([
        'coach_id' => $coach->id,
    ]);

    $exo1 = Exercice::factory()->create(['coach_id' => $coach->id]);
    $exo2 = Exercice::factory()->create(['coach_id' => $coach->id]);
    $exo3 = Exercice::factory()->create(['coach_id' => $coach->id]);

    $programme->ajouter_exercice($exo1->id, 1, ['semaine' => 1, 'jour' => 'lundi']);
    $programme->ajouter_exercice($exo2->id, 2, ['semaine' => 1, 'jour' => 'mercredi']);
    $programme->ajouter_exercice($exo3->id, 1, ['semaine' => 2, 'jour' => 'mardi']);

    $groupes = $programme->get_exercices_par_semaine();

    expect($groupes->keys()->all())->toBe([1, 2]);
    expect($groupes->get(1)->count())->toBe(2);
    expect($groupes->get(2)->count())->toBe(1);
});
