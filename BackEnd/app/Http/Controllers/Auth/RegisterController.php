<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResources;
use App\Models\Coach;
use App\Models\Role;
use App\Models\User;
use App\Services\Coach\CoachContentSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            if ($data['role'] === Role::COACH) {
                $user->assignRole(Role::COACH);
                $coach = Coach::create(['user_id' => $user->id]);

                CoachContentSeeder::seed($coach, $user);
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
