# Architecture Backend V3

## Stack

- Framework: Laravel 11
- Auth: Laravel Sanctum
- DB: MySQL (tests: SQLite in-memory)
- Tests: Pest + PHPUnit
- Runtime: PHP 8.2+

## Couches

- Routes API: routes/api.php
- Controllers: app/Http/Controllers
- Models Eloquent: app/Models
- Middleware: app/Http/Middleware
- Exceptions API: app/Exceptions/ApiExceptionHandler.php

## Domaines fonctionnels

- Core: users, roles, auth
- Business: offres, contrats, paiements, factures
- Coaching: seances, presence, programmes
- Communication: notifications, messagerie
- Commerce: produits, commandes
- Reporting: dashboards coach/client
- Integrations: sports-data mock

## Securite

- Role middleware (coach/client/gym_manager + alias legacy admin)
- Ownership middleware (ressources sensibles)
- RateLimit middleware (60 req/min)
- Audit middleware (actions critiques)
- CORS durci configurable par env

## Performance

- Cache dashboard (1h)
- Cache catalogue (1h)
- Cache permissions (30 min)
- Monitoring temps de reponse (X-Response-Time-ms)
- Index SQL cibles sur tables critiques
- Pagination endpoints lourds (max 100)

## Observabilite

- Logs applicatifs: channel stack
- Logs audit: channel audit
- Logs performance: channel performance

## Flux type requete API

1. Auth sanctum
2. Rate limit
3. Audit write actions
4. Monitoring temps reponse
5. Middleware role/ownership
6. Controller + modele + DB/cache
7. Reponse JSON standard
