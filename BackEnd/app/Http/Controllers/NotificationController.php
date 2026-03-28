<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Inbox utilisateur
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $this->generateSystemNotifications($user);

        $notifications = Notification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Marquer notification comme lue
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acces non autorise a cette notification.',
            ], 403);
        }

        $notification->update(['lue' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marquee comme lue.',
            'data' => $notification,
        ]);
    }

    /**
     * Generation des notifications systeme (rappels J/J-1 et fin de pack)
     */
    private function generateSystemNotifications($user): void
    {
        // Rappels seances pour coach
        if ($user->hasRole('coach') && $user->coach) {
            $seances = $user->coach->seances()
                ->get()
                ->filter(function ($seance) {
                    if (!$seance->date) {
                        return false;
                    }

                    $date = Carbon::parse($seance->date)->startOfDay();

                    return $date->betweenIncluded(now()->startOfDay(), now()->addDay()->startOfDay());
                });

            foreach ($seances as $seance) {
                $daysDiff = now()->startOfDay()->diffInDays($seance->date, false);
                $type = $daysDiff === 0 ? 'rappel_seance_jour_j' : 'rappel_seance_j_1';
                $key = $type . ':coach:' . $user->id . ':seance:' . $seance->id;

                Notification::firstOrCreate(
                    ['unique_key' => $key],
                    [
                        'user_id' => $user->id,
                        'type' => $type,
                        'lue' => false,
                        'data' => [
                            'seance_id' => $seance->id,
                            'titre' => $seance->titre,
                            'date' => $seance->date?->toDateString(),
                            'heure_debut' => $seance->heure_debut,
                        ],
                    ]
                );
            }
        }

        // Rappels seances et fin de pack pour client
        if ($user->hasRole('client') && $user->client) {
            $seances = $user->client->seances()
                ->get()
                ->filter(function ($seance) {
                    if (!$seance->date) {
                        return false;
                    }

                    $date = Carbon::parse($seance->date)->startOfDay();

                    return $date->betweenIncluded(now()->startOfDay(), now()->addDay()->startOfDay());
                });

            foreach ($seances as $seance) {
                $daysDiff = now()->startOfDay()->diffInDays($seance->date, false);
                $type = $daysDiff === 0 ? 'rappel_seance_jour_j' : 'rappel_seance_j_1';
                $key = $type . ':client:' . $user->id . ':seance:' . $seance->id;

                Notification::firstOrCreate(
                    ['unique_key' => $key],
                    [
                        'user_id' => $user->id,
                        'type' => $type,
                        'lue' => false,
                        'data' => [
                            'seance_id' => $seance->id,
                            'titre' => $seance->titre,
                            'date' => $seance->date?->toDateString(),
                            'heure_debut' => $seance->heure_debut,
                        ],
                    ]
                );
            }

            $contratsProches = $user->client->contrats()
                ->where('statut', 'actif')
                ->whereNotNull('date_fin')
                ->whereBetween('contrats.date_fin', [now()->toDateString(), now()->addDays(7)->toDateString()])
                ->get();

            foreach ($contratsProches as $contrat) {
                $key = 'fin_pack_imminente:client:' . $user->id . ':contrat:' . $contrat->id;

                Notification::firstOrCreate(
                    ['unique_key' => $key],
                    [
                        'user_id' => $user->id,
                        'type' => 'fin_pack_imminente',
                        'lue' => false,
                        'data' => [
                            'contrat_id' => $contrat->id,
                            'date_fin' => $contrat->date_fin?->toDateString(),
                            'offre_id' => $contrat->offre_id,
                        ],
                    ]
                );
            }
        }
    }
}
