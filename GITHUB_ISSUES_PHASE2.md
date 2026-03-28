# 📝 GitHub Issues — Phase Finale Version 3

Copier-coller ces issues sur GitHub Issues. Les créer dans l'ordre numérique.

Important: cette phase correspond a la phase finale de developpement. Le perimetre V3 complet doit etre livre dans cette meme phase.

---

## 🟢 LABELS À CRÉER D'ABORD

Sur GitHub → Settings → Labels :

```
feature          (vert clair) → New feature implementation
bugfix           (rouge) → Bug fix
test             (bleu) → Tests/Testing
documentation    (orange) → Documentation/Docs
devA             (pourpre) → Assigned to Dev A
devB             (rose) → Assigned to Dev B
urgent           (rouge foncé) → High priority
waiting          (gris) → Blocked/Waiting for review
3-points         (bleu foncé) → Estimation 3 points
5-points         (bleu moyen) → Estimation 5 points
8-points         (bleu clair) → Estimation 8 points
```

---

## 📋 PHASE FINALE V3 — ISSUES

Issues de base deja preparees: #12 a #19.

Issues additionnelles obligatoires a ajouter pour couvrir tout le perimetre:

- #20 Agenda + Synchronisation calendrier + notifications
- #21 Messagerie individuelle et groupe
- #22 Boutique (produits, stock, commandes)
- #23 Dashboards & reporting business
- #24 Integrations donnees sportives (mock Garmin/Strava)
- #25 Durcissement securite/permissions globales
- #26 Performance API + optimisation requetes
- #27 Stabilisation finale + recette + documentation V3

### Issue #12 — Logique métier Offre + Contrat

**Titre** : `[FEATURE] Logique métier Offre & Contrat — Calcul séances`

**Labels** : `feature`, `devA`, `3-points`

**Assignee** : Dev A

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Implémenter la logique métier pour le calcul des séances consommées/restantes.

## Tâches

- [ ] Method `Contrat::seances_consommees()` — compter les séances utilisées
- [ ] Method `Contrat::seances_restantes()` — compter les séances disponibles
- [ ] Method `Offre::seances_incluses()` — retourner nombre séances par offre
- [ ] Validation dates : `date_debut < date_fin`
- [ ] Status workflow : actif → expiré → archivé
- [ ] Case `Offre::TYPES` pour valider les types

## Fichiers à modifier

- `/app/Models/Offre.php`
- `/app/Models/Contrat.php`

## Tests

- [ ] Tests unitaires Offre → `tests/Unit/Models/OffreTest.php`
- [ ] Tests unitaires Contrat → `tests/Unit/Models/ContratTest.php`

## Definition of Done

- ✅ Code passe all tests
- ✅ Pas d'erreur PHP Lint
- ✅ Relations bien chargées (eager loading)
- ✅ Documentation inline pour les methods complexes

## Branche

`feature/offre-contrat-logic`

## Commits suggérés
```

feat(offre): add seance counting methods
feat(contrat): implement seance consumption tracking
test(offre): add unit tests for Offre model
test(contrat): add unit tests for Contrat model

```

```

---

### Issue #13 — Middleware & Autorisation Offre/Contrat

**Titre** : `[FEATURE] Middleware & Autorisation — Offre/Contrat`

**Labels** : `feature`, `devA`, `5-points`

**Assignee** : Dev A

**Milestone** : Phase 2 — Tests & Logic

**Dépend de** : #12

**Description** :

```markdown
## Objectif

Ajouter middleware pour vérifier les droits d'accès (coach ne voit que ses données).

## Tâches

- [ ] Middleware `CheckOffreOwnership` — coach voit ses offres
- [ ] Middleware `CheckContratAccess` — coach voit contrats de ses clients
- [ ] Middleware `CheckClientAccess` — client voit ses contrats
- [ ] Appliquer middlewares dans routes `routes/api.php`
- [ ] Exception dans `ApiExceptionHandler` pour accès refusé (403)
- [ ] Tester avec différents rôles (coach, client, admin)

## Fichiers à créer

- `/app/Http/Middleware/CheckOffreOwnership.php`
- `/app/Http/Middleware/CheckContratAccess.php`
- `/app/Http/Middleware/CheckClientAccess.php`

## Tests

- [ ] Feature tests authorization → `tests/Feature/Authorization`

## Definition of Done

- ✅ Toutes les routes protégées
- ✅ Tests d'autorisation passent
- ✅ Admin peut toujours accéder

## Branche

`feature/auth-offre-contrat`

## Commits suggérés
```

feat(auth): add middleware CheckOffreOwnership
feat(auth): add middleware CheckContratAccess
feat(auth): add middleware CheckClientAccess
test(auth): add authorization tests

```

```

---

### Issue #14 — Tests Exercice + Paiement

**Titre** : `[TEST] Tests complets Exercice & Paiement — CRUD + Auth`

**Labels** : `test`, `devA`, `5-points`

**Assignee** : Dev A

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Compléter les tests CRUD et d'autorisation pour Exercice et Paiement.

## Tâches — Exercice

- [ ] Test create exercice
- [ ] Test read (show, index)
- [ ] Test update exercice
- [ ] Test delete (soft delete)
- [ ] Test validation (nom requis, niveau valide, etc.)
- [ ] Test permissions (coach voit ses exercices)
- [ ] Test relations (coach, categories)

## Tâches — Paiement

- [ ] Test create paiement
- [ ] Test read (show, index)
- [ ] Test update paiement (non-modifiable après)
- [ ] Test delete
- [ ] Test validation (montant > 0, methode valide)
- [ ] Test relations (client, contrat, facture)
- [ ] Test permissions (client voit ses paiements)

## Fichiers à créer

- `/tests/Feature/Controllers/ExerciceControllerTest.php`
- `/tests/Feature/Controllers/PaiementControllerTest.php`

## Lignes de code cibles

- Min 50 tests
- Min 80% coverage pour ces 2 models

## Branche

`feature/test-exercice-paiement`

## Commits suggérés
```

test(exercice): add feature tests for ExerciceController
test(paiement): add feature tests for PaiementController
test: add authorization tests

```

```

---

### Issue #15 — Export & Metrics Offre

**Titre** : `[FEATURE] Export CSV & Reporting — Offres`

**Labels** : `feature`, `devA`, `3-points`

**Assignee** : Dev A

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Ajouter export CSV et statistiques pour les offres.

## Tâches

- [ ] Method `OffreController::export()` — export CSV offres du coach
- [ ] Colonnes CSV : nom, type, prix, nombre contrats, CA total
- [ ] Method `Offre::getMetrics()` — stats (durée moyenne, contrats actifs)
- [ ] Ajouter route `GET /api/offres/export/csv`
- [ ] Tester export manuel (téléchargement)

## Fichiers à modifier

- `/app/Models/Offre.php`
- `/app/Http/Controllers/OffreController.php`
- `/routes/api.php`

## Tests

- [ ] Test export method
- [ ] Test metrics calculation

## Branche

`feature/offre-export`

## Commits suggérés
```

feat(offre): add export CSV functionality
feat(offre): add statistics and metrics
test(offre): add export tests

```

```

---

### Issue #16 — Logique métier Seance + Présence

**Titre** : `[FEATURE] Logique métier Seance — Présence & Waiting list`

**Labels** : `feature`, `devB`, `5-points`

**Assignee** : Dev B

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Implémenter gestion des présences et liste d'attente pour les séances.

## Tâches

- [ ] Method `Seance::marquer_presence($client_id, $statut)` — présent/absent/excuse
- [ ] Method `Seance::get_participants()` — listing des présents
- [ ] Method `Seance::get_absents()` — listing des absents
- [ ] Method `Seance::get_waiting_list()` — listing liste d'attente
- [ ] Method `Seance::capacite_restante()` — places disponibles
- [ ] Logic : SI capacité atteinte → ajouter à liste d'attente
- [ ] Pivot table `seance_client` avec champs status_presence, feedback

## Fichiers à modifier

- `/app/Models/Seance.php`
- `/app/Models/Client.php` (relation many-to-many)
- Vérifier migration `seance_client`

## Tests

- [ ] Tests unitaires → `tests/Unit/Models/SeanceTest.php`
- [ ] Test marquer présence
- [ ] Test waiting list logic

## Definition of Done

- ✅ Presence tracking fonctionne
- ✅ Waiting list auto-populate
- ✅ Tests passent

## Branche

`feature/seance-presence`

## Commits suggérés
```

feat(seance): add attendance tracking
feat(seance): implement waiting list management
test(seance): add unit tests for Seance model

```

```

---

### Issue #17 — Logique métier Programme

**Titre** : `[FEATURE] Logique métier Programme — Exercices & Publication`

**Labels** : `feature`, `devB`, `5-points`

**Assignee** : Dev B

**Milestone** : Phase 2 — Tests & Logic

**Dépend de** : Avoir Exercice fait

**Description** :

```markdown
## Objectif

Implémenter gestion des exercices et workflow de publication pour programmes.

## Tâches

- [ ] Method `Programme::ajouter_exercice($exercice_id, $ordre, $details)` — add
- [ ] Method `Programme::retirer_exercice($exercice_id)` — remove
- [ ] Method `Programme::publier()` — draft → published workflow
- [ ] Method `Programme::get_exercices_par_semaine()` — grouped by week
- [ ] Validation : exercices du même coach seulement
- [ ] Enum/Const pour status (brouillon, publié, archivé)

## Fichiers à modifier

- `/app/Models/Programme.php`
- `/app/Models/Exercice.php` (relation)
- Vérifier migration `programme_exercice`

## Tests

- [ ] Tests unitaires → `tests/Unit/Models/ProgrammeTest.php`
- [ ] Test adding/removing exercises
- [ ] Test publication workflow
- [ ] Test coach validation

## Branche

`feature/programme-logic`

## Commits suggérés
```

feat(programme): add exercise management
feat(programme): implement publication workflow
test(programme): add unit tests for Programme model

```

```

---

### Issue #18 — Facturation & PDF

**Titre** : `[FEATURE] Facturation — PDF Generation & Email`

**Labels** : `feature`, `devB`, `8-points`

**Assignee** : Dev B

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Implémenter génération de factures PDF et envoi par email.

## Tâches

- [ ] Method `Facture::generer_pdf()` — generate PDF using Laravel Dompdf
- [ ] Method `Facture::send_email()` — send PDF to client email
- [ ] Route `GET /api/factures/{id}/pdf` — download PDF
- [ ] Auto-numbering : FAC-2026-001, FAC-2026-002...
- [ ] Calcul TVA : HT + (HT × TVA%) = TTC
- [ ] Template Blade → `resources/views/factures/template.blade.php`
- [ ] Storage : factures en `/storage/app/factures/`

## Fichiers à créer/modifier

- `/app/Models/Facture.php` → methods generer_pdf(), send_email()
- `/app/Http/Controllers/FactureController.php` → pdf() route
- `/resources/views/factures/template.blade.php` (NEW)

## Dependencies

- `composer require barryvdh/laravel-dompdf`

## Tests

- [ ] Test PDF generation
- [ ] Test email sending
- [ ] Test PDF download route

## Definition of Done

- ✅ PDF généré correctement
- ✅ Email envoyé avec PDF
- ✅ Numérotation auto
- ✅ Format facture professionnel

## Branche

`feature/facture-generation`

## Commits suggérés
```

feat(facture): add PDF generation with Dompdf
feat(facture): add auto-numbering and email sending
feat(facture): add PDF download route
test(facture): add feature tests for PDF

```

```

---

### Issue #19 — Tests Seance + Client

**Titre** : `[TEST] Tests complets Seance & Client — CRUD + Presence`

**Labels** : `test`, `devB`, `8-points`

**Assignee** : Dev B

**Milestone** : Phase 2 — Tests & Logic

**Description** :

```markdown
## Objectif

Compléter les tests CRUD, présence et autorisation pour Seance et Client.

## Tâches — Seance

- [ ] Test create seance
- [ ] Test read (show, index)
- [ ] Test update seance
- [ ] Test delete (soft delete)
- [ ] Test marquer_presence()
- [ ] Test waiting list logic
- [ ] Test permissions (coach voit ses séances, client ses réservations)

## Tâches — Client

- [ ] Test create client
- [ ] Test read (show, index)
- [ ] Test update client
- [ ] Test delete (soft delete)
- [ ] Test validation (email unique, etc.)
- [ ] Test relations (coach, contrats, séances)
- [ ] Test permissions (client voit ses données)

## Fichiers à créer

- `/tests/Feature/Controllers/SeanceControllerTest.php`
- `/tests/Feature/Controllers/ClientControllerTest.php`

## Lignes de code cibles

- Min 60 tests
- Min 85% coverage

## Branche

`feature/test-seance-client`

## Commits suggérés
```

test(seance): add feature tests for SeanceController
test(client): add feature tests for ClientController
test(seance): add presence and waiting list tests

```

```

---

## 🚀 ORDRE DE CRÉATION RECOMMANDÉ

1. ✅ Créer les labels d'abord
2. Créer le Milestone "Phase 2 — Tests & Logic"
3. Crée issues dans cet ordre (les dépendances sont respectées) :
   - #12 (Offre/Contrat logic) — Dev A
   - #13 (Auth middleware) — Dev A
   - #14 (Tests Exercice/Paiement) — Dev A
   - #15 (Export Offre) — Dev A
   - #16 (Seance + Présence) — Dev B
   - #17 (Programme logic) — Dev B
   - #18 (Facture PDF) — Dev B
   - #19 (Tests Seance/Client) — Dev B

---

---

### Issue #20 — Agenda + Synchronisation calendrier + Notifications

**Titre** : `[FEATURE] Agenda V3 — Export ICS, Sync Google Calendar, Notifications`

**Labels** : `feature`, `devA`, `8-points`

**Assignee** : Dev A

**Milestone** : Version 3 — Phase Finale Backend

**Dépend de** : #12, #16

**Description** :

```markdown
## Objectif

Implémenter agenda complet avec export calendrier et intégration notifications.

## Tâches — Agenda

- [ ] Export ICS (iCalendar) pour séances coach et client
- [ ] Route `GET /api/seances/export/ics`
- [ ] Synchronisation unidirectionnelle Google Calendar (minimum)
- [ ] Configuration OAuth2 Google (ou mock en dev)
- [ ] Endpoint `POST /api/calendar/sync` pour full sync

## Tâches — Notifications

- [ ] Modèle `Notification` (type, utilisateur, lue, données JSON)
- [ ] API notifications : rappel séance (J-1, J)
- [ ] Notifications annulation/modification séance
- [ ] Notifications fin pack/abonnement imminent
- [ ] Endpoint `GET /api/notifications` (inbox utilisateur)
- [ ] Endpoint `PUT /api/notifications/{id}/read`

## Fichiers à créer/modifier

- Migration `create_notifications_table`
- `/app/Models/Notification.php`
- `/app/Http/Controllers/CalendarController.php`
- `/app/Http/Controllers/NotificationController.php`
- `/routes/api.php`

## Tests

- [ ] Test export ICS génération
- [ ] Test Google Calendar sync
- [ ] Test notification creation
- [ ] Test notification read/unread
- [ ] Min 70% coverage

## Definition of Done

- ✅ Export ICS valide et lisible par Outlook/Google
- ✅ Notifications créées et délivrées
- ✅ Tests d'intégration passent

## Branche

`feature/v3-agenda-notifications`

## Commits suggérés
```

feat(agenda): add ICS export functionality
feat(calendar): implement Google Calendar sync
feat(notifications): add notification system with reminders
test(calendar): add calendar sync tests
test(notifications): add notification tests

```

```

---

### Issue #21 — Messagerie (Individuelle + Groupe)

**Titre** : `[FEATURE] Messagerie V3 — Individuelle & Groupée`

**Labels** : `feature`, `devB`, `8-points`

**Assignee** : Dev B

**Milestone** : Version 3 — Phase Finale Backend

**Description** :

```markdown
## Objectif

Implémenter système de messagerie 1-to-1 et groupée (par groupes/tags).

## Tâches — Messagerie Individuelle

- [ ] Modèle `Conversation` (user_id, coach_id, derniere_date)
- [ ] Modèle `Message` (conversation_id, from_id, contenu, date)
- [ ] Route `GET /api/conversations` — lister conversations utilisateur
- [ ] Route `POST /api/conversations/{id}/messages` — envoyer message
- [ ] Route `GET /api/conversations/{id}/messages` — pagination messages

## Tâches — Messagerie Groupe

- [ ] Modèle `GroupMessage` (groupe_id, from_id, contenu, date)
- [ ] Route `GET /api/groups/{id}/messages` — lister messages groupe
- [ ] Route `POST /api/groups/{id}/messages` — envoyer dans le groupe
- [ ] Notifier tous les membres du groupe
- [ ] Archivage messages (soft delete)

## Tâches — Sécurité

- [ ] Middleware : utilisateur voit uniquement ses conversations
- [ ] Middleware : client voit messages de son groupe seulement
- [ ] Audit : logging des messages critiques

## Fichiers à créer/modifier

- Migrations `create_conversations_table`, `create_messages_table`, `create_group_messages_table`
- `/app/Models/Conversation.php`
- `/app/Models/Message.php`
- `/app/Models/GroupMessage.php`
- `/app/Http/Controllers/MessageController.php`
- `/app/Http/Middleware/CheckConversationAccess.php`

## Tests

- [ ] Test create conversation
- [ ] Test send/receive message
- [ ] Test group messaging
- [ ] Test permissions (utilisateur voit ses messages)
- [ ] Min 75% coverage

## Definition of Done

- ✅ Messagerie 1-to-1 fonctionnelle
- ✅ Messagerie groupe opérationnelle
- ✅ Tests d'autorisation passent
- ✅ Pagination messages testée

## Branche

`feature/v3-messaging`

## Commits suggérés
```

feat(messaging): add conversation model and API
feat(messaging): add message system 1-to-1
feat(messaging): add group messaging
feat(messaging): add access middleware
test(messaging): add messaging tests

```

```

---

### Issue #22 — Boutique (Produits, Stock, Commandes)

**Titre** : `[FEATURE] Boutique V3 — Catalogue, Stock, Commandes`

**Labels** : `feature`, `devB`, `8-points`

**Assignee** : Dev B

**Milestone** : Version 3 — Phase Finale Backend

**Description** :

```markdown
## Objectif

Implémenter boutique en ligne avec produits, stock et gestion commandes.

## Tâches — Produits & Catalogue

- [ ] Modèle `Produit` (coach_id, nom, description, type, prix, stock, visible)
- [ ] Types : physique, numérique, service
- [ ] Route `GET /api/produits` — catalog (avec filtres)
- [ ] Route `POST /api/produits` — créer produit (coach)
- [ ] Route `PUT/DELETE /api/produits/{id}` — modifier/archiver produit

## Tâches — Stock

- [ ] Colonne `stock_quantite` et `alerte_stock` dans Produit
- [ ] Methods de décrémentation stock (transactionnel)
- [ ] Alerte quand stock < alerte_stock
- [ ] Route `GET /api/produits/{id}/stock` — état stock

## Tâches — Commandes

- [ ] Migration `create_commandes_table` (client_id, coach_id, date, statut, total)
- [ ] Migration `create_commande_items_table` (commande_id, produit_id, quantite, prix_unitaire)
- [ ] Modèle `Commande` + `CommandeItem`
- [ ] Route `POST /api/commandes` — créer commande
- [ ] Route `GET /api/commandes` — lister commandes (client/coach)
- [ ] Route `PUT /api/commandes/{id}/status` — modifier statut (attente → envoyé → livré)

## Fichiers à créer/modifier

- Migrations produits, commandes, commande_items
- `/app/Models/Produit.php`
- `/app/Models/Commande.php`
- `/app/Models/CommandeItem.php`
- `/app/Http/Controllers/ShopController.php`
- `/app/Http/Controllers/CommandeController.php`

## Tests

- [ ] Test CRUD produits
- [ ] Test stock management
- [ ] Test create commande
- [ ] Test stock décrémentation
- [ ] Test permissions (coach voit ses produits)
- [ ] Min 75% coverage

## Definition of Done

- ✅ Boutique CRUD fonctionnelle
- ✅ Stock géré transactionnellement
- ✅ Commandes créées et suivies
- ✅ Tests d'intégration passent

## Branche

`feature/v3-boutique`

## Commits suggérés
```

feat(shop): add product model and catalog
feat(shop): add stock management system
feat(shop): add order creation and tracking
test(shop): add shop and order tests

```

```

---

### Issue #23 — Dashboards & Reporting Business

**Titre** : `[FEATURE] Dashboards V3 — KPI & Reporting`

**Labels** : `feature`, `devA`, `8-points`

**Assignee** : Dev A

**Milestone** : Version 3 — Phase Finale Backend

**Dépend de** : #12, #15, #18, #22

**Description** :

```markdown
## Objectif

Implémenter endpoints de reporting pour dashboards business.

## Tâches — KPI Coach

- [ ] Method `Coach::getCATotal($period)` — CA par période (jour/mois/an)
- [ ] Method `Coach::getTauxRemplissage($period)` — % séances remplies
- [ ] Method `Coach::getFidelisation()` — % clients actifs vs churned
- [ ] Method `Coach::getPanierMoyen()` — CA moyen par client
- [ ] Method `Coach::getTopOffers()` — ofertes les plus vendues
- [ ] Données brutes et graphes (données pour courbes)

## Tâches — KPI Client

- [ ] Method `Client::getSeancesConsommees()` — total séances utilisées
- [ ] Method `Client::getProgressionData()` — évolution weights/reps/performance
- [ ] Method `Client::getFacturationTotal()` — montant dépensé
- [ ] Historique achats produits

## Tâches — Endpoints Reporting

- [ ] Route `GET /api/coach/dashboard/kpis` — tous les KPI coach
- [ ] Route `GET /api/coach/dashboard/ca?period=month` — CA by period
- [ ] Route `GET /api/coach/dashboard/taux-remplissage?period=month`
- [ ] Route `GET /api/client/dashboard/progression` — progression client
- [ ] Route `GET /api/client/dashboard/historique` — historique achats

## Fichiers à modifier

- `/app/Models/Coach.php` → Methods KPI
- `/app/Models/Client.php` → Methods progression
- `/app/Http/Controllers/DashboardController.php` (NEW)
- `/routes/api.php`

## Tests

- [ ] Test KPI calculations
- [ ] Test dashboard endpoints
- [ ] Test data aggregation correctness
- [ ] Min 70% coverage

## Definition of Done

- ✅ Tous les KPI calculés correctement
- ✅ Endpoints retournent JSON frontend-ready
- ✅ Données agrégées en cache (performance)
- ✅ Tests d'intégration passent

## Branche

`feature/v3-dashboards`

## Commits suggérés
```

feat(dashboard): add KPI calculation methods
feat(dashboard): add coach dashboard endpoints
feat(dashboard): add client progression endpoints
test(dashboard): add KPI and dashboard tests

```

```

---

### Issue #24 — Intégrations Données Sportives (Mock Garmin/Strava)

**Titre** : `[FEATURE] Intégrations V3 — Mock Garmin/Strava (API Données Sportives)`

**Labels** : `feature`, `devB`, `8-points`

**Assignee** : Dev B

**Milestone** : Version 3 — Phase Finale Backend

**Description** :

```markdown
## Objectif

Implémenter intégration mock de données sportives (Garmin/Strava) avec corrélation séances.

## Tâches — Modèle Données Sportives

- [ ] Modèle `SportsData` (client_id, source, distance, time, calories, heart_rate, timestamp)
- [ ] Modèle `WorkoutSession` (relation avec SportsData et Seance)
- [ ] Migrations pour stocker les données

## Tâches — API Mock Garmin/Strava

- [ ] Endpoint `POST /api/sports-data/import` — import données (mock)
- [ ] Generateur données mock (distance, temps, HR, calories)
- [ ] Correlation : matcher SportsData avec Seance (by timestamp)
- [ ] Stockage données brutes

## Tâches — Analytics

- [ ] Method `Client::getProgressionMetrics()` — tendance distance/HR/temps
- [ ] Method `Seance::getPerformanceData()` — data de la séance (avg HR, calories, temps)
- [ ] Endpoint `GET /api/client/analytics/progression` — graphe progression
- [ ] Comparison avant/après programme

## Fichiers à créer/modifier

- Migrations `create_sports_data_table`
- `/app/Models/SportsData.php`
- `/app/Http/Controllers/SportsDataController.php`
- `/app/Services/SportsDataImporter.php` (mock)
- `/routes/api.php`

## Tests

- [ ] Test import données mock
- [ ] Test correlation Seance ↔ SportsData
- [ ] Test progression calculation
- [ ] Test analytics endpoints
- [ ] Min 70% coverage

## Definition of Done

- ✅ Import mock fonctionne
- ✅ Données corrélées avec séances
- ✅ Progression calculée correctement
- ✅ Tests d'intégration passent

## Branche

`feature/v3-sports-integrations`

## Commits suggérés
```

feat(sports): add sports data import (mock Garmin/Strava)
feat(sports): implement data correlation with sessions
feat(sports): add progression analytics
test(sports): add sports data integration tests

```

```

---

### Issue #25 — Durcissement Sécurité & Permissions Globales

**Titre** : `[FEATURE] Sécurité V3 — Hardening Autorisations Globales`

**Labels** : `feature`, `devA`, `5-points`

**Assignee** : Dev A

**Milestone** : Version 3 — Phase Finale Backend

**Dépend de** : #13

**Description** :

```markdown
## Objectif

Appliquer sécurité et autorisation systématiquement sur toute l'API.

## Tâches — Authorization Middleware

- [ ] Middleware `CheckResourceOwnership` — générique pour toutes ressources
- [ ] Appliquer middleware à toutes routes protected
- [ ] Vérifier : coach voit UNIQUEMENT ses données
- [ ] Vérifier : client voit UNIQUEMENT ses données
- [ ] Vérifier : admin accès complet (avec audit)

## Tâches — API Security

- [ ] Rate limiting : 60 req/minute par utilisateur
- [ ] CORS configuration stricte
- [ ] Validation input systématique (Laravel Requests)
- [ ] SQL injection prevention (use Eloquent ORM partout)
- [ ] CSRF tokens (si nécessaire)

## Tâches — Audit & Logging

- [ ] Logger toutes actions critiques (create/update/delete)
- [ ] Logger tentatives accès non-autorisé
- [ ] Logger erreurs 500
- [ ] Endpoint `GET /api/admin/audit-log` (admin only)
- [ ] Rotation logs (conservation 30 jours)

## Fichiers à modifier

- `/app/Http/Middleware/CheckResourceOwnership.php`
- `/app/Http/Middleware/RateLimit.php`
- `/config/cors.php`
- `/app/Exceptions/ApiExceptionHandler.php`
- Middleware appliqué sur routes API

## Tests

- [ ] Test authorization sur chaque endpoint protégé
- [ ] Test rate limiting
- [ ] Test CORS headers
- [ ] Test input validation
- [ ] Test audit logging
- [ ] Min 80% coverage sécurité

## Definition of Done

- ✅ Aucun endpoint sans protection
- ✅ Tests d'autorisation passent
- ✅ Audit logging fonctionnel
- ✅ Rate limiting actif

## Branche

`feature/v3-security-hardening`

## Commits suggérés
```

feat(security): add comprehensive authorization checks
feat(security): implement rate limiting
feat(security): add audit logging system
test(security): add security and authorization tests

```

```

---

### Issue #26 — Performance API & Optimisations

**Titre** : `[FEATURE] Performance V3 — API Optimization & Caching`

**Labels** : `feature`, `devA`, `5-points`

**Assignee** : Dev A

**Milestone** : Version 3 — Phase Finale Backend

**Dépend de** : #12-#25

**Description** :

```markdown
## Objectif

Optimiser performance API pour respecter SLA < 500ms.

## Tâches — Query Optimization

- [ ] Audit requêtes N+1 (Debugbar/Query profiler)
- [ ] Eager loading systématique (::with())
- [ ] Indexes BDD sur clés étrangères
- [ ] Select() colonnes nécessaires uniquement
- [ ] Pagination endpoints lourds (max 100/page)

## Tâches — Caching

- [ ] Cache KPI/Dashboard (ttl 1h)
- [ ] Cache catalog produits (ttl 1h)
- [ ] Cache user permissions (ttl 30min)
- [ ] Redis config (si disponible)
- [ ] Invalidation cache on update

## Tâches — Testing Performance

- [ ] Benchmark endpoints clés (< 500ms)
- [ ] Load test : 100 concurrent users
- [ ] Monitoring API response times
- [ ] Report de baseline performance

## Fichiers à modifier

- `/app/Http/Controllers/*` — eager loading
- `/database/migrations/*` — ajouter indexes
- `/config/cache.php`
- Tests performance

## Tests

- [ ] Performance tests endpoints clés
- [ ] Vérifier pagination
- [ ] Test cache hit/miss
- [ ] Load testing results

## Definition of Done

- ✅ 90% endpoints < 500ms
- ✅ N+1 queries éliminées
- ✅ Cache stratégies implémentées
- ✅ Performance tests passent

## Branche

`feature/v3-performance`

## Commits suggérés
```

feat(perf): add eager loading and query optimization
feat(perf): implement caching strategies
feat(perf): add performance monitoring
test(perf): add performance and load tests

```

```

---

### Issue #27 — Stabilisation Finale, Recette & Documentation V3

**Titre** : `[FEATURE] Stabilisation V3 — Recette UAT, Tests, Documentation`

**Labels** : `feature`, `documentation`, `devA+B`, `5-points`

**Assignee** : Dev A + Dev B

**Milestone** : Version 3 — Phase Finale Backend

**Dépend de** : #12-#26

**Description** :

```markdown
## Objectif

Stabiliser version finale V3, compléter tests et documentation pour recette client.

## Tâches — Tests Finaux

- [ ] Tous les tests passent (php artisan test)
- [ ] Coverage >= 80% (tous modules)
- [ ] Zéro warning / errors
- [ ] Recette manuelle : tous use cases
- [ ] Regression testing

## Tâches — Documentation

- [ ] API documentation complète (Swagger/OpenAPI)
- [ ] Architecture et design decisions
- [ ] Setup guide backend (installation, config, deploy)
- [ ] Troubleshooting & common issues
- [ ] Database schema documentation
- [ ] Modèles de données détaillés
- [ ] Endpoints API exhaustive list

## Tâches — Quality Assurance

- [ ] Code review final par binôme
- [ ] Linting : 0 warnings (`php artisan lint`)
- [ ] Style PSR-12 vérifié
- [ ] Migrations check (rollback/forward)
- [ ] Seeders data check

## Tâches — Deployment Readiness

- [ ] Environment config (.env.example)
- [ ] Database backup strategy
- [ ] Error monitoring setup
- [ ] Logs rotation configured
- [ ] Health check endpoint `GET /api/health`

## Fichiers à créer/modifier

- `/README_V3.md` — documentation complète
- `/docs/API.md` — endpoints documentation
- `/docs/ARCHITECTURE.md`
- `/docs/SETUP.md` — guide d'installation
- `/docs/DEPLOYMENT.md` — guide déploiement
- Swagger config (si applicable)

## Tests

- [ ] Full regression test
- [ ] All edge cases tested
- [ ] Performance validates
- [ ] Security review passed

## Definition of Done

- ✅ Backend V3 stable et prêt recette
- ✅ Documentation complète
- ✅ Tests >= 80% coverage
- ✅ Zéro critical issues
- ✅ Prêt intégration Frontend
- ✅ Acceptable UAT client

## Branche

`release/v3-final`

## Commits suggérés
```

test(v3): add final regression tests
docs(v3): add complete API documentation
docs(v3): add setup and deployment guides
chore(v3): final code review and cleanup

```

```

---

## 📊 RÉSUMÉ COMPLET V3

| Issue   | Module                   | Dev     | Points | Dépend de              |
| ------- | ------------------------ | ------- | ------ | ---------------------- |
| #12     | Offre/Contrat            | A       | 3      | -                      |
| #13     | Auth/Middleware          | A       | 5      | #12                    |
| #14     | Tests Exercice/Paiement  | A       | 5      | -                      |
| #15     | Export/Metrics           | A       | 3      | #12                    |
| #16     | Seance/Présence          | B       | 5      | -                      |
| #17     | Programme                | B       | 5      | Exercice               |
| #18     | Facture PDF              | B       | 8      | -                      |
| #19     | Tests Seance/Client      | B       | 8      | #16, #17               |
| **#20** | **Agenda/Notifications** | **A**   | **8**  | **#12, #16**           |
| **#21** | **Messagerie**           | **B**   | **8**  | **-**                  |
| **#22** | **Boutique**             | **B**   | **8**  | **-**                  |
| **#23** | **Dashboards**           | **A**   | **8**  | **#12, #15, #18, #22** |
| **#24** | **Sports Data**          | **B**   | **8**  | **-**                  |
| **#25** | **Sécurité**             | **A**   | **5**  | **#13**                |
| **#26** | **Performance**          | **A**   | **5**  | **#12-#25**            |
| **#27** | **Stabilisation/Doc**    | **A+B** | **5**  | **#12-#26**            |

**Total** : 121 story points  
**Durée estimée** : 4-5 semaines  
**Dev A** : 54 points  
**Dev B** : 67 points  
**Livrable** : Version 3 backend complète + tests + documentation
