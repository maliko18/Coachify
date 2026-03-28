# ⚡ QUICK START — Phase Finale Version 3 (binome)

Suivez exactement ces etapes pour demarrer la collaboration GitHub sur la phase finale V3.

---

## 🚀 ÉTAPE 1 — Configuration GitHub (à faire UNE FOIS)

### Sur GitHub (directeur/responsable du repo)

1. **Créer les Labels** → Settings → Labels

   ```
   feature (vert)
   test (bleu)
   bugfix (rouge)
   devA (pourpre)
   devB (rose)
   3-points / 5-points / 8-points (bleus différents)
   ```

2. **Créer le Milestone**
   - Nom : `Version 3 — Phase Finale Backend`
   - Date : 30 avril 2026
   - Description : Livraison complete backend (modules, integrations, tests, documentation)

3. **Activer les protections** → Settings → Branches
   - Branch name pattern : `main`
   - Require pull request reviews : ✅
   - Require status checks to pass : ✅

---

## 📋 ÉTAPE 2 — Créer les Issues (à faire UNE FOIS)

Copier les issues du fichier `GITHUB_ISSUES_PHASE2.md` :

```
#12 — Logique métier Offre + Contrat (Dev A, 3 pts)
#13 — Middleware & Autorisation (Dev A, 5 pts)
#14 — Tests Exercice + Paiement (Dev A, 5 pts)
#15 — Export & Metrics Offre (Dev A, 3 pts)
#16 — Logique métier Seance + Présence (Dev B, 5 pts)
#17 — Logique métier Programme (Dev B, 5 pts)
#18 — Facturation & PDF (Dev B, 8 pts)
#19 — Tests Seance + Client (Dev B, 8 pts)
#20 — Agenda + Synchronisation + Notifications
#21 — Messagerie
#22 — Boutique
#23 — Dashboards & Reporting
#24 — Intégrations sportives (mock)
#25 — Sécurité globale
#26 — Performance API
#27 — Stabilisation/Recette/Documentation finale
```

---

## 💻 ÉTAPE 3 — Développeur A — Démarrage

### Setup local

```bash
# Terminal 1
cd c:\wamp64\www\archiweb_2026_projets_gr05

# Mettre à jour la branche main
git checkout main
git pull origin main

# Vérifier Laravel fonctionne
php artisan migrate:refresh --seed
php artisan test

# Branche 1 : Logique métier Offre/Contrat (Issue #12)
git checkout -b feature/offre-contrat-logic
```

### Tâches #12 (3 jours)

```
1. Ajouter dans /app/Models/Offre.php :
   - Method seances_incluses()
   - Method getMetrics()

2. Ajouter dans /app/Models/Contrat.php :
   - Method seances_consommees()
   - Method seances_restantes()
   - Method status_workflow()

3. Créer tests unitaires :
   - tests/Unit/Models/OffreTest.php
   - tests/Unit/Models/ContratTest.php

4. Commands:
   php artisan test
   git commit -m "feat(offre): add seance counting methods"
   git commit -m "test(offre): add unit tests"
   git push origin feature/offre-contrat-logic

5. Sur GitHub : Ouvrir PR → Ajouter description → Assign Dev B pour review
```

### Puis les autres branche

```
# Issue #13 (Middleware)
git checkout main && git pull
git checkout -b feature/auth-offre-contrat
# ... développer, commit, push, PR ...

# Issue #14 (Tests)
git checkout main && git pull
git checkout -b feature/test-exercice-paiement
# ... développer, commit, push, PR ...

# Issue #15 (Export)
git checkout main && git pull
git checkout -b feature/offre-export
# ... développer, commit, push, PR ...
```

---

## 💻 ÉTAPE 4 — Développeur B — Démarrage

### Setup local (IDENTIQUE à Dev A)

```bash
cd c:\wamp64\www\archiweb_2026_projets_gr05
git checkout main
git pull origin main
php artisan migrate:refresh --seed
php artisan test
```

### Tâches #16 (4 jours)

```
1. Ajouter dans /app/Models/Seance.php :
   - Method marquer_presence($client_id, $statut)
   - Method get_participants()
   - Method get_waiting_list()
   - Method capacite_restante()

2. Vérifier Migration seance_client :
   - Colonnes : seance_id, client_id, statut_presence, feedback_client, feedback_coach

3. Créer tests unitaires :
   - tests/Unit/Models/SeanceTest.php

4. Commands:
   php artisan test
   git commit -m "feat(seance): add attendance tracking"
   git push origin feature/seance-presence

5. Sur GitHub : Ouvrir PR → Assign Dev A pour review
```

### Puis les autres branches

```
# Issue #17 (Programme logic)
git checkout main && git pull
git checkout -b feature/programme-logic
# ...

# Issue #18 (Facture PDF)
git checkout main && git pull
git checkout -b feature/facture-generation
# Ajouter : composer require barryvdh/laravel-dompdf
# ...

# Issue #19 (Tests)
git checkout main && git pull
git checkout -b feature/test-seance-client
# ...
```

---

## 👥 ÉTAPE 5 — Code Review Croisée

**Workflow** :

1. Dev A push PR pour Issue #12
2. Dev B review la PR #12 dans GitHub
3. Dev B leave comments / approval
4. Dev A fait corrections si nécessaire
5. Dev A merge PR quand approuvée
6. **PUIS** Dev B commence ses issues

**OU** en parallèle si issues indépendantes

### Checklist Review

```
✅ Code passe les tests (php artisan test)
✅ Pas d'erreurs PHP (php artisan lint)
✅ Relations Eloquent correctes
✅ Validations présentes dans les Models
✅ SoftDeletes utilisés si approprié
✅ Comments clairs pour code complexe
✅ Tests >= 80% coverage
✅ Pas de console.log()/dd() resté
✅ Commits mentionnent l'issue (#12, etc)
✅ Migration peut se rollback
```

---

## 🧪 ÉTAPE 6 — Tester LOCAL avant de push

```bash
# Vérifier les tests passent
php artisan test

# Vérifier code lint
php artisan lint:blade
php artisan lint:config

# Tester manuelle une route (ex: create offre)
curl -X POST http://localhost:8000/api/offres \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Premier pack","type":"pack_seance","prix":99.99}'

# Ou utiliser Postman / Thunder Client (VS Code ext)
```

---

## 📊 TIMELINE FINALE V3

```
Lundi 31 mars      : Dev A #12 + Dev B #16 (parallèle)
Mardi 1 avril      : Dev A #12 fini, Dev B #16 fini
Mercredi 2 avril   : Code review + Merge
Jeudi 3 avril      : Dev A #13 + Dev B #17 (parallèle)
Vendredi 4 avril   : Dev A #13 fini, Dev B #17 fini
Lundi 7 avril      : Dev A #14 + Dev B #18 (parallèle)
Mardi 8 avril      : Dev A #14 + Dev B #18 fini
Mercredi 9 avril   : Dev A #15 + Dev B #19 fini
Jeudi 10 avril     : Review intermédiaire + hotfixes
Vendredi 11 avril  : Lot final préparé
Semaine 3          : Issues #20 à #23
Semaine 4          : Issues #24 à #26
Semaine 5          : #27 recette, stabilisation, doc finale
```

---

## 📞 COMMUNICATION

- **Daily standup** : 10h00 (15 min)
- **Issues** : Mettre à jour dans GitHub (In Progress, Done)
- **Problèmes** : Slack/Discord immédiatement
- **PR reviews** : Max 12h pour répondre

---

## 🆘 AIDE RAPIDE

### Git branch bloquée ?

```bash
# Voir branches locales
git branch -a

# Supprimer branche locale
git branch -d feature/nom

# Supprimer branche distante
git push origin --delete feature/nom

# Recréer propre
git checkout main && git pull
git checkout -b feature/nom-clean
```

### Tests fail ?

```bash
# Relancer les tests
php artisan test

# Tests d'un fichier spécifique
php artisan test tests/Unit/Models/OffreTest.php

# Voir les erreurs détaillées
php artisan test --verbose

# Avec debug
php artisan test --log-teamcity
```

### Conflit merge ?

```bash
# Quand on pull ou merge
git status
# Éditer les fichiers en conflit
git add .
git commit -m "resolve merge conflict"
git push
```

### Réinitialiser BDD de test

```bash
php artisan migrate:fresh --seed
```

---

## ✅ CHECKLIST AVANT DE COMMENCER

- [ ] Main branch pull et à jour
- [ ] `php artisan migrate:refresh --seed` fonctionne
- [ ] `php artisan test` passe
- [ ] VS Code + extensions (Laravel, PHP Intelephense)
- [ ] Git configuré (`git config --global user.name "Prénom"`)
- [ ] Accès GitHub avec permissions
- [ ] Issues créées sur GitHub
- [ ] Milestone créé
- [ ] Labels créés

---

## 🎯 OBJECTIF FINAL

**À la fin de la Phase Finale V3** :

- ✅ PR des issues #12 a #27 mergees
- ✅ 0 conflits non-résolus
- ✅ >80% tests coverage
- ✅ API 100% fonctionnelle
- ✅ Documentation finale V3 complete
- ✅ Prete pour integration Frontend + recette client

---

**Bonne chance ! Vous êtes prêts ? → Allez ! 🚀**
