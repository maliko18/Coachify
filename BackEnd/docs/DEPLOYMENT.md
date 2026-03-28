# Deployment Backend V3

## Cible

Deployment PHP-FPM + Nginx/Apache, DB MySQL, cache Redis optionnel.

## Checklist pre-deploiement

- APP_ENV=production
- APP_DEBUG=false
- APP_KEY renseignee
- CORS_ALLOWED_ORIGINS restreint aux domaines frontend
- LOG_CHANNEL=stack
- CACHE_STORE=failover (redis si disponible)
- Migrations executees

## Build & release

1. Installer dependances prod

```bash
composer install --no-dev --optimize-autoloader
```

2. Optimiser Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. Migration

```bash
php artisan migrate --force
```

4. Permissions

- storage/ et bootstrap/cache/ ecriture autorisee

## Verification post-deploiement

- GET /api/health -> status ok
- Auth login/logout fonctionnel
- Endpoint dashboard coach repond < 500ms mediane locale
- Logs audit/performance ecrits correctement

## Monitoring

- Analyser storage/logs/audit-*.log
- Analyser storage/logs/performance-*.log
- Alerter si SLA > 500ms frequent

## Backup & rollback

- Backup DB avant migration
- Tag git release avant mise en production
- Rollback migration si incident critique
