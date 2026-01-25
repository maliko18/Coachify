<?php
// filepath: c:\wamp64\www\archiweb_2026_projets_gr05\BackEnd\app\Http\Controllers\Auth\RegisterController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Coach;
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
            if ($data['role'] === 'coach') {
                $user->assignRole(Role::COACH);
                Coach::create(['user_id' => $user->id]);
                $user->load('coach');
            } else {
                $user->assignRole(Role::PROSPECT);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user->load('roles'),
            'token' => $token,
        ], 201);
    }
}
