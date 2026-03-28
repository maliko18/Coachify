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
     * Nombre de séances incluses dans l'offre
     * 
     * @return int Nombre de séances : 0 si abonnement/collectif/programme/produit
     */
    public function seances_incluses(): int
    {
        // Les packs de séances ont un nombre fixe
        if ($this->type === 'pack_seance') {
            return (int) $this->nombre_seances ?? 0;
        }

        // Les abonnements, programmes et produits n'ont pas de séances
        return 0;
    }

    /**
     * Obtenir les métriques d'utilisation de l'offre
     * 
     * @return array Métriques incluant nombre de contrats, CA total, taux de remplissage
     */
    public function getMetrics(): array
    {
        $contrats = $this->contrats()->where('statut', '!=', 'annule')->get();

        $total_contrats = $contrats->count();
        $contrats_actifs = $contrats->where('statut', 'actif')->count();
        $ca_total = $contrats->sum('montant_paye');
        $ca_pending = $contrats->where('statut', 'actif')->sum('montant_total') - $contrats->where('statut', 'actif')->sum('montant_paye');
        
        return [
            'total_contrats' => $total_contrats,
            'contrats_actifs' => $contrats_actifs,
            'ca_total' => round($ca_total, 2),
            'ca_pending' => round($ca_pending, 2),
            'taux_remplissage' => $total_contrats > 0 ? round(($contrats_actifs / $total_contrats) * 100, 2) : 0,
        ];
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
