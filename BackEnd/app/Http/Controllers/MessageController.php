<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function indexConversations(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $requestedPerPage = (int) $request->query('per_page', 0);
        $perPage = $requestedPerPage > 0 ? max(1, min($requestedPerPage, 100)) : 0;

        $query = Conversation::query()
            ->select(['id', 'user_id', 'coach_id', 'last_message_at', 'created_at', 'updated_at'])
            ->forUser($userId)
            ->with(['user:id,first_name,last_name,email', 'coach:id,first_name,last_name,email'])
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $conversations = $perPage > 0
            ? $query->paginate($perPage)
            : $query->limit(100)->get();

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function storeConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:users,id|different:' . $request->user()->id,
        ]);

        $userId = (int) $request->user()->id;
        $coachId = (int) $validated['coach_id'];

        $coachUser = User::find($coachId);
        if (!$coachUser || !$coachUser->hasRole('coach')) {
            return response()->json([
                'success' => false,
                'message' => 'Le destinataire doit avoir le role coach.',
            ], 422);
        }

        $conversation = Conversation::firstOrCreate([
            'user_id' => $userId,
            'coach_id' => $coachId,
        ], [
            'last_message_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $conversation->wasRecentlyCreated
                ? 'Conversation créée avec succès.'
                : 'Conversation déjà existante.',
            'data' => $conversation,
        ], $conversation->wasRecentlyCreated ? 201 : 200);
    }

    public function indexConversationMessages(Request $request, Conversation $conversation): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 15), 100));

        $messages = $conversation->messages()
            ->with('sender:id,first_name,last_name,email')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function storeConversationMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'contenu' => 'required|string|max:2000',
        ]);

        $message = $conversation->messages()->create([
            'from_id' => $request->user()->id,
            'contenu' => $validated['contenu'],
            'sent_at' => now(),
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé avec succès.',
            'data' => $message->load('sender:id,first_name,last_name,email'),
        ], 201);
    }

    public function indexGroupMessages(Request $request, Group $group): JsonResponse
    {
        if (!$this->canAccessGroup($request, $group)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à ce groupe.',
            ], 403);
        }

        $perPage = max(1, min((int) $request->query('per_page', 15), 100));

        $messages = $group->messages()
            ->with('sender:id,first_name,last_name,email')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function storeGroupMessage(Request $request, Group $group): JsonResponse
    {
        if (!$this->canAccessGroup($request, $group)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à ce groupe.',
            ], 403);
        }

        $validated = $request->validate([
            'contenu' => 'required|string|max:2000',
        ]);

        $message = $group->messages()->create([
            'from_id' => $request->user()->id,
            'contenu' => $validated['contenu'],
            'sent_at' => now(),
        ]);

        $group->update(['last_message_at' => now()]);

        $recipientIds = $group->members()
            ->where('users.id', '!=', $request->user()->id)
            ->pluck('users.id')
            ->values()
            ->all();

        // Notification asynchrone simplifiée (logging) en attendant le module Notifications dédié.
        Log::info('group_message_sent', [
            'group_id' => $group->id,
            'from_id' => $request->user()->id,
            'recipient_ids' => $recipientIds,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message de groupe envoyé avec succès.',
            'data' => $message->load('sender:id,first_name,last_name,email'),
        ], 201);
    }

    private function canAccessGroup(Request $request, Group $group): bool
    {
        $userId = (int) $request->user()->id;

        if ((int) $group->coach_id === $userId) {
            return true;
        }

        return $group->hasMember($userId);
    }
}
