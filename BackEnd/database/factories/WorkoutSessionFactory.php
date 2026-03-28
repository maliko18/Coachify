<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\SportsData;
use App\Models\WorkoutSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkoutSession>
 */
class WorkoutSessionFactory extends Factory
{
    protected $model = WorkoutSession::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'sports_data_id' => SportsData::factory(),
            'seance_id' => null,
            'performance_score' => fake()->randomFloat(2, 10, 100),
            'matched_at' => now(),
        ];
    }
}
