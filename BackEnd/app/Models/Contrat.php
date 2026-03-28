<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contrat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'offre_id',
        'coach_id',
        'date_debut',
        'date_fin',
        'statut',
        'seances_totales',
        'seances_consommees',
        'seances_restantes',
        'montant_total',
        'montant_paye',
        'notes',
        'renouvellement_auto',
        'date_prochain_renouvellement',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'montant_total' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'renouvellement_auto' => 'boolean',
        'date_prochain_renouvellement' => 'date',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'en_attente' => 'En attente',
        'actif'      => 'Actif',
        'suspendu'   => 'Suspendu',
        'termine'    => 'Terminé',
        'annule'     => 'Annulé',
    ];

    /**
     * Le client du contrat
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * L'offre associée au contrat
     */
    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class);
    }

    /**
     * Le coach du contrat
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Vérifier si le contrat est actif
     */
    public function isActif(): bool
    {
        return $this->statut === 'actif';
    }

    /**
     * Vérifier si le contrat est expiré
     */
    public function isExpire(): bool
    {
        if (!$this->date_fin) {
            return false;
        }
        return now()->greaterThan($this->date_fin);
    }

    /**
     * Vérifier s'il reste des séances
     */
    public function hasSeancesRestantes(): bool
    {
        return $this->seances_restantes > 0;
    }

    /**
     * Calculer le nombre de séances consommées
     * 
     * @return int Nombre de séances utilisées via les Seances
     */
    public function seances_consommees(): int
    {
        // Compter les séances où le client a participé avec ce contrat
        // TODO: À adapter selon la structure SeanceClient
        return (int) $this->seances_consommees ?? 0;
    }

    /**
     * Calculer le nombre de séances restantes
     * 
     * @return int Nombre de séances disponibles
     */
    public function seances_restantes(): int
    {
        if (!$this->offre) {
            return 0;
        }

        $total_seances = $this->offre->seances_incluses();
        $consommees = $this->seances_consommees();

        return max(0, $total_seances - $consommees);
    }

    /**
     * Mettre à jour le statut du contrat selon les règles de workflow
     * 
     * @return void
     */
    public function updateStatusWorkflow(): void
    {
        // En attente -> Actif si date_debut atteinte
        if ($this->statut === 'en_attente' && now()->greaterThanOrEqualTo($this->date_debut)) {
            $this->statut = 'actif';
        }

        // Actif -> Expiré si date_fin dépassée
        if ($this->statut === 'actif' && $this->date_fin && now()->greaterThan($this->date_fin)) {
            $this->statut = 'termine';
        }

        // Pas de séances restantes et pas d'abonnement -> Terminé
        if ($this->statut === 'actif' && $this->seances_restantes() <= 0 && $this->offre->type === 'pack_seance') {
            $this->statut = 'termine';
        }

        $this->save();
    }

    /**
     * Vérifier si les dates du contrat sont valides
     * 
     * @return bool True si date_debut < date_fin
     */
    public function datesValides(): bool
    {
        return $this->date_debut < ($this->date_fin ?? now()->addYears(1));
    }

    /**
     * Incrémenter les séances consommées et mettre à jour les restantes
     * 
     * @param int $nombre Nombre de séances à incrémenter
     * @return void
     */
    public function incrementSeancesConsommees(int $nombre = 1): void
    {
        $this->seances_consommees = ($this->seances_consommees ?? 0) + $nombre;
        $this->seances_restantes = max(0, $this->seances_totales - $this->seances_consommees);
        $this->save();
    }

    /**
     * Consommer une séance
     */
    public function consommerSeance(): bool
    {
        if (!$this->hasSeancesRestantes()) {
            return false;
        }

        $this->seances_consommees++;
        $this->seances_restantes--;
        $this->save();

        return true;
    }

    /**
     * Calculer le montant restant à payer
     */
    public function getMontantRestantAttribute(): float
    {
        return round((float) $this->montant_total - (float) $this->montant_paye, 2);
    }

    /**
     * Vérifier si le contrat est entièrement payé
     */
    public function isPayeIntegralement(): bool
    {
        return (float) $this->montant_paye >= (float) $this->montant_total;
    }

    /**
     * Scope pour les contrats actifs
     */
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    /**
     * Scope pour les contrats d'un coach
     */
    public function scopeOfCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Scope pour les contrats d'un client
     */
    public function scopeOfClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope pour les contrats arrivant à expiration (7 jours)
     */
    public function scopeExpirationProche($query, int $jours = 7)
    {
        return $query->where('statut', 'actif')
            ->whereNotNull('date_fin')
            ->whereBetween('date_fin', [now(), now()->addDays($jours)]);
    }
}
