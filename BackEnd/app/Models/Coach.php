<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\app\Models\Coach.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

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
     * Les séances du coach
     */
    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }

    /**
     * Les programmes du coach
     */
    public function programmes(): HasMany
    {
        return $this->hasMany(Programme::class);
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

    /**
     * Les exercices créés par le coach
     */
    public function exercices(): HasMany
    {
        return $this->hasMany(Exercice::class);
    }

    /**
     * Les paiements reçus par le coach
     */
    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    /**
     * Les produits vendus par le coach
     */
    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class);
    }

    /**
     * Les commandes reçues par le coach
     */
    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

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

    /**
     * CA par période (jour/mois/an) avec série temporelle.
     */
    public function getCATotal(string $period = 'month'): array
    {
        [$startDate, $endDate, $format] = $this->resolvePeriodRange($period);

        $paiements = Paiement::query()
            ->where('coach_id', $this->id)
            ->where('statut', 'valide')
            ->whereBetween('date_paiement', [$startDate, $endDate])
            ->get();

        $total = round((float) $paiements->sum('montant'), 2);

        $series = $paiements
            ->groupBy(fn ($paiement) => $paiement->date_paiement->format($format))
            ->map(fn ($items, $key) => [
                'label' => $key,
                'ca' => round((float) $items->sum('montant'), 2),
            ])
            ->values();

        return [
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'total' => $total,
            'series' => $series,
        ];
    }

    /**
     * Taux de remplissage des séances sur la période.
     */
    public function getTauxRemplissage(string $period = 'month'): array
    {
        [$startDate, $endDate] = $this->resolvePeriodRange($period);

        $seances = Seance::query()
            ->where('coach_id', $this->id)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get(['id', 'capacite_max']);

        $seanceIds = $seances->pluck('id');
        $capaciteTotale = (int) $seances->sum('capacite_max');

        $participantsPresents = $seanceIds->isEmpty()
            ? 0
            : (int) DB::table('seance_client')
                ->whereIn('seance_id', $seanceIds)
                ->where('statut_presence', 'present')
                ->where('en_liste_attente', false)
                ->count();

        $taux = $capaciteTotale > 0
            ? round(($participantsPresents / $capaciteTotale) * 100, 2)
            : 0.0;

        return [
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'seances_count' => $seances->count(),
            'capacite_totale' => $capaciteTotale,
            'participants_presents' => $participantsPresents,
            'taux_remplissage' => $taux,
        ];
    }

    /**
     * Fidélisation client : actifs vs churnés.
     */
    public function getFidelisation(): array
    {
        $clients = Client::query()->where('coach_id', $this->id);
        $total = (int) $clients->count();
        $actifs = (int) (clone $clients)->where('subscription_status', 'active')->count();
        $churned = max(0, $total - $actifs);

        return [
            'total_clients' => $total,
            'clients_actifs' => $actifs,
            'clients_churned' => $churned,
            'taux_fidelisation' => $total > 0 ? round(($actifs / $total) * 100, 2) : 0.0,
        ];
    }

    /**
     * CA moyen par client payeur.
     */
    public function getPanierMoyen(): array
    {
        $paiementsValides = Paiement::query()
            ->where('coach_id', $this->id)
            ->where('statut', 'valide');

        $totalCa = (float) $paiementsValides->sum('montant');
        $clientsPayeurs = (int) $paiementsValides->distinct('client_id')->count('client_id');

        return [
            'ca_total' => round($totalCa, 2),
            'clients_payeurs' => $clientsPayeurs,
            'panier_moyen' => $clientsPayeurs > 0 ? round($totalCa / $clientsPayeurs, 2) : 0.0,
        ];
    }

    /**
     * Offres les plus vendues.
     */
    public function getTopOffers(int $limit = 5): array
    {
        return Contrat::query()
            ->select('offre_id', DB::raw('COUNT(*) as ventes'), DB::raw('SUM(montant_paye) as ca'))
            ->where('coach_id', $this->id)
            ->where('statut', '!=', 'annule')
            ->with('offre:id,nom,type')
            ->groupBy('offre_id')
            ->orderByDesc('ventes')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'offre_id' => $item->offre_id,
                    'nom' => $item->offre->nom ?? null,
                    'type' => $item->offre->type ?? null,
                    'ventes' => (int) $item->ventes,
                    'ca' => round((float) $item->ca, 2),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Résolution de plage de dates selon la période.
     */
    private function resolvePeriodRange(string $period): array
    {
        $end = now();

        return match ($period) {
            'day' => [$end->copy()->startOfDay(), $end->copy()->endOfDay(), 'Y-m-d H:00'],
            'year' => [$end->copy()->startOfYear(), $end->copy()->endOfYear(), 'Y-m'],
            default => [$end->copy()->startOfMonth(), $end->copy()->endOfMonth(), 'Y-m-d'],
        };
    }
}
