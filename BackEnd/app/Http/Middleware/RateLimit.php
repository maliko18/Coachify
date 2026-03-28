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
        int $maxAttempts = 60,
        int $decaySeconds = 60
    ): Response {
        $key = 'api-rate-limit:' . ($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
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
                ->header('X-RateLimit-Limit', $maxAttempts)
                ->header('X-RateLimit-Remaining', 0);
        }

        RateLimiter::hit($key, $decaySeconds);

        $response = $next($request);

        $remaining = max(0, $maxAttempts - RateLimiter::attempts($key));

        $response->headers->set('X-RateLimit-Limit', (string) $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', (string) $remaining);

        return $response;
    }
}
