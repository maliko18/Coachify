# 🏋️ API Backend - Coaching Fitness

API REST Laravel pour l'application de coaching fitness.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **PHP** >= 8.2
- **Composer** >= 2.x
- **MySQL** >= 8.0 (ou MariaDB >= 10.4)
- **Node.js** >= 18.x (optionnel, pour les assets)

### Vérifier les versions

```bash
php -v          # PHP 8.2+
composer -V     # Composer 2.x
mysql --version # MySQL 8.0+
```

---

## 🚀 Installation

### 1. Cloner et accéder au projet

```bash
cd BackEnd
```

### 2. Installer les dépendances PHP

```bash
composer install
```

### 3. Configurer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 4. Configurer la base de données

Ouvrez le fichier `.env` et modifiez les paramètres de connexion :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coaching_fitness
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### 5. Créer la base de données

#### Option A : Via MySQL CLI

```bash
mysql -u root -p
```

```sql
CREATE DATABASE coaching_fitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Option B : Via phpMyAdmin (WAMP/XAMPP)

1. Accédez à `http://localhost/phpmyadmin`
2. Cliquez sur "Nouvelle base de données"
3. Nom : `coaching_fitness`
4. Interclassement : `utf8mb4_unicode_ci`
5. Cliquez sur "Créer"

### 6. Exécuter les migrations et seeders

```bash
# Créer les tables
php artisan migrate

# (Optionnel) Peupler avec des données de test
php artisan db:seed
```

### 7. Lancer le serveur de développement

```bash
php artisan serve
```

L'API sera accessible sur : **http://127.0.0.1:8000**


## 📡 Endpoints API

Base URL : `http://127.0.0.1:8000/api`

### 🔐 Authentification

| Méthode | Endpoint                           | Description                         | Auth |
| ------- | ---------------------------------- | ----------------------------------- | ---- |
| `POST`  | `/register`                        | Inscription d'un nouvel utilisateur | ❌   |
| `POST`  | `/login`                           | Connexion                           | ❌   |
| `POST`  | `/logout`                          | Déconnexion                         | ✅   |
| `POST`  | `/forgot-password`                 | Demande de réinitialisation         | ❌   |
| `POST`  | `/reset-password`                  | Réinitialiser le mot de passe       | ❌   |
| `GET`   | `/verify-email/{id}/{hash}`        | Vérifier l'email                    | ✅   |
| `POST`  | `/email/verification-notification` | Renvoyer l'email de vérification    | ✅   |

### 👤 Utilisateur

| Méthode | Endpoint | Description                      | Auth |
| ------- | -------- | -------------------------------- | ---- |
| `GET`   | `/user`  | Récupérer l'utilisateur connecté | ✅   |

---

## 📝 Détails des Endpoints

### POST `/api/register`

Inscription d'un nouvel utilisateur (prospect ou coach).

**Request Body :**

```json
{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!",
    "password_confirmation": "MotDePasse123!",
    "role": "user"
}
```

| Champ                   | Type   | Requis | Description                     |
| ----------------------- | ------ | ------ | ------------------------------- |
| `first_name`            | string | ✅     | Prénom (max 255 caractères)     |
| `last_name`             | string | ✅     | Nom (max 255 caractères)        |
| `email`                 | string | ✅     | Email unique                    |
| `password`              | string | ✅     | Mot de passe (min 8 caractères) |
| `password_confirmation` | string | ✅     | Confirmation du mot de passe    |
| `role`                  | string | ✅     | `user` ou `coach`               |

**Response (201 Created) :**

```json
{
    "message": "Inscription réussie",
    "user": {
        "id": 1,
        "first_name": "Jean",
        "last_name": "Dupont",
        "full_name": "Jean Dupont",
        "email": "jean.dupont@example.com",
        "phone": null,
        "address": null,
        "city": null,
        "postal_code": null,
        "avatar": null,
        "location": null,
        "roles": [
            {
                "id": 1,
                "name": "prospect",
                "description": "Utilisateur prospect"
            }
        ],
        "coach": null,
        "email_verified_at": null,
        "created_at": "2026-01-29T10:30:00.000Z",
        "updated_at": "2026-01-29T10:30:00.000Z"
    },
    "token": "1|abc123xyz..."
}
```

---

### POST `/api/login`

Connexion d'un utilisateur.

**Request Body :**

```json
{
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!"
}
```

**Response (200 OK) :**

```json
{
  "token": "2|def456abc...",
  "user": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "full_name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "roles": [...],
    "created_at": "2026-01-29T10:30:00.000Z",
    "updated_at": "2026-01-29T10:30:00.000Z"
  }
}
```

**Erreurs possibles :**

| Code | Message                                                        |
| ---- | -------------------------------------------------------------- |
| 422  | `Ces identifiants ne correspondent pas à nos enregistrements.` |
| 429  | Trop de tentatives (rate limiting)                             |

---

### POST `/api/logout`

Déconnexion de l'utilisateur.

**Headers requis :**

```
Authorization: Bearer {token}
```

**Response (204 No Content)**

---

### GET `/api/user`

Récupérer les informations de l'utilisateur connecté.

**Headers requis :**

```
Authorization: Bearer {token}
```

**Response (200 OK) :**

```json
{
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "full_name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postal_code": "75001",
    "avatar": "https://example.com/avatar.jpg",
    "location": {
        "latitude": 48.8566,
        "longitude": 2.3522
    },
    "roles": [{ "id": 2, "name": "coach", "description": "Coach sportif" }],
    "coach": {
        "id": 1,
        "bio": "Coach certifié avec 10 ans d'expérience",
        "specialties": ["musculation", "cardio", "nutrition"],
        "certifications": ["BPJEPS", "CrossFit Level 2"],
        "experience_years": 10,
        "hourly_rate": {
            "amount": 50.0,
            "formatted": "50,00 €",
            "currency": "EUR"
        },
        "is_available": true,
        "created_at": "2026-01-29T10:30:00.000Z",
        "updated_at": "2026-01-29T10:30:00.000Z"
    },
    "email_verified_at": "2026-01-29T11:00:00.000Z",
    "created_at": "2026-01-29T10:30:00.000Z",
    "updated_at": "2026-01-29T10:30:00.000Z"
}
```

---

### POST `/api/forgot-password`

Demander un lien de réinitialisation de mot de passe.

**Request Body :**

```json
{
    "email": "jean.dupont@example.com"
}
```

**Response (200 OK) :**

```json
{
    "status": "Un lien de réinitialisation a été envoyé à votre adresse email."
}
```

---

### POST `/api/reset-password`

Réinitialiser le mot de passe.

**Request Body :**

```json
{
    "token": "token_recu_par_email",
    "email": "jean.dupont@example.com",
    "password": "NouveauMotDePasse123!",
    "password_confirmation": "NouveauMotDePasse123!"
}
```

**Response (200 OK) :**

```json
{
    "status": "Votre mot de passe a été réinitialisé."
}
```

---

## 🔑 Authentification avec le Token

Pour les routes protégées, incluez le token dans les headers :

```javascript
// Exemple avec Fetch API
fetch("http://127.0.0.1:8000/api/user", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
    },
});
```

```javascript
// Exemple avec Axios
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Ou par requête
axios.get("/api/user", {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});
```

---

## 📊 Codes de réponse HTTP

| Code | Signification         |
| ---- | --------------------- |
| 200  | Succès                |
| 201  | Ressource créée       |
| 204  | Succès sans contenu   |
| 401  | Non authentifié       |
| 403  | Non autorisé          |
| 404  | Ressource non trouvée |
| 422  | Erreur de validation  |
| 429  | Trop de requêtes      |
| 500  | Erreur serveur        |

---

## 🧪 Tests

```bash
# Lancer les tests
php artisan test

# Ou avec Pest
./vendor/bin/pest
```

---

## 📁 Structure du projet

```
BackEnd/
├── app/
│   ├── Http/
│   │   ├── Controllers/Auth/    # Contrôleurs d'authentification
│   │   ├── Requests/Auth/       # Validation des requêtes
│   │   └── Resources/           # Transformation des réponses API
│   └── Models/                  # Modèles Eloquent
├── database/
│   ├── migrations/              # Migrations de base de données
│   └── seeders/                 # Données de test
├── routes/
│   ├── api.php                  # Routes API
│   └── auth.php                 # Routes d'authentification
└── config/
    └── cors.php                 # Configuration CORS
```

---

## 🛠️ Commandes utiles

```bash
# Voir toutes les routes
php artisan route:list

# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Rafraîchir la base de données
php artisan migrate:fresh --seed

# Créer un nouveau contrôleur
php artisan make:controller NomController

# Créer une nouvelle ressource
php artisan make:resource NomResource
```

---

## 📞 Support

Pour toute question, contactez l'équipe backend.
