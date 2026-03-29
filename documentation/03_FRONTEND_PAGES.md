# 03 - Documentation des pages frontend

Source principale: [FrontEnd/src/App.tsx](../FrontEnd/src/App.tsx)

## Legende

- Acces public: sans authentification
- Acces invite: seulement non connecte (GuestRoute)
- Acces protege: token requis (ProtectedRoute)
- Role user: espace user/client
- Role coach: espace coach

## A. Pages publiques

| URL                       | Page                 | Fichier                                                                                                                                                                                                                                         | Fonctionnalites principales                   | Liens principaux                                |
| ------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| /                         | Home                 | [FrontEnd/src/components/Hero.tsx](../FrontEnd/src/components/Hero.tsx) + [FrontEnd/src/components/HowItWorks.tsx](../FrontEnd/src/components/HowItWorks.tsx) + [FrontEnd/src/components/BlogGrid.tsx](../FrontEnd/src/components/BlogGrid.tsx) | Landing, CTA, mise en avant coachs/blog       | /coaches, /blog, /signup                        |
| /services                 | Services             | [FrontEnd/src/pages/ServicesPage.tsx](../FrontEnd/src/pages/ServicesPage.tsx)                                                                                                                                                                   | Presentation services plateforme              | /coaches                                        |
| /blog                     | Blog list            | [FrontEnd/src/pages/BlogPage.tsx](../FrontEnd/src/pages/BlogPage.tsx)                                                                                                                                                                           | Liste d'articles                              | /blog/:postId                                   |
| /blog/:postId             | Blog detail          | [FrontEnd/src/pages/BlogPostPage.tsx](../FrontEnd/src/pages/BlogPostPage.tsx)                                                                                                                                                                   | Detail article + navigation precedent/suivant | /blog                                           |
| /contact                  | Contact              | [FrontEnd/src/pages/ContactPage.tsx](../FrontEnd/src/pages/ContactPage.tsx)                                                                                                                                                                     | Formulaire / infos contact                    | /                                               |
| /coaches                  | Coaches listing      | [FrontEnd/src/pages/CoachesPage.tsx](../FrontEnd/src/pages/CoachesPage.tsx)                                                                                                                                                                     | Liste coachs, actions profil/book/programmes  | /coaches/:coachId/profile, /book-coach/:coachId |
| /coaches/:coachId/profile | Coach public profile | [FrontEnd/src/pages/CoachProfilePage.tsx](../FrontEnd/src/pages/CoachProfilePage.tsx)                                                                                                                                                           | Profil detail, CTA reservation                | /book-coach/:coachId                            |

## B. Pages invitees (GuestRoute)

| URL              | Page                | Fichier                                                                           | Fonctionnalites                 |
| ---------------- | ------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| /login           | Login               | [FrontEnd/src/pages/Login.tsx](../FrontEnd/src/pages/Login.tsx)                   | Authentification utilisateur    |
| /signup          | Signup              | [FrontEnd/src/pages/Signup.tsx](../FrontEnd/src/pages/Signup.tsx)                 | Inscription role coach/prospect |
| /forgot-password | Mot de passe oublie | [FrontEnd/src/pages/ForgotPassword.tsx](../FrontEnd/src/pages/ForgotPassword.tsx) | Demarrage reset password        |

Comportement guard invite:

- utilisateur deja connecte redirige vers dashboard role-appropriate
- source: [FrontEnd/src/components/GuestRoute.tsx](../FrontEnd/src/components/GuestRoute.tsx)

## C. Pages protegees role user/client

| URL                                 | Page                        | Fichier                                                                                                     | Fonctionnalites                                                   | APIs principales                                               |
| ----------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| /user/dashboard                     | User dashboard              | [FrontEnd/src/pages/UserDashboard.tsx](../FrontEnd/src/pages/UserDashboard.tsx)                             | KPIs perso, activite, raccourcis                                  | /user, /client/seances, /commandes                             |
| /user/wallet                        | Wallet                      | [FrontEnd/src/pages/WalletPage.tsx](../FrontEnd/src/pages/WalletPage.tsx)                                   | Suivi paiements/depenses                                          | /user, /commandes                                              |
| /user/bookings                      | Bookings                    | [FrontEnd/src/pages/BookingsPage.tsx](../FrontEnd/src/pages/BookingsPage.tsx)                               | Historique reservations                                           | /user, /client/seances                                         |
| /user/profile                       | User profile                | [FrontEnd/src/pages/UserProfilePage.tsx](../FrontEnd/src/pages/UserProfilePage.tsx)                         | Mise a jour profil + password                                     | /user, /user/password                                          |
| /user/messages                      | Messages user               | [FrontEnd/src/pages/CoachMessagesPage.tsx](../FrontEnd/src/pages/CoachMessagesPage.tsx)                     | Conversations, lecture/envoi messages                             | /conversations, /conversations/:id/messages                    |
| /client/programmes/reservations     | Mes reservations programmes | [FrontEnd/src/pages/MyProgrammeReservationsPage.tsx](../FrontEnd/src/pages/MyProgrammeReservationsPage.tsx) | Programmes publies + mes reservations                             | /test/programmes, /test/programmes/reservations                |
| /client/coaches/:coachId/programmes | Programmes publics coach    | [FrontEnd/src/pages/CoachPublicProgrammesPage.tsx](../FrontEnd/src/pages/CoachPublicProgrammesPage.tsx)     | Consultation catalogue programmes coach                           | /coaches, /client/programmes                                   |
| /book-coach/:coachId                | Booking coach               | [FrontEnd/src/pages/BookCoachPage.tsx](../FrontEnd/src/pages/BookCoachPage.tsx)                             | Processus en 5 etapes, paiement, creation commande/facture locale | /coaches, /client/offres, /coach/offres, /produits, /commandes |

## D. Pages protegees role coach

| URL               | Page                   | Fichier                                                                                               | Fonctionnalites                                               | APIs principales                                                                  |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| /coach/dashboard  | Coach dashboard        | [FrontEnd/src/pages/CoachDashboard.tsx](../FrontEnd/src/pages/CoachDashboard.tsx)                     | KPIs, seances, commandes, notifications, chats                | /coach/dashboard/kpis, /coach/seances, /commandes, /notifications, /conversations |
| /coach/profile    | Coach profile settings | [FrontEnd/src/pages/CoachProfileSettingsPage.tsx](../FrontEnd/src/pages/CoachProfileSettingsPage.tsx) | Edition profil + mot de passe                                 | /user, /user/password                                                             |
| /coach/offres     | Offres coach           | [FrontEnd/src/pages/CoachOffersPage.tsx](../FrontEnd/src/pages/CoachOffersPage.tsx)                   | CRUD offres                                                   | /coach/offres                                                                     |
| /coach/seances    | Seances coach          | [FrontEnd/src/pages/CoachSeancesPage.tsx](../FrontEnd/src/pages/CoachSeancesPage.tsx)                 | Planning, export ICS, sync calendrier                         | /coach/seances, /seances/export/ics, /calendar/sync                               |
| /coach/exercices  | Exercices coach        | [FrontEnd/src/pages/CoachExercicesPage.tsx](../FrontEnd/src/pages/CoachExercicesPage.tsx)             | CRUD exercices                                                | /coach/exercices                                                                  |
| /coach/programmes | Programmes coach       | [FrontEnd/src/pages/CoachProgrammesPage.tsx](../FrontEnd/src/pages/CoachProgrammesPage.tsx)           | CRUD programmes + actions publication                         | /coach/programmes, /coach/programmes/:id/\*                                       |
| /coach/messages   | Messages coach         | [FrontEnd/src/pages/CoachMessagesPage.tsx](../FrontEnd/src/pages/CoachMessagesPage.tsx)               | Inbox coach, recherche conversation, preselection query param | /conversations, /conversations/:id/messages                                       |
| /coach/analytics  | Analytics coach        | [FrontEnd/src/pages/CoachAnalyticsPage.tsx](../FrontEnd/src/pages/CoachAnalyticsPage.tsx)             | CA, taux remplissage, KPIs                                    | /coach/dashboard/ca, /coach/dashboard/taux-remplissage, /coach/dashboard/kpis     |

## E. Composants transverses

- Header global: [FrontEnd/src/components/Header.tsx](../FrontEnd/src/components/Header.tsx)
  - navigation role-aware
  - menu profil
  - entree Messages + badge local unread
- Guard protege: [FrontEnd/src/components/ProtectedRoute.tsx](../FrontEnd/src/components/ProtectedRoute.tsx)
  - token requis
  - blocage acces inter-role (coach vers user/_, user vers coach/_)
- Guard invite: [FrontEnd/src/components/GuestRoute.tsx](../FrontEnd/src/components/GuestRoute.tsx)
  - redirection role-aware si deja connecte

## F. Services API frontend

Services centralises: [FrontEnd/src/api/index.ts](../FrontEnd/src/api/index.ts)

- [FrontEnd/src/api/offres.ts](../FrontEnd/src/api/offres.ts)
- [FrontEnd/src/api/contrats.ts](../FrontEnd/src/api/contrats.ts)
- [FrontEnd/src/api/exercices.ts](../FrontEnd/src/api/exercices.ts)
- [FrontEnd/src/api/paiements.ts](../FrontEnd/src/api/paiements.ts)
- [FrontEnd/src/api/seances.ts](../FrontEnd/src/api/seances.ts)
- [FrontEnd/src/api/programmes.ts](../FrontEnd/src/api/programmes.ts)
- [FrontEnd/src/api/factures.ts](../FrontEnd/src/api/factures.ts)
- [FrontEnd/src/api/conversations.ts](../FrontEnd/src/api/conversations.ts)
- [FrontEnd/src/api/coachDashboard.ts](../FrontEnd/src/api/coachDashboard.ts)
