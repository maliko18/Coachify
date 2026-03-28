<?php

use App\Mail\FacturePdfMail;
use App\Models\Client;
use App\Models\Coach;
use App\Models\Facture;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $coachRole = Role::firstOrCreate(['name' => Role::COACH], ['description' => 'Coach']);

    $this->coachUser = User::factory()->create();
    $this->coachUser->roles()->attach($coachRole->id);

    $this->coach = Coach::factory()->create([
        'user_id' => $this->coachUser->id,
    ]);

    $this->clientUser = User::factory()->create();
    $this->client = Client::factory()->create([
        'user_id' => $this->clientUser->id,
        'coach_id' => $this->coach->id,
    ]);

    $this->facture = Facture::factory()->create([
        'client_id' => $this->client->id,
        'statut' => 'emise',
        'pdf_path' => null,
    ]);
});

it('genere et telecharge un pdf de facture via la route', function () {
    Storage::fake('local');

    $response = $this->actingAs($this->coachUser)
        ->get('/api/coach/factures/' . $this->facture->id . '/pdf');

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');

    $facture = $this->facture->fresh();
    expect($facture->pdf_path)->not->toBeNull();
    expect(Storage::disk('local')->exists($facture->pdf_path))->toBeTrue();
});

it('envoie la facture pdf par email a ladresse explicite', function () {
    Storage::fake('local');
    Mail::fake();

    $response = $this->actingAs($this->coachUser)
        ->postJson('/api/coach/factures/' . $this->facture->id . '/send-email', [
            'email' => 'destinataire@example.com',
        ]);

    $response->assertOk();
    Mail::assertSent(FacturePdfMail::class, function (FacturePdfMail $mail) {
        return $mail->hasTo('destinataire@example.com');
    });
});

it('envoie la facture pdf a lemail du client par defaut', function () {
    Storage::fake('local');
    Mail::fake();

    $response = $this->actingAs($this->coachUser)
        ->postJson('/api/coach/factures/' . $this->facture->id . '/send-email');

    $response->assertOk();
    Mail::assertSent(FacturePdfMail::class, function (FacturePdfMail $mail) {
        return $mail->hasTo($this->clientUser->email);
    });
});
