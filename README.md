# Coachify - Plateforme de coaching sportif (Web)

Coachify est une plateforme full-stack de coaching sportif composee de:

- un backend API REST en Laravel
- un frontend SPA en React + TypeScript

Le projet couvre les parcours metier principaux:

- authentification et roles (prospect, client, coach)
- reservation et paiement
- offres, programmes, seances, exercices
- messagerie et notifications
- dashboards coach/client
- wallet, factures et boutique

## Sommaire

- [1. Architecture du projet](#1-architecture-du-projet)
- [2. Stack technique](#2-stack-technique)
- [3. Prerequis](#3-prerequis)
- [4. Installation rapide](#4-installation-rapide)
- [5. Configuration environnement](#5-configuration-environnement)
- [6. Lancer le projet en local](#6-lancer-le-projet-en-local)
- [7. Comptes de test et seed](#7-comptes-de-test-et-seed)
- [8. Scripts utiles](#8-scripts-utiles)
- [9. Documentation disponible](#9-documentation-disponible)
- [10. Depannage](#10-depannage)
- [11. Releases](#11-releases)

## 1. Architecture du projet

```text
archiweb_2026_projets_gr05/
  BackEnd/        # API Laravel 11
  FrontEnd/       # Application React + TypeScript (Vite)
  documentation/  # Documentation backend/frontend
```

Flux standard:

1. Le frontend appelle l'API Laravel via Axios.
2. L'auth est geree via Sanctum (token).
3. Les routes frontend protegees filtrent selon l'etat de connexion et le role.

## 2. Stack technique

- Frontend: React 18+, TypeScript 5+, Vite 6+, TailwindCSS 4+
- Backend: Laravel 11, PHP 8.2+, Sanctum
- Base de donnees: MySQL 8+
- Tests: Pest PHP

## 3. Prerequis

Installez au minimum:

- PHP 8.2+
- Composer 2+
- Node.js 18+ et npm
- MySQL 8+

Verification rapide:

```bash
php -v
composer -V
node -v
npm -v
mysql --version
```

## 4. Installation rapide

### 4.1 Backend

```bash
cd BackEnd
composer install
cp .env.example .env
php artisan key:generate
```

Configurez ensuite la base de donnees dans BackEnd/.env:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coaching_fitness
DB_USERNAME=root
DB_PASSWORD=
```

Puis lancez les migrations et seeders:

```bash
php artisan migrate
php artisan db:seed
```

### 4.2 Frontend

```bash
cd FrontEnd
npm install
```

## 5. Configuration environnement

### 5.1 Backend (.env)

Champs critiques a verifier:

- APP_URL
- DB\_\*
- CORS (origines frontend)
- variables de rate limit API (si presentes)

Exemple CORS (selon votre setup local):

```dotenv
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173
```

### 5.2 Frontend

Si un fichier .env frontend est utilise, verifiez la base URL API.
Exemple courant:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## 6. Lancer le projet en local

Ouvrez 2 terminaux:

Terminal 1 (backend):

```bash
cd BackEnd
php artisan serve
```

Terminal 2 (frontend):

```bash
cd FrontEnd
npm run dev
```

Acces local:

- Frontend: http://127.0.0.1:5173
- API backend: http://127.0.0.1:8000/api

## 7. Comptes de test et seed

Les comptes de test dependent des seeders actifs.
Pour regenerer proprement les donnees:

```bash
cd BackEnd
php artisan migrate:fresh --seed
```

Si vous avez des seeders specifiques (RoleSeeder, ProduitSeeder, etc.), vous pouvez aussi les lancer individuellement.

## 8. Scripts utiles

### Backend

```bash
cd BackEnd
php artisan test
php artisan optimize:clear
php artisan route:list
```

### Frontend

```bash
cd FrontEnd
npm run dev
npm run build
npm run preview
npm run lint
```

## 9. Documentation disponible

- Documentation API: documentation/backend_doc/GUIDE_FRONTEND_API.md
- Collection API: documentation/backend_doc/postman_collection.json
- Tests HTTP: documentation/backend_doc/api-tests.http
- Types TS API: documentation/backend_doc/api-types.ts
- Documentation backend detaillee:
  - BackEnd/docs/API.md
  - BackEnd/docs/ARCHITECTURE.md
  - BackEnd/docs/SETUP.md
  - BackEnd/docs/DEPLOYMENT.md

## 10. Depannage

### Erreur 401/403

- Verifiez le token de connexion.
- Verifiez le role utilisateur (coach vs client).
- Verifiez les guards frontend et middlewares backend.

### Erreur CORS

- Verifiez les origines autorisees cote backend.
- Verifiez la base URL frontend vers l'API.

### Erreur base de donnees

- Verifiez DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD.
- Relancez:

```bash
cd BackEnd
php artisan migrate
php artisan db:seed
```

### Trop de requetes

- Verifiez la config du middleware de rate limit.
- Nettoyez le cache:

```bash
cd BackEnd
php artisan optimize:clear
```

## 11. Releases

- Release v3: voir RELEASE_v3.0.0.md

## Equipe

Projet realise dans le cadre du cursus ArchiWeb.
