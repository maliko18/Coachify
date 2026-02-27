<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\OffreController;
use App\Http\Controllers\SeanceController;
use App\Http\Resources\UserResources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques (sans authentification)
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php'; // Inscription, connexion, mot de passe oublié

/*
|--------------------------------------------------------------------------
| Routes protégées - Authentification requise
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Informations de l'utilisateur connecté
    Route::get('/user', function (Request $request) {
        return new UserResources($request->user()->load('roles', 'coach'));
    });

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

        // Routes Clients (CRUD)
        Route::apiResource('clients', ClientController::class);

        // Routes Offres (CRUD)
        Route::apiResource('offres', OffreController::class);

        // Routes Contrats (CRUD)
        Route::apiResource('contrats', ContratController::class);
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
    });

    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux CLIENTS
    |--------------------------------------------------------------------------
    | Middleware : is_client
    | Rôle requis : client
    */
    Route::middleware('is_client')->prefix('client')->group(function () {
        // Mes séances (le client voit ses séances)
        Route::get('/seances', [SeanceController::class, 'mesSeances']);

        // Feedback du client sur une séance
        Route::post('/seances/{seance}/feedback', [SeanceController::class, 'feedbackClient']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux ADMINS
    |--------------------------------------------------------------------------
    | Middleware : is_admin
    | Rôle requis : admin
    */
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        // Exemple : Liste des utilisateurs
        Route::get('/users', function (Request $request) {
            return response()->json([
                'message' => 'Liste des utilisateurs (admin only)',
            ]);
        });

        // TODO: Ajouter les routes admin ici
        // Route::get('/statistics', [AdminController::class, 'statistics']);
        // Route::post('/users/{user}/ban', [AdminController::class, 'banUser']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes réservées aux RESPONSABLES DE SALLE
    |--------------------------------------------------------------------------
    | Middleware : is_gym_manager
    | Rôle requis : gym_manager
    */
    Route::middleware('is_gym_manager')->prefix('gym')->group(function () {
        // Exemple : Dashboard salle
        Route::get('/dashboard', function (Request $request) {
            return response()->json([
                'message' => 'Dashboard responsable de salle',
            ]);
        });

        // TODO: Ajouter les routes gym manager ici
        // Route::get('/equipment', [EquipmentController::class, 'index']);
        // Route::post('/equipment', [EquipmentController::class, 'store']);
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
