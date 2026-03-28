<?php

use App\Models\Client;
use App\Models\Coach;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    // Créer coach
    $this->userCoach = User::factory()->create();
    $coachRole = Role::create(['name' => 'coach']);
    $this->userCoach->roles()->attach($coachRole);
    $this->coach = Coach::factory()->create(['user_id' => $this->userCoach->id]);

    // Créer client
    $this->userClient = User::factory()->create();
    $clientRole = Role::create(['name' => 'client']);
    $this->userClient->roles()->attach($clientRole);
    $this->client = Client::factory()->create(['coach_id' => $this->coach->id]);

    // Créer offre
    $this->offre = Offre::factory()->create([
        'coach_id' => $this->coach->id,
        'type' => 'pack_seance',
        'nombre_seances' => 10,
        'prix' => 100.00,
    ]);

    // Créer contrat
    $this->contrat = Contrat::factory()->create([
        'client_id' => $this->client->id,
        'offre_id' => $this->offre->id,
        'coach_id' => $this->coach->id,
        'seances_totales' => 10,
        'seances_consommees' => 0,
        'seances_restantes' => 10,
        'statut' => 'actif',
        'date_debut' => now(),
        'date_fin' => now()->addMonths(3),
    ]);
});

describe('Contrat Model - Attributes', function () {
    test('contrat has correct attributes', function () {
        expect($this->contrat->seances_totales)->toBe(10);
        expect($this->contrat->seances_consommees)->toBe(0);
        expect($this->contrat->seances_restantes)->toBe(10);
        expect($this->contrat->statut)->toBe('actif');
    });

    test('contrat statut validation for all valid statuts', function () {
        $validStatuts = array_keys(Contrat::STATUTS);
        
        foreach ($validStatuts as $statut) {
            $contrat = Contrat::factory()->create([
                'coach_id' => $this->coach->id,
                'offre_id' => $this->offre->id,
                'client_id' => $this->client->id,
                'statut' => $statut,
            ]);
            
            expect($contrat->statut)->toBe($statut);
        }
    });

    test('contrat montant_total decimal precision', function () {
        $this->contrat->update(['montant_total' => 99.99]);
        
        expect($this->contrat->montant_total)->toBe('99.99');
    });

    test('contrat montant_paye decimal precision', function () {
        $this->contrat->update(['montant_paye' => 50.50]);
        
        expect($this->contrat->montant_paye)->toBe('50.50');
    });
});

describe('Contrat Model - Seances Calculation', function () {
    test('seances_consommees returns integer', function () {
        $consommees = $this->contrat->seances_consommees();
        
        expect($consommees)->toBeInt();
        expect($consommees)->toBe(0);
    });

    test('seances_restantes calculates correctly', function () {
        $this->contrat->update(['seances_consommees' => 3]);
        
        $restantes = $this->contrat->seances_restantes();
        
        expect($restantes)->toBe(7);
    });

    test('seances_restantes returns zero when all consumed', function () {
        $this->contrat->update(['seances_consommees' => 10]);
        
        $restantes = $this->contrat->seances_restantes();
        
        expect($restantes)->toBe(0);
    });

    test('increment seances_consommees by one', function () {
        $this->contrat->incrementSeancesConsommees(1);
        
        expect($this->contrat->seances_consommees)->toBe(1);
        expect($this->contrat->seances_restantes)->toBe(9);
    });

    test('increment seances_consommees by multiple', function () {
        $this->contrat->incrementSeancesConsommees(3);
        
        expect($this->contrat->seances_consommees)->toBe(3);
        expect($this->contrat->seances_restantes)->toBe(7);
    });

    test('increment seances_restantes never goes negative', function () {
        $this->contrat->update(['seances_consommees' => 10]);
        $this->contrat->incrementSeancesConsommees(5);
        
        expect($this->contrat->seances_consommees)->toBe(15);
        expect($this->contrat->seances_restantes)->toBe(0);
    });
});

describe('Contrat Model - Date Validation', function () {
    test('datesValides returns true with valid dates', function () {
        $contrat = Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $this->offre->id,
            'client_id' => $this->client->id,
            'date_debut' => now(),
            'date_fin' => now()->addMonth(),
        ]);

        expect($contrat->datesValides())->toBeTrue();
    });

    test('datesValides returns false when dates inverted', function () {
        $contrat = Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $this->offre->id,
            'client_id' => $this->client->id,
            'date_debut' => now()->addMonth(),
            'date_fin' => now(),
        ]);

        expect($contrat->datesValides())->toBeFalse();
    });
});

describe('Contrat Model - Status Checks', function () {
    test('isActif returns true when statut is actif', function () {
        $this->contrat->update(['statut' => 'actif']);
        
        expect($this->contrat->isActif())->toBeTrue();
    });

    test('isActif returns false when statut is not actif', function () {
        $this->contrat->update(['statut' => 'suspendu']);
        
        expect($this->contrat->isActif())->toBeFalse();
    });

    test('isExpire returns false when date_fin is future', function () {
        $this->contrat->update(['date_fin' => now()->addMonth()]);
        
        expect($this->contrat->isExpire())->toBeFalse();
    });

    test('isExpire returns true when date_fin is past', function () {
        $this->contrat->update(['date_fin' => now()->subDay()]);
        
        expect($this->contrat->isExpire())->toBeTrue();
    });

    test('hasSeancesRestantes returns true when seances_restantes > 0', function () {
        $this->contrat->update(['seances_restantes' => 5]);
        
        expect($this->contrat->hasSeancesRestantes())->toBeTrue();
    });

    test('hasSeancesRestantes returns false when seances_restantes is 0', function () {
        $this->contrat->update(['seances_restantes' => 0]);
        
        expect($this->contrat->hasSeancesRestantes())->toBeFalse();
    });
});

describe('Contrat Model - Status Workflow', function () {
    test('updateStatusWorkflow transitions en_attente to actif', function () {
        $contrat = Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $this->offre->id,
            'client_id' => $this->client->id,
            'statut' => 'en_attente',
            'date_debut' => now()->subDay(),
        ]);

        $contrat->updateStatusWorkflow();
        
        expect($contrat->statut)->toBe('actif');
    });

    test('updateStatusWorkflow transitions actif to termine on expired date', function () {
        $this->contrat->update([
            'statut' => 'actif',
            'date_fin' => now()->subDay(),
        ]);

        $this->contrat->updateStatusWorkflow();
        
        expect($this->contrat->statut)->toBe('termine');
    });

    test('updateStatusWorkflow transitions actif to termine when no seances left', function () {
        // Mettre toutes les séances comme consommées
        $this->contrat->update([
            'statut' => 'actif',
            'seances_consommees' => 10,  // Égal à nombre_seances
            'seances_restantes' => 0,
        ]);
        $this->contrat->refresh();

        $this->contrat->updateStatusWorkflow();
        
        expect($this->contrat->statut)->toBe('termine');
    });
});

describe('Contrat Model - Relations', function () {
    test('contrat belongs to client', function () {
        expect($this->contrat->client)->toBeInstanceOf(Client::class);
        expect($this->contrat->client->id)->toBe($this->client->id);
    });

    test('contrat belongs to offre', function () {
        expect($this->contrat->offre)->toBeInstanceOf(Offre::class);
        expect($this->contrat->offre->id)->toBe($this->offre->id);
    });

    test('contrat belongs to coach', function () {
        expect($this->contrat->coach)->toBeInstanceOf(Coach::class);
        expect($this->contrat->coach->id)->toBe($this->coach->id);
    });
});

describe('Contrat Model - Soft Deletes', function () {
    test('contrat can be soft deleted', function () {
        $contratId = $this->contrat->id;
        $this->contrat->delete();

        expect(Contrat::find($contratId))->toBeNull();
        expect(Contrat::withTrashed()->find($contratId))->not()->toBeNull();
    });
});
