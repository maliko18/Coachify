<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class MonitorApiPerformance
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $durationMs = round((microtime(true) - $start) * 1000, 2);
        $response->headers->set('X-Response-Time-ms', (string) $durationMs);

        Log::channel('performance')->info('api_response_time', [
            'path' => $request->path(),
            'method' => $request->method(),
            'status' => $response->getStatusCode(),
            'duration_ms' => $durationMs,
            'user_id' => $request->user()?->id,
        ]);

        if ($durationMs > 500) {
            Log::channel('performance')->warning('api_sla_threshold_exceeded', [
                'path' => $request->path(),
                'method' => $request->method(),
                'duration_ms' => $durationMs,
                'user_id' => $request->user()?->id,
            ]);
        }

        return $response;
    }
}
