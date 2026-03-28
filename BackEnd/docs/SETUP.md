# Setup Backend V3

## Prerequis

- PHP >= 8.2
- Composer >= 2
- MySQL >= 8

## Installation

1. Aller dans le dossier backend

```bash
cd BackEnd
```

2. Installer les dependances

```bash
composer install
```

3. Configurer l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

4. Configurer la base de donnees dans .env

- DB_CONNECTION
- DB_HOST
- DB_PORT
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD

5. Migrer et seeder

```bash
php artisan migrate
php artisan db:seed --class=RoleSeeder
```

## Variables recommandees

```dotenv
APP_ENV=local
APP_DEBUG=true
CACHE_STORE=failover
LOG_CHANNEL=stack
LOG_STACK=single,audit,performance
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
LOG_DAILY_DAYS=30
LOG_AUDIT_DAYS=30
LOG_PERF_DAYS=30
```

## Execution

```bash
php artisan serve
```

## Verification rapide

- GET /api/health doit retourner status=ok
- GET /api/user avec token valide doit retourner l'utilisateur
