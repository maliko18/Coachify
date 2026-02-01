# 🔀 Merge Request

## Titre

```
feat(backend): Implémentation complète de l'API d'authentification Laravel avec Sanctum
```

---

## 📝 Description

### 🎯 Objectif

Mise en place de l'infrastructure backend complète avec Laravel, incluant le système d'authentification, la gestion des utilisateurs (prospects et coachs), et les API Resources optimisées.

---

## ✅ Fonctionnalités implémentées

### 🔐 Authentification (Laravel Sanctum)

- [x] Inscription utilisateur (`POST /api/register`)
- [x] Connexion (`POST /api/login`)
- [x] Déconnexion (`POST /api/logout`)
- [x] Mot de passe oublié (`POST /api/forgot-password`)
- [x] Réinitialisation du mot de passe (`POST /api/reset-password`)
- [x] Vérification d'email (`GET /api/verify-email/{id}/{hash}`)
- [x] Renvoi de l'email de vérification (`POST /api/email/verification-notification`)

### 👤 Gestion des utilisateurs

- [x] Récupération de l'utilisateur connecté (`GET /api/user`)
- [x] Support des rôles : `prospect`, `coach`, `admin`
- [x] Profil coach avec spécialités, certifications et tarif horaire

### 🗄️ Base de données

- [x] Migration `users` - Informations utilisateur complètes
- [x] Migration `roles` - Système de rôles
- [x] Migration `role_user` - Relation many-to-many
- [x] Migration `coaches` - Profil coach détaillé
- [x] Seeders pour données de test

### 📦 API Resources (Optimisation des réponses JSON)

- [x] `UserResources` - Formatage complet des utilisateurs
- [x] `RoleResource` - Formatage des rôles
- [x] `CoachResource` - Formatage avec prix structuré
- [x] `UserCollection` / `CoachCollection` - Collections avec méta-données
- [x] Dates formatées en ISO 8601
- [x] Relations conditionnelles avec `whenLoaded()`

### 📚 Documentation

- [x] README complet avec guide d'installation
- [x] Documentation de tous les endpoints API
- [x] Exemples de requêtes/réponses JSON
- [x] Guide d'utilisation des tokens (Fetch, Axios)

---

## 📁 Fichiers ajoutés/modifiés

```
BackEnd/
├── app/
│   ├── Http/
│   │   ├── Controllers/Auth/
│   │   │   ├── RegisterController.php
│   │   │   ├── LoginController.php
│   │   │   ├── LogoutController.php
│   │   │   ├── ForgotPasswordController.php
│   │   │   └── ResetPasswordController.php
│   │   ├── Requests/Auth/
│   │   │   ├── RegisterRequest.php
│   │   │   └── LoginRequest.php
│   │   └── Resources/
│   │       ├── UserResources.php
│   │       ├── RoleResource.php
│   │       ├── CoachResource.php
│   │       ├── UserCollection.php
│   │       └── CoachCollection.php
│   └── Models/
│       ├── User.php
│       ├── Role.php
│       └── Coach.php
├── database/
│   ├── migrations/
│   │   ├── xxxx_create_users_table.php
│   │   ├── xxxx_create_roles_table.php
│   │   ├── xxxx_create_role_user_table.php
│   │   └── xxxx_create_coaches_table.php
│   └── seeders/
│       └── RoleSeeder.php
├── routes/
│   ├── api.php
│   └── auth.php
├── config/
│   └── cors.php
└── README.md
```

---

## 🧪 Tests effectués

- [x] Inscription utilisateur (prospect et coach)
- [x] Connexion avec identifiants valides/invalides
- [x] Déconnexion avec token
- [x] Récupération du profil utilisateur
- [x] Validation des champs requis
- [x] Gestion des erreurs (401, 422, etc.)

---

## 📋 Prochaines étapes (hors scope)

- [ ] CRUD complet des coachs
- [ ] Système de réservation de séances
- [ ] Gestion des paiements
- [ ] Notifications push
- [ ] Tests unitaires automatisés

---

## 🔗 Liens utiles

- **Base URL API** : `http://127.0.0.1:8000/api`
- **Documentation** : `BackEnd/README.md`

---

## 👥 Reviewers suggérés

@equipe-frontend @lead-dev
