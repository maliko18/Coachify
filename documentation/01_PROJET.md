# 01 - Vue d'ensemble du projet

## Objectif produit

Coachify est une plateforme de coaching sportif qui connecte coachs et clients autour de:

- la gestion des offres et contrats
- la planification des seances
- les paiements, commandes et factures
- les programmes d'entrainement
- la messagerie et les notifications
- les dashboards de suivi

## Architecture technique

## Frontend

- React 18+
- TypeScript 5+
- Vite 6+
- TailwindCSS 4+
- React Router pour le routage
- Axios pour la communication API

## Backend

- Laravel 11
- PHP 8.2+
- Auth via Sanctum
- Middleware de securite (RBAC, ownership, rate limit)
- API REST JSON

## Base de donnees

- MySQL 8+

## Organisation code

- [FrontEnd/src/App.tsx](../FrontEnd/src/App.tsx): routes frontend
- [FrontEnd/src/context/AuthContext.tsx](../FrontEnd/src/context/AuthContext.tsx): etat auth global
- [FrontEnd/src/components/ProtectedRoute.tsx](../FrontEnd/src/components/ProtectedRoute.tsx): protection role/token
- [FrontEnd/src/components/GuestRoute.tsx](../FrontEnd/src/components/GuestRoute.tsx): redirection invite
- [FrontEnd/src/api/index.ts](../FrontEnd/src/api/index.ts): export central des services API
- [BackEnd/routes/api.php](../BackEnd/routes/api.php): routes API

## Roles metier

- prospect: utilisateur non client
- client: utilisateur avec parcours client
- coach: utilisateur avec espace coach
- admin / gym_manager: routes reservees backend

## Principes de securite

- Auth obligatoire sur les routes metier
- Controles de role cote backend
- Controles de role cote frontend (guards)
- Controle ownership sur ressources sensibles
- Rate limiting sur API protegee

## Modules fonctionnels

- Authentification et profil
- Dashboard client / coach
- Seances
- Offres
- Contrats
- Exercices
- Programmes
- Paiements
- Factures
- Boutique (produits + commandes)
- Messagerie
- Notifications
- Blog / contenu public
