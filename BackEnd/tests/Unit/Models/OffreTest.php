<?php

use App\Models\Coach;
use App\Models\Client;
use App\Models\Contrat;
use App\Models\Offre;
use App\Models\User;
use App\Models\Role;

beforeEach(function () {
    // Créer un utilisateur coach
    $this->user = User::factory()->create();
    $coachRole = Role::create(['name' => 'coach']);
    $this->user->roles()->attach($coachRole);

    // Créer un coach
    $this->coach = Coach::factory()->create(['user_id' => $this->user->id]);

    // Créer une offre
    $this->offre = Offre::factory()->create([
        'coach_id' => $this->coach->id,
        'type' => 'pack_seance',
        'nombre_seances' => 10,
        'prix' => 100.00,
        'tva' => 20,
        'statut' => 'active',
    ]);
});

describe('Offre Model - Attributes', function () {
    test('offre has correct attributes', function () {
        expect($this->offre->type)->toBe('pack_seance');
        expect($this->offre->nombre_seances)->toBe(10);
        expect($this->offre->prix)->toBe('100.00');
    });

    test('type validation for all valid types', function () {
        $validTypes = array_keys(Offre::TYPES);
        
        foreach ($validTypes as $type) {
            $offre = Offre::factory()->create([
                'coach_id' => $this->coach->id,
                'type' => $type,
            ]);
            
            expect($offre->type)->toBe($type);
        }
    });

    test('statut validation for all valid statuts', function () {
        $validStatuts = array_keys(Offre::STATUTS);
        
        foreach ($validStatuts as $statut) {
            $offre = Offre::factory()->create([
                'coach_id' => $this->coach->id,
                'statut' => $statut,
            ]);
            
            expect($offre->statut)->toBe($statut);
        }
    });
});

describe('Offre Model - Seances Incluses', function () {
    test('seances_incluses returns number for pack_seance type', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'type' => 'pack_seance',
            'nombre_seances' => 5,
        ]);

        expect($offre->seances_incluses())->toBe(5);
    });

    test('seances_incluses returns zero for abonnement type', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'type' => 'abonnement',
        ]);

        expect($offre->seances_incluses())->toBe(0);
    });

    test('seances_incluses returns zero for collectif type', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'type' => 'collectif',
        ]);

        expect($offre->seances_incluses())->toBe(0);
    });

    test('seances_incluses returns zero for programme_numerique type', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'type' => 'programme_numerique',
        ]);

        expect($offre->seances_incluses())->toBe(0);
    });
});

describe('Offre Model - Metrics', function () {
    test('getMetrics returns correct array structure', function () {
        $metrics = $this->offre->getMetrics();

        expect($metrics)->toBeArray();
        expect($metrics)->toHaveKeys(['total_contrats', 'contrats_actifs', 'duree_moyenne_jours', 'ca_total', 'ca_pending', 'taux_remplissage']);
    });

    test('getMetrics returns zero values when no contrats', function () {
        $metrics = $this->offre->getMetrics();

        expect($metrics['total_contrats'])->toBe(0);
        expect($metrics['contrats_actifs'])->toBe(0);
        expect($metrics['duree_moyenne_jours'])->toBe(0.0);
        expect($metrics['ca_total'])->toBe(0.0);
        expect($metrics['taux_remplissage'])->toBe(0);
    });

    test('getMetrics calculates active contracts average duration and revenue', function () {
        $clientA = Client::factory()->create(['coach_id' => $this->coach->id]);
        $clientB = Client::factory()->create(['coach_id' => $this->coach->id]);

        Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $this->offre->id,
            'client_id' => $clientA->id,
            'statut' => 'actif',
            'date_debut' => now()->subDays(30),
            'date_fin' => now(),
            'montant_total' => 200,
            'montant_paye' => 150,
        ]);

        Contrat::factory()->create([
            'coach_id' => $this->coach->id,
            'offre_id' => $this->offre->id,
            'client_id' => $clientB->id,
            'statut' => 'termine',
            'date_debut' => now()->subDays(20),
            'date_fin' => now(),
            'montant_total' => 180,
            'montant_paye' => 180,
        ]);

        $metrics = $this->offre->getMetrics();

        expect($metrics['total_contrats'])->toBe(2);
        expect($metrics['contrats_actifs'])->toBe(1);
        expect($metrics['duree_moyenne_jours'])->toBeGreaterThan(20);
        expect($metrics['ca_total'])->toBe(330.0);
    });
});

describe('Offre Model - Pricing', function () {
    test('prix_ttc calculated correctly', function () {
        $this->offre->update(['prix' => 100.00, 'tva' => 20]);
        
        expect($this->offre->prix_ttc)->toBe(120.0);
    });

    test('en_promotion returns false without promotion dates', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'prix_promotion' => null,
            'date_debut_promotion' => null,
            'date_fin_promotion' => null,
        ]);

        expect($offre->en_promotion)->toBeFalse();
    });

    test('en_promotion returns true during active promotion', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'prix_promotion' => 80.00,
            'date_debut_promotion' => now()->subDay(),
            'date_fin_promotion' => now()->addDay(),
        ]);

        expect($offre->en_promotion)->toBeTrue();
    });

    test('en_promotion returns false after promotion ends', function () {
        $offre = Offre::factory()->create([
            'coach_id' => $this->coach->id,
            'prix_promotion' => 80.00,
            'date_debut_promotion' => now()->subDays(10),
            'date_fin_promotion' => now()->subDay(),
        ]);

        expect($offre->en_promotion)->toBeFalse();
    });
});

describe('Offre Model - Relations', function () {
    test('offre belongs to coach', function () {
        expect($this->offre->coach)->toBeInstanceOf(Coach::class);
        expect($this->offre->coach->id)->toBe($this->coach->id);
    });

    test('offre has many contrats', function () {
        $contrats = $this->offre->contrats()->get();
        
        expect($contrats)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });
});

describe('Offre Model - Soft Deletes', function () {
    test('offre can be soft deleted', function () {
        $offreId = $this->offre->id;
        $this->offre->delete();

        expect(Offre::find($offreId))->toBeNull();
        expect(Offre::withTrashed()->find($offreId))->not()->toBeNull();
    });
});
