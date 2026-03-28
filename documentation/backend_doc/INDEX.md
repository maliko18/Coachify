# Documentation Backend Doc

Ce dossier a ete simplifie pour garder uniquement les fichiers utiles.

## A lire en priorite

1. [GUIDE_FRONTEND_API.md](./GUIDE_FRONTEND_API.md)
2. [postman_collection.json](./postman_collection.json)
3. [api-tests.http](./api-tests.http)
4. [api-types.ts](./api-types.ts)

## Ce qui est conserve

- [GUIDE_FRONTEND_API.md](./GUIDE_FRONTEND_API.md) : guide principal integration frontend
- [postman_collection.json](./postman_collection.json) : collection Postman prete a l'emploi
- [api-tests.http](./api-tests.http) : tests rapides dans VS Code (REST Client)
- [api-types.ts](./api-types.ts) : types TypeScript
- [INDEX.md](./INDEX.md) : index court

## Documentation backend technique

- [BackEnd/README.md](../../BackEnd/README.md)
- [BackEnd/routes/api.php](../../BackEnd/routes/api.php)
- [BackEnd/tests/Feature](../../BackEnd/tests/Feature)

## Base URL API

http://127.0.0.1:8000/api
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
