<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Paiement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'contrat_id',
        'coach_id',
        'montant',
        'devise',
        'date_paiement',
        'methode',
        'statut',
        'reference',
        'reference_externe',
        'description',
        'notes',
        'montant_rembourse',
        'date_remboursement',
        'motif_remboursement',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'montant_rembourse' => 'decimal:2',
        'date_paiement' => 'datetime',
        'date_remboursement' => 'datetime',
    ];

    /**
     * Méthodes de paiement disponibles
     */
    public const METHODES = [
        'carte_bancaire' => 'Carte bancaire',
        'virement'       => 'Virement bancaire',
        'especes'        => 'Espèces',
        'cheque'         => 'Chèque',
        'paypal'         => 'PayPal',
        'stripe'         => 'Stripe',
        'prelevement'    => 'Prélèvement',
        'autre'          => 'Autre',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'en_attente' => 'En attente',
        'valide'     => 'Validé',
        'refuse'     => 'Refusé',
        'rembourse'  => 'Remboursé',
        'annule'     => 'Annulé',
    ];

    /**
     * Générer automatiquement une référence unique à la création
     */
    protected static function booted(): void
    {
        static::creating(function (Paiement $paiement) {
            if (empty($paiement->reference)) {
                $paiement->reference = self::genererReference();
            }
        });
    }

    /**
     * Générer une référence unique au format PAY-YYYYMMDD-XXXXX
     */
    public static function genererReference(): string
    {
        do {
            $reference = 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
        } while (self::where('reference', $reference)->exists());

        return $reference;
    }

    /**
     * Le client du paiement
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Le contrat associé (optionnel)
     */
    public function contrat(): BelongsTo
    {
        return $this->belongsTo(Contrat::class);
    }

    /**
     * Le coach qui reçoit le paiement
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class);
    }

    /**
     * Vérifier si le paiement est validé
     */
    public function isValide(): bool
    {
        return $this->statut === 'valide';
    }

    /**
     * Vérifier si le paiement est remboursable
     */
    public function isRemboursable(): bool
    {
        return $this->statut === 'valide' && (float) $this->montant_rembourse < (float) $this->montant;
    }

    /**
     * Calculer le montant net (montant - remboursé)
     */
    public function getMontantNetAttribute(): float
    {
        return round((float) $this->montant - (float) $this->montant_rembourse, 2);
    }

    /**
     * Effectuer un remboursement (partiel ou total)
     */
    public function rembourser(float $montant, string $motif = null): bool
    {
        if (!$this->isRemboursable()) {
            return false;
        }

        $maxRemboursable = (float) $this->montant - (float) $this->montant_rembourse;
        $montantEffectif = min($montant, $maxRemboursable);

        $this->montant_rembourse = (float) $this->montant_rembourse + $montantEffectif;
        $this->date_remboursement = now();
        $this->motif_remboursement = $motif;

        // Si remboursement total, changer le statut
        if ((float) $this->montant_rembourse >= (float) $this->montant) {
            $this->statut = 'rembourse';
        }

        $this->save();

        return true;
    }

    /**
     * Valider le paiement
     */
    public function valider(): bool
    {
        if ($this->statut !== 'en_attente') {
            return false;
        }

        $this->statut = 'valide';
        $this->save();

        // Mettre à jour le montant payé du contrat associé
        if ($this->contrat) {
            $this->contrat->increment('montant_paye', $this->montant);
        }

        return true;
    }

    /**
     * Annuler le paiement
     */
    public function annuler(): bool
    {
        if (!in_array($this->statut, ['en_attente', 'valide'])) {
            return false;
        }

        $this->statut = 'annule';
        $this->save();

        return true;
    }

    /**
     * Scope pour les paiements validés
     */
    public function scopeValide($query)
    {
        return $query->where('statut', 'valide');
    }

    /**
     * Scope pour les paiements en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    /**
     * Scope pour les paiements d'un coach
     */
    public function scopeOfCoach($query, int $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    /**
     * Scope pour les paiements d'un client
     */
    public function scopeOfClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope pour les paiements sur une période
     */
    public function scopePeriode($query, string $debut, string $fin)
    {
        return $query->whereBetween('date_paiement', [$debut, $fin]);
    }

    /**
     * Scope par méthode de paiement
     */
    public function scopeMethode($query, string $methode)
    {
        return $query->where('methode', $methode);
    }
}
