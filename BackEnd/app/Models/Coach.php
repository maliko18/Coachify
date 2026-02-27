<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\app\Models\Coach.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coach extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'specialties',
        'certifications',
        'experience_years',
        'hourly_rate',
        'is_available',
    ];

    protected $casts = [
        'specialties' => 'array',
        'certifications' => 'array',
        'hourly_rate' => 'decimal:2',
        'is_available' => 'boolean',
    ];

    /**
     * Spécialités disponibles
     */
    public const SPECIALTIES = [
        'musculation',
        'cardio',
        'yoga',
        'pilates',
        'crossfit',
        'boxe',
        'natation',
        'running',
        'nutrition',
        'perte_de_poids',
        'prise_de_masse',
        'remise_en_forme',
        'preparation_physique',
        'stretching',
    ];

    /**
     * L'utilisateur associé au coach
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Les clients du coach
     */
    // public function clients(): HasMany
    // {
    //     return $this->hasMany(Client::class);
    // }

    // /**
    //  * Les salles associées au coach
    //  */
    // public function gyms(): BelongsToMany
    // {
    //     return $this->belongsToMany(Gym::class, 'coach_gym')
    //                 ->withPivot(['commission_rate', 'start_date', 'end_date', 'is_active'])
    //                 ->withTimestamps();
    // }

    /**
     * Les offres du coach
     */
    public function offres(): HasMany
    {
        return $this->hasMany(Offre::class);
    }

    /**
     * Les contrats du coach
     */
    public function contrats(): HasMany
    {
        return $this->hasMany(Contrat::class);
    }

    // /**
    //  * Les exercices créés par le coach
    //  */
    // public function exercises(): HasMany
    // {
    //     return $this->hasMany(Exercise::class);
    // }

    // /**
    //  * Les modèles de séances du coach
    //  */
    // public function sessionTemplates(): HasMany
    // {
    //     return $this->hasMany(SessionTemplate::class);
    // }

    // /**
    //  * Les séances planifiées du coach
    //  */
    // public function scheduledSessions(): HasMany
    // {
    //     return $this->hasMany(ScheduledSession::class);
    // }

    // /**
    //  * Les programmes du coach
    //  */
    // public function programs(): HasMany
    // {
    //     return $this->hasMany(Program::class);
    // }

    // /**
    //  * Les plans nutritionnels du coach
    //  */
    // public function nutritionPlans(): HasMany
    // {
    //     return $this->hasMany(NutritionPlan::class);
    // }

    // /**
    //  * Les tags du coach
    //  */
    // public function tags(): HasMany
    // {
    //     return $this->hasMany(Tag::class);
    // }

    // /**
    //  * Les groupes de clients du coach
    //  */
    // public function clientGroups(): HasMany
    // {
    //     return $this->hasMany(ClientGroup::class);
    // }

    // /**
    //  * Les disponibilités du coach
    //  */
    // public function availabilities(): HasMany
    // {
    //     return $this->hasMany(Availability::class);
    // }

    // /**
    //  * Les indisponibilités du coach
    //  */
    // public function unavailabilities(): HasMany
    // {
    //     return $this->hasMany(Unavailability::class);
    // }

    // /**
    //  * Les factures du coach
    //  */
    // public function invoices(): HasMany
    // {
    //     return $this->hasMany(Invoice::class);
    // }

    // /**
    //  * Les produits du coach
    //  */
    // public function products(): HasMany
    // {
    //     return $this->hasMany(Product::class);
    // }

    /**
     * Les avis du coach
     */
    // public function reviews(): HasMany
    // {
    //     return $this->hasMany(Review::class);
    // }

    /**
     * Obtenir le nom complet du coach via l'utilisateur
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->full_name;
    }

    /**
     * Obtenir l'email du coach via l'utilisateur
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email;
    }

    /**
     * Vérifier si le coach a une spécialité
     */
    public function hasSpecialty(string $specialty): bool
    {
        return in_array($specialty, $this->specialties ?? []);
    }

    /**
     * Obtenir la note moyenne du coach
     */
    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->reviews()->where('is_approved', true)->avg('rating');
        return $avg ? round($avg, 1) : null;
    }

    /**
     * Scope pour les coachs disponibles
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope pour filtrer par spécialité
     */
    public function scopeWithSpecialty($query, string $specialty)
    {
        return $query->whereJsonContains('specialties', $specialty);
    }
}
