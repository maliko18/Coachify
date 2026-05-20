<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\app\Http\Controllers\Auth\RegisterController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResources;
use App\Models\Coach;
use App\Models\Produit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            // 1. Créer l'utilisateur
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // 2. Assigner le rôle et créer le profil si coach
            if ($data['role'] === Role::COACH) {
                $user->assignRole(Role::COACH);
                $coach = Coach::create(['user_id' => $user->id]);

                // Produit "service" par défaut pour permettre les réservations
                // immédiatement après l'inscription (la page Book A Coach
                // requiert au moins un produit actif pour ce coach).
                Produit::create([
                    'coach_id' => $coach->id,
                    'nom' => 'Séance de coaching',
                    'description' => 'Séance individuelle de coaching avec '
                        . trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) . '.',
                    'type' => 'service',
                    'prix' => 60.00,
                    'stock_quantite' => 0,
                    'alerte_stock' => 0,
                    'visible' => true,
                ]);

                $user->load('coach');
            } else {
                $user->assignRole(Role::PROSPECT);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => new UserResources($user->load('roles')),
            'token' => $token,
        ], 201);
    }
}
