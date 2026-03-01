Projet ArchiWeb 2026 -- Expression de besoins
Le projet Archiweb 2026 vise à développer une application web complète et intuitive pour assister les coachs sportifs dans la gestion de leur activité professionnelle. Cette plateforme centralisera les outils nécessaires pour optimiser les interactions avec les clients, les partenaires et les structures sportives, tout en facilitant la monétisation des services et des produits.

L'objectif principal est de fournir un écosystème numérique adapté aux besoins variés des coachs, qu'ils opèrent de manière indépendante, en partenariat ou au sein d'une salle de sport.

L'application sera conçue avec une architecture modulaire, permettant une scalabilité facile et une intégration avec des services tiers (calendriers Google, API Garmin/Strava, systèmes de paiement en ligne).

Elle priorisera une interface utilisateur responsive, accessible sur desktop et mobile.

1. Objectifs
Concevoir une application web permettant à un coach sportif de piloter :

son activité commerciale (clients, prospects, contrats, ventes),
son activité opérationnelle (agenda, séances, programmes),
son contenu métier (exercices, plans d'entraînement, nutrition),
sa relation client (messagerie, suivi de progression),
ses revenus (facturation, reporting),
ses partenariats (salles, autres coachs).
Le système doit être multi-acteurs, multi-contrats, multi-modèles économiques.

Le coach sportif opère dans un environnement dynamique où il gère des prestations variées pour des clients individuels ou collectifs. Les modes de travail incluent :

Séances individuelles directes : Contrat direct coach ↔ client
Séances collectives directes : Offres groupées (contrat par client)
Séances collectives pour une salle : Prestations au bénéfice d'une structure (salle, entreprise, association)
Séances individuelles pour une salle : Sessions personnalisées déléguées par la salle
Partenariats avec d'autres coachs : Sous-traitance ou co-traitance (partage de revenus/commissions)
En synthèse, on cherchera à mettre en oeuvre les modules suivants:

CRM complet (gestion clients, prospects, partenaires)
Bibliothèques d'exercices, séances et programmes d'entraînement
Bibliothèque de plans nutritionnels
Gestion d'agenda très rigoureuse + synchronisation externe
Facturation multi-types de contrats (packs, abonnements, commissions, TVA variable)
Boutique en ligne (produits physiques et numériques)
Messagerie intégrée (individuelle & groupée)
Import données physiologiques (Garmin, Strava, etc.)
Dashboards & reporting (CA, rétention, progression clients)
Gestion des partenariats & sous-traitance
...
2. Acteurs et rôles
2.1 Rôles principaux
Prospect : utilisateur non inscrit ou sans contrat actif
Client : personne ayant acheté une prestation
Coach : prestataire principal
Responsable de salle : gestionnaire d'une structure
Coach partenaire : sous-traitant / co-traitant
Administrateur système (rôle technique)
2.2 Exemples de droits généraux
Action	Prospect	Client	Coach	Responsable
Consulter les coachs	✔	✔	✔	✔
Réserver une séance	✖	✔	✔	✔
Créer des programmes	✖	✖	✔	✖
Voir la facturation	✖	Partiel	✔	✔
Gérer les coachs	✖	✖	✖	✔
3. Périmètre fonctionnel - Vision synthétique
3.1 CRM -- Gestion des clients
Fonctionnalités :

Création / modification / archivage d'un client.
Informations
Identité, coordonnées,
Objectifs sportifs.
Pathologies, blessures, restrictions médicales.
Consentements RGPD.
Historique
des séances,
achats,
paiements,
messages.
Tags personnalisés.
Groupes de clients.
Segmentation dynamique (par tags, activité, ancienneté, consommation).
Règles métier :

Un client peut avoir plusieurs contrats simultanés.
Un client peut appartenir à plusieurs groupes.
Un coach ne voit que ses propres clients sauf partage explicite.
3.2 Contrats et offres
Types d'offres :

À la séance (pack).
À la durée (abonnement).
Séances collectives.
Programmes numériques.
Produits.
Fonctionnalités :

Catalogue d'offres.
Gestion des prix, TVA, promotions.
Achat en ligne.
Suivi des consommations.
Alertes de seuil.
3.3 Agenda et planification
Fonctionnalités :

Vue calendrier (jour / semaine / mois).
Gestion :
séances individuelles,
séances collectives,
indisponibilités,
congés.
Réservation en ligne.
Limitation de capacité.
Liste d’attente.
Notifications :
rappel séance,
annulation,
modification.
Interopérabilité :

Export Google Calendar (ICS).
Synchronisation unidirectionnelle minimum.
3.4 Gestion des séances
Création de séances types.
Association d'exercices.
Association à un client ou un groupe
Suivi
de présence
performance
commentaires du coach
commentaires du client (évaluation de la difficulté, ajout de répétition, ...)
Historique exploitable.
3.5 Bibliothèque d'exercices et programmes
Exercices :

Catégories,
niveau,
matériel,
médias,
consignes.
Séances :

Assemblage d'exercices.
Durée estimée.
Objectifs.
Programmes :

Séquences planifiées.
Publication progressive.
Gratuit / payant.
Planification automatique.
3.6 Intégration données sportives
Connexion APIs tierces (mock? ).
Synchronisation
distance
fréquence cardiaque
temps
calories
répétitions
Corrélation avec planning.
Indicateurs de progression.
3.7 Facturation et reporting
Factures automatiques.
Historique des paiements.
Export comptable.
Statistiques commerciales
Chiffre d'affaire
taux de remplissage,
fidélisation,
panier moyen.
3.8 Boutique
Catalogue produits.
Gestion de stock.
Commande en ligne.
Livraison / Retrait.
Historique client.
3.9 Messagerie interne
Messagerie individuelle et de groupe.
Notifications.
Historique sécurisé.
3.10 Portail Prospect
Recherche géolocalisée.
Filtres avancés.
Création de compte.
Achat direct.
4. Périmètre fonctionnel - Vision use case
En tant que Coach, je peux...
Clients
Ajouter un client (coordonnées + objectifs + données de base)
Enregistrer l'historique des blessures + niveau de gravité
Proposer et vendre packs "à la séance" (5, 10, 20…)
Proposer et vendre abonnements "à la durée" (mensuel, 3 mois, 6 mois…)
Planifier des séances individuelles précises
Visualiser l'historique + futur + solde restant par client
Recevoir des alertes de fin de pack / abonnement imminent
Voir qui consulte / achète mes programmes
Importer les données d'entraînement depuis Garmin/Strava/…
Créer des groupes de clients
Utiliser des tags personnalisés pour segmentation
Séances
Consulter un calendrier global interactif (vue jour/semaine/mois)
Créer et publier des séances collectives ouvertes (inscription préalable)
Suivre les réservations, listes d'attente, annulations
Annuler/reporter une séance → notification auto
Noter présences + feedbacks post-séance
Contenus / Programmes
Créer des exercices (avec vidéos, consignes, niveaux)
Composer des séances type
Créer des programmes complets (avec ou sans planification temporelle)
Publier des programmes gratuits d'accueil
Vendre des programmes planifiés (progression auto dans le calendrier client)
Créer et vendre des plans nutritionnels
Facturation & Chiffres
Suivi CA hebdo/mensuel/trimestriel/annuel
Suivi solde consommation par client
Gestion boutique (produits physiques & numériques)
Facturation automatique + rapports fiscaux
Autres
Exporter agenda vers Google Calendar / iCal / Outlook
Messagerie intégrée (1-to-1 et groupée par tag/groupe)
Gestion partenaires (commissions, agenda partagé)
En tant que Prospect, je peux...
Voir les salles de sport proches (géolocalisation)
Rechercher des coachs (spécialités, distance, avis, tarifs)
Consulter profils coachs + programmes gratuits
Acheter directement packs/séances/abonnements
Demander un devis personnalisé
En tant que Client, je peux...
Consulter mon planning personnel + rappels
Suivre mes progrès (graphiques, stats importées)
Accéder à mes programmes et contenus achetés
Réserver/annuler séances collectives
Communiquer avec mon coach et avec mon groupe
Payer en ligne + consulter historique paiements
Laisser des avis
Acheter produits boutique du coach
En tant que Responsable de salle, je peux...
Gérer les coachs affiliés + contrats
Planifier séances salle
Suivre inscriptions & occupation
Facturer / recevoir rapports
5. Données principales
Utilisateur
Rôle
Client
Coach
Salle
Contrat
Offre
Séance
Programme
Exercice
Planning
Paiement
Facture
Message
Groupe
Tag
Produit
Stock
Données sportives
6. Contraintes non fonctionnelles
Sécurité :

Authentification forte.
RGPD.
Chiffrement.
Performance :

Temps de réponse \< 500 ms.
Scalabilité :

API REST.
Séparation frontend / backend.
Traçabilité :

Journalisation.
Intégrations tierces

paiement,
calendrier,
tracking fitness