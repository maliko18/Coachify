<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('health endpoint returns service status', function () {
    $response = $this->getJson('/api/health');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('status', 'ok')
        ->assertJsonStructure([
            'success',
            'status',
            'service',
            'timestamp',
        ]);
});
