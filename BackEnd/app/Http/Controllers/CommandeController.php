<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\CommandeItem;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CommandeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $requestedPerPage = (int) $request->query('per_page', 0);
        $perPage = $requestedPerPage > 0 ? max(1, min($requestedPerPage, 100)) : 0;

        $query = Commande::query()
            ->select(['id', 'client_id', 'coach_id', 'date_commande', 'statut', 'total', 'created_at'])
            ->with([
                'items:id,commande_id,produit_id,quantite,prix_unitaire',
                'items.produit:id,coach_id,nom,type,prix',
                'client:id,user_id,coach_id',
                'client.user:id,first_name,last_name,email',
                'coach:id,user_id',
                'coach.user:id,first_name,last_name,email',
            ])
            ->orderByDesc('date_commande');

        if ($user->hasRole('client') && $user->client) {
            $query->where('client_id', $user->client->id);
        } elseif ($user->hasRole('coach') && $user->coach) {
            $query->where('coach_id', $user->coach->id);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé aux commandes.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $perPage > 0 ? $query->paginate($perPage) : $query->limit(100)->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('client') || !$user->client) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux clients.',
            ], 403);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
        ]);

        $commande = DB::transaction(function () use ($validated, $user) {
            $itemsInput = collect($validated['items']);
            $produits = Produit::query()
                ->whereIn('id', $itemsInput->pluck('produit_id')->all())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $coachIds = $produits->pluck('coach_id')->unique()->values();
            if ($coachIds->count() !== 1) {
                throw ValidationException::withMessages([
                    'items' => ['Tous les produits d\'une commande doivent appartenir au même coach.'],
                ]);
            }

            $commande = Commande::create([
                'client_id' => $user->client->id,
                'coach_id' => (int) $coachIds->first(),
                'date_commande' => now(),
                'statut' => 'attente',
                'total' => 0,
            ]);

            $total = 0;

            foreach ($itemsInput as $itemInput) {
                $produit = $produits->get((int) $itemInput['produit_id']);

                if (!$produit || !$produit->visible) {
                    throw ValidationException::withMessages([
                        'items' => ['Un produit demandé est introuvable ou non disponible.'],
                    ]);
                }

                $quantite = (int) $itemInput['quantite'];

                if ($produit->type === 'physique') {
                    if ($produit->stock_quantite < $quantite) {
                        throw ValidationException::withMessages([
                            'items' => ["Stock insuffisant pour le produit {$produit->nom}."],
                        ]);
                    }

                    $produit->decrementStock($quantite);

                    if ($produit->isLowStock()) {
                        Log::warning('produit_low_stock', [
                            'produit_id' => $produit->id,
                            'stock_quantite' => $produit->stock_quantite,
                            'alerte_stock' => $produit->alerte_stock,
                        ]);
                    }
                }

                $prixUnitaire = (float) $produit->prix;
                $total += $prixUnitaire * $quantite;

                CommandeItem::create([
                    'commande_id' => $commande->id,
                    'produit_id' => $produit->id,
                    'quantite' => $quantite,
                    'prix_unitaire' => $prixUnitaire,
                ]);
            }

            $commande->update(['total' => round($total, 2)]);

            return $commande->fresh(['items.produit', 'client.user', 'coach.user']);
        });

        Cache::increment('perf:dashboard:coach:' . $commande->coach_id . ':version');
        Cache::increment('perf:dashboard:client:' . $commande->client_id . ':version');

        return response()->json([
            'success' => true,
            'message' => 'Commande créée avec succès.',
            'data' => $commande,
        ], 201);
    }

    public function updateStatus(Request $request, Commande $commande): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('coach') || !$user->coach || $commande->coach_id !== $user->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette commande.',
            ], 403);
        }

        $validated = $request->validate([
            'statut' => 'required|in:' . implode(',', Commande::STATUTS),
        ]);

        $newStatut = $validated['statut'];
        if (!$commande->canTransitionTo($newStatut)) {
            return response()->json([
                'success' => false,
                'message' => 'Transition de statut invalide.',
            ], 422);
        }

        $commande->update(['statut' => $newStatut]);

        Cache::increment('perf:dashboard:coach:' . $commande->coach_id . ':version');
        Cache::increment('perf:dashboard:client:' . $commande->client_id . ':version');

        return response()->json([
            'success' => true,
            'message' => 'Statut de commande mis à jour.',
            'data' => $commande->fresh(['items.produit', 'client.user', 'coach.user']),
        ]);
    }
}
