<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'avatar',
        'rgpd_consent',
        'rgpd_consent_date',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'rgpd_consent' => 'boolean',
        'rgpd_consent_date' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Obtenir le nom complet de l'utilisateur
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Les rôles de l'utilisateur
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
                    ->withTimestamps();
    }

    /**
     * Profil coach (si l'utilisateur est coach)
     */
    public function coach(): HasOne
    {
        return $this->hasOne(Coach::class);
    }

    /**
     * Profil client (si l'utilisateur est client)
     */
    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }

    /**
     * Notifications applicatives de l'utilisateur
     */
    public function appNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderByDesc('created_at');
    }

    /**
     * Conversations où l'utilisateur est côté client.
     */
    public function clientConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'user_id');
    }

    /**
     * Conversations où l'utilisateur est côté coach.
     */
    public function coachConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'coach_id');
    }

    /**
     * Messages envoyés en 1-to-1.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'from_id');
    }

    /**
     * Groupes de messagerie auxquels l'utilisateur appartient.
     */
    public function messagingGroups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_user')->withTimestamps();
    }

    // /**
    //  * Salles gérées (si l'utilisateur est responsable de salle)
    //  */
    // public function managedGyms(): HasMany
    // {
    //     return $this->hasMany(Gym::class, 'manager_id');
    // }

    // /**
    //  * Conversations de l'utilisateur
    //  */
    // public function conversations(): BelongsToMany
    // {
    //     return $this->belongsToMany(Conversation::class, 'conversation_participants')
    //                 ->withPivot('last_read_at')
    //                 ->withTimestamps();
    // }

    // /**
    //  * Messages envoyés
    //  */
    // public function sentMessages(): HasMany
    // {
    //     return $this->hasMany(Message::class, 'sender_id');
    // }

    // /**
    //  * Notifications de l'utilisateur
    //  */
    // public function notifications(): HasMany
    // {
    //     return $this->hasMany(Notification::class);
    // }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole(string $roleName): bool
    {
        return in_array($roleName, $this->getCachedRoleNames(), true);
    }

    /**
     * Vérifier si l'utilisateur a l'un des rôles spécifiés
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return count(array_intersect($roleNames, $this->getCachedRoleNames())) > 0;
    }

    /**
     * Assigner un rôle à l'utilisateur
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::findByName($roleName);
        if ($role && !$this->hasRole($roleName)) {
            $this->roles()->attach($role->id);
            $this->forgetRoleCache();
        }
    }

    /**
     * Récupère la liste des rôles utilisateur depuis le cache (TTL 30 min).
     */
    public function getCachedRoleNames(): array
    {
        return Cache::remember(
            $this->getRoleCacheKey(),
            now()->addMinutes(30),
            fn () => $this->roles()->pluck('name')->all()
        );
    }

    /**
     * Invalidation explicite du cache permissions utilisateur.
     */
    public function forgetRoleCache(): void
    {
        Cache::forget($this->getRoleCacheKey());
    }

    private function getRoleCacheKey(): string
    {
        return 'user:' . $this->id . ':roles';
    }

    // /**
    //  * Retirer un rôle de l'utilisateur
    //  */
    // public function removeRole(string $roleName): void
    // {
    //     $role = Role::findByName($roleName);
    //     if ($role) {
    //         $this->roles()->detach($role->id);
    //     }
    // }

    // /**
    //  * Vérifier si l'utilisateur est un prospect
    //  */
    // public function isProspect(): bool
    // {
    //     return $this->hasRole(Role::PROSPECT);
    // }

    // /**
    //  * Vérifier si l'utilisateur est un client
    //  */
    // public function isClient(): bool
    // {
    //     return $this->hasRole(Role::CLIENT);
    // }

    // /**
    //  * Vérifier si l'utilisateur est un coach
    //  */
    // public function isCoach(): bool
    // {
    //     return $this->hasRole(Role::COACH);
    // }

    // /**
    //  * Vérifier si l'utilisateur est un responsable de salle
    //  */
    // public function isGymManager(): bool
    // {
    //     return $this->hasRole(Role::GYM_MANAGER);
    // }

    // /**
    //  * Vérifier si l'utilisateur est un admin
    //  */
    // public function isAdmin(): bool
    // {
    //     return $this->hasRole(Role::ADMIN);
    // }
}
