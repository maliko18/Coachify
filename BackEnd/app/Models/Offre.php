<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offre extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coach_id',
        'nom',
        'description',
        'type',
        'prix',
        'tva',
        'devise',
        'nombre_seances',
        'duree_jours',
        'capacite_max',
        'options',
        'statut',
        'est_visible',
        'prix_promotion',
        'date_debut_promotion',
        'date_fin_promotion',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'tva' => 'decimal:2',
        'prix_promotion' => 'decimal:2',
        'options' => 'array',
        'est_visible' => 'boolean',
        'date_debut_promotion' => 'date',
        'date_fin_promotion' => 'date',
    ];

    /**
     * Types d'offres disponibles
     */
    public const TYPES = [
        'pack_seance'         => 'Pack de séances',
        'abonnement'          => 'Abonnement',
        'collectif'           => 'Séance collective',
        'programme_numerique' => 'Programme numérique',
        'produit'             => 'Produit',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'active'   => 'Active',
        'inactive' => 'Inactive',
        'archivee' => 'Archivée',
    ];

    /**
     * Le coach propriétaire de l'offre
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Les contrats associés à cette offre
     */
    public function contrats(): HasMany
    {
        return $this->hasMany(Contrat::class);
    }

    /**
     * Calculer le prix TTC
     */
    public function getPrixTtcAttribute(): float
    {
        return round($this->prix * (1 + $this->tva / 100), 2);
    }

    /**
     * Vérifier si l'offre est en promotion
     */
    public function getEnPromotionAttribute(): bool
    {
        if (!$this->prix_promotion || !$this->date_debut_promotion || !$this->date_fin_promotion) {
            return false;
        }

        $now = now()->toDateString();
        return $now >= $this->date_debut_promotion && $now <= $this->date_fin_promotion;
    }

    /**
     * Obtenir le prix effectif (promotion ou normal)
     */
    public function getPrixEffectifAttribute(): float
    {
        return $this->en_promotion ? (float) $this->prix_promotion : (float) $this->prix;
    }

    /**
     * Scope pour les offres actives
     */
    public function scopeActive($query)
    {
        return $query->where('statut', 'active');
    }

    /**
     * Scope pour les offres visibles publiquement
     */
    public function scopeVisible($query)
    {
        return $query->where('est_visible', true)->active();
    }

    /**
     * Scope pour filtrer par type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope pour les offres d'un coach
     */
    public function scopeOfCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }
}
