<?php

namespace App\Models;

use App\Mail\FacturePdfMail;
use Illuminate\Support\Facades\Blade;
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

        $pdfFacadeClass = 'Barryvdh\\DomPDF\\Facade\\Pdf';

        if (class_exists($pdfFacadeClass)) {
            $html = Blade::render($this->buildPdfHtml());
            /** @var object $pdfWrapper */
            $pdfWrapper = app('dompdf.wrapper');
            $pdfContent = $pdfWrapper->loadHTML($html)->output();
        } else {
            // Fallback robuste en environnement de test si DomPDF n'est pas disponible.
            $pdfContent = $this->buildFallbackPdf();
        }

        Storage::disk('local')->put($relativePath, $pdfContent);

        $this->update(['pdf_path' => $relativePath]);

        return $relativePath;
    }

    private function buildPdfHtml(): string
    {
        $clientName = trim(($this->client?->user?->first_name ?? '') . ' ' . ($this->client?->user?->last_name ?? ''));

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {$this->numero}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111827; }
        h1 { font-size: 20px; margin-bottom: 8px; }
        .meta { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
    </style>
</head>
<body>
    <h1>Facture {$this->numero}</h1>
    <div class="meta">
        <div>Client: {$clientName}</div>
        <div>Date d'emission: {$this->date_emission?->format('Y-m-d')}</div>
        <div>Date d'echeance: {$this->date_echeance?->format('Y-m-d')}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Montant HT</th>
                <th>TVA (%)</th>
                <th>Montant TTC</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{$this->montant_ht}</td>
                <td>{$this->tva}</td>
                <td>{$this->montant_ttc}</td>
                <td>{$this->statut}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
HTML;
    }

    private function buildFallbackPdf(): string
    {
        return "%PDF-1.4\n"
            . "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            . "2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            . "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
            . "4 0 obj<</Length 96>>stream\n"
            . "BT /F1 14 Tf 50 790 Td (Facture {$this->numero}) Tj T* (Montant TTC: {$this->montant_ttc}) Tj ET\n"
            . "endstream endobj\n"
            . "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            . "xref\n0 6\n0000000000 65535 f \n"
            . "0000000010 00000 n \n0000000062 00000 n \n0000000117 00000 n \n"
            . "0000000245 00000 n \n0000000393 00000 n \n"
            . "trailer<</Size 6/Root 1 0 R>>\nstartxref\n463\n%%EOF";
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
