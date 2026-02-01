<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class ApiExceptionHandler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Rendre les erreurs en JSON pour les requêtes API
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Handle API exceptions and return JSON responses.
     */
    protected function handleApiException(Throwable $exception, Request $request): JsonResponse
    {
        // Validation errors
        if ($exception instanceof ValidationException) {
            return $this->validationErrorResponse($exception);
        }

        // Authentication errors
        if ($exception instanceof AuthenticationException) {
            return $this->errorResponse(
                'Non authentifié.',
                'UNAUTHENTICATED',
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Authorization errors
        if ($exception instanceof AuthorizationException) {
            return $this->errorResponse(
                'Accès non autorisé.',
                'FORBIDDEN',
                Response::HTTP_FORBIDDEN
            );
        }

        // Model not found
        if ($exception instanceof ModelNotFoundException) {
            $model = class_basename($exception->getModel());
            return $this->errorResponse(
                "Ressource {$model} non trouvée.",
                'RESOURCE_NOT_FOUND',
                Response::HTTP_NOT_FOUND
            );
        }

        // Route not found
        if ($exception instanceof NotFoundHttpException) {
            return $this->errorResponse(
                'Route non trouvée.',
                'ROUTE_NOT_FOUND',
                Response::HTTP_NOT_FOUND
            );
        }

        // Method not allowed
        if ($exception instanceof MethodNotAllowedHttpException) {
            return $this->errorResponse(
                'Méthode HTTP non autorisée.',
                'METHOD_NOT_ALLOWED',
                Response::HTTP_METHOD_NOT_ALLOWED
            );
        }

        // Too many requests
        if ($exception instanceof TooManyRequestsHttpException) {
            return $this->errorResponse(
                'Trop de requêtes. Veuillez réessayer plus tard.',
                'TOO_MANY_REQUESTS',
                Response::HTTP_TOO_MANY_REQUESTS
            );
        }

        // Generic HTTP exceptions
        if ($exception instanceof HttpException) {
            return $this->errorResponse(
                $exception->getMessage() ?: 'Erreur HTTP.',
                'HTTP_ERROR',
                $exception->getStatusCode()
            );
        }

        // Server error (500)
        return $this->errorResponse(
            config('app.debug') ? $exception->getMessage() : 'Erreur serveur interne.',
            'SERVER_ERROR',
            Response::HTTP_INTERNAL_SERVER_ERROR,
            config('app.debug') ? [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => collect($exception->getTrace())->take(5)->toArray(),
            ] : null
        );
    }

    /**
     * Create a validation error response.
     */
    protected function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Les données fournies sont invalides.',
            'error' => [
                'code' => 'VALIDATION_ERROR',
                'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
                'errors' => $exception->errors(),
            ],
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Create a standardized error response.
     */
    protected function errorResponse(
        string $message,
        string $code,
        int $status,
        ?array $debug = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'error' => [
                'code' => $code,
                'status' => $status,
            ],
        ];

        if ($debug !== null) {
            $response['error']['debug'] = $debug;
        }

        return response()->json($response, $status);
    }
}
