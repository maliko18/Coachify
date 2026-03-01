# 📚 Documentation API - Index

Bienvenue dans la documentation de l'API Backend de Coaching Fitness !

---

## 🎯 Par où commencer ?

### Si vous êtes de l'équipe **FRONTEND** :

1. **📧 [MESSAGE_FRONTEND.md](./MESSAGE_FRONTEND.md)** ⭐ **COMMENCEZ ICI !**
   - Vue d'ensemble complète
   - Informations essentielles
   - Checklist d'intégration

2. **🚀 [FRONTEND_QUICKSTART.md](./FRONTEND_QUICKSTART.md)** (3 min)
   - Intégration rapide
   - Code prêt à copier-coller
   - Exemples minimaux

3. **📄 [API_EXAMPLES.md](./API_EXAMPLES.md)** (10 min)
   - Toutes les réponses JSON
   - Exemples de succès et d'erreurs
   - Structure des données

4. **📖 [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** (30 min)
   - Guide complet d'intégration
   - Exemples Fetch, Axios, React
   - Gestion des erreurs
   - React Context

5. **📘 [api-types.ts](./api-types.ts)**
   - Types TypeScript complets
   - Interfaces pour toutes les réponses
   - Helpers utilitaires

6. **🧪 [api-tests.http](./api-tests.http)**
   - Tester l'API directement dans VS Code
   - Extension REST Client requise

### Si vous êtes de l'équipe **BACKEND** :

1. **📖 [README.md](../../BackEnd/README.md)**
   - Installation et configuration
   - Documentation technique complète
   - Liste des endpoints

2. **🛣️ [routes/api.php](../../BackEnd/routes/api.php)**
   - Toutes les routes de l'API
   - Configuration des middlewares

3. **✅ [tests/Feature/](../../BackEnd/tests/Feature/)**
   - Tests d'authentification
   - Tests des middlewares
   - Exemples d'utilisation

---

## 📂 Structure de la Documentation

```
documentation/backend_doc/
├── 📧 MESSAGE_FRONTEND.md          ← ⭐ START HERE (Frontend)
├── 🚀 FRONTEND_QUICKSTART.md       ← Quick Start (3 min)
├── 📖 API_INTEGRATION_GUIDE.md     ← Guide complet (30 min)
├── 📄 API_EXAMPLES.md              ← Exemples de réponses JSON
├── 📘 api-types.ts                 ← Types TypeScript
├── 🧪 api-tests.http               ← Tests REST Client
└── 📚 INDEX.md                     ← Ce fichier

BackEnd/
├── 📖 README.md                    ← Documentation backend
└── 🔧 MERGE_REQUEST.md             ← Template de merge request
```

---

## 🎓 Parcours d'Apprentissage Recommandé

### Niveau 1 : Débutant (15 min)

1. Lire [MESSAGE_FRONTEND.md](./MESSAGE_FRONTEND.md)
2. Lire [FRONTEND_QUICKSTART.md](./FRONTEND_QUICKSTART.md)
3. Tester 2-3 endpoints avec [api-tests.http](./api-tests.http)

✅ Vous savez maintenant : Base URL, authentification, structure des réponses

### Niveau 2 : Intermédiaire (45 min)

1. Consulter [API_EXAMPLES.md](./API_EXAMPLES.md)
2. Lire la section Fetch/Axios de [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
3. Implémenter login/register dans votre app

✅ Vous savez maintenant : Faire des requêtes, gérer les tokens, afficher les erreurs

### Niveau 3 : Avancé (2h)

1. Implémenter React Context (voir [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md))
2. Ajouter [api-types.ts](./api-types.ts) à votre projet
3. Implémenter la protection des routes par rôle
4. Configurer axios avec interceptors

✅ Vous savez maintenant : Architecture complète, TypeScript, gestion globale des erreurs

---

## 🔗 Liens Rapides

### Endpoints Principaux

| Endpoint                   | Description          | Documentation                                        |
| -------------------------- | -------------------- | ---------------------------------------------------- |
| `POST /api/register`       | Inscription          | [API_EXAMPLES.md#inscription](./API_EXAMPLES.md)     |
| `POST /api/login`          | Connexion            | [API_EXAMPLES.md#connexion](./API_EXAMPLES.md)       |
| `GET /api/user`            | Utilisateur connecté | [API_EXAMPLES.md#utilisateur](./API_EXAMPLES.md)     |
| `GET /api/coach/dashboard` | Dashboard coach      | [API_EXAMPLES.md#dashboard-coach](./API_EXAMPLES.md) |

### Concepts Clés

| Concept             | Documentation                                                       |
| ------------------- | ------------------------------------------------------------------- |
| Authentification    | [FRONTEND_QUICKSTART.md#authentification](./FRONTEND_QUICKSTART.md) |
| Système de rôles    | [FRONTEND_QUICKSTART.md#roles](./FRONTEND_QUICKSTART.md)            |
| Gestion des erreurs | [API_INTEGRATION_GUIDE.md#erreurs](./API_INTEGRATION_GUIDE.md)      |
| Types TypeScript    | [api-types.ts](./api-types.ts)                                      |
| Middlewares         | [../../BackEnd/README.md#middlewares](../../BackEnd/README.md)      |

---

## 🧰 Outils Utiles

### Extensions VS Code Recommandées

- **REST Client** - Tester l'API directement

  ```
  ext install humao.rest-client
  ```

  → Ouvrir [api-tests.http](./api-tests.http) et cliquer sur "Send Request"

- **Thunder Client** - Alternative à Postman
  ```
  ext install rangav.vscode-thunder-client
  ```

### Outils Externes

- **Postman** - Tests d'API
- **Insomnia** - Alternative à Postman
- **cURL** - Ligne de commande

---

## ❓ FAQ

**Q: Quelle documentation lire en premier ?**  
R: [MESSAGE_FRONTEND.md](./MESSAGE_FRONTEND.md) → Vue d'ensemble complète

**Q: Où trouver des exemples de code ?**  
R: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) → Fetch, Axios, React

**Q: Comment tester l'API rapidement ?**  
R: [api-tests.http](./api-tests.http) avec l'extension REST Client

**Q: Où sont les types TypeScript ?**  
R: [api-types.ts](./api-types.ts) → Copier dans votre projet

**Q: Comment gérer les rôles ?**  
R: [FRONTEND_QUICKSTART.md#roles](./FRONTEND_QUICKSTART.md)

**Q: Format des erreurs ?**  
R: [API_EXAMPLES.md#erreurs](./API_EXAMPLES.md)

---

## 📞 Support

### Ressources

- **Logs Backend** : `BackEnd/storage/logs/laravel.log`
- **Routes disponibles** : `cd BackEnd && php artisan route:list`
- **Tests** : `cd BackEnd && ./vendor/bin/pest`

### Contact

- **Questions techniques** : Équipe Backend
- **Bugs** : Créer une issue sur le repo
- **Améliorations** : Merge Request

---

## ✅ Checklist Complète

### Avant de commencer

- [ ] J'ai lu MESSAGE_FRONTEND.md
- [ ] J'ai compris le système d'authentification (Bearer Token)
- [ ] Je connais les 5 rôles disponibles
- [ ] J'ai testé au moins 1 endpoint avec REST Client

### Configuration Frontend

- [ ] J'ai configuré la baseURL (`http://127.0.0.1:8000/api`)
- [ ] J'ai copié les types TypeScript (si TypeScript)
- [ ] J'ai configuré Axios avec interceptors (si Axios)
- [ ] J'ai un plan pour gérer l'authentification (Context/Redux)

### Fonctionnalités de base

- [ ] Inscription fonctionnelle
- [ ] Connexion fonctionnelle
- [ ] Sauvegarde du token dans localStorage
- [ ] Token ajouté aux headers des requêtes protégées
- [ ] Gestion erreur 401 (redirection login)
- [ ] Gestion erreur 403 (message d'erreur)
- [ ] Affichage des erreurs de validation (422)

### Protection des routes

- [ ] Vérification des rôles avant affichage menu
- [ ] Routes frontend protégées par rôle
- [ ] Redirection si rôle insuffisant
- [ ] Menu adapté selon le rôle utilisateur

### Tests

- [ ] Testé inscription prospect
- [ ] Testé inscription coach
- [ ] Testé connexion
- [ ] Testé déconnexion
- [ ] Testé route protégée (avec token)
- [ ] Testé route protégée (sans token) → 401
- [ ] Testé route avec mauvais rôle → 403

---

**Documentation créée le 1er février 2026**  
**Dernière mise à jour : 1er février 2026**

Pour toute suggestion d'amélioration de cette documentation, contactez l'équipe backend.
