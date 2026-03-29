# 05 - Flux metier bout-en-bout

## 1) Flux authentification

1. Utilisateur ouvre /login ou /signup.
2. Frontend envoie /api/login ou /api/register.
3. Token stocke cote frontend.
4. Recuperation /api/user.
5. Redirection dashboard selon role.

Fichiers cle:

- [FrontEnd/src/context/AuthContext.tsx](../FrontEnd/src/context/AuthContext.tsx)
- [FrontEnd/src/components/GuestRoute.tsx](../FrontEnd/src/components/GuestRoute.tsx)
- [FrontEnd/src/components/ProtectedRoute.tsx](../FrontEnd/src/components/ProtectedRoute.tsx)

## 2) Flux reservation + paiement

1. User/client ouvre /book-coach/:coachId.
2. Selection coach + creneau + infos personnelles.
3. Frontend charge produits via /api/produits?coach_id=...
4. Frontend cree commande via /api/commandes.
5. Facture locale ajoutee dans localStorage cote frontend.
6. Redirection vers /user/bookings.

Notes:

- Un fallback local existe en cas d'erreur table produits absente.
- Message d'erreur explicite si aucun produit actif.

Fichier cle:

- [FrontEnd/src/pages/BookCoachPage.tsx](../FrontEnd/src/pages/BookCoachPage.tsx)

## 3) Flux post-commande (messagerie + notifications)

1. Creation commande backend.
2. Emission notifications client/coach.
3. Creation/reutilisation conversation.
4. Envoi d'un premier message contextuel.

Fichier backend cle:

- [BackEnd/app/Http/Controllers/CommandeController.php](../BackEnd/app/Http/Controllers/CommandeController.php)

## 4) Flux messagerie

1. Ouverture de /coach/messages ou /user/messages.
2. Chargement /api/conversations.
3. Selection conversation.
4. Chargement /api/conversations/{id}/messages.
5. Envoi via POST /api/conversations/{id}/messages.

Fichiers cles:

- [FrontEnd/src/pages/CoachMessagesPage.tsx](../FrontEnd/src/pages/CoachMessagesPage.tsx)
- [FrontEnd/src/api/conversations.ts](../FrontEnd/src/api/conversations.ts)

## 5) Flux dashboard coach

1. Ouverture /coach/dashboard.
2. Chargement seances, commandes, notifications, conversations.
3. Chargement KPI via /api/coach/dashboard/kpis.
4. Liens rapides vers analytics, messages, seances, offres.

Fichier cle:

- [FrontEnd/src/pages/CoachDashboard.tsx](../FrontEnd/src/pages/CoachDashboard.tsx)

## 6) Flux analytics coach

1. Ouverture /coach/analytics.
2. Appels:
   - /api/coach/dashboard/kpis
   - /api/coach/dashboard/ca
   - /api/coach/dashboard/taux-remplissage
3. Affichage normalise des valeurs numeriques.

Fichier API cle:

- [FrontEnd/src/api/coachDashboard.ts](../FrontEnd/src/api/coachDashboard.ts)

## 7) Flux contenu public (blog)

1. Home affiche une grille d'articles.
2. Click sur un article -> /blog/:postId.
3. La page detail propose navigation precedent/suivant.

Fichiers cles:

- [FrontEnd/src/components/BlogGrid.tsx](../FrontEnd/src/components/BlogGrid.tsx)
- [FrontEnd/src/pages/BlogPage.tsx](../FrontEnd/src/pages/BlogPage.tsx)
- [FrontEnd/src/pages/BlogPostPage.tsx](../FrontEnd/src/pages/BlogPostPage.tsx)
- [FrontEnd/src/data/blogPosts.ts](../FrontEnd/src/data/blogPosts.ts)

## 8) Flux de protection des routes

Regles frontend:

- Sans token: acces interdit aux routes protegees, redirection /login.
- Utilisateur connecte sur route invite: redirection dashboard selon role.
- Coach sur route user/client: redirection vers /coach/dashboard.
- User/client sur route coach: redirection vers /user/dashboard.

Fichiers:

- [FrontEnd/src/components/ProtectedRoute.tsx](../FrontEnd/src/components/ProtectedRoute.tsx)
- [FrontEnd/src/components/GuestRoute.tsx](../FrontEnd/src/components/GuestRoute.tsx)
