<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function getStreamedResponseContent($response): string
{
    if (method_exists($response, 'streamedContent')) {
        return $response->streamedContent();
    }

    ob_start();
    $response->sendContent();
    return (string) ob_get_clean();
}

beforeEach(function () {
    $coachRole = Role::create(['name' => 'coach']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole);
    $this->coach = Coach::factory()->create(['user_id' => $this->coachUser->id]);

    $this->otherCoachUser = User::factory()->create();
    $this->otherCoachUser->roles()->attach($coachRole);
    $this->otherCoach = Coach::factory()->create(['user_id' => $this->otherCoachUser->id]);

    $this->client = Client::factory()->create(['coach_id' => $this->coach->id]);
    $this->otherClient = Client::factory()->create(['coach_id' => $this->otherCoach->id]);
});

describe('Offre CSV Export', function () {
    test('coach can export own offres in csv format', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'nom' => 'Pack Premium',
            'type' => 'pack_seance',
            'prix' => 120,
        ]);

        Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $offre->id,
            'client_id' => $this->client->id,
            'statut' => 'actif',
            'montant_paye' => 120,
        ]);

        $response = $this->actingAs($this->coachUser)
            ->get('/api/offres/export/csv');

        $statusCode = method_exists($response, 'status') ? $response->status() : $response->getStatusCode();
        expect($statusCode)->toBe(200);
        expect($response->headers->get('content-type'))->toContain('text/csv');

        $csv = getStreamedResponseContent($response);
        $lines = array_values(array_filter(array_map('trim', explode("\n", $csv))));
        $header = str_getcsv($lines[0], ';');
        $firstDataRow = str_getcsv($lines[1], ';');

        expect($header)->toBe(['nom', 'type', 'prix', 'nombre contrats', 'CA total']);
        expect($firstDataRow[0])->toBe('Pack Premium');
        expect($firstDataRow[1])->toBe('pack_seance');
        expect($firstDataRow[2])->toBe('120');
        expect($firstDataRow[3])->toBe('1');
        expect($firstDataRow[4])->toBe('120');
    });

    test('csv export excludes offres from other coaches', function () {
        Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'nom' => 'Offre Coach 1',
        ]);

        Offre::factory()->create([
            'coach_id' => $this->otherCoach->id,
            'nom' => 'Offre Coach 2',
        ]);

        $response = $this->actingAs($this->coachUser)
            ->get('/api/offres/export/csv');

        $csv = getStreamedResponseContent($response);
        expect($csv)->toContain('Offre Coach 1');
        expect($csv)->not()->toContain('Offre Coach 2');
    });

    test('non authenticated user cannot export csv', function () {
        $response = $this->get('/api/offres/export/csv');

        expect($response->status())->toBe(401);
    });
});
