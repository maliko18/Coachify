<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 100);
        $limit = max(1, min(500, $limit));

        $lines = $this->tailAuditLogs($limit);

        return response()->json([
            'success' => true,
            'data' => $lines,
            'meta' => [
                'count' => count($lines),
                'limit' => $limit,
            ],
        ]);
    }

    /**
     * Récupère les dernières lignes des fichiers d'audit.
     */
    private function tailAuditLogs(int $limit): array
    {
        $logDir = storage_path('logs');
        $files = glob($logDir . DIRECTORY_SEPARATOR . 'audit-*.log') ?: [];

        // fallback si le canal n'utilise pas le format daily
        $singleFile = $logDir . DIRECTORY_SEPARATOR . 'audit.log';
        if (is_file($singleFile)) {
            $files[] = $singleFile;
        }

        if (empty($files)) {
            return [];
        }

        rsort($files);

        $buffer = [];
        foreach ($files as $file) {
            $fileLines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            $buffer = array_merge($buffer, array_slice($fileLines, -$limit));
            if (count($buffer) >= $limit) {
                break;
            }
        }

        return array_slice($buffer, -$limit);
    }
}
