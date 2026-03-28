<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\SportsData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SportsData>
 */
class SportsDataFactory extends Factory
{
    protected $model = SportsData::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'source' => fake()->randomElement(['garmin', 'strava']),
            'distance_km' => fake()->randomFloat(2, 1, 20),
            'duration_minutes' => fake()->numberBetween(15, 150),
            'calories' => fake()->numberBetween(100, 1200),
            'heart_rate_avg' => fake()->numberBetween(90, 175),
            'recorded_at' => now()->subDays(fake()->numberBetween(0, 30)),
            'raw_payload' => ['mock' => true],
        ];
    }
}
