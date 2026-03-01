# 📧 Message pour l'Équipe Frontend

Bonjour l'équipe Frontend ! 👋

L'API Backend est prête pour l'intégration. Voici tout ce que vous devez savoir :

---

## 🎯 Informations Essentielles

### URL de l'API

```
http://127.0.0.1:8000/api
```

### Authentification

- **Type :** Bearer Token (Laravel Sanctum)
- **Header :** `Authorization: Bearer {token}`
- **Obtention :** Via `/api/register` ou `/api/login`

### Format des requêtes/réponses

- **Content-Type :** `application/json`
- **Accept :** `application/json`

---

## 📖 Documentation Disponible

| Document                 | Description                           | Lien                                                   |
| ------------------------ | ------------------------------------- | ------------------------------------------------------ |
| **Quick Start**          | Intégration en 3 minutes              | [FRONTEND_QUICKSTART.md](./FRONTEND_QUICKSTART.md)     |
| **Guide Complet**        | Exemples Fetch, Axios, React          | [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) |
| **Exemples de Réponses** | Toutes les réponses JSON              | [API_EXAMPLES.md](./API_EXAMPLES.md)                   |
| **README Backend**       | Documentation technique               | [README.md](./README.md)                               |
| **Tests REST Client**    | Tester l'API directement dans VS Code | [api-tests.http](./api-tests.http)                     |

---

## 🚀 Par où commencer ?

### 1. **Lire le Quick Start** (5 min)

```
BackEnd/FRONTEND_QUICKSTART.md
```

→ Comprendre les bases : inscription, connexion, requêtes authentifiées

### 2. **Consulter les exemples** (10 min)

```
BackEnd/API_EXAMPLES.md
```

→ Voir toutes les réponses JSON pour chaque endpoint

### 3. **Tester l'API** (15 min)

- Installer l'extension **REST Client** dans VS Code
- Ouvrir `BackEnd/api-tests.http`
- Tester tous les endpoints en un clic

### 4. **Intégrer dans votre app** (30 min)

```
BackEnd/API_INTEGRATION_GUIDE.md
```

→ Exemples complets : Fetch, Axios, React Context, gestion d'erreurs

---

## 🔑 Endpoints Principaux

### Authentification (Public)

- `POST /api/register` - Inscription (prospect ou coach)
- `POST /api/login` - Connexion
- `POST /api/forgot-password` - Mot de passe oublié

### Utilisateur (Authentifié)

- `GET /api/user` - Infos utilisateur connecté
- `POST /api/logout` - Déconnexion

### Routes Protégées par Rôle

- `GET /api/coach/dashboard` - Dashboard coach (rôle: `coach`)
- `GET /api/admin/users` - Liste users (rôle: `admin`)
- `GET /api/gym/dashboard` - Dashboard salle (rôle: `gym_manager`)
- `GET /api/statistics` - Stats (rôles: `coach` OU `admin`)

---

## 🛡️ Système de Rôles

### Rôles disponibles

| Rôle          | Inscription | Description                       |
| ------------- | ----------- | --------------------------------- |
| `prospect`    | ✅          | Utilisateur par défaut            |
| `coach`       | ✅          | Coach sportif (avec profil coach) |
| `client`      | ❌          | Assigné après achat               |
| `gym_manager` | ❌          | Responsable de salle              |
| `admin`       | ❌          | Administrateur                    |

### Comment vérifier les rôles ?

```javascript
const user = JSON.parse(localStorage.getItem("user"));

// Vérifier un rôle
const isCoach = user?.roles?.some((r) => r.name === "coach");
const isAdmin = user?.roles?.some((r) => r.name === "admin");

// Affichage conditionnel
{
    isCoach && <Link to="/coach/dashboard">Dashboard Coach</Link>;
}
{
    isAdmin && <Link to="/admin">Admin Panel</Link>;
}
```

---

## ⚠️ Gestion des Erreurs

### Codes HTTP à gérer

| Code  | Signification         | Action Frontend                           |
| ----- | --------------------- | ----------------------------------------- |
| `401` | Non authentifié       | Rediriger vers `/login` + supprimer token |
| `403` | Rôle insuffisant      | Afficher message d'erreur                 |
| `422` | Validation échouée    | Afficher erreurs de formulaire            |
| `404` | Ressource non trouvée | Page 404                                  |
| `500` | Erreur serveur        | Message générique                         |

### Format uniforme des erreurs

Toutes les erreurs suivent cette structure :

```json
{
    "success": false,
    "message": "Message d'erreur explicite",
    "error": {
        "code": "ERROR_CODE",
        "status": 422,
        "errors": {
            "email": ["Cette adresse email est déjà utilisée."]
        }
    }
}
```

---

## 🧪 Tester l'API Rapidement

### Option 1 : REST Client (VS Code)

1. Installer l'extension "REST Client"
2. Ouvrir `BackEnd/api-tests.http`
3. Cliquer sur "Send Request" au-dessus de chaque requête

### Option 2 : cURL

```bash
# Connexion
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Route protégée
curl -X GET http://127.0.0.1:8000/api/user \
  -H "Authorization: Bearer {VOTRE_TOKEN}"
```

### Option 3 : Postman/Insomnia

Collection Postman disponible sur demande.

---

## 💡 Conseils d'Intégration

### ✅ À FAIRE

1. **Sauvegarder le token après login/register**

    ```javascript
    localStorage.setItem("auth_token", data.token);
    ```

2. **Ajouter le token à TOUTES les requêtes authentifiées**

    ```javascript
    headers: { "Authorization": `Bearer ${token}` }
    ```

3. **Gérer l'erreur 401 globalement**

    ```javascript
    if (response.status === 401) {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
    }
    ```

4. **Vérifier les rôles avant d'afficher les menus**
    ```javascript
    {
        user?.roles?.some((r) => r.name === "coach") && <CoachMenu />;
    }
    ```

### ❌ À ÉVITER

- ❌ Stocker le mot de passe (seulement le token !)
- ❌ Oublier le header `Accept: application/json`
- ❌ Faire confiance au rôle côté frontend uniquement (le backend vérifie toujours)
- ❌ Ne pas gérer les erreurs 401/403

---

## 🔧 Configuration Axios Recommandée

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Ajouter automatiquement le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Gérer automatiquement le 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export default api;
```

---

## 📊 Exemple de Flux Complet

```javascript
// 1. Inscription
const registerResponse = await fetch("http://127.0.0.1:8000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
        first_name: "Marie",
        last_name: "Martin",
        email: "marie@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        role: "coach",
    }),
});
const registerData = await registerResponse.json();
localStorage.setItem("auth_token", registerData.token);
localStorage.setItem("user", JSON.stringify(registerData.user));

// 2. Récupérer l'utilisateur connecté
const userResponse = await fetch("http://127.0.0.1:8000/api/user", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        Accept: "application/json",
    },
});
const userData = await userResponse.json();
console.log(userData); // Infos user avec rôles

// 3. Vérifier le rôle et accéder au dashboard coach
const user = JSON.parse(localStorage.getItem("user"));
if (user.roles.some((r) => r.name === "coach")) {
    const dashboardResponse = await fetch(
        "http://127.0.0.1:8000/api/coach/dashboard",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                Accept: "application/json",
            },
        },
    );
    const dashboardData = await dashboardResponse.json();
    console.log(dashboardData); // Dashboard coach
}
```

---

## ❓ Questions Fréquentes

**Q: Le serveur est lancé ?**  
R: Vérifiez avec `php artisan serve` dans le dossier `BackEnd/`

**Q: Les tokens expirent ?**  
R: Non, les tokens Sanctum n'expirent pas par défaut (sauf déconnexion)

**Q: Comment tester sans créer de compte ?**  
R: Utilisez `php artisan db:seed` pour créer des utilisateurs de test

**Q: Erreur CORS ?**  
R: L'API accepte toutes les origines pour le dev. En prod, configurez `config/cors.php`

**Q: Comment changer de rôle ?**  
R: Seul le backend peut modifier les rôles (routes admin à venir)

**Q: Différence entre 401 et 403 ?**  
R: 401 = pas de token, 403 = token OK mais rôle insuffisant

---

## 🆘 Support

### En cas de problème

1. **Consulter la documentation** (liens ci-dessus)
2. **Vérifier les exemples** dans `API_EXAMPLES.md`
3. **Tester avec REST Client** (`api-tests.http`)
4. **Contacter l'équipe backend**

### Informations utiles pour le debug

- Logs Laravel : `BackEnd/storage/logs/laravel.log`
- Liste des routes : `php artisan route:list`
- Tests backend : `./vendor/bin/pest`

---

## ✅ Checklist Avant de Commencer

- [ ] J'ai lu le Quick Start
- [ ] J'ai testé au moins 3 endpoints avec REST Client
- [ ] Je comprends le système de rôles
- [ ] Je sais gérer les erreurs 401/403
- [ ] J'ai un plan pour l'authentification (Context, Redux, etc.)
- [ ] Je connais le format des erreurs de validation

---

**Bonne intégration ! 🚀**

En cas de question, n'hésitez pas à consulter les docs ou nous contacter.

L'équipe Backend
