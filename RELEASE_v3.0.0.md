# v3.0.0 - Plateforme Coachify

## 🎯 Présentation

Version 3 de Coachify avec un focus sur la fiabilité du parcours utilisateur, la messagerie temps réel métier (coach/client), la navigation par rôles et l'expérience de contenu.

Cette release consolide les flux critiques: réservation/paiement, notifications post-commande, accès aux conversations, analytics coach, et routing sécurisé selon le rôle.

## ✨ Nouveautés majeures

### 💬 Messagerie & Notifications

- Automatisation post-commande côté backend:
  - création de notifications client/coach après paiement,
  - création (ou récupération) de conversation,
  - envoi d'un premier message de contexte.
- Intégration des accès messagerie dans l'UI:
  - entrée Messages dans le menu profil,
  - accès rapide depuis les dashboards,
  - badge d'éléments non lus côté frontend.
- Amélioration de la navigation coach:
  - depuis les "Recent Chats" du dashboard vers la vraie conversation,
  - pré-sélection d'une conversation via query param.

### 🔐 Sécurité de routage par rôle

- Renforcement des guards frontend:
  - redirection dynamique selon le rôle (coach vs user/client),
  - protection explicite des zones coach et user,
  - correction des redirections incorrectes vers user/dashboard pour les coachs.

### 📊 Analytics Coach fiabilisées

- Correction du parsing des réponses API dashboard:
  - prise en charge des champs numériques imbriqués,
  - suppression des affichages incohérents à 0.00 sur certains indicateurs.

### ⚡ API & Performance UX

- Ajustement du rate limiting backend:
  - limitation par utilisateur/IP + méthode + route,
  - séparation des seuils lecture/écriture,
  - réduction des faux positifs "Trop de requêtes" sur écrans riches.

### 📰 Blog & Home

- Refonte du module blog:
  - données d'articles structurées,
  - pages détail par article,
  - navigation article précédent/suivant,
  - amélioration de lisibilité (typographies ajustées).
- Section How It Works rendue plus data-driven pour simplifier l'évolution du contenu.

## 🧩 Backend - Détails

- Commandes: extension du flux de création pour déclencher notifications + conversation + message initial.
- Middleware RateLimit: nouvelle stratégie de clés de throttling plus granulaire.
- Configuration: variables d'environnement ajoutées pour piloter les limites API read/write.
- Données: ajout/ajustement de seeders et migration(s) liées aux parcours programme/produit.

## 🖥️ Frontend - Détails

- Routing:
  - nouvelles routes messagerie utilisateur,
  - route détail blog par identifiant,
  - guards Guest/Protected alignés avec les rôles.
- Dashboard coach:
  - CTA chat connectés à la vraie messagerie,
  - cohérence des indicateurs analytics.
- Composants:
  - Header enrichi (Messages + compteur),
  - BlogGrid et page détail améliorés,
  - pages Coach Messages / Coach Analytics consolidées.

## 🔁 Compatibilité & Impacts

- Impact fonctionnel: élevé (routing, dashboards, parcours commande/messagerie).
- Impact API: faible à modéré (pas de rupture majeure d'endpoint, mais comportements enrichis).
- Recommandation: déployer backend + frontend ensemble pour garantir la cohérence des flux post-paiement/messaging.

## ✅ Checklist de validation post-déploiement

1. Auth: login coach redirige vers dashboard coach, login client vers dashboard user.
2. Guard: un coach ne peut pas rester sur une route user/\* (et inversement).
3. Booking/paiement: création commande + facture + notifications + conversation initiale.
4. Dashboard coach: "Recent Chats" ouvre la conversation ciblée.
5. Analytics coach: les KPI/CA/taux d'occupation ne restent pas bloqués à 0.00.
6. Blog: ouverture par article, navigation précédent/suivant opérationnelle.

## 🛠️ Stack Technique

- Frontend: React 18+, TypeScript 5+, Vite 6+, TailwindCSS 4+
- Backend: Laravel 11, PHP 8.2+, Sanctum
- Base de données: MySQL 8+
- Tests: Pest PHP

## 📥 Installation / Mise à jour

Voir le README principal pour les instructions d'installation et de déploiement.

---

Version: v3.0.0
Statut: Ready for release
