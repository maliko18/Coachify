<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(Role::getAllRoles()),
            'description' => fake()->sentence(),
        ];
    }

    /**
     * État pour le rôle prospect
     */
    public function prospect(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => Role::PROSPECT,
            'description' => 'Utilisateur non inscrit ou sans contrat actif',
        ]);
    }

    /**
     * État pour le rôle client
     */
    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => Role::CLIENT,
            'description' => 'Personne ayant acheté une prestation',
        ]);
    }

    /**
     * État pour le rôle coach
     */
    public function coach(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => Role::COACH,
            'description' => 'Prestataire principal de services sportifs',
        ]);
    }

    /**
     * État pour le rôle responsable de salle
     */
    public function gymManager(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => Role::GYM_MANAGER,
            'description' => 'Gestionnaire d\'une structure sportive',
        ]);
    }

    /**
     * État pour le rôle admin
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => Role::ADMIN,
            'description' => 'Administrateur système avec tous les droits',
        ]);
    }
}
