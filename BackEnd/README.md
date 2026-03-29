# 🏋️ API Backend - Coaching Fitness

API REST Laravel pour l'application de coaching fitness avec authentification JWT et système de rôles.

> **📚 [INDEX DE LA DOCUMENTATION](../documentation/backend_doc/INDEX.md)** - Navigation complète de toute la documentation

---

## 📚 Documentation

### 📱 Pour l'Équipe Frontend

- **📧 [Message pour le Frontend](../documentation/backend_doc/MESSAGE_FRONTEND.md)** - ⭐ **Commencez ici !**
- **🚀 [Quick Start](../documentation/backend_doc/FRONTEND_QUICKSTART.md)** - Intégration en 3 minutes
- **📖 [Guide d'Intégration](../documentation/backend_doc/API_INTEGRATION_GUIDE.md)** - Fetch, Axios, React Context
- **📄 [Exemples de Réponses](../documentation/backend_doc/API_EXAMPLES.md)** - Toutes les réponses JSON
- **📘 [Types TypeScript](../documentation/backend_doc/api-types.ts)** - Interfaces TypeScript complètes
- **🧪 [Tests REST Client](../documentation/backend_doc/api-tests.http)** - Tester l'API dans VS Code

### 🔧 Documentation Technique Backend

- **🛣️ Routes** : Voir [routes/api.php](./routes/api.php)
- **🔐 Middlewares** : [app/Http/Middleware/](./app/Http/Middleware/)
- **✅ Tests** : [tests/Feature/](./tests/Feature/)
- **📊 Modèles** : [app/Models/](./app/Models/)

---

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

```

### 8. Comptes de test pour connexion

Ces comptes sont crees par les seeders pour l'environnement local:

| Role | Email | Mot de passe |
| ---- | ----- | ------------ |
| gym_manager (admin legacy) | admin@coachapp.fr | admin123 |
| coach | coach.jean@coachapp.fr | coach123 |
| client | client.sophie@example.com | client123 |

Reset complet des donnees de test:

```bash
php artisan migrate:fresh --seed
```

L'API sera accessible sur : **http://127.0.0.1:8000**

## 📡 Endpoints API

Base URL : `http://127.0.0.1:8000/api`

### 🔐 Authentification

| Méthode | Endpoint                           | Description                         | Auth | Rôle |
| ------- | ---------------------------------- | ----------------------------------- | ---- | ---- |
| `POST`  | `/register`                        | Inscription d'un nouvel utilisateur | ❌   | -    |
| `POST`  | `/login`                           | Connexion                           | ❌   | -    |
| `POST`  | `/logout`                          | Déconnexion                         | ✅   | -    |
| `POST`  | `/forgot-password`                 | Demande de réinitialisation         | ❌   | -    |
| `POST`  | `/reset-password`                  | Réinitialiser le mot de passe       | ❌   | -    |
| `GET`   | `/verify-email/{id}/{hash}`        | Vérifier l'email                    | ✅   | -    |
| `POST`  | `/email/verification-notification` | Renvoyer l'email de vérification    | ✅   | -    |

### 👤 Utilisateur

| Méthode | Endpoint | Description                      | Auth | Rôle |
| ------- | -------- | -------------------------------- | ---- | ---- |
| `GET`   | `/user`  | Récupérer l'utilisateur connecté | ✅   | -    |

### 🏋️ Routes Coach

| Méthode | Endpoint            | Description     | Auth | Rôle    |
| ------- | ------------------- | --------------- | ---- | ------- |
| `GET`   | `/coach/dashboard`  | Dashboard coach | ✅   | `coach` |
| `GET`   | `/coach/clients`    | Liste clients   | ✅   | `coach` |
| `GET`   | `/coach/statistics` | Statistiques    | ✅   | `coach` |
| `POST`  | `/coach/offers`     | Créer une offre | ✅   | `coach` |

### 🏢 Routes Gym Manager

| Méthode | Endpoint                    | Description                          | Auth | Rôle          |
| ------- | --------------------------- | ------------------------------------ | ---- | ------------- |
| `GET`   | `/gym/dashboard`            | Dashboard salle                      | ✅   | `gym_manager` |
| `GET`   | `/gym/users`                | Liste utilisateurs                   | ✅   | `gym_manager` |
| `PUT`   | `/gym/users/{id}/role`      | Mise a jour role utilisateur         | ✅   | `gym_manager` |
| `POST`  | `/gym/users/{id}/ban`       | Bannir un utilisateur                | ✅   | `gym_manager` |
| `DELETE`| `/gym/users/{id}/ban`       | Lever le bannissement utilisateur    | ✅   | `gym_manager` |
| `GET`   | `/gym/equipements`          | Liste equipements                    | ✅   | `gym_manager` |
| `POST`  | `/gym/equipements`          | Ajouter equipement                   | ✅   | `gym_manager` |

Note: les anciennes routes `/admin/*` sont considerees legacy et convergent vers l'espace `/gym/*`.

### 📊 Routes Multi-rôles

| Méthode | Endpoint      | Description  | Auth | Rôle            |
| ------- | ------------- | ------------ | ---- | --------------- |
| `GET`   | `/statistics` | Statistiques | ✅   | `coach`/`gym_manager` |

---

## 🎯 Système de Rôles

### Rôles disponibles :

| Rôle          | Description                    | Inscription |
| ------------- | ------------------------------ | ----------- |
| `prospect`    | Utilisateur sans contrat actif | ✅ Oui      |
| `client`      | Client avec contrat actif      | ❌ Non      |
| `coach`       | Coach sportif                  | ✅ Oui      |
| `gym_manager` | Responsable de salle de sport  | ❌ Non      |
| `admin`       | Alias legacy (compatibilite)   | ❌ Non      |

### Protection des routes

Les routes sont protégées par des **middlewares de rôles** :

```php
// Route accessible uniquement aux coaches
Route::middleware(['auth:sanctum', 'is_coach'])->get('/coach/dashboard', ...);

// Route accessible aux coaches OU gym managers
Route::middleware(['auth:sanctum', 'role:coach,gym_manager'])->get('/statistics', ...);
```

### Réponses d'erreur

**401 Unauthorized (Non authentifié) :**

```json
{
    "success": false,
    "message": "Non authentifié.",
    "error": {
        "code": "UNAUTHENTICATED",
        "status": 401
    }
}
```

**403 Forbidden (Mauvais rôle) :**

```json
{
    "success": false,
    "message": "Accès réservé aux coachs.",
    "error": {
        "code": "FORBIDDEN",
        "status": 403
    }
}
```

**422 Validation Error :**

```json
{
    "success": false,
    "message": "Les données fournies sont invalides.",
    "error": {
        "code": "VALIDATION_ERROR",
        "status": 422,
        "errors": {
            "email": ["Ce champ est requis."]
        }
    }
}
```

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
| `role`                  | string | ✅     | `prospect` ou `coach`           |

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

Toutes les routes protégées (✅) nécessitent un **Bearer Token** dans les headers.

### Comment obtenir un token ?

1. **Inscription** : `POST /api/register` → retourne `token`
2. **Connexion** : `POST /api/login` → retourne `token`

### Envoyer le token dans les requêtes

**Headers requis :**

```
Authorization: Bearer {votre_token_ici}
Content-Type: application/json
Accept: application/json
```

### Exemples d'intégration Frontend

#### 🟦 **Fetch API (JavaScript vanilla)**

```javascript
// 1. Connexion et récupération du token
const login = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            email: "user@example.com",
            password: "Password123!",
        }),
    });

    const data = await response.json();

    // Sauvegarder le token
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
};

// 2. Utiliser le token pour les requêtes protégées
const getUser = async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch("http://127.0.0.1:8000/api/user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        return;
    }

    return await response.json();
};

// 3. Route protégée par rôle (coach)
const getCoachDashboard = async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch("http://127.0.0.1:8000/api/coach/dashboard", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (response.status === 403) {
        // Rôle insuffisant
        alert("Accès réservé aux coachs");
        return;
    }

    return await response.json();
};
```

#### 🔷 **Axios (Recommandé pour React/Vue)**

```javascript
import axios from "axios";

// Configuration globale
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Interceptor pour ajouter le token automatiquement
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor pour gérer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }

        if (error.response?.status === 403) {
            // Rôle insuffisant
            console.error("Accès refusé:", error.response.data.message);
        }

        return Promise.reject(error);
    },
);

// Utilisation
export const authService = {
    // Connexion
    login: async (email, password) => {
        const { data } = await api.post("/login", { email, password });
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    },

    // Inscription
    register: async (userData) => {
        const { data } = await api.post("/register", userData);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    },

    // Déconnexion
    logout: async () => {
        await api.post("/logout");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
    },

    // Récupérer l'utilisateur
    getUser: async () => {
        const { data } = await api.get("/user");
        return data;
    },
};

// Routes coach
export const coachService = {
    getDashboard: async () => {
        const { data } = await api.get("/coach/dashboard");
        return data;
    },
};

// Routes gym manager (admin = alias legacy)
export const gymManagerService = {
    getUsers: async () => {
        const { data } = await api.get("/gym/users");
        return data;
    },
};
```

#### ⚛️ **React Context pour l'authentification**

```javascript
// AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { authService } from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("auth_token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            authService
                .getUser()
                .then((data) => setUser(data))
                .catch(() => {
                    setToken(null);
                    localStorage.removeItem("auth_token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    };

    // Vérifier si l'utilisateur a un rôle
    const hasRole = (role) => {
        return user?.roles?.some((r) => r.name === role) || false;
    };

    return (
        <AuthContext.Provider
            value={{ user, token, login, logout, hasRole, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Utilisation dans un composant
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

function CoachDashboard() {
    const { user, hasRole } = useContext(AuthContext);

    if (!hasRole("coach")) {
        return <div>Accès réservé aux coachs</div>;
    }

    return <div>Dashboard Coach - Bienvenue {user.full_name}</div>;
}
```

### 🔒 Gestion des rôles côté Frontend

```javascript
// Vérifier le rôle de l'utilisateur
const user = JSON.parse(localStorage.getItem("user"));
const isCoach = user?.roles?.some((role) => role.name === "coach");
const isGymManager = user?.roles?.some((role) => ["gym_manager", "admin"].includes(role.name));

// Affichage conditionnel
{
    isCoach && <Link to="/coach/dashboard">Dashboard Coach</Link>;
}
{
    isGymManager && <Link to="/gym/users">Gestion Utilisateurs</Link>;
}

// Protection de routes (React Router)
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const hasRole = user?.roles?.some((r) => r.name === requiredRole);

    if (!hasRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}

// Utilisation
<Route
    path="/coach/dashboard"
    element={
        <ProtectedRoute requiredRole="coach">
            <CoachDashboard />
        </ProtectedRoute>
    }
/>;
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
