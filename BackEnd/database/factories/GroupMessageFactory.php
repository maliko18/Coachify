<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\GroupMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GroupMessage>
 */
class GroupMessageFactory extends Factory
{
    protected $model = GroupMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'from_id' => User::factory(),
            'contenu' => fake()->sentence(),
            'sent_at' => fake()->dateTimeBetween('-3 days', 'now'),
        ];
    }
}
