<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckConversationAccess
{
    /**
     * Vérifie que l'utilisateur connecté participe à la conversation.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $routeConversation = $request->route('conversation');

        if (!$routeConversation) {
            return $next($request);
        }

        $conversation = $routeConversation instanceof Conversation
            ? $routeConversation
            : Conversation::find($routeConversation);

        if (!$conversation) {
            return $this->jsonError('Conversation introuvable.', 404);
        }

        $userId = (int) $request->user()->id;
        if (!$conversation->hasParticipant($userId)) {
            return $this->jsonError('Accès non autorisé à cette conversation.', 403);
        }

        return $next($request);
    }

    private function jsonError(string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
