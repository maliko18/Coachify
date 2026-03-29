# 02 - Guide d'installation et demarrage

## Prerequis

- PHP 8.2+
- Composer 2+
- Node.js 18+
- npm
- MySQL 8+

## 1) Installation backend

```bash
cd BackEnd
composer install
cp .env.example .env
php artisan key:generate
```

Configurer la base dans BackEnd/.env:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coaching_fitness
DB_USERNAME=root
DB_PASSWORD=
```

Migrer et seeder:

```bash
php artisan migrate
php artisan db:seed
```

Comptes de test pour login (seed local):

| Role | Email | Mot de passe |
| --- | --- | --- |
| gym_manager (admin legacy) | admin@coachapp.fr | admin123 |
| coach | coach.jean@coachapp.fr | coach123 |
| client | client.sophie@example.com | client123 |

Si besoin de reinitialiser rapidement les comptes de test:

```bash
php artisan migrate:fresh --seed
```

Lancer API:

```bash
php artisan serve
```

API dispo sur http://127.0.0.1:8000/api

## 2) Installation frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Frontend dispo sur http://127.0.0.1:5173

## 3) Variables importantes

Backend (.env):

- APP_URL
- DB\_\*
- CORS
- variables rate limit API

Frontend (.env si utilise):

- VITE_API_BASE_URL=http://127.0.0.1:8000/api

## 4) Commandes utiles

Backend:

```bash
cd BackEnd
php artisan test
php artisan optimize:clear
php artisan route:list
```

Frontend:

```bash
cd FrontEnd
npm run lint
npm run build
npm run preview
```

## 5) Verification rapide

- login fonctionne
- redirection role-aware (coach vers /coach/dashboard, user/client vers /user/dashboard)
- routes protegees ne sont pas accessibles sans token
- booking + paiement + commande fonctionnent
- messagerie charge les conversations
