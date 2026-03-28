<?php

use App\Exceptions\ApiExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // $middleware->api(prepend: [
        //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'is_coach' => \App\Http\Middleware\EnsureUserIsCoach::class,
            'is_client' => \App\Http\Middleware\IsClient::class,
            'is_admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'is_gym_manager' => \App\Http\Middleware\EnsureUserIsGymManager::class,
            'check_offre_ownership' => \App\Http\Middleware\CheckOffreOwnership::class,
            'check_contrat_access' => \App\Http\Middleware\CheckContratAccess::class,
            'check_client_access' => \App\Http\Middleware\CheckClientAccess::class,
            'check_conversation_access' => \App\Http\Middleware\CheckConversationAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Gestion des erreurs d'authentification pour l'API
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié.',
                    'error' => [
                        'code' => 'UNAUTHENTICATED',
                        'status' => Response::HTTP_UNAUTHORIZED,
                    ],
                ], Response::HTTP_UNAUTHORIZED);
            }
        });

        // Gestion des erreurs de validation pour l'API
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les données fournies sont invalides.',
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
                        'errors' => $e->errors(),
                    ],
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        });

        // Gestion des erreurs 404 pour l'API
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ressource non trouvée.',
                    'error' => [
                        'code' => 'NOT_FOUND',
                        'status' => Response::HTTP_NOT_FOUND,
                    ],
                ], Response::HTTP_NOT_FOUND);
            }
        });
    })->create();
