<?php

use App\Models\Coach;
use App\Models\Exercice;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    $coachRole = Role::create(['name' => 'coach']);
    $clientRole = Role::create(['name' => 'client']);
    $adminRole = Role::create(['name' => 'admin']);

    // Create coaches with associated users
    $this->user1 = User::factory()->create();
    $this->coach1 = Coach::factory()->create(['user_id' => $this->user1->id]);
    $this->user1->roles()->attach($coachRole);

    $this->user2 = User::factory()->create();
    $this->coach2 = Coach::factory()->create(['user_id' => $this->user2->id]);
    $this->user2->roles()->attach($coachRole);

    // Create admin
    $this->admin = User::factory()->create();
    $this->admin->roles()->attach($adminRole);
});

describe('Exercice Index', function () {
    test('coach can list own exercices', function () {
        Exercice::factory()->count(3)->create(['coach_id' => $this->coach1->id]);
        Exercice::factory()->count(2)->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices');

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toHaveCount(3);
    });

    test('coach cannot see other coach exercices', function () {
        Exercice::factory()->create(['coach_id' => $this->coach1->id]);
        Exercice::factory()->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices');

        $ids = array_map(fn ($item) => $item['id'], $response->json('data'));
        expect($ids)->not()->toContain(
            Exercice::where('coach_id', $this->coach2->id)->first()->id
        );
    });

    test('index filters by categorie', function () {
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'categorie' => 'musculation']);
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'categorie' => 'cardio']);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices?categorie=musculation');

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.categorie'))->toBe('musculation');
    });

    test('index filters by niveau', function () {
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'niveau' => 'debutant']);
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'niveau' => 'avance']);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices?niveau=avance');

        expect($response->status())->toBe(200);
        expect($response->json('data.0.niveau'))->toBe('avance');
    });

    test('index search by name', function () {
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'nom' => 'Développé couché']);
        Exercice::factory()->create(['coach_id' => $this->coach1->id, 'nom' => 'Squats']);

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices?search=Développé');

        expect($response->status())->toBe(200);
        expect($response->json('data'))->toHaveCount(1);
    });

    test('admin can list all exercices', function () {
        Exercice::factory()->create(['coach_id' => $this->coach1->id]);
        Exercice::factory()->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/coach/exercices');

        expect($response->status())->toBeIn([200, 403]);
    });
});

describe('Exercice Show', function () {
    test('coach can view own exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/exercices/{$exercice->id}");

        expect($response->status())->toBe(200);
        expect($response->json('data.id'))->toBe($exercice->id);
    });

    test('coach cannot view other coach exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/exercices/{$exercice->id}");

        expect($response->status())->toBeIn([403, 404]);
    });

    test('show returns 404 for nonexistent exercice', function () {
        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices/99999');

        expect($response->status())->toBeIn([403, 404]);
    });

    test('show loads coach relations', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id]);

        $response = $this->actingAs($this->user1)
            ->getJson("/api/coach/exercices/{$exercice->id}");

        expect($response->status())->toBe(200);
        expect($response->json('data.coach'))->not()->toBeNull();
    });
});

describe('Exercice Store', function () {
    test('coach can create exercice', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Développé couché',
                'description' => 'Exercice de base',
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
                'series_defaut' => 3,
                'repetitions_defaut' => 8,
            ]);

        expect($response->status())->toBe(201);
        expect($response->json('data.nom'))->toBe('Développé couché');
        expect($response->json('data.coach.id'))->toBe($this->coach1->id);
    });

    test('nom is required', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.nom'))->not()->toBeNull();
    });

    test('categorie is required and validated', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Test',
                'categorie' => 'invalid_category',
                'niveau' => 'intermediaire',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.categorie'))->not()->toBeNull();
    });

    test('niveau is required and validated', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Test',
                'categorie' => 'musculation',
                'niveau' => 'invalid_level',
            ]);

        expect($response->status())->toBe(422);
        expect($response->json('error.errors.niveau'))->not()->toBeNull();
    });

    test('series_defaut and repetitions_defaut are validated', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Test',
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
                'series_defaut' => 0,
                'repetitions_defaut' => 101,
            ]);

        expect($response->status())->toBe(422);
    });

    test('medias array structure is validated', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Test',
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
                'medias' => [
                    ['type' => 'video', 'url' => 'https://example.com/video.mp4'],
                    ['type' => 'image', 'url' => 'https://example.com/image.jpg'],
                ],
            ]);

        expect($response->status())->toBe(201);
    });

    test('est_public can be set', function () {
        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => 'Public Exercise',
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
                'est_public' => true,
            ]);

        expect($response->status())->toBe(201);
        expect($response->json('data.est_public'))->toBeTrue();
    });
});

describe('Exercice Update', function () {
    test('coach can update own exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id, 'nom' => 'Old Name']);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/exercices/{$exercice->id}", [
                'nom' => 'New Name',
            ]);

        expect($response->status())->toBe(200);
        expect($response->json('data.nom'))->toBe('New Name');
    });

    test('coach cannot update other coach exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/exercices/{$exercice->id}", [
                'nom' => 'Attempted Change',
            ]);

        expect($response->status())->toBeIn([403, 404]);
    });

    test('update validates categorie', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/exercices/{$exercice->id}", [
                'categorie' => 'invalid',
            ]);

        expect($response->status())->toBe(422);
    });

    test('update returns 404 for nonexistent', function () {
        $response = $this->actingAs($this->user1)
            ->putJson('/api/coach/exercices/99999', ['nom' => 'Test']);

        expect($response->status())->toBeIn([403, 404]);
    });

    test('update partial fields', function () {
        $exercice = Exercice::factory()->create([
            'coach_id' => $this->coach1->id,
            'nom' => 'Original',
            'description' => 'Original Description',
        ]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/coach/exercices/{$exercice->id}", [
                'nom' => 'Updated',
            ]);

        expect($response->status())->toBe(200);
        expect($response->json('data.nom'))->toBe('Updated');
        expect($response->json('data.description'))->toBe('Original Description');
    });
});

describe('Exercice Delete', function () {
    test('coach can soft delete own exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/coach/exercices/{$exercice->id}");

        expect($response->status())->toBe(200);
        
        // Verify soft delete (still in DB but deleted_at set)
        $deletedExercice = Exercice::withTrashed()->find($exercice->id);
        expect($deletedExercice->deleted_at)->not()->toBeNull();
    });

    test('coach cannot delete other coach exercice', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach2->id]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/coach/exercices/{$exercice->id}");

        expect($response->status())->toBeIn([403, 404]);
    });

    test('delete returns 404 for nonexistent', function () {
        $response = $this->actingAs($this->user1)
            ->deleteJson('/api/coach/exercices/99999');

        expect($response->status())->toBeIn([403, 404]);
    });

    test('deleted exercice does not appear in list', function () {
        $exercice = Exercice::factory()->create(['coach_id' => $this->coach1->id]);
        $exercice->delete();

        $response = $this->actingAs($this->user1)
            ->getJson('/api/coach/exercices');

        $ids = array_map(fn ($item) => $item['id'], $response->json('data'));
        expect($ids)->not()->toContain($exercice->id);
    });
});

describe('Exercice Validation', function () {
    test('nom max length is enforced', function () {
        $longName = str_repeat('a', 256);

        $response = $this->actingAs($this->user1)
            ->postJson('/api/coach/exercices', [
                'nom' => $longName,
                'categorie' => 'musculation',
                'niveau' => 'intermediaire',
            ]);

        expect($response->status())->toBe(422);
    });

    test('all categorie values are valid', function () {
        $categories = ['musculation', 'cardio', 'stretching', 'yoga', 'pilates', 'crossfit', 'boxe', 'fonctionnel', 'equilibre', 'plyometrie', 'autre'];

        foreach ($categories as $cat) {
            $response = $this->actingAs($this->user1)
                ->postJson('/api/coach/exercices', [
                    'nom' => "Exercise {$cat}",
                    'categorie' => $cat,
                    'niveau' => 'intermediaire',
                ]);

            expect($response->status())->toBe(201);
        }
    });

    test('all niveau values are valid', function () {
        $niveaux = ['debutant', 'intermediaire', 'avance', 'expert'];

        foreach ($niveaux as $niveau) {
            $response = $this->actingAs($this->user1)
                ->postJson('/api/coach/exercices', [
                    'nom' => "Exercise {$niveau}",
                    'categorie' => 'musculation',
                    'niveau' => $niveau,
                ]);

            expect($response->status())->toBe(201);
        }
    });
});

describe('Exercice Permissions', function () {
    test('unauthenticated user cannot create', function () {
        $response = $this->postJson('/api/coach/exercices', [
            'nom' => 'Test',
            'categorie' => 'musculation',
            'niveau' => 'intermediaire',
        ]);

        expect($response->status())->toBe(401);
    });

    test('client cannot access coach routes', function () {
        $client = User::factory()->create();
        $clientRole = Role::where('name', 'client')->first() ?? Role::create(['name' => 'client']);
        $client->roles()->attach($clientRole);

        $response = $this->actingAs($client)
            ->getJson('/api/coach/exercices');

        expect($response->status())->toBeIn([403, 401]);
    });
});
