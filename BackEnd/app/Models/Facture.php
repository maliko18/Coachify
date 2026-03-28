<?php

namespace App\Models;

use App\Mail\FacturePdfMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class Facture extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero',
        'client_id',
        'paiement_id',
        'montant_ht',
        'tva',
        'montant_ttc',
        'date_emission',
        'date_echeance',
        'statut',
        'pdf_path',
        'notes',
    ];

    protected $casts = [
        'montant_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'date_emission' => 'date',
        'date_echeance' => 'date',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'brouillon' => 'Brouillon',
        'emise' => 'Émise',
        'payee' => 'Payée',
        'annulee' => 'Annulée',
        'en_retard' => 'En retard',
    ];

    /**
     * Le client associé à la facture
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Générer un numéro de facture unique
     * Format: FAC-YYYY-XXXX
     */
    public static function genererNumero(): string
    {
        $annee = date('Y');
        $prefix = "FAC-{$annee}-";

        // Trouver le dernier numéro de l'année
        $derniereFacture = static::where('numero', 'like', "{$prefix}%")
            ->orderBy('numero', 'desc')
            ->first();

        if ($derniereFacture) {
            // Extraire le numéro séquentiel et incrémenter
            $dernierNumero = (int) substr($derniereFacture->numero, -4);
            $nouveauNumero = $dernierNumero + 1;
        } else {
            $nouveauNumero = 1;
        }

        return $prefix . str_pad($nouveauNumero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculer le montant TTC à partir du montant HT et de la TVA
     */
    public static function calculerMontantTTC(float $montantHT, float $tva = 20.00): float
    {
        return round($montantHT * (1 + $tva / 100), 2);
    }

    /**
     * Vérifier si la facture est en retard
     */
    public function estEnRetard(): bool
    {
        return $this->statut !== 'payee'
            && $this->statut !== 'annulee'
            && $this->date_echeance->isPast();
    }

    /**
     * Marquer comme payée
     */
    public function marquerPayee(): void
    {
        $this->update(['statut' => 'payee']);
    }

    /**
     * Annuler la facture
     */
    public function annuler(): void
    {
        $this->update(['statut' => 'annulee']);
    }

    /**
     * Émettre la facture
     */
    public function emettre(): void
    {
        $this->update(['statut' => 'emise']);
    }

    /**
     * Générer le PDF de la facture et l'enregistrer dans storage/app/factures.
     *
     * @return string Chemin relatif du PDF dans le disk local
     */
    public function genererPdf(): string
    {
        $this->loadMissing(['client.user']);

        $filename = 'facture_' . $this->numero . '.pdf';
        $relativePath = 'factures/' . $filename;

        $pdf = Pdf::loadView('factures.template', [
            'facture' => $this,
            'client' => $this->client,
            'user' => $this->client?->user,
        ]);

        Storage::disk('local')->put($relativePath, $pdf->output());

        $this->update(['pdf_path' => $relativePath]);

        return $relativePath;
    }

    /**
     * Alias attendu par l'issue (#18)
     */
    public function generer_pdf(): string
    {
        return $this->genererPdf();
    }

    /**
     * Envoyer la facture PDF par email.
     */
    public function sendEmail(?string $to = null): void
    {
        $this->loadMissing(['client.user']);

        $recipient = $to ?? $this->client?->user?->email;
        if (!$recipient) {
            throw new \InvalidArgumentException('Aucune adresse email disponible pour cette facture.');
        }

        $path = $this->pdf_path;
        if (!$path || !Storage::disk('local')->exists($path)) {
            $path = $this->genererPdf();
        }

        Mail::to($recipient)->send(new FacturePdfMail($this, $path));
    }

    /**
     * Alias attendu par l'issue (#18)
     */
    public function send_email(?string $to = null): void
    {
        $this->sendEmail($to);
    }

    /**
     * Scope pour les factures en retard
     */
    public function scopeEnRetard($query)
    {
        return $query->where('statut', '!=', 'payee')
            ->where('statut', '!=', 'annulee')
            ->where('date_echeance', '<', now());
    }

    /**
     * Scope pour les factures d'un client
     */
    public function scopeOfClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope pour les factures par statut
     */
    public function scopeStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope pour les factures émises entre deux dates
     */
    public function scopeEmisesEntre($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_emission', [$dateDebut, $dateFin]);
    }

    /**
     * Boot method pour les événements du modèle
     */
    protected static function boot()
    {
        parent::boot();

        // Générer automatiquement le numéro de facture
        static::creating(function ($facture) {
            if (empty($facture->numero)) {
                $facture->numero = static::genererNumero();
            }

            // Calculer automatiquement le montant TTC si non fourni
            if (empty($facture->montant_ttc) && !empty($facture->montant_ht)) {
                $facture->montant_ttc = static::calculerMontantTTC(
                    $facture->montant_ht,
                    $facture->tva ?? 20.00
                );
            }
        });
    }
}
