# 🏋️ Coaching Fitness - Projet Architecture Web 2026

Application web complète de coaching fitness développée par le **Groupe 05**.

> **Projet UHA** - Architecture Web 2026

---

## 🎯 Présentation du Projet

Cette application permet de gérer une plateforme de coaching fitness avec :

- 👥 Gestion des utilisateurs (prospects, clients, coachs)
- 🏢 Gestion des salles de sport
- 📊 Suivi des performances et statistiques
- 🔐 Système d'authentification sécurisé avec rôles

---

## 🛠️ Technologies Utilisées

### Frontend (📱 FrontEnd/)

| Technologie     | Version | Description       |
| --------------- | ------- | ----------------- |
| **React**       | 18+     | Framework UI      |
| **TypeScript**  | 5+      | Typage statique   |
| **Vite**        | 6+      | Build tool rapide |
| **TailwindCSS** | 4+      | Framework CSS     |
| **ESLint**      | -       | Linting code      |

### Backend (🔧 BackEnd/)

| Technologie | Version | Description          |
| ----------- | ------- | -------------------- |
| **Laravel** | 11      | Framework PHP        |
| **PHP**     | 8.2+    | Langage serveur      |
| **MySQL**   | 8.0+    | Base de données      |
| **Sanctum** | -       | Authentification API |
| **Pest**    | -       | Tests unitaires      |

---

## 📁 Structure du Projet

```
archiweb_2026_projets_gr05/
│
├── 📱 FrontEnd/                    # Application React/TypeScript
│   ├── src/
│   │   ├── api/                   # Services API
│   │   ├── components/            # Composants React
│   │   ├── context/               # Contextes React
│   │   └── pages/                 # Pages de l'application
│   ├── package.json
│   └── README.md
│
├── 🔧 BackEnd/                     # API REST Laravel
│   ├── app/
│   │   ├── Http/Controllers/      # Contrôleurs API
│   │   ├── Http/Middleware/       # Middlewares (auth, rôles)
│   │   └── Models/                # Modèles Eloquent
│   ├── routes/api.php             # Routes API
│   ├── database/                  # Migrations & Seeders
│   ├── tests/                     # Tests Pest
│   └── README.md
│
└── 📚 documentation/               # Documentation complète
    ├── README.md                  # Index documentation
    └── backend_doc/               # Doc API pour le Frontend
```

---

## 🚀 Installation & Démarrage

### 1️⃣ Backend (API Laravel)

```bash
# Aller dans le dossier backend
cd BackEnd

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Configurer la base de données dans .env
# DB_DATABASE=coaching_fitness
# DB_USERNAME=root
# DB_PASSWORD=

# Créer les tables et données de test
php artisan migrate --seed

# Lancer le serveur
php artisan serve
```

✅ **API disponible sur :** `http://127.0.0.1:8000/api`

### 2️⃣ Frontend (React/Vite)

```bash
# Aller dans le dossier frontend
cd FrontEnd

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

✅ **Application disponible sur :** `http://localhost:5173`

---

## 🔗 Documentation

| Document                   | Description                      | Lien                                                                             |
| -------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| 📚 **Index Documentation** | Vue d'ensemble de toute la doc   | [documentation/README.md](./documentation/README.md)                             |
| 🔧 **Backend README**      | Documentation technique API      | [BackEnd/README.md](./BackEnd/README.md)                                         |
| 📱 **Frontend README**     | Documentation technique Frontend | [FrontEnd/README.md](./FrontEnd/README.md)                                       |
| 🚀 **Quick Start API**     | Démarrage rapide intégration API | [FRONTEND_QUICKSTART.md](./documentation/backend_doc/FRONTEND_QUICKSTART.md)     |
| 📖 **Guide API Complet**   | Guide détaillé d'intégration     | [API_INTEGRATION_GUIDE.md](./documentation/backend_doc/API_INTEGRATION_GUIDE.md) |

---

## 👥 Pour les Équipes

### 📱 Équipe Frontend

> **⭐ Point d'entrée :** [documentation/backend_doc/MESSAGE_FRONTEND.md](./documentation/backend_doc/MESSAGE_FRONTEND.md)

**Ressources disponibles :**

- [Types TypeScript](./documentation/backend_doc/api-types.ts) - Interfaces prêtes à copier
- [Exemples de réponses](./documentation/backend_doc/API_EXAMPLES.md) - Format JSON des API
- [Tests HTTP](./documentation/backend_doc/api-tests.http) - Tests avec REST Client

### 🔧 Équipe Backend

> **⭐ Point d'entrée :** [BackEnd/README.md](./BackEnd/README.md)

**Commandes utiles :**

```bash
cd BackEnd
php artisan route:list          # Voir toutes les routes
./vendor/bin/pest               # Lancer les tests
php artisan migrate:fresh --seed # Reset la base
```

---

## 🎯 Fonctionnalités Principales

### Authentification & Rôles

| Rôle          | Description        | Accès            |
| ------------- | ------------------ | ---------------- |
| `prospect`    | Nouvel utilisateur | Accès basique    |
| `client`      | Client actif       | Accès programmes |
| `coach`       | Coach fitness      | Gestion clients  |
| `gym_manager` | Gérant de salle    | Gestion salle    |
| `admin`       | Administrateur     | Accès complet    |

### Endpoints API Principaux

| Endpoint        | Méthode | Description        |
| --------------- | ------- | ------------------ |
| `/api/register` | POST    | Inscription        |
| `/api/login`    | POST    | Connexion          |
| `/api/user`     | GET     | Profil utilisateur |
| `/api/coach/*`  | -       | Routes coach       |
| `/api/admin/*`  | -       | Routes admin       |

---

## 🧪 Tests

### Backend

```bash
cd BackEnd
./vendor/bin/pest
```

### Frontend

```bash
cd FrontEnd
npm run lint        # Vérification ESLint
npm run build       # Build production
```

---

## 📞 Contact Équipe

**Groupe 05 - Architecture Web 2026 - UHA**

---

## 📄 Licence

Projet académique - UHA 2026

### Rôles Disponibles

| Rôle          | Description            | Inscription |
| ------------- | ---------------------- | ----------- |
| `prospect`    | Utilisateur par défaut | ✅          |
| `coach`       | Coach sportif          | ✅          |
| `client`      | Client avec contrat    | ❌          |
| `gym_manager` | Responsable de salle   | ❌          |
| `admin`       | Administrateur         | ❌          |

---

## 👥 Équipe

- **Backend** : API Laravel avec Laravel Sanctum
- **Frontend** : React/Vue avec TypeScript
- **Année** : 2026
- **Projet** : Architecture Web

---

## 📞 Support

- **Documentation** : Voir [documentation/](./documentation/)
- **Issues** : Créer une issue sur le repo
- **Backend** : Consulter [BackEnd/README.md](./BackEnd/README.md)
- **Frontend** : Consulter [FrontEnd/README.md](./FrontEnd/README.md)

---

**Dernière mise à jour : 1er février 2026**
