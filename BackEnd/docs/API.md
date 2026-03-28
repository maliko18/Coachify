# API V3 - Reference Backend

## Base URL

- Local: http://127.0.0.1:8000/api

## Health

- GET /health
- Auth: non
- Reponse:
  - success: bool
  - status: ok
  - service: string
  - timestamp: ISO8601

## Auth

- POST /register
- POST /login
- POST /logout
- POST /forgot-password
- POST /reset-password
- GET /user

## Dashboard

### Coach

- GET /coach/dashboard/kpis?period=day|month|year
- GET /coach/dashboard/ca?period=day|month|year
- GET /coach/dashboard/taux-remplissage?period=day|month|year

### Client

- GET /client/dashboard/progression
- GET /client/dashboard/historique
- GET /client/analytics/progression

## Boutique

- GET /produits
- GET /produits/{produit}
- GET /produits/{produit}/stock
- POST /produits (coach)
- PUT /produits/{produit} (coach proprietaire)
- DELETE /produits/{produit} (coach proprietaire)

## Commandes

- GET /commandes
- POST /commandes
- PUT /commandes/{commande}/status (coach proprietaire)

## Agenda / Notifications

- GET /seances/export/ics
- POST /calendar/sync
- GET /notifications
- PUT /notifications/{notification}/read

## Messagerie

- GET /conversations
- POST /conversations
- GET /conversations/{conversation}/messages
- POST /conversations/{conversation}/messages
- GET /groups/{group}/messages
- POST /groups/{group}/messages

## Administration

- GET /admin/users
- GET /admin/audit-log

## Règles transverses

- Auth: sanctum sur routes protegees
- Rate limiting: 60 req/min/user
- Monitoring perf: header X-Response-Time-ms
- Pagination lourde: parametre per_page plafonne a 100
- Reponses erreurs JSON standardisees
