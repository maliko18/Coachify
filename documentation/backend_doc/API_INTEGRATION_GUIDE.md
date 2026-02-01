# 📖 Guide d'Intégration API - Pour l'Équipe Frontend

## 🚀 Démarrage Rapide

### Base URL

```
http://127.0.0.1:8000/api
```

---

## 🔐 Flux d'Authentification

### 1. Inscription d'un utilisateur

**Endpoint :** `POST /register`

```javascript
const register = async (formData) => {
    const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
            role: "prospect", // ou "coach"
        }),
    });

    const data = await response.json();

    if (response.ok) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    } else {
        // Gérer les erreurs
        throw new Error(data.message || "Erreur lors de l'inscription");
    }
};
```

**Réponse réussie (201) :**

```json
{
    "message": "Inscription réussie",
    "user": {
        "id": 1,
        "first_name": "Jean",
        "last_name": "Dupont",
        "full_name": "Jean Dupont",
        "email": "jean@example.com",
        "roles": [
            {
                "id": 1,
                "name": "prospect",
                "description": "Utilisateur prospect"
            }
        ]
    },
    "token": "1|abcdef123456..."
}
```

**Erreurs possibles (422) :**

```json
{
    "success": false,
    "message": "Les données fournies sont invalides.",
    "error": {
        "code": "VALIDATION_ERROR",
        "status": 422,
        "errors": {
            "email": ["Cette adresse email est déjà utilisée."],
            "password": ["Le mot de passe doit contenir au moins 8 caractères."]
        }
    }
}
```

---

### 2. Connexion

**Endpoint :** `POST /login`

```javascript
const login = async (email, password) => {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    } else {
        throw new Error(data.message || "Identifiants invalides");
    }
};
```

---

### 3. Déconnexion

**Endpoint :** `POST /logout` (Authentifié)

```javascript
const logout = async () => {
    const token = localStorage.getItem("auth_token");

    await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    // Nettoyer le localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Rediriger vers la page de connexion
    window.location.href = "/login";
};
```

---

### 4. Récupérer l'utilisateur connecté

**Endpoint :** `GET /user` (Authentifié)

```javascript
const getCurrentUser = async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch("http://127.0.0.1:8000/api/user", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (response.status === 401) {
        // Token invalide
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        return null;
    }

    const data = await response.json();
    return data;
};
```

---

## 🏋️ Routes Protégées par Rôle

### Dashboard Coach (Rôle : `coach`)

**Endpoint :** `GET /coach/dashboard` (Authentifié + Rôle coach)

```javascript
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
        alert("Accès réservé aux coachs");
        return null;
    }

    return await response.json();
};
```

**Réponse réussie (200) :**

```json
{
    "message": "Bienvenue sur le dashboard coach",
    "coach": {
        "id": 1,
        "bio": "Coach certifié...",
        "specialties": ["musculation", "cardio"],
        "hourly_rate": {
            "amount": 50.0,
            "formatted": "50,00 €"
        }
    }
}
```

**Erreur 403 (Mauvais rôle) :**

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

---

### Dashboard Admin (Rôle : `admin`)

**Endpoint :** `GET /admin/users` (Authentifié + Rôle admin)

```javascript
const getAdminUsers = async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch("http://127.0.0.1:8000/api/admin/users", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (response.status === 403) {
        alert("Accès réservé aux administrateurs");
        return null;
    }

    return await response.json();
};
```

---

## 🛡️ Gestion des Erreurs

### Erreurs courantes

| Code  | Erreur           | Description                    | Action Frontend                |
| ----- | ---------------- | ------------------------------ | ------------------------------ |
| `401` | UNAUTHENTICATED  | Token manquant/invalide/expiré | Rediriger vers `/login`        |
| `403` | FORBIDDEN        | Rôle insuffisant               | Afficher message d'erreur      |
| `422` | VALIDATION_ERROR | Données invalides              | Afficher erreurs de formulaire |
| `404` | NOT_FOUND        | Ressource introuvable          | Afficher page 404              |
| `500` | SERVER_ERROR     | Erreur serveur                 | Afficher message générique     |

### Exemple de gestion globale des erreurs

```javascript
const handleApiError = (error) => {
    if (error.response) {
        const { status, data } = error.response;

        switch (status) {
            case 401:
                // Token invalide
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
                break;

            case 403:
                // Accès refusé
                alert(data.message || "Accès non autorisé");
                break;

            case 422:
                // Erreurs de validation
                return data.error.errors; // Retourner pour afficher dans le formulaire
                break;

            case 404:
                alert("Ressource non trouvée");
                break;

            default:
                alert("Une erreur est survenue");
        }
    }
};
```

---

## 🎯 Vérifier les Rôles Côté Frontend

```javascript
// Fonction utilitaire pour vérifier les rôles
const hasRole = (roleName) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.roles?.some((role) => role.name === roleName) || false;
};

// Utilisation
if (hasRole("coach")) {
    // Afficher le menu coach
}

if (hasRole("admin")) {
    // Afficher le menu admin
}

// Vérifier plusieurs rôles
const hasAnyRole = (...roleNames) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.roles?.some((role) => roleNames.includes(role.name)) || false;
};

if (hasAnyRole("coach", "admin")) {
    // Accessible aux coaches ET admins
}
```

---

## 📋 Checklist d'Intégration

- [ ] Configurer la baseURL de l'API (`http://127.0.0.1:8000/api`)
- [ ] Implémenter l'inscription et la connexion
- [ ] Sauvegarder le token dans `localStorage`
- [ ] Ajouter le token dans les headers de toutes les requêtes protégées
- [ ] Gérer l'erreur 401 (redirection vers login)
- [ ] Gérer l'erreur 403 (rôle insuffisant)
- [ ] Afficher les erreurs de validation (422)
- [ ] Implémenter la déconnexion
- [ ] Protéger les routes frontend selon les rôles
- [ ] Tester toutes les routes avec différents rôles

---

## 🧪 Tests avec cURL

### Inscription

```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "role": "prospect"
  }'
```

### Connexion

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "Password123!"
  }'
```

### Route protégée

```bash
curl -X GET http://127.0.0.1:8000/api/user \
  -H "Authorization: Bearer {VOTRE_TOKEN}" \
  -H "Accept: application/json"
```

### Route avec rôle coach

```bash
curl -X GET http://127.0.0.1:8000/api/coach/dashboard \
  -H "Authorization: Bearer {TOKEN_COACH}" \
  -H "Accept: application/json"
```

---

## 📞 Support

Pour toute question sur l'API, contactez l'équipe backend.

**Points de contact :**

- Documentation complète : `BackEnd/README.md`
- Routes disponibles : `php artisan route:list`
- Tests : `BackEnd/tests/Feature/`
