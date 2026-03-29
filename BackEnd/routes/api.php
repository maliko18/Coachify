<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\GymManagerController;
use App\Http\Controllers\CoachController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciceController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OffreController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgrammeController;
use App\Http\Controllers\SeanceController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SportsDataController;
use App\Http\Resources\UserResources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques (sans authentification)
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php'; // Inscription, connexion, mot de passe oublié

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'status' => 'ok',
        'service' => config('app.name'),
        'timestamp' => now()->toISOString(),
    ]);
});

// Annuaire des coachs (consultation publique)
Route::get('/coaches', [CoachController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Routes protégées - Authentification requise
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'api_rate_limit', 'audit_api_actions', 'monitor_api_performance'])->group(function () {

    // Boutique V3 (catalogue + stock + commandes)
    Route::get('/produits', [ShopController::class, 'index']);
    Route::get('/produits/{produit}', [ShopController::class, 'show']);
    Route::get('/produits/{produit}/stock', [ShopController::class, 'stock']);
    Route::middleware('is_coach')->group(function () {
        Route::post('/produits', [ShopController::class, 'store']);
        Route::put('/produits/{produit}', [ShopController::class, 'update'])
            ->middleware('check_resource_ownership:produit,coach,coach_id');
        Route::delete('/produits/{produit}', [ShopController::class, 'destroy'])
            ->middleware('check_resource_ownership:produit,coach,coach_id');
        Route::put('/commandes/{commande}/status', [CommandeController::class, 'updateStatus'])
            ->middleware('check_resource_ownership:commande,coach,coach_id');
    });

    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::post('/commandes', [CommandeController::class, 'store']);

    // Sports Data V3 (mock Garmin/Strava)
    Route::post('/sports-data/import', [SportsDataController::class, 'import']);

    // Export CSV des offres (coach)
    Route::middleware('is_coach')->get('/offres/export/csv', [OffreController::class, 'exportCsv']);

    // Agenda + synchronisation calendrier
    Route::get('/seances/export/ics', [CalendarController::class, 'exportIcs']);
    Route::post('/calendar/sync', [CalendarController::class, 'sync']);

    // Notifications utilisateur
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->middleware('check_resource_ownership:notification,user,user_id');

    // Messagerie V3 (1-to-1 + groupe)
    Route::get('/conversations', [MessageController::class, 'indexConversations']);
    Route::post('/conversations', [MessageController::class, 'storeConversation']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'indexConversationMessages'])
        ->middleware('check_conversation_access');
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'storeConversationMessage'])
        ->middleware('check_conversation_access');

    Route::get('/groups/{group}/messages', [MessageController::class, 'indexGroupMessages']);
    Route::post('/groups/{group}/messages', [MessageController::class, 'storeGroupMessage']);

    // Informations de l'utilisateur connecté
    Route::get('/user', function (Request $request) {
        return new UserResources($request->user()->load('roles', 'coach'));
    });

    // Mise a jour du profil utilisateur connecte
    Route::put('/user', [ProfileController::class, 'update']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);

    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux COACHES
    |--------------------------------------------------------------------------
    | Middleware : is_coach
    | Rôle requis : coach
    */
    Route::middleware('is_coach')->prefix('coach')->group(function () {
        // Exemple : Dashboard coach
        Route::get('/dashboard', function (Request $request) {
            return response()->json([
                'message' => 'Bienvenue sur le dashboard coach',
                'coach' => $request->user()->coach,
            ]);
        });

        // Dashboard business coach (Issue #23)
        Route::get('/dashboard/kpis', [DashboardController::class, 'coachKpis']);
        Route::get('/dashboard/ca', [DashboardController::class, 'coachCA']);
        Route::get('/dashboard/taux-remplissage', [DashboardController::class, 'coachTauxRemplissage']);

        // Routes Clients (CRUD)
        Route::middleware('check_client_access')->apiResource('clients', ClientController::class);

        // Routes Offres (CRUD)
        Route::middleware('check_offre_ownership')->apiResource('offres', OffreController::class);

        // Routes Contrats (CRUD)
        Route::middleware('check_contrat_access')->apiResource('contrats', ContratController::class);
        Route::get('contrats-expiration', [ContratController::class, 'expirationProche']);
        // ── Routes Séances (CRUD) ──
        Route::apiResource('seances', SeanceController::class);

        // Gestion des inscriptions
        Route::post('/seances/{seance}/inscrire', [SeanceController::class, 'inscrireClient']);
        Route::delete('/seances/{seance}/desinscrire/{clientId}', [SeanceController::class, 'desinscrireClient']);

        // Gestion de la présence
        Route::put('/seances/{seance}/presence/{clientId}', [SeanceController::class, 'marquerPresence']);

        // Feedback du coach sur un client
        Route::put('/seances/{seance}/feedback-coach/{clientId}', [SeanceController::class, 'feedbackCoach']);

        // Routes Exercices (CRUD)
        Route::apiResource('exercices', ExerciceController::class);

        // Routes Paiements (CRUD)
        Route::apiResource('paiements', PaiementController::class);
        Route::post('paiements/{paiement}/valider', [PaiementController::class, 'valider']);
        Route::post('paiements/{paiement}/rembourser', [PaiementController::class, 'rembourser']);
        Route::post('paiements/{paiement}/annuler', [PaiementController::class, 'annuler']);
        Route::get('paiements-statistiques', [PaiementController::class, 'statistiques']);

        // ── Routes Programmes (CRUD) ──
        Route::apiResource('programmes', ProgrammeController::class);

        // Gestion des exercices dans un programme
        Route::post('/programmes/{programme}/exercices', [ProgrammeController::class, 'ajouterExercice']);
        Route::put('/programmes/{programme}/exercices/{exercice}', [ProgrammeController::class, 'modifierExercice']);
        Route::delete('/programmes/{programme}/exercices/{exercice}', [ProgrammeController::class, 'retirerExercice']);

        // Actions sur les programmes
        Route::post('/programmes/{programme}/publier', [ProgrammeController::class, 'publier']);
        Route::post('/programmes/{programme}/depublier', [ProgrammeController::class, 'depublier']);
        Route::post('/programmes/{programme}/archiver', [ProgrammeController::class, 'archiver']);
        Route::post('/programmes/{programme}/dupliquer', [ProgrammeController::class, 'dupliquer']);

        // ── Routes Factures (CRUD + Actions) ──
        Route::apiResource('factures', FactureController::class);

        // Actions sur les factures
        Route::post('/factures/{facture}/emettre', [FactureController::class, 'emettre']);
        Route::post('/factures/{facture}/payer', [FactureController::class, 'payer']);
        Route::post('/factures/{facture}/annuler', [FactureController::class, 'annuler']);
        Route::get('/factures/{facture}/pdf', [FactureController::class, 'exportPdf']);
        Route::post('/factures/{facture}/send-email', [FactureController::class, 'envoyerEmail']);

        // Factures en retard et statistiques
        Route::get('/factures-en-retard', [FactureController::class, 'enRetard']);
        Route::get('/factures-stats', [FactureController::class, 'statistiques']);
    });
     
    Route::get('/test/programmes', [ProgrammeController::class, 'index']);
    Route::post('/test/programmes/{programme}/reserve', [ProgrammeController::class, 'reserveTest']);
    Route::get('/test/programmes/reservations', [ProgrammeController::class, 'mesReservationsTest']);
    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux CLIENTS
    |--------------------------------------------------------------------------
    | Middleware : is_client
    | Rôle requis : client
    */
    Route::middleware('is_client')->prefix('client')->group(function () {
        // Mes informations
        Route::get('/info', [ClientController::class, 'info']);

        // Mes contrats
        Route::middleware('check_contrat_access')->apiResource('contrats', ContratController::class, ['only' => ['index', 'show']]);

        // Les offres disponibles (lecture seule)
        Route::get('/offres', [OffreController::class, 'index']);
        Route::get('/offres/{offre}', [OffreController::class, 'show']);

        // Mes séances (le client voit ses séances)
        Route::get('/seances', [SeanceController::class, 'mesSeances']);

        Route::get('/programmes', [ProgrammeController::class, 'index']);

        Route::get('/programmes/reservations', [ProgrammeController::class, 'mesReservationsTest']);

        // Dashboard client (Issue #23)
        Route::get('/dashboard/progression', [DashboardController::class, 'clientProgression']);
        Route::get('/dashboard/historique', [DashboardController::class, 'clientHistorique']);
        Route::get('/analytics/progression', [SportsDataController::class, 'analyticsProgression']);

        // Feedback du client sur une séance
        Route::post('/seances/{seance}/feedback', [SeanceController::class, 'feedbackClient']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux RESPONSABLES DE SALLE
    |--------------------------------------------------------------------------
    | Middleware : is_gym_manager
    | Rôle requis : gym_manager
    */
    Route::middleware('is_gym_manager')->prefix('gym')->group(function () {
        Route::get('/dashboard', [GymManagerController::class, 'dashboard']);
        Route::get('/users', [GymManagerController::class, 'users']);
        Route::get('/users/{userId}', [GymManagerController::class, 'show']);
        Route::put('/users/{userId}/roles', [GymManagerController::class, 'updateRoles']);
        Route::post('/users/{userId}/ban', [GymManagerController::class, 'ban']);
        Route::post('/users/{userId}/unban', [GymManagerController::class, 'unban']);
        Route::get('/seances', [GymManagerController::class, 'seances']);
        Route::get('/equipements', [GymManagerController::class, 'equipements']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes multi-rôles
    |--------------------------------------------------------------------------
    | Middleware : role:coach,admin
    | Plusieurs rôles autorisés
    */
    Route::middleware('role:coach,admin')->group(function () {
        // Exemple : Statistiques accessibles aux coaches ET admins
        Route::get('/statistics', function (Request $request) {
            return response()->json([
                'message' => 'Statistiques (coach ou admin)',
            ]);
        });
    });
});
