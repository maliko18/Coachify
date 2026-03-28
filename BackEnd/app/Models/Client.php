<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'coach_id',
        'objectives',
        'medical_conditions',
        'injuries_history',
        'fitness_level',
        'preferred_activities',
        'subscription_status',
        'start_date',
        'sessions_remaining',
        'weight',
        'height',
        'age',
    ];

    protected $casts = [
        'injuries_history' => 'array',
        'preferred_activities' => 'array',
        'start_date' => 'date',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    /**
     * Niveaux de fitness disponibles
     */
    public const FITNESS_LEVELS = [
        'beginner' => 'Débutant',
        'intermediate' => 'Intermédiaire',
        'advanced' => 'Avancé',
    ];

    /**
     * Statuts d'abonnement
     */
    public const SUBSCRIPTION_STATUSES = [
        'active' => 'Actif',
        'paused' => 'En pause',
        'inactive' => 'Inactif',
    ];

    /**
     * L'utilisateur associé au client
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Le coach principal du client
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

     /**
     * Les contrats du client
     */
    public function contrats(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Contrat::class);
    }

    /**
     * Les factures du client
     */
    public function factures(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Facture::class);
    }

    /**
     * Les paiements du client
     */
    public function paiements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    /**
     * Les séances auxquelles le client est inscrit
     */
    public function seances(): BelongsToMany
    {
        return $this->belongsToMany(Seance::class, 'seance_client')
                    ->withPivot(['statut_presence', 'en_liste_attente', 'feedback_client', 'feedback_coach', 'note'])
                    ->withTimestamps();
    }

    /**
     * Obtenir le nom complet via l'utilisateur
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->full_name;
    }

    /**
     * Vérifier si le client a un coach assigné
     */
    public function hasCoach(): bool
    {
        return !is_null($this->coach_id);
    }

    /**
     * Vérifier si l'abonnement est actif
     */
    public function isActive(): bool
    {
        return $this->subscription_status === 'active';
    }

    /**
     * Calculer l'IMC (BMI)
     */
    public function getBmiAttribute(): ?float
    {
        if ($this->weight && $this->height) {
            $heightInMeters = $this->height / 100;
            return round($this->weight / ($heightInMeters * $heightInMeters), 1);
        }
        return null;
    }

    /**
     * Scope pour les clients actifs
     */
    public function scopeActive($query)
    {
        return $query->where('subscription_status', 'active');
    }

    /**
     * Scope pour les clients d'un coach
     */
    public function scopeOfCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Total de séances consommées (présence = present).
     */
    public function getSeancesConsommees(): int
    {
        return (int) DB::table('seance_client')
            ->where('client_id', $this->id)
            ->where('statut_presence', 'present')
            ->where('en_liste_attente', false)
            ->count();
    }

    /**
     * Données de progression basées sur la présence aux séances.
     */
    public function getProgressionData(): array
    {
        $seances = $this->seances()
            ->whereBetween('seances.date', [now()->subMonths(6)->toDateString(), now()->toDateString()])
            ->get(['seances.id', 'seances.date']);

        $monthly = $seances
            ->groupBy(fn ($seance) => $seance->date->format('Y-m'))
            ->map(function ($items, $month) {
                $present = $items->where('pivot.statut_presence', 'present')->count();
                $absent = $items->whereIn('pivot.statut_presence', ['absent', 'excuse'])->count();
                $inscrit = $items->where('pivot.statut_presence', 'inscrit')->count();
                $total = $items->count();

                return [
                    'month' => $month,
                    'total' => $total,
                    'present' => $present,
                    'absent' => $absent,
                    'inscrit' => $inscrit,
                    'taux_presence' => $total > 0 ? round(($present / $total) * 100, 2) : 0.0,
                ];
            })
            ->values();

        $total = $monthly->sum('total');
        $present = $monthly->sum('present');

        return [
            'resume' => [
                'total_seances' => (int) $total,
                'seances_presentes' => (int) $present,
                'taux_presence' => $total > 0 ? round(($present / $total) * 100, 2) : 0.0,
            ],
            'series' => $monthly,
        ];
    }

    /**
     * Montant total payé par le client (net des remboursements).
     */
    public function getFacturationTotal(): float
    {
        $paiements = $this->paiements()
            ->whereIn('statut', ['valide', 'rembourse'])
            ->get(['montant', 'montant_rembourse']);

        $net = $paiements->sum(function ($paiement) {
            return (float) $paiement->montant - (float) $paiement->montant_rembourse;
        });

        return round((float) $net, 2);
    }

    /**
     * Historique d'achats du client (paiements + offre associée si disponible).
     */
    public function getHistoriqueAchats(int $limit = 20): array
    {
        return $this->paiements()
            ->with(['contrat.offre'])
            ->orderByDesc('date_paiement')
            ->limit($limit)
            ->get()
            ->map(function ($paiement) {
                return [
                    'paiement_id' => $paiement->id,
                    'date' => $paiement->date_paiement?->toISOString(),
                    'montant' => round((float) $paiement->montant, 2),
                    'montant_net' => round((float) $paiement->montant - (float) $paiement->montant_rembourse, 2),
                    'statut' => $paiement->statut,
                    'methode' => $paiement->methode,
                    'description' => $paiement->description,
                    'offre' => $paiement->contrat?->offre ? [
                        'id' => $paiement->contrat->offre->id,
                        'nom' => $paiement->contrat->offre->nom,
                        'type' => $paiement->contrat->offre->type,
                    ] : null,
                ];
            })
            ->values()
            ->all();
    }
}
