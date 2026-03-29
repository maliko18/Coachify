<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimit
{
    public function handle(
        Request $request,
        Closure $next,
        int $maxAttempts = 0,
        int $decaySeconds = 0
    ): Response {
        $isReadRequest = in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true);

        $resolvedMaxAttempts = $maxAttempts > 0
            ? $maxAttempts
            : (int) env(
                $isReadRequest ? 'API_RATE_LIMIT_MAX_ATTEMPTS_READ' : 'API_RATE_LIMIT_MAX_ATTEMPTS_WRITE',
                $isReadRequest ? 240 : 120
            );

        $resolvedDecaySeconds = $decaySeconds > 0
            ? $decaySeconds
            : (int) env('API_RATE_LIMIT_DECAY_SECONDS', 60);

        $routeKey = $request->route()?->uri() ?? $request->path();
        $key = 'api-rate-limit:'
            . ($request->user()?->id ?? $request->ip())
            . ':' . $request->method()
            . ':' . $routeKey;

        if (RateLimiter::tooManyAttempts($key, $resolvedMaxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Trop de requetes. Veuillez reessayer plus tard.',
                'error' => [
                    'code' => 'TOO_MANY_REQUESTS',
                    'status' => 429,
                    'retry_after' => $retryAfter,
                ],
            ], 429)
                ->header('Retry-After', $retryAfter)
                ->header('X-RateLimit-Limit', $resolvedMaxAttempts)
                ->header('X-RateLimit-Remaining', 0);
        }

        RateLimiter::hit($key, $resolvedDecaySeconds);

        $response = $next($request);

        $remaining = max(0, $resolvedMaxAttempts - RateLimiter::attempts($key));

        $response->headers->set('X-RateLimit-Limit', (string) $resolvedMaxAttempts);
        $response->headers->set('X-RateLimit-Remaining', (string) $remaining);

        return $response;
    }
}
