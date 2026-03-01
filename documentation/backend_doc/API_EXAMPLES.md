# 📄 Exemples de Réponses API

Ce fichier contient des exemples concrets de réponses pour chaque endpoint de l'API.

---

## 🔐 Authentification

### POST `/api/register`

**Request :**

```json
{
    "first_name": "Marie",
    "last_name": "Martin",
    "email": "marie.martin@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "role": "coach"
}
```

**Response 201 (Succès) :**

```json
{
    "message": "Inscription réussie",
    "user": {
        "id": 2,
        "first_name": "Marie",
        "last_name": "Martin",
        "full_name": "Marie Martin",
        "email": "marie.martin@example.com",
        "phone": null,
        "address": null,
        "city": null,
        "postal_code": null,
        "avatar": null,
        "location": null,
        "roles": [
            {
                "id": 3,
                "name": "coach",
                "description": "Prestataire principal de services sportifs"
            }
        ],
        "coach": {
            "id": 1,
            "bio": null,
            "specialties": [],
            "certifications": [],
            "experience_years": 0,
            "hourly_rate": null,
            "is_available": true,
            "created_at": "2026-02-01T14:30:00.000000Z",
            "updated_at": "2026-02-01T14:30:00.000000Z"
        },
        "email_verified_at": null,
        "created_at": "2026-02-01T14:30:00.000000Z",
        "updated_at": "2026-02-01T14:30:00.000000Z"
    },
    "token": "2|abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

**Response 422 (Erreur de validation) :**

```json
{
    "success": false,
    "message": "Les données fournies sont invalides.",
    "error": {
        "code": "VALIDATION_ERROR",
        "status": 422,
        "errors": {
            "email": ["Cette adresse email est déjà utilisée."],
            "password": [
                "Le mot de passe doit contenir au moins 8 caractères."
            ],
            "role": ["Le rôle doit être prospect ou coach."]
        }
    }
}
```

---

### POST `/api/login`

**Request :**

```json
{
    "email": "marie.martin@example.com",
    "password": "Password123!"
}
```

**Response 200 (Succès) :**

```json
{
    "token": "3|xyz987wvu654tsr321pqo098nml765kji432hgf109edc876ba",
    "user": {
        "id": 2,
        "first_name": "Marie",
        "last_name": "Martin",
        "full_name": "Marie Martin",
        "email": "marie.martin@example.com",
        "phone": "+33612345678",
        "address": "15 Avenue des Champs",
        "city": "Lyon",
        "postal_code": "69001",
        "avatar": "https://api.example.com/storage/avatars/marie.jpg",
        "location": {
            "latitude": 45.764043,
            "longitude": 4.835659
        },
        "roles": [
            {
                "id": 3,
                "name": "coach",
                "description": "Prestataire principal de services sportifs"
            }
        ],
        "coach": {
            "id": 1,
            "bio": "Coach certifiée avec 5 ans d'expérience en musculation et cardio",
            "specialties": ["musculation", "cardio", "nutrition"],
            "certifications": ["BPJEPS", "CrossFit Level 1"],
            "experience_years": 5,
            "hourly_rate": {
                "amount": 45.0,
                "formatted": "45,00 €",
                "currency": "EUR"
            },
            "is_available": true,
            "created_at": "2026-02-01T14:30:00.000000Z",
            "updated_at": "2026-02-01T15:20:00.000000Z"
        },
        "email_verified_at": "2026-02-01T14:35:00.000000Z",
        "created_at": "2026-02-01T14:30:00.000000Z",
        "updated_at": "2026-02-01T15:20:00.000000Z"
    }
}
```

**Response 422 (Identifiants incorrects) :**

```json
{
    "success": false,
    "message": "Les données fournies sont invalides.",
    "error": {
        "code": "VALIDATION_ERROR",
        "status": 422,
        "errors": {
            "email": [
                "Ces identifiants ne correspondent pas à nos enregistrements."
            ]
        }
    }
}
```

---

### POST `/api/logout`

**Headers :**

```
Authorization: Bearer {token}
```

**Response 204 (Succès) :**

```
(Aucun contenu - Status 204 No Content)
```

**Response 401 (Non authentifié) :**

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

---

### GET `/api/user`

**Headers :**

```
Authorization: Bearer {token}
```

**Response 200 (Succès - Utilisateur Coach) :**

```json
{
    "data": {
        "id": 2,
        "first_name": "Marie",
        "last_name": "Martin",
        "full_name": "Marie Martin",
        "email": "marie.martin@example.com",
        "phone": "+33612345678",
        "address": "15 Avenue des Champs",
        "city": "Lyon",
        "postal_code": "69001",
        "avatar": "https://api.example.com/storage/avatars/marie.jpg",
        "location": {
            "latitude": 45.764043,
            "longitude": 4.835659
        },
        "roles": [
            {
                "id": 3,
                "name": "coach",
                "description": "Prestataire principal de services sportifs"
            }
        ],
        "coach": {
            "id": 1,
            "bio": "Coach certifiée avec 5 ans d'expérience",
            "specialties": ["musculation", "cardio", "nutrition"],
            "certifications": ["BPJEPS", "CrossFit Level 1"],
            "experience_years": 5,
            "hourly_rate": {
                "amount": 45.0,
                "formatted": "45,00 €",
                "currency": "EUR"
            },
            "is_available": true,
            "created_at": "2026-02-01T14:30:00.000000Z",
            "updated_at": "2026-02-01T15:20:00.000000Z"
        },
        "email_verified_at": "2026-02-01T14:35:00.000000Z",
        "created_at": "2026-02-01T14:30:00.000000Z",
        "updated_at": "2026-02-01T15:20:00.000000Z"
    }
}
```

**Response 200 (Succès - Utilisateur Prospect) :**

```json
{
    "data": {
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
                "description": "Utilisateur non inscrit ou sans contrat actif"
            }
        ],
        "coach": null,
        "email_verified_at": null,
        "created_at": "2026-02-01T10:15:00.000000Z",
        "updated_at": "2026-02-01T10:15:00.000000Z"
    }
}
```

---

## 🏋️ Routes Coach

### GET `/api/coach/dashboard`

**Headers :**

```
Authorization: Bearer {token_coach}
```

**Response 200 (Succès - Utilisateur coach) :**

```json
{
    "message": "Bienvenue sur le dashboard coach",
    "coach": {
        "id": 1,
        "bio": "Coach certifiée avec 5 ans d'expérience",
        "specialties": ["musculation", "cardio", "nutrition"],
        "certifications": ["BPJEPS", "CrossFit Level 1"],
        "experience_years": 5,
        "hourly_rate": {
            "amount": 45.0,
            "formatted": "45,00 €",
            "currency": "EUR"
        },
        "is_available": true,
        "created_at": "2026-02-01T14:30:00.000000Z",
        "updated_at": "2026-02-01T15:20:00.000000Z"
    }
}
```

**Response 403 (Utilisateur sans rôle coach) :**

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

**Response 401 (Non authentifié) :**

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

---

## 👑 Routes Admin

### GET `/api/admin/users`

**Headers :**

```
Authorization: Bearer {token_admin}
```

**Response 200 (Succès) :**

```json
{
    "message": "Liste des utilisateurs (admin only)"
}
```

**Response 403 (Utilisateur sans rôle admin) :**

```json
{
    "success": false,
    "message": "Accès réservé aux administrateurs.",
    "error": {
        "code": "FORBIDDEN",
        "status": 403
    }
}
```

---

## 🏢 Routes Responsable de Salle

### GET `/api/gym/dashboard`

**Headers :**

```
Authorization: Bearer {token_gym_manager}
```

**Response 200 (Succès) :**

```json
{
    "message": "Dashboard responsable de salle"
}
```

**Response 403 (Utilisateur sans rôle gym_manager) :**

```json
{
    "success": false,
    "message": "Accès réservé aux responsables de salle.",
    "error": {
        "code": "FORBIDDEN",
        "status": 403
    }
}
```

---

## 📊 Routes Multi-rôles

### GET `/api/statistics`

**Headers :**

```
Authorization: Bearer {token}
```

**Accessible par :** `coach` OU `admin`

**Response 200 (Succès) :**

```json
{
    "message": "Statistiques (coach ou admin)"
}
```

**Response 403 (Utilisateur prospect ou client) :**

```json
{
    "success": false,
    "message": "Accès non autorisé. Rôle requis : coach ou admin",
    "error": {
        "code": "FORBIDDEN",
        "status": 403,
        "required_roles": ["coach", "admin"]
    }
}
```

---

## 🚫 Erreurs Communes

### 404 Not Found

```json
{
    "success": false,
    "message": "Ressource non trouvée.",
    "error": {
        "code": "NOT_FOUND",
        "status": 404
    }
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Erreur serveur interne.",
    "error": {
        "code": "SERVER_ERROR",
        "status": 500
    }
}
```

---

## 💡 Notes pour le Frontend

### Structure des rôles dans l'objet user

```javascript
const user = {
    id: 2,
    first_name: "Marie",
    last_name: "Martin",
    roles: [
        {
            id: 3,
            name: "coach", // ← Vérifier cette valeur
            description: "...",
        },
    ],
};

// Vérifier le rôle
const isCoach = user.roles.some((r) => r.name === "coach");
const isAdmin = user.roles.some((r) => r.name === "admin");
```

### Valeurs possibles pour `roles[].name`

- `"prospect"` - Utilisateur par défaut
- `"client"` - Client avec contrat
- `"coach"` - Coach sportif
- `"gym_manager"` - Responsable de salle
- `"admin"` - Administrateur

### Champs nullable

Les champs suivants peuvent être `null` :

- `phone`
- `address`
- `city`
- `postal_code`
- `avatar`
- `location` (si pas de latitude/longitude)
- `coach` (si l'utilisateur n'est pas coach)
- `email_verified_at` (si email non vérifié)
