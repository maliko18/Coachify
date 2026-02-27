# 📖 Guide API Backend — Pour l'équipe Frontend

> **Date** : 28 février 2026  
> **Status** : ✅ Toutes les 11 issues implémentées  
> **Base URL** : `http://localhost:8000/api`

---

## Table des matières

1. [Authentification & Connexion](#1--authentification--connexion)
2. [Module Offre (Issues #1, #3)](#2--module-offre-issues-1-3)
3. [Module Contrat (Issues #2, #3)](#3--module-contrat-issues-2-3)
4. [Module Exercice (Issues #4, #5)](#4--module-exercice-issues-4-5)
5. [Module Paiement (Issue #6)](#5--module-paiement-issue-6)
6. [Module Séance (Issues #7, #8)](#6--module-séance-issues-7-8)
7. [Module Programme (Issues #9, #10)](#7--module-programme-issues-9-10)
8. [Module Facture (Issue #11)](#8--module-facture-issue-11)
9. [Comment tester avec cURL / Postman](#9--comment-tester)
10. [Format commun des réponses](#10--format-commun-des-réponses)
11. [Récapitulatif des endpoints](#11--récapitulatif-complet-des-endpoints)

---

## 1. 🔐 Authentification & Connexion

Toutes les routes métier nécessitent un **token Sanctum**. Voici comment s'authentifier :

### Inscription

```
POST /api/register
Content-Type: application/json

{
  "first_name": "Marie",
  "last_name": "Martin",
  "email": "marie@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "role": "coach"
}
```

### Connexion

```
POST /api/login
Content-Type: application/json

{
  "email": "marie@example.com",
  "password": "Password123!"
}
```

**Réponse** : retourne un `token` que vous devez utiliser dans le header de toutes les requêtes suivantes.

### Utilisation du token

Ajoutez ce header à **toutes** les requêtes protégées :

```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### Déconnexion

```
POST /api/logout
Authorization: Bearer VOTRE_TOKEN
```

### Utilisateur connecté

```
GET /api/user
Authorization: Bearer VOTRE_TOKEN
```

---

## 2. 📦 Module Offre (Issues #1, #3)

> Une **offre** est un produit/service proposé par un coach à ses clients (pack de séances, abonnement, etc.)

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/offres` | Lister les offres du coach |
| `POST` | `/api/coach/offres` | Créer une offre |
| `GET` | `/api/coach/offres/{id}` | Détail d'une offre |
| `PUT` | `/api/coach/offres/{id}` | Modifier une offre |
| `DELETE` | `/api/coach/offres/{id}` | Supprimer une offre |

### Filtres disponibles (query params)

```
GET /api/coach/offres?type=pack_seance
GET /api/coach/offres?statut=active
GET /api/coach/offres?type=abonnement&statut=active
```

### Types d'offre possibles

| Valeur | Libellé |
|--------|---------|
| `pack_seance` | Pack de séances |
| `abonnement` | Abonnement |
| `collectif` | Cours collectif |
| `programme_numerique` | Programme numérique |
| `produit` | Produit |

### Statuts possibles

`active` | `inactive` | `archivee`

### Créer une offre — Body JSON

```json
{
  "nom": "Pack 10 séances",
  "description": "Pack de 10 séances individuelles de coaching",
  "type": "pack_seance",
  "prix": 450.00,
  "tva": 20,
  "devise": "EUR",
  "nombre_seances": 10,
  "duree_jours": 90,
  "capacite_max": 1,
  "options": [],
  "statut": "active",
  "est_visible": true,
  "prix_promotion": null,
  "date_debut_promotion": null,
  "date_fin_promotion": null
}
```

> **Champs obligatoires** : `nom`, `type`, `prix`

### Réponse JSON

```json
{
  "id": 1,
  "nom": "Pack 10 séances",
  "description": "...",
  "type": "pack_seance",
  "type_label": "Pack de séances",
  "prix": { "amount": 450.00, "formatted": "450,00 €", "currency": "EUR" },
  "prix_ttc": { "amount": 540.00, "formatted": "540,00 €", "currency": "EUR" },
  "tva": 20.0,
  "devise": "EUR",
  "nombre_seances": 10,
  "duree_jours": 90,
  "capacite_max": 1,
  "options": [],
  "statut": "active",
  "est_visible": true,
  "en_promotion": false,
  "prix_promotion": null,
  "prix_effectif": { "amount": 450.00, "formatted": "450,00 €", "currency": "EUR" },
  "date_debut_promotion": null,
  "date_fin_promotion": null,
  "coach": { "id": 1, "bio": "..." },
  "contrats_count": 5,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## 3. 📦 Module Contrat (Issues #2, #3)

> Un **contrat** lie un client à une offre, avec un suivi des séances et des paiements.

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/contrats` | Lister les contrats |
| `POST` | `/api/coach/contrats` | Créer un contrat |
| `GET` | `/api/coach/contrats/{id}` | Détail d'un contrat |
| `PUT` | `/api/coach/contrats/{id}` | Modifier un contrat |
| `DELETE` | `/api/coach/contrats/{id}` | Supprimer un contrat |
| `GET` | `/api/coach/contrats-expiration` | Contrats expirant bientôt |

### Filtres disponibles

```
GET /api/coach/contrats?statut=actif
GET /api/coach/contrats?client_id=3
GET /api/coach/contrats?offre_id=1
GET /api/coach/contrats-expiration?jours=7     (défaut: 7 jours)
```

### Statuts possibles

`en_attente` | `actif` | `suspendu` | `termine` | `annule`

### Créer un contrat — Body JSON

```json
{
  "client_id": 1,
  "offre_id": 1,
  "date_debut": "2026-03-01",
  "date_fin": "2026-06-01",
  "statut": "actif",
  "seances_totales": 10,
  "montant_total": 450.00,
  "montant_paye": 0,
  "notes": "Contrat initial",
  "renouvellement_auto": false
}
```

> **Champs obligatoires** : `client_id`, `offre_id`, `date_debut`, `montant_total`

### Réponse JSON

```json
{
  "id": 1,
  "statut": "actif",
  "statut_label": "Actif",
  "date_debut": "2026-03-01",
  "date_fin": "2026-06-01",
  "seances_totales": 10,
  "seances_consommees": 3,
  "seances_restantes": 7,
  "montant_total": { "amount": 450.00, "formatted": "450,00 €", "currency": "EUR" },
  "montant_paye": { "amount": 200.00, "formatted": "200,00 €", "currency": "EUR" },
  "montant_restant": { "amount": 250.00, "formatted": "250,00 €", "currency": "EUR" },
  "est_paye_integralement": false,
  "renouvellement_auto": false,
  "date_prochain_renouvellement": null,
  "notes": "Contrat initial",
  "is_actif": true,
  "is_expire": false,
  "client": { "id": 1, "first_name": "Jean", "last_name": "Dupont", "email": "..." },
  "offre": { "id": 1, "nom": "Pack 10 séances", "..." : "..." },
  "coach": { "id": 1, "bio": "..." },
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## 4. 📦 Module Exercice (Issues #4, #5)

> Un **exercice** est un mouvement ou activité défini par le coach, utilisable dans les programmes.

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/exercices` | Lister les exercices |
| `POST` | `/api/coach/exercices` | Créer un exercice |
| `GET` | `/api/coach/exercices/{id}` | Détail d'un exercice |
| `PUT` | `/api/coach/exercices/{id}` | Modifier un exercice |
| `DELETE` | `/api/coach/exercices/{id}` | Supprimer un exercice |

### Filtres disponibles

```
GET /api/coach/exercices?categorie=musculation
GET /api/coach/exercices?niveau=debutant
GET /api/coach/exercices?muscle=pectoraux
GET /api/coach/exercices?search=squat
```

### Catégories possibles

`musculation` | `cardio` | `stretching` | `yoga` | `pilates` | `crossfit` | `boxe` | `fonctionnel` | `equilibre` | `plyometrie` | `autre`

### Niveaux possibles

`debutant` | `intermediaire` | `avance` | `expert`

### Créer un exercice — Body JSON

```json
{
  "nom": "Développé couché",
  "description": "Exercice de musculation pour les pectoraux",
  "consignes": "Garder le dos plaqué au banc...",
  "categorie": "musculation",
  "niveau": "intermediaire",
  "materiel": ["banc de musculation", "barre", "disques"],
  "medias": [
    { "type": "video", "url": "https://example.com/video.mp4" },
    { "type": "image", "url": "https://example.com/photo.jpg" }
  ],
  "muscles_cibles": ["pectoraux", "triceps", "épaules"],
  "duree_estimee": 90,
  "series_defaut": 4,
  "repetitions_defaut": 10,
  "repos_defaut": 90,
  "est_public": true,
  "est_actif": true
}
```

> **Champs obligatoires** : `nom`, `categorie`, `niveau`

### Réponse JSON

```json
{
  "id": 1,
  "nom": "Développé couché",
  "description": "...",
  "consignes": "...",
  "categorie": "musculation",
  "categorie_label": "Musculation",
  "niveau": "intermediaire",
  "niveau_label": "Intermédiaire",
  "materiel": ["banc de musculation", "barre", "disques"],
  "medias": [{ "type": "video", "url": "..." }],
  "muscles_cibles": ["pectoraux", "triceps"],
  "duree_estimee": 90,
  "duree_formatee": "1 min 30 s",
  "series_defaut": 4,
  "repetitions_defaut": 10,
  "repos_defaut": 90,
  "est_public": true,
  "est_actif": true,
  "coach": { "id": 1, "bio": "..." },
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

### Réponse Collection (index)

```json
{
  "data": [ /* tableau d'exercices */ ],
  "meta": {
    "total": 15,
    "categories": ["musculation", "cardio"],
    "niveaux": ["debutant", "intermediaire"]
  }
}
```

---

## 5. 📦 Module Paiement (Issue #6)

> Un **paiement** enregistre un règlement d'un client, lié ou non à un contrat.

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/paiements` | Lister les paiements |
| `POST` | `/api/coach/paiements` | Créer un paiement |
| `GET` | `/api/coach/paiements/{id}` | Détail d'un paiement |
| `PUT` | `/api/coach/paiements/{id}` | Modifier un paiement |
| `DELETE` | `/api/coach/paiements/{id}` | Supprimer un paiement |
| `POST` | `/api/coach/paiements/{id}/valider` | Valider (en_attente → validé) |
| `POST` | `/api/coach/paiements/{id}/rembourser` | Rembourser (partiel ou total) |
| `POST` | `/api/coach/paiements/{id}/annuler` | Annuler |
| `GET` | `/api/coach/paiements-statistiques` | Statistiques des paiements |

### Filtres disponibles

```
GET /api/coach/paiements?statut=valide
GET /api/coach/paiements?client_id=3
GET /api/coach/paiements?methode=carte_bancaire
GET /api/coach/paiements?contrat_id=1
GET /api/coach/paiements?date_debut=2026-02-01&date_fin=2026-02-28
```

### Méthodes de paiement possibles

`carte_bancaire` | `virement` | `especes` | `cheque` | `paypal` | `stripe` | `prelevement` | `autre`

### Statuts possibles

`en_attente` | `valide` | `refuse` | `rembourse` | `annule`

### Créer un paiement — Body JSON

```json
{
  "client_id": 1,
  "contrat_id": 1,
  "montant": 150.00,
  "devise": "EUR",
  "date_paiement": "2026-02-28",
  "methode": "carte_bancaire",
  "statut": "en_attente",
  "reference_externe": "STRIPE-123456",
  "description": "Paiement séance",
  "notes": ""
}
```

> **Champs obligatoires** : `client_id`, `montant`, `date_paiement`, `methode`

### Rembourser — Body JSON

```json
{
  "montant": 50.00,
  "motif": "Annulation de séance"
}
```

> Le remboursement peut être **partiel**. Si le montant remboursé atteint le montant total, le statut passe à `rembourse`.

### Statistiques — Réponse

```
GET /api/coach/paiements-statistiques?date_debut=2026-02-01&date_fin=2026-02-28
```

```json
{
  "periode": { "debut": "2026-02-01", "fin": "2026-02-28" },
  "chiffre_affaires": 5000.00,
  "total_rembourse": 200.00,
  "ca_net": 4800.00,
  "en_attente": 1500.00,
  "nombre_paiements": 25,
  "nombre_valides": 20,
  "repartition_methode": {
    "carte_bancaire": { "nombre": 15, "total": 3500.00, "label": "Carte bancaire" },
    "virement": { "nombre": 5, "total": 1500.00, "label": "Virement bancaire" }
  }
}
```

### Réponse JSON

```json
{
  "id": 1,
  "montant": { "amount": 150.00, "formatted": "150,00 €", "currency": "EUR" },
  "devise": "EUR",
  "date_paiement": "2026-02-28T00:00:00.000000Z",
  "methode": "carte_bancaire",
  "methode_label": "Carte bancaire",
  "statut": "en_attente",
  "statut_label": "En attente",
  "reference": "PAY-20260228-AB12C",
  "reference_externe": "STRIPE-123456",
  "description": "Paiement séance",
  "notes": "",
  "montant_rembourse": null,
  "montant_net": { "amount": 150.00, "formatted": "150,00 €", "currency": "EUR" },
  "date_remboursement": null,
  "motif_remboursement": null,
  "is_remboursable": false,
  "is_valide": false,
  "client": { "..." : "..." },
  "contrat": { "..." : "..." },
  "coach": { "..." : "..." },
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## 6. 📦 Module Séance (Issues #7, #8)

> Une **séance** est un rendez-vous planifié par le coach, auquel des clients peuvent s'inscrire.

### Endpoints Coach

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/seances` | Lister les séances du coach |
| `POST` | `/api/coach/seances` | Créer une séance |
| `GET` | `/api/coach/seances/{id}` | Détail d'une séance |
| `PUT` | `/api/coach/seances/{id}` | Modifier une séance |
| `DELETE` | `/api/coach/seances/{id}` | Supprimer une séance |
| `POST` | `/api/coach/seances/{id}/inscrire` | Inscrire un client |
| `DELETE` | `/api/coach/seances/{id}/desinscrire/{clientId}` | Désinscrire un client |
| `PUT` | `/api/coach/seances/{id}/presence/{clientId}` | Marquer la présence |
| `PUT` | `/api/coach/seances/{id}/feedback-coach/{clientId}` | Ajouter feedback coach |

### Endpoints Client

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/client/seances` | Mes séances (en tant que client) |
| `POST` | `/api/client/seances/{id}/feedback` | Donner un feedback client |

### Types de séance possibles

`individuelle` | `collective` | `en_ligne`

### Statuts de séance

`planifiee` | `en_cours` | `terminee` | `annulee`

### Statuts de présence (pivot)

`inscrit` | `present` | `absent` | `excuse`

### Créer une séance — Body JSON

```json
{
  "titre": "Séance cardio collective",
  "date": "2026-03-05",
  "heure_debut": "09:00",
  "duree": 60,
  "type": "collective",
  "capacite_max": 15,
  "lieu": "Salle A",
  "notes": "Apporter serviette et bouteille d'eau"
}
```

> **Champs obligatoires** : `titre`, `date`, `heure_debut`, `duree`, `type`, `capacite_max`

### Inscrire un client — Body JSON

```json
{
  "client_id": 3
}
```

> ⚠️ Retourne une erreur 422 si la séance est complète ou si le client est déjà inscrit.

### Marquer la présence — Body JSON

```json
{
  "statut_presence": "present"
}
```

> Valeurs possibles : `present`, `absent`, `excuse`

### Feedback coach — Body JSON

```json
{
  "feedback_coach": "Bonne progression sur les exercices",
  "note": 8
}
```

### Feedback client — Body JSON

```json
{
  "feedback_client": "Très bonne séance, merci !",
  "note": 9
}
```

### Réponse JSON

```json
{
  "id": 1,
  "titre": "Séance cardio collective",
  "date": "2026-03-05",
  "heure_debut": "09:00",
  "duree": 60,
  "type": "collective",
  "capacite_max": 15,
  "statut": "planifiee",
  "lieu": "Salle A",
  "notes": "...",
  "places_restantes": 12,
  "est_complete": false,
  "coach": { "id": 1, "bio": "..." },
  "clients": [
    {
      "id": 3,
      "user": { "id": 5, "full_name": "Jean Dupont", "email": "jean@example.com" },
      "statut_presence": "inscrit",
      "feedback_client": null,
      "feedback_coach": null,
      "note": null
    }
  ],
  "clients_count": 3,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## 7. 📦 Module Programme (Issues #9, #10)

> Un **programme** est un plan d'entraînement composé d'exercices organisés par semaine et jour.

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/programmes` | Lister les programmes |
| `POST` | `/api/coach/programmes` | Créer un programme |
| `GET` | `/api/coach/programmes/{id}` | Détail d'un programme |
| `PUT` | `/api/coach/programmes/{id}` | Modifier un programme |
| `DELETE` | `/api/coach/programmes/{id}` | Supprimer un programme |
| `POST` | `/api/coach/programmes/{id}/exercices` | Ajouter exercice au programme |
| `PUT` | `/api/coach/programmes/{id}/exercices/{exerciceId}` | Modifier exercice dans le programme |
| `DELETE` | `/api/coach/programmes/{id}/exercices/{exerciceId}` | Retirer exercice du programme |
| `POST` | `/api/coach/programmes/{id}/publier` | Publier (brouillon → publié) |
| `POST` | `/api/coach/programmes/{id}/depublier` | Dépublier (publié → brouillon) |
| `POST` | `/api/coach/programmes/{id}/archiver` | Archiver |
| `POST` | `/api/coach/programmes/{id}/dupliquer` | Dupliquer le programme |

### Filtres disponibles

```
GET /api/coach/programmes?type=perte_de_poids
GET /api/coach/programmes?statut=publie
```

### Types de programme possibles

`perte_de_poids` | `prise_de_masse` | `remise_en_forme` | `endurance` | `force` | `personnalise`

### Statuts possibles

`brouillon` | `publie` | `archive`

### Jours de la semaine (pour les exercices)

`lundi` | `mardi` | `mercredi` | `jeudi` | `vendredi` | `samedi` | `dimanche`

### Créer un programme — Body JSON

```json
{
  "titre": "Programme Perte de Poids 8 semaines",
  "description": "Programme progressif pour perdre du poids",
  "duree_semaines": 8,
  "type": "perte_de_poids",
  "statut": "brouillon",
  "prix": 29.99
}
```

> **Champs obligatoires** : `titre`, `duree_semaines`, `type`

### Ajouter un exercice au programme — Body JSON

```json
{
  "exercice_id": 5,
  "jour_semaine": "lundi",
  "series": 3,
  "repetitions": 12,
  "duree_minutes": null,
  "repos_secondes": 60,
  "instructions": "Augmenter la charge chaque semaine",
  "ordre": 1
}
```

> **Champs obligatoires** : `exercice_id`, `jour_semaine`, `series`, `repos_secondes`

### Modifier un exercice dans le programme — Body JSON

```json
{
  "series": 4,
  "repetitions": 15,
  "repos_secondes": 90
}
```

### Actions spéciales

| Action | Condition requise |
|--------|-------------------|
| **Publier** | Le programme doit être en `brouillon` et contenir au moins 1 exercice |
| **Dépublier** | Le programme doit être `publie` |
| **Archiver** | Le programme ne doit pas être déjà `archive` |
| **Dupliquer** | Crée une copie avec le titre + " (copie)", statut `brouillon`, et duplique tous les exercices associés |

### Réponse JSON

```json
{
  "id": 1,
  "coach_id": 1,
  "titre": "Programme Perte de Poids 8 semaines",
  "description": "...",
  "duree_semaines": 8,
  "type": "perte_de_poids",
  "statut": "brouillon",
  "prix": "29.99",
  "est_gratuit": false,
  "coach": { "id": 1, "bio": "..." },
  "exercices": [
    {
      "id": 5,
      "nom": "Squat",
      "description": "...",
      "categorie": "musculation",
      "niveau": "intermediaire",
      "duree_estimee": 90,
      "pivot": {
        "ordre": 1,
        "jour_semaine": "lundi",
        "series": 3,
        "repetitions": 12,
        "duree_minutes": null,
        "repos_secondes": 60,
        "instructions": "Augmenter la charge chaque semaine"
      }
    }
  ],
  "nombre_exercices": 5,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

### Réponse Collection (index)

```json
{
  "data": [ /* tableau de programmes */ ],
  "meta": {
    "total": 3,
    "types": ["perte_de_poids", "force"],
    "statuts": ["brouillon", "publie"]
  }
}
```

---

## 8. 📦 Module Facture (Issue #11)

> Une **facture** est un document financier émis pour un client, avec gestion du cycle de vie (brouillon → émise → payée).

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/coach/factures` | Lister les factures |
| `POST` | `/api/coach/factures` | Créer une facture |
| `GET` | `/api/coach/factures/{id}` | Détail d'une facture |
| `PUT` | `/api/coach/factures/{id}` | Modifier une facture |
| `DELETE` | `/api/coach/factures/{id}` | Supprimer (interdit si payée) |
| `POST` | `/api/coach/factures/{id}/emettre` | Émettre (brouillon → émise) |
| `POST` | `/api/coach/factures/{id}/payer` | Marquer comme payée |
| `POST` | `/api/coach/factures/{id}/annuler` | Annuler (interdit si payée) |
| `GET` | `/api/coach/factures/{id}/pdf` | Exporter en PDF |
| `GET` | `/api/coach/factures-en-retard` | Factures en retard |
| `GET` | `/api/coach/factures-stats` | Statistiques des factures |

### Filtres disponibles

```
GET /api/coach/factures?statut=emise
GET /api/coach/factures?client_id=3
GET /api/coach/factures?en_retard=true
GET /api/coach/factures?date_debut=2026-01-01&date_fin=2026-02-28
```

### Statuts possibles

`brouillon` | `emise` | `payee` | `annulee` | `en_retard`

### Cycle de vie d'une facture

```
brouillon → (émettre) → emise → (payer) → payee
                          ↓
                     (annuler) → annulee
```

### Créer une facture — Body JSON

```json
{
  "client_id": 1,
  "montant_ht": 100.00,
  "tva": 20.00,
  "date_emission": "2026-02-28",
  "date_echeance": "2026-03-28",
  "statut": "brouillon",
  "notes": "Coaching février 2026"
}
```

> **Champs obligatoires** : `client_id`, `montant_ht`, `date_emission`, `date_echeance`
>
> ⚠️ Le `montant_ttc` est **calculé automatiquement** (montant_ht × (1 + tva/100))
>
> ⚠️ Le `numero` est **généré automatiquement** au format `FAC-2026-0001`

### Règles de suppression / annulation

| Action | Condition |
|--------|-----------|
| Supprimer | ❌ Interdit si statut = `payee` |
| Annuler | ❌ Interdit si statut = `payee` ou `annulee` |
| Émettre | ✅ Uniquement si statut = `brouillon` |
| Payer | ❌ Interdit si statut = `payee` ou `annulee` |

### Statistiques — Réponse

```json
{
  "total_factures": 50,
  "total_ht": 25000.00,
  "total_ttc": 30000.00,
  "par_statut": {
    "brouillon": 5,
    "emise": 10,
    "payee": 30,
    "annulee": 3,
    "en_retard": 2
  },
  "montant_paye": 18000.00,
  "montant_en_attente": 7200.00
}
```

### Réponse JSON

```json
{
  "id": 1,
  "numero": "FAC-2026-0001",
  "client_id": 1,
  "paiement_id": null,
  "montant_ht": 100.00,
  "tva": 20.00,
  "montant_ttc": 120.00,
  "date_emission": "2026-02-28",
  "date_echeance": "2026-03-28",
  "statut": "brouillon",
  "statut_label": "Brouillon",
  "pdf_path": null,
  "notes": "Coaching février 2026",
  "est_en_retard": false,
  "client": { "id": 1, "first_name": "Jean", "last_name": "Dupont", "..." : "..." },
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## 9. 🧪 Comment tester

### Prérequis

1. **Lancer le backend** :
   ```bash
   cd BackEnd
   php artisan serve
   ```
   Le serveur tourne sur `http://localhost:8000`

2. **Seed de la base de données** (données de test) :
   ```bash
   php artisan migrate:fresh --seed
   ```

### Tester avec cURL

```bash
# 1. Se connecter et récupérer le token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "coach@example.com", "password": "password"}'

# 2. Utiliser le token (remplacer TOKEN par la valeur reçue)

# Lister les offres
curl http://localhost:8000/api/coach/offres \
  -H "Authorization: Bearer TOKEN"

# Créer une offre
curl -X POST http://localhost:8000/api/coach/offres \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Pack 10", "type": "pack_seance", "prix": 450}'

# Modifier une offre
curl -X PUT http://localhost:8000/api/coach/offres/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prix": 500}'

# Supprimer une offre
curl -X DELETE http://localhost:8000/api/coach/offres/1 \
  -H "Authorization: Bearer TOKEN"
```

### Tester avec Postman

1. Créer un **Environment** avec la variable `base_url` = `http://localhost:8000/api`
2. Créer un **Environment** avec la variable `token`
3. Faire un `POST {{base_url}}/login` et copier le token
4. Dans l'onglet **Authorization**, choisir **Bearer Token** et utiliser `{{token}}`
5. Tester chaque endpoint du tableau récapitulatif ci-dessous

### Tester avec le fichier HTTP

Un fichier de tests HTTP est disponible dans `documentation/backend_doc/api-tests.http`.

---

## 10. 📋 Format commun des réponses

### Champs monétaires

Tous les montants sont formatés ainsi :

```json
{
  "amount": 100.00,
  "formatted": "100,00 €",
  "currency": "EUR"
}
```

> **Côté frontend**, utilisez `amount` pour les calculs et `formatted` pour l'affichage.

### Erreurs de validation (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nom": ["Le champ nom est obligatoire."],
    "prix": ["Le champ prix doit être un nombre."]
  }
}
```

### Erreur d'autorisation (403)

```json
{
  "message": "Vous n'êtes pas autorisé à modifier cette ressource."
}
```

### Erreur non trouvé (404)

```json
{
  "message": "No query results for model [App\\Models\\Offre] 999"
}
```

### Soft Delete

Tous les modèles utilisent le **soft delete** (suppression logique). Les données ne sont pas réellement effacées de la base de données.

---

## 11. 📊 Récapitulatif complet des endpoints

### Routes Coach (`/api/coach/...`) — Authentification requise + rôle coach

| # | Méthode | URL | Module |
|---|---------|-----|--------|
| 1 | `GET` | `/api/coach/offres` | Offre |
| 2 | `POST` | `/api/coach/offres` | Offre |
| 3 | `GET` | `/api/coach/offres/{id}` | Offre |
| 4 | `PUT` | `/api/coach/offres/{id}` | Offre |
| 5 | `DELETE` | `/api/coach/offres/{id}` | Offre |
| 6 | `GET` | `/api/coach/contrats` | Contrat |
| 7 | `POST` | `/api/coach/contrats` | Contrat |
| 8 | `GET` | `/api/coach/contrats/{id}` | Contrat |
| 9 | `PUT` | `/api/coach/contrats/{id}` | Contrat |
| 10 | `DELETE` | `/api/coach/contrats/{id}` | Contrat |
| 11 | `GET` | `/api/coach/contrats-expiration` | Contrat |
| 12 | `GET` | `/api/coach/seances` | Séance |
| 13 | `POST` | `/api/coach/seances` | Séance |
| 14 | `GET` | `/api/coach/seances/{id}` | Séance |
| 15 | `PUT` | `/api/coach/seances/{id}` | Séance |
| 16 | `DELETE` | `/api/coach/seances/{id}` | Séance |
| 17 | `POST` | `/api/coach/seances/{id}/inscrire` | Séance |
| 18 | `DELETE` | `/api/coach/seances/{id}/desinscrire/{clientId}` | Séance |
| 19 | `PUT` | `/api/coach/seances/{id}/presence/{clientId}` | Séance |
| 20 | `PUT` | `/api/coach/seances/{id}/feedback-coach/{clientId}` | Séance |
| 21 | `GET` | `/api/coach/exercices` | Exercice |
| 22 | `POST` | `/api/coach/exercices` | Exercice |
| 23 | `GET` | `/api/coach/exercices/{id}` | Exercice |
| 24 | `PUT` | `/api/coach/exercices/{id}` | Exercice |
| 25 | `DELETE` | `/api/coach/exercices/{id}` | Exercice |
| 26 | `GET` | `/api/coach/paiements` | Paiement |
| 27 | `POST` | `/api/coach/paiements` | Paiement |
| 28 | `GET` | `/api/coach/paiements/{id}` | Paiement |
| 29 | `PUT` | `/api/coach/paiements/{id}` | Paiement |
| 30 | `DELETE` | `/api/coach/paiements/{id}` | Paiement |
| 31 | `POST` | `/api/coach/paiements/{id}/valider` | Paiement |
| 32 | `POST` | `/api/coach/paiements/{id}/rembourser` | Paiement |
| 33 | `POST` | `/api/coach/paiements/{id}/annuler` | Paiement |
| 34 | `GET` | `/api/coach/paiements-statistiques` | Paiement |
| 35 | `GET` | `/api/coach/programmes` | Programme |
| 36 | `POST` | `/api/coach/programmes` | Programme |
| 37 | `GET` | `/api/coach/programmes/{id}` | Programme |
| 38 | `PUT` | `/api/coach/programmes/{id}` | Programme |
| 39 | `DELETE` | `/api/coach/programmes/{id}` | Programme |
| 40 | `POST` | `/api/coach/programmes/{id}/exercices` | Programme |
| 41 | `PUT` | `/api/coach/programmes/{id}/exercices/{exId}` | Programme |
| 42 | `DELETE` | `/api/coach/programmes/{id}/exercices/{exId}` | Programme |
| 43 | `POST` | `/api/coach/programmes/{id}/publier` | Programme |
| 44 | `POST` | `/api/coach/programmes/{id}/depublier` | Programme |
| 45 | `POST` | `/api/coach/programmes/{id}/archiver` | Programme |
| 46 | `POST` | `/api/coach/programmes/{id}/dupliquer` | Programme |
| 47 | `GET` | `/api/coach/factures` | Facture |
| 48 | `POST` | `/api/coach/factures` | Facture |
| 49 | `GET` | `/api/coach/factures/{id}` | Facture |
| 50 | `PUT` | `/api/coach/factures/{id}` | Facture |
| 51 | `DELETE` | `/api/coach/factures/{id}` | Facture |
| 52 | `POST` | `/api/coach/factures/{id}/emettre` | Facture |
| 53 | `POST` | `/api/coach/factures/{id}/payer` | Facture |
| 54 | `POST` | `/api/coach/factures/{id}/annuler` | Facture |
| 55 | `GET` | `/api/coach/factures/{id}/pdf` | Facture |
| 56 | `GET` | `/api/coach/factures-en-retard` | Facture |
| 57 | `GET` | `/api/coach/factures-stats` | Facture |

### Routes Client (`/api/client/...`) — Authentification requise + rôle client

| # | Méthode | URL | Module |
|---|---------|-----|--------|
| 58 | `GET` | `/api/client/seances` | Séance |
| 59 | `POST` | `/api/client/seances/{id}/feedback` | Séance |

### Routes Auth (`/api/...`) — Publiques

| # | Méthode | URL | Description |
|---|---------|-----|-------------|
| 60 | `POST` | `/api/register` | Inscription |
| 61 | `POST` | `/api/login` | Connexion |
| 62 | `POST` | `/api/forgot-password` | Mot de passe oublié |
| 63 | `POST` | `/api/reset-password` | Réinitialiser mot de passe |
| 64 | `POST` | `/api/logout` | Déconnexion (auth) |
| 65 | `GET` | `/api/user` | Utilisateur connecté (auth) |

---

> **Créé le** : 28 février 2026  
> **Correspond aux Issues** : #1 à #11 du plan de travail  
> **Backend** : Laravel 11 + Sanctum  
> **Questions ?** Contactez l'équipe backend !
