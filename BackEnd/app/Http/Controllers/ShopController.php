<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Produit::query()->with('coach.user');

        if (!$request->user()->hasRole('coach') || !$request->boolean('include_hidden', false)) {
            $query->where('visible', true);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->filled('coach_id')) {
            $query->where('coach_id', (int) $request->input('coach_id'));
        }

        if ($request->filled('q')) {
            $term = $request->string('q')->toString();
            $query->where(function ($builder) use ($term) {
                $builder->where('nom', 'like', '%' . $term . '%')
                    ->orWhere('description', 'like', '%' . $term . '%');
            });
        }

        $produits = $query->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $produits,
        ]);
    }

    public function show(Request $request, Produit $produit): JsonResponse
    {
        $user = $request->user();

        if (!$produit->visible && !($user->hasRole('coach') && $user->coach && $user->coach->id === $produit->coach_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non accessible.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $produit->load('coach.user'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('coach') || !$user->coach) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux coachs.',
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:' . implode(',', Produit::TYPES),
            'prix' => 'required|numeric|min:0',
            'stock_quantite' => 'required|integer|min:0',
            'alerte_stock' => 'required|integer|min:0',
            'visible' => 'nullable|boolean',
        ]);

        $validated['coach_id'] = $user->coach->id;
        $produit = Produit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès.',
            'data' => $produit,
        ], 201);
    }

    public function update(Request $request, Produit $produit): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('coach') || !$user->coach || $produit->coach_id !== $user->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à ce produit.',
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:' . implode(',', Produit::TYPES),
            'prix' => 'nullable|numeric|min:0',
            'stock_quantite' => 'nullable|integer|min:0',
            'alerte_stock' => 'nullable|integer|min:0',
            'visible' => 'nullable|boolean',
        ]);

        $produit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour avec succès.',
            'data' => $produit,
        ]);
    }

    public function destroy(Request $request, Produit $produit): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('coach') || !$user->coach || $produit->coach_id !== $user->coach->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à ce produit.',
            ], 403);
        }

        $produit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit archivé avec succès.',
        ]);
    }

    public function stock(Request $request, Produit $produit): JsonResponse
    {
        $user = $request->user();

        if (!$produit->visible && !($user->hasRole('coach') && $user->coach && $user->coach->id === $produit->coach_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non accessible.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'produit_id' => $produit->id,
                'stock_quantite' => $produit->stock_quantite,
                'alerte_stock' => $produit->alerte_stock,
                'low_stock' => $produit->isLowStock(),
            ],
        ]);
    }
}
