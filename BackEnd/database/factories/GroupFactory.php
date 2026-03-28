<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    protected $model = Group::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coach_id' => User::factory(),
            'nom' => fake()->words(3, true),
            'tag' => fake()->optional(0.6)->slug(),
            'last_message_at' => fake()->optional(0.4)->dateTimeBetween('-7 days', 'now'),
        ];
    }
}
