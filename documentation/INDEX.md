# Documentation Projet Coachify

Bienvenue dans la documentation centrale du projet.

## Navigation rapide

- [Vue d'ensemble du projet](01_PROJET.md)
- [Guide d'installation et demarrage](02_INSTALLATION.md)
- [Documentation des pages frontend](03_FRONTEND_PAGES.md)
- [Documentation API backend](04_BACKEND_API.md)
- [Flux metier bout-en-bout](05_FLOWS_METIER.md)
- [Release v3.0.0](../RELEASE_v3.0.0.md)
- [README racine](../README.md)

## Portee de cette doc

Cette documentation couvre:

- architecture globale frontend/backend
- pages, routes, acces et liens de navigation
- fonctionnalites metier principales
- endpoints backend par module
- guide d'installation local
- scenarios metier (auth, reservation, paiement, messagerie)
- scenarios gym manager (pilotage salle, utilisateurs, seances, equipements)

## Structure du depot

- BackEnd/: API Laravel 11
- FrontEnd/: SPA React + TypeScript
- documentation/: documentation complete du projet

## Mini schema navigation par role

- client: /client/dashboard -> /bookings -> /wallet -> /user/messages -> /client/programmes/reservations
- coach: /coach/dashboard -> /coach/seances -> /coach/programmes -> /coach/exercices -> /coach/messages
- gym_manager: /gym/dashboard -> /gym/users -> /gym/seances -> /gym/equipements
- legacy: /admin/* redirige vers /gym/* cote frontend
