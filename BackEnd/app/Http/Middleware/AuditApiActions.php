<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditApiActions
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            Log::channel('audit')->info('api_critical_action', [
                'user_id' => $request->user()?->id,
                'method' => $request->method(),
                'path' => $request->path(),
                'status' => $response->getStatusCode(),
                'ip' => $request->ip(),
            ]);

            // Invalidation coarse-grained des caches de performance.
            Cache::increment('perf:shop:catalog:version');

            if ($request->user()?->coach) {
                Cache::increment('perf:dashboard:coach:' . $request->user()->coach->id . ':version');
            }

            if ($request->user()?->client) {
                Cache::increment('perf:dashboard:client:' . $request->user()->client->id . ':version');
            }
        }

        return $response;
    }
}
