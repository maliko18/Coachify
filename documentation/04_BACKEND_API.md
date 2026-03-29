# 04 - Documentation API backend

Source: [BackEnd/routes/api.php](../BackEnd/routes/api.php)

## Middleware globaux

Toutes les routes protegees passent par:

- auth:sanctum
- api_rate_limit
- audit_api_actions
- monitor_api_performance

## A. Routes publiques

| Methode | Endpoint         | Description                                |
| ------- | ---------------- | ------------------------------------------ |
| GET     | /api/health      | Sante service                              |
| \*      | /api/\* auth.php | login/register/password (fichier auth.php) |

## B. Routes transverses (auth requis)

| Methode | Endpoint                     | Description               |
| ------- | ---------------------------- | ------------------------- |
| GET     | /api/coaches                 | Annuaire coachs           |
| GET     | /api/user                    | Utilisateur courant       |
| PUT     | /api/user                    | Mise a jour profil        |
| PUT     | /api/user/password           | Mise a jour mot de passe  |
| GET     | /api/notifications           | Notifications utilisateur |
| PUT     | /api/notifications/{id}/read | Marquer notification lue  |

## C. Boutique / commandes

| Methode | Endpoint                 | Description        |
| ------- | ------------------------ | ------------------ |
| GET     | /api/produits            | Catalogue produits |
| GET     | /api/produits/{id}       | Detail produit     |
| GET     | /api/produits/{id}/stock | Stock produit      |
| GET     | /api/commandes           | Liste commandes    |
| POST    | /api/commandes           | Creer commande     |

Coach uniquement:

- POST /api/produits
- PUT /api/produits/{id}
- DELETE /api/produits/{id}
- PUT /api/commandes/{id}/status

## D. Messagerie

| Methode | Endpoint                         | Description            |
| ------- | -------------------------------- | ---------------------- |
| GET     | /api/conversations               | Liste conversations    |
| POST    | /api/conversations               | Creer conversation     |
| GET     | /api/conversations/{id}/messages | Messages conversation  |
| POST    | /api/conversations/{id}/messages | Envoyer message        |
| GET     | /api/groups/{id}/messages        | Messages groupe        |
| POST    | /api/groups/{id}/messages        | Envoyer message groupe |

## E. Calendar et integrations

| Methode | Endpoint                | Description              |
| ------- | ----------------------- | ------------------------ |
| GET     | /api/seances/export/ics | Export agenda ICS        |
| POST    | /api/calendar/sync      | Sync calendrier externe  |
| POST    | /api/sports-data/import | Import data sport (mock) |

## F. Espace coach (/api/coach/\*)

KPIs dashboard:

- GET /api/coach/dashboard/kpis
- GET /api/coach/dashboard/ca
- GET /api/coach/dashboard/taux-remplissage

Ressources coach:

- clients (apiResource)
- offres (apiResource)
- contrats (apiResource)
- seances (apiResource)
- exercices (apiResource)
- paiements (apiResource)
- programmes (apiResource)
- factures (apiResource)

Actions metier coach (selection):

- contrats expiration: GET /api/coach/contrats-expiration
- seances inscrire/desinscrire/presence/feedback
- paiements valider/rembourser/annuler/statistiques
- programmes publier/depublier/archiver/dupliquer
- factures emettre/payer/annuler/pdf/send-email/en-retard/stats

## G. Espace client (/api/client/\*)

| Methode | Endpoint                            | Description                 |
| ------- | ----------------------------------- | --------------------------- |
| GET     | /api/client/info                    | Infos client                |
| GET     | /api/client/offres                  | Offres disponibles          |
| GET     | /api/client/seances                 | Mes seances                 |
| GET     | /api/client/programmes              | Programmes                  |
| GET     | /api/client/programmes/reservations | Mes reservations programmes |
| GET     | /api/client/dashboard/progression   | Dashboard progression       |
| GET     | /api/client/dashboard/historique    | Dashboard historique        |
| GET     | /api/client/analytics/progression   | Analytics progression       |
| POST    | /api/client/seances/{id}/feedback   | Feedback client             |

## H. Test routes programmes

- GET /api/test/programmes
- POST /api/test/programmes/{programme}/reserve
- GET /api/test/programmes/reservations

## I. Espace gym manager (/api/gym/*)

Routes protegees par middleware is_gym_manager.

| Methode | Endpoint                    | Description                                             |
| ------- | --------------------------- | ------------------------------------------------------- |
| GET     | /api/gym/dashboard          | KPIs globaux salle (users, coachs, clients, stock)     |
| GET     | /api/gym/users              | Liste utilisateurs (filtres recherche/role/statut)      |
| GET     | /api/gym/users/{userId}     | Detail utilisateur (roles + relations coach/client)     |
| PUT     | /api/gym/users/{userId}/roles | Mise a jour roles utilisateur                          |
| POST    | /api/gym/users/{userId}/ban | Bannir (soft-delete) un utilisateur                     |
| POST    | /api/gym/users/{userId}/unban | Reactiver un utilisateur banni                        |
| GET     | /api/gym/seances            | Supervision seances (coach, statut, capacite, inscrits)|
| GET     | /api/gym/equipements        | Inventaire equipements (stock/alerte, filtre low stock)|

Compatibilite legacy frontend:

- Les anciennes routes /admin/* sont redirigees cote frontend vers /gym/*.
- Aucune route /api/admin/* active dans la configuration actuelle.

## J. Bonnes pratiques integration frontend

- Toujours passer le token auth pour routes protegees.
- Traiter les erreurs 401/403/422 cote UI.
- Pour ressources ownership (offres, produits, etc.), l'API peut refuser la modification hors perimetre coach.
