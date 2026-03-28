<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Votre facture {{ $facture->numero }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111827;">
    <h2>Votre facture {{ $facture->numero }}</h2>
    <p>Bonjour,</p>
    <p>Veuillez trouver en pièce jointe votre facture au format PDF.</p>
    <p>Montant TTC: <strong>{{ number_format((float) $facture->montant_ttc, 2, ',', ' ') }} EUR</strong></p>
    <p>Merci pour votre confiance.</p>
</body>
</html>
