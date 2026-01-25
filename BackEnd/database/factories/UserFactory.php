<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'latitude' => fake()->latitude(43.0, 49.0), // France métropolitaine
            'longitude' => fake()->longitude(-1.0, 7.0),
            'avatar' => null,
            'rgpd_consent' => true,
            'rgpd_consent_date' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Utilisateur sans consentement RGPD
     */
    public function withoutRgpdConsent(): static
    {
        return $this->state(fn (array $attributes) => [
            'rgpd_consent' => false,
            'rgpd_consent_date' => null,
        ]);
    }

    /**
     * Utilisateur avec avatar
     */
    public function withAvatar(): static
    {
        return $this->state(fn (array $attributes) => [
            'avatar' => 'avatars/' . fake()->uuid() . '.jpg',
        ]);
    }

    /**
     * Utilisateur localisé à Paris
     */
    public function inParis(): static
    {
        return $this->state(fn (array $attributes) => [
            'city' => 'Paris',
            'postal_code' => '75001',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);
    }

    /**
     * Utilisateur localisé à Lyon
     */
    public function inLyon(): static
    {
        return $this->state(fn (array $attributes) => [
            'city' => 'Lyon',
            'postal_code' => '69001',
            'latitude' => 45.7640,
            'longitude' => 4.8357,
        ]);
    }

    /**
     * Utilisateur localisé à Mulhouse
     */
    public function inMulhouse(): static
    {
        return $this->state(fn (array $attributes) => [
            'city' => 'Mulhouse',
            'postal_code' => '68100',
            'latitude' => 47.7508,
            'longitude' => 7.3359,
        ]);
    }
}