# 🎯 Quick Start - API Backend pour Frontend

## ⚡ En 3 minutes

### 1. Base URL

```
http://127.0.0.1:8000/api
```

### 2. Flux d'inscription/connexion

```javascript
// INSCRIPTION
const response = await fetch("http://127.0.0.1:8000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
        first_name: "Marie",
        last_name: "Martin",
        email: "marie@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        role: "prospect", // ou "coach"
    }),
});
const data = await response.json();
localStorage.setItem("auth_token", data.token);
```

```javascript
// CONNEXION
const response = await fetch("http://127.0.0.1:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
        email: "marie@example.com",
        password: "Password123!",
    }),
});
const data = await response.json();
localStorage.setItem("auth_token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
```

### 3. Requêtes authentifiées

```javascript
const token = localStorage.getItem("auth_token");

const response = await fetch("http://127.0.0.1:8000/api/user", {
    headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    },
});
```

---

## 📋 Endpoints Disponibles

| Endpoint           | Méthode | Auth | Rôle        | Description         |
| ------------------ | ------- | ---- | ----------- | ------------------- |
| `/register`        | POST    | ❌   | -           | Inscription         |
| `/login`           | POST    | ❌   | -           | Connexion           |
| `/logout`          | POST    | ✅   | -           | Déconnexion         |
| `/user`            | GET     | ✅   | -           | Infos utilisateur   |
| `/coach/dashboard` | GET     | ✅   | coach       | Dashboard coach     |
| `/admin/users`     | GET     | ✅   | admin       | Liste users (admin) |
| `/gym/dashboard`   | GET     | ✅   | gym_manager | Dashboard salle     |
| `/statistics`      | GET     | ✅   | coach/admin | Stats multi-rôles   |

---

## 🔐 Rôles Disponibles

| Rôle          | Inscription | Description         |
| ------------- | ----------- | ------------------- |
| `prospect`    | ✅          | Par défaut          |
| `coach`       | ✅          | Coach sportif       |
| `client`      | ❌          | Assigné après achat |
| `gym_manager` | ❌          | Responsable salle   |
| `admin`       | ❌          | Administrateur      |

---

## 🛡️ Vérifier les Rôles

```javascript
// Récupérer l'utilisateur
const user = JSON.parse(localStorage.getItem("user"));

// Vérifier un rôle
const isCoach = user?.roles?.some((r) => r.name === "coach");
const isAdmin = user?.roles?.some((r) => r.name === "admin");

// Affichage conditionnel
{
    isCoach && <CoachMenu />;
}
{
    isAdmin && <AdminPanel />;
}
```

---

## ⚠️ Gestion des Erreurs

| Code | Erreur           | Action                        |
| ---- | ---------------- | ----------------------------- |
| 401  | Non authentifié  | → Rediriger `/login`          |
| 403  | Rôle insuffisant | → Afficher message            |
| 422  | Validation       | → Afficher erreurs formulaire |

```javascript
if (response.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
}

if (response.status === 403) {
    alert("Accès non autorisé");
}
```

---

## 📚 Documentation Complète

- **README Backend** : [`BackEnd/README.md`](./README.md)
- **Guide d'intégration** : [`BackEnd/API_INTEGRATION_GUIDE.md`](./API_INTEGRATION_GUIDE.md)
- **Exemples de réponses** : [`BackEnd/API_EXAMPLES.md`](./API_EXAMPLES.md)

---

## 🧪 Tester l'API

### Avec cURL

```bash
# Connexion
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Route protégée
curl -X GET http://127.0.0.1:8000/api/user \
  -H "Authorization: Bearer {TOKEN}"
```

### Avec Postman/Insomnia

1. Créer une requête `POST /api/login`
2. Body → JSON → `{"email": "...", "password": "..."}`
3. Copier le `token` de la réponse
4. Créer une requête `GET /api/user`
5. Headers → `Authorization: Bearer {token}`

---

## 💡 Tips Frontend

### Configuration Axios

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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

### React Context

```javascript
import { createContext, useState, useEffect } from "react";
import api from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            api.get("/user")
                .then((res) => setUser(res.data.data))
                .catch(() => localStorage.removeItem("auth_token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const hasRole = (role) => user?.roles?.some((r) => r.name === role);

    return (
        <AuthContext.Provider value={{ user, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## 🚀 Checklist Intégration

- [ ] Configurer la baseURL
- [ ] Implémenter login/register
- [ ] Sauvegarder le token
- [ ] Gérer l'erreur 401
- [ ] Protéger les routes frontend
- [ ] Vérifier les rôles
- [ ] Tester avec Postman

---

## ❓ FAQ

**Q: Le token expire-t-il ?**  
A: Actuellement, les tokens Sanctum n'expirent pas par défaut.

**Q: Où stocker le token ?**  
A: `localStorage` pour simplicité. Pour plus de sécurité → httpOnly cookies.

**Q: Comment changer de rôle ?**  
A: Seul le backend peut modifier les rôles (routes admin futures).

**Q: Pourquoi 403 au lieu de 401 ?**  
A: 401 = pas authentifié, 403 = authentifié mais rôle insuffisant.

---

**🎓 Prêt à intégrer !** Consultez les guides détaillés pour plus d'exemples.
