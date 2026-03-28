<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $facture->numero }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; margin: 28px; }
        .top { margin-bottom: 24px; }
        .title { font-size: 26px; font-weight: 700; margin: 0 0 6px; }
        .muted { color: #6b7280; font-size: 12px; }
        .grid { width: 100%; margin: 14px 0 20px; }
        .grid td { width: 50%; vertical-align: top; }
        .box-title { font-size: 13px; font-weight: 700; margin: 0 0 6px; }
        .line { margin: 2px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
        th { background: #f9fafb; }
        .right { text-align: right; }
        .total { font-weight: 700; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="top">
        <h1 class="title">Facture {{ $facture->numero }}</h1>
        <div class="muted">Statut: {{ \App\Models\Facture::STATUTS[$facture->statut] ?? $facture->statut }}</div>
    </div>

    <table class="grid">
        <tr>
            <td>
                <p class="box-title">Facturé à</p>
                <p class="line">{{ $user?->full_name ?? ('Client #' . $client->id) }}</p>
                <p class="line">{{ $user?->email ?? 'Email non disponible' }}</p>
            </td>
            <td>
                <p class="box-title">Détails</p>
                <p class="line">Date émission: {{ $facture->date_emission?->format('d/m/Y') }}</p>
                <p class="line">Date échéance: {{ $facture->date_echeance?->format('d/m/Y') }}</p>
                @if($facture->notes)
                    <p class="line">Note: {{ $facture->notes }}</p>
                @endif
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class="right">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Prestations coaching</td>
                <td class="right">{{ number_format((float) $facture->montant_ht, 2, ',', ' ') }} EUR</td>
            </tr>
            <tr>
                <td>TVA ({{ number_format((float) $facture->tva, 2, ',', ' ') }}%)</td>
                <td class="right">{{ number_format((float) $facture->montant_ttc - (float) $facture->montant_ht, 2, ',', ' ') }} EUR</td>
            </tr>
            <tr class="total">
                <td>Total TTC</td>
                <td class="right">{{ number_format((float) $facture->montant_ttc, 2, ',', ' ') }} EUR</td>
            </tr>
        </tbody>
    </table>

    <p class="footer">Document généré automatiquement par ArchiWeb Coaching Platform.</p>
</body>
</html>
