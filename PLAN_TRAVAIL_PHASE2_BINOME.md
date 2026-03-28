# 🚀 Plan de Répartition — Phase Finale (Version 3) ArchiWeb 2026

## Collaboration GitHub Binôme — Livraison complète backend

**Date** : 28 mars 2026  
**Durée estimée** : 4-5 semaines  
**Branche de base** : `main`  
**Objectif** : Livrer 100% du périmètre backend en une seule phase finale (V3)

---

## 👥 RÉPARTITION DES TÂCHES

### Règle de la phase finale V3

- Cette phase est la dernière phase de développement.
- Tous les modules restants doivent être implémentés dans cette phase.
- Aucun report de fonctionnalités vers une phase suivante.
- La sortie finale V3 doit inclure code, tests, documentation et validation API.

### **Développeur A**

- Modules : `Offre`, `Contrat`, `Exercice`, `Paiement`
- Focus : Gestion commerciale + bibliothèque
- Tests associés

### **Développeur B**

- Modules : `Seance`, `Programme`, `Facture`, `Client`
- Focus : Gestion opérationnelle + facturation
- Tests associés

---

## ✅ ÉTAT ACTUEL (28 mars 2026)

### Modèles Créés (11/11) ✅

- ✅ User, Role, Coach, Client (Authentification)
- ✅ Offre, Contrat, Seance, Exercice, Programme
- ✅ Paiement, Facture

### Controllers Créés (9/9) ✅

- ✅ Auth, Client, Offre, Contrat, Seance, Exercice, Programme, Paiement, Facture

### Resources Créées (17/17) ✅

- ✅ Tous les Resource classes prêtes

### Migrations (16/16) ✅

- ✅ Toutes les migrations créées

### Seeders (12/12) ✅

- ✅ Tous les seeders disponibles

---

## ⏳ PLAN DE LIVRAISON COMPLET V3

### 🔴 PHASE 2A — Développeur A (2-3 jours)

#### Tâche A1 : Logique métier Offre + Contrat

**Branche** : `feature/offre-contrat-logic`

- [ ] Method `Contrat::seances_consommees()` — calcul des séances utilisées
- [ ] Method `Contrat::seances_restantes()` — calcul des séances restantes
- [ ] Method `Offre::seances_incluses()` — nombre de séances par offre
- [ ] Validation des dates (date_debut < date_fin)
- [ ] Status workflow (actif → expiré → archivé)
- **Tests** : Tests unitaires pour Offre et Contrat
- **Commits** :
  ```
  feat(offre): add seance counting methods
  feat(contrat): implement seance consumption tracking
  test(offre): add unit tests for Offre model
  test(contrat): add unit tests for Contrat model
  ```

#### Tâche A2 : Middleware & Autorisation Offre/Contrat

**Branche** : `feature/auth-offre-contrat`

- [ ] Middleware : coach voit uniquement ses offres
- [ ] Middleware : coach voit uniquement ses contrats (ses clients)
- [ ] Middleware : client voit ses contrats
- [ ] Exception ApiExceptionHandler pour accès refusé
- **Tests** : Tests d'autorisation (Feature tests)
- **Commits** :
  ```
  feat(auth): add middleware CheckOffreOwnership
  feat(auth): add middleware CheckContratAccess
  test(auth): add authorization tests
  ```

#### Tâche A3 : Tests Complets Exercice + Paiement

**Branche** : `feature/test-exercice-paiement`

- [ ] Tests CRUD Exercice (create, read, update, delete)
- [ ] Tests CRUD Paiement (create, read, update, delete)
- [ ] Tests validations (prix > 0, etc.)
- [ ] Tests relations (Exercice → Coach, Paiement → Client/Contrat)
- [ ] Tests permissions (coach voit ses exercices)
- **Commits** :
  ```
  test(exercice): add feature tests for ExerciceController
  test(paiement): add feature tests for PaiementController
  test: add authorization tests for exercice & paiement
  ```

#### Tâche A4 : Export & Reporting Offre

**Branche** : `feature/offre-export`

- [ ] Method `OffreController::export()` — export CSV offres
- [ ] Stats : nombre de contrats par offre
- [ ] Stats : CA par offre (via Paiement)
- [ ] Method `OffreResource::calculateMetrics()` — durée moyenne, etc.
- **Commits** :
  ```
  feat(offre): add export CSV functionality
  feat(offre): add statistics and metrics
  ```

---

### 🔴 PHASE 2B — Développeur B (2-3 jours)

#### Tâche B1 : Logique métier Seance + Présence

**Branche** : `feature/seance-presence`

- [ ] Method `Seance::marquer_presence($client_id, $statut)` (présent/absent/excuse)
- [ ] Method `Seance::get_participants()` — liste présents
- [ ] Method `Seance::get_absents()` — liste absents
- [ ] Method `Seance::get_waiting_list()` — liste d'attente
- [ ] Method `Seance::capacite_restante()` — places disponibles
- [ ] Ajout client à liste d'attente si capacité atteinte
- **Tests** : Tests unitaires Seance
- **Commits** :
  ```
  feat(seance): add attendance tracking
  feat(seance): implement waiting list management
  test(seance): add unit tests for Seance model
  ```

#### Tâche B2 : Logique métier Programme

**Branche** : `feature/programme-logic`

- [ ] Method `Programme::ajouter_exercice($exercice_id, $ordre, $details)` — add exercises
- [ ] Method `Programme::retirer_exercice($exercice_id)` — remove exercises
- [ ] Method `Programme::publier()` — change status draft → published
- [ ] Method `Programme::get_exercices_par_semaine()` — grouped by week
- [ ] Validation : exercices du même coach seulement
- **Tests** : Tests unitaires Programme
- **Commits** :
  ```
  feat(programme): add exercise management
  feat(programme): implement publication workflow
  test(programme): add unit tests for Programme model
  ```

#### Tâche B3 : Facturation + PDF

**Branche** : `feature/facture-generation`

- [ ] Method `Facture::generer_pdf()` — generate PDF
- [ ] Method `Facture::send_email()` — send to client email
- [ ] Method `FactureController::pdf($id)` — download PDF
- [ ] Numérotation auto factures (FAC-2026-001, etc.)
- [ ] Calcul TVA (HT + TVA = TTC)
- [ ] Template Blade pour facture
- **Tests** : Tests CRUD Facture + PDF génération
- **Commits** :
  ```
  feat(facture): add PDF generation
  feat(facture): add auto-numbering and email sending
  test(facture): add feature tests for FactureController
  ```

#### Tâche B4 : Tests Complets Seance + Client

**Branche** : `feature/test-seance-client`

- [ ] Tests CRUD Seance (create, read, update, delete)
- [ ] Tests CRUD Client (create, read, update, delete)
- [ ] Tests présence marking
- [ ] Tests waiting list
- [ ] Tests permissions (coach voit ses séances, client ses réservations)
- **Commits** :
  ```
  test(seance): add feature tests for SeanceController
  test(client): add feature tests for ClientController
  test: add authorization tests
  ```

---

### 🔴 PHASE 2C — Périmètre restant obligatoire V3 (2 semaines)

#### Tâche A5 : Agenda + Notifications + Sécurité API

**Branche** : `feature/v3-agenda-notifications-security`

- [ ] Export calendrier (ICS) pour séances coach/client
- [ ] Synchronisation unidirectionnelle Google Calendar (minimum)
- [ ] Notifications API (rappel, annulation, modification)
- [ ] Durcissement autorisations (ownership systématique)
- [ ] Journalisation erreurs API + audit actions critiques
- [ ] Tests feature (agenda + notifications + permissions)

#### Tâche A6 : Performance + CI qualité backend

**Branche** : `feature/v3-quality-performance`

- [ ] Optimiser endpoints lourds (pagination + eager loading)
- [ ] Vérifier objectifs de réponse API (< 500 ms sur endpoints clés)
- [ ] Couverture tests backend >= 80%
- [ ] Ajouter vérification test/lint dans pipeline CI
- [ ] Compléter documentation d'exploitation backend

#### Tâche B5 : Messagerie + Boutique (API)

**Branche** : `feature/v3-messaging-shop`

- [ ] API messagerie individuelle (coach-client)
- [ ] API messagerie groupée (groupes/tags)
- [ ] Catalogue produits (physiques + numériques)
- [ ] Stock, commande, historique achat
- [ ] Tests CRUD + permissions messagerie/boutique

#### Tâche B6 : Dashboards + Intégrations sportives (mock)

**Branche** : `feature/v3-dashboard-integrations`

- [ ] KPI CA, panier moyen, fidélisation, taux de remplissage
- [ ] Import données sportives (mock Garmin/Strava)
- [ ] Corrélation données sportives / séances / progression
- [ ] Endpoints reporting frontend-ready
- [ ] Tests des calculs et agrégations

---

## 🌿 BRANCHES GIT — STRUCTURE

```
main (branche principale protégée)
├── feature/offre-contrat-logic       (Dev A)
├── feature/auth-offre-contrat        (Dev A)
├── feature/test-exercice-paiement    (Dev A)
├── feature/offre-export              (Dev A)
├── feature/seance-presence           (Dev B)
├── feature/programme-logic           (Dev B)
├── feature/facture-generation        (Dev B)
├── feature/test-seance-client        (Dev B)
├── feature/v3-agenda-notifications-security (Dev A)
├── feature/v3-quality-performance    (Dev A)
├── feature/v3-messaging-shop         (Dev B)
└── feature/v3-dashboard-integrations (Dev B)
```

---

## 🔧 GITHUB SETUP — COMMANDES

### 1️⃣ Labels à créer

```
feature          → New feature
bugfix           → Bug fix
test             → Tests
documentation    → Documentation
devA             → Assign to Dev A
devB             → Assign to Dev B
urgent           → Urgent/Priority
waiting          → Blocked/Waiting
```

### 2️⃣ Milestones à créer

```
Milestone : "Version 3 — Phase Finale Backend"
Due date : 30 avril 2026
```

### 3️⃣ Git Workflow

```bash
# --- DÉBUT DE TRAVAIL (DEV A OU B) ---

# 1. Mettre à jour la branche main
git checkout main
git pull origin main

# 2. Créer une branche feature
git checkout -b feature/offre-contrat-logic

# 3. Développer avec commits atomiques
git add app/Models/Offre.php
git commit -m "feat(offre): add seance counting methods"

git add tests/Unit/Models/OffreTest.php
git commit -m "test(offre): add unit tests for counting"

# 4. Push et créer Pull Request
git push origin feature/offre-contrat-logic

# --- SUR GITHUB ---
# Ouvrir PR → Ajouter description → Assign reviewers

# 5. Attendre review + feedback (Dev A et B se review mutuellement)

# 6. Fusionner dans main (après approval)
git checkout main
git pull origin main
git merge feature/offre-contrat-logic
git push origin main

# 7. Supprimer branche locale et distante
git branch -d feature/offre-contrat-logic
git push origin --delete feature/offre-contrat-logic
```

---

## 📋 TEMPLATE PULL REQUEST

Lors du push, utiliser ce template sur GitHub :

```markdown
## Description

Complète [Tâche Ax] / [Tâche Bx]
Implémente la logique métier pour [Module]

## Changes

- [ ] Migration/Model
- [ ] Controller methods
- [ ] Tests unitaires
- [ ] Tests d'autorisation
- [ ] Documentation

## Testing
```

TODO: Expliquer comment tester manuellement

```

## Checklist
- [ ] Code suit les conventions Laravel
- [ ] 100% des tests passent (`php artisan test`)
- [ ] Pas de conflits avec main
- [ ] Toutes les migrations peuvent se rollback
- [ ] API Resources formatées correctement

## Screenshots (si applicable)
N/A

## Related Issues
Closes #[issue_number]
```

---

## 📅 TIMELINE ESTIMÉE

| Semaine   | Dev A                        | Dev B                    |
| --------- | ---------------------------- | ------------------------ |
| **Sem 1** | A1 (Offre/Contrat logic)     | B1 (Seance/Présence)     |
| **Sem 1** | A2 (Auth middleware)         | B2 (Programme logic)     |
| **Sem 2** | A3 (Tests Exercice/Paiement) | B3 (Facture PDF)         |
| **Sem 2** | A4 (Export/Stats)            | B4 (Tests Seance/Client) |
| **Sem 3** | A5 (Agenda/Notif/Sécurité)   | B5 (Messagerie/Boutique) |
| **Sem 4** | A6 (Perf/CI/Qualité)         | B6 (Dashboard/Intégr.)   |
| **Sem 5** | Stabilisation + UAT          | Stabilisation + UAT      |

---

## 🧪 COMMANDES POUR TESTER

```bash
# Créer la BD de test
php artisan migrate:refresh --seed

# Lancer les tests
php artisan test

# Lancer les tests d'une classe spécifique
php artisan test tests/Unit/Models/OffreTest.php
php artisan test tests/Feature/Controllers/OffreControllerTest.php

# Code coverage
php artisan test --coverage

# Vérifier le code avec Pest
vendor/bin/pest

# Linter Laravel
php artisan lint:blade
php artisan lint:config
```

---

## 📌 CONSEILS DE COLLABORATION

✅ **À FAIRE**

- Commiter souvent avec messages clairs
- Écrire les tests au fur et à mesure
- Faire des PR pas trop grosses (< 400 lignes)
- Répondre rapidement aux reviews
- Tester local avant de push

❌ **À ÉVITER**

- Merger directement dans main sans review
- Commits "fix" ou "update" (soyez précis)
- Laisser des branches mortes
- Oublier les tests
- Travailler sans communiquer

---

## 🎯 OBJECTIF FINAL

✅ Backend V3 complet (tous modules du besoin)  
✅ API 100% fonctionnelle + sécurisée  
✅ Tests >= 80% coverage  
✅ Documentation technique et intégration à jour  
✅ Prête pour intégration Frontend et recette finale

---

**Créé le** : 28 mars 2026  
**Animateur** : AI Assistant  
**Status** : 🔴 Phase finale V3 à démarrer
