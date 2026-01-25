<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Les utilisateurs ayant ce rôle
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
                    ->withTimestamps();
    }

    /**
     * Constantes pour les rôles
     */
    public const PROSPECT = 'prospect';
    public const CLIENT = 'client';
    public const COACH = 'coach';
    public const GYM_MANAGER = 'gym_manager';
    public const ADMIN = 'admin';

    /**
     * Récupérer tous les noms de rôles disponibles
     */
    public static function getAllRoles(): array
    {
        return [
            self::PROSPECT,
            self::CLIENT,
            self::COACH,
            self::GYM_MANAGER,
            self::ADMIN,
        ];
    }

    /**
     * Trouver un rôle par son nom
     */
    public static function findByName(string $name): ?self
    {
        return self::where('name', $name)->first();
    }
}
