<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResources;
use App\Models\Coach;
use App\Models\Role;
use App\Models\User;
use App\Services\Coach\CoachContentSeeder;
use Google\Auth\AccessToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GoogleAuthController extends Controller
{
    /**
     * Authentifier (ou créer) un utilisateur à partir d'un ID token Google.
     *
     * Le SPA récupère l'ID token via Google Identity Services puis l'envoie ici.
     * On vérifie cryptographiquement le token contre les clés publiques de Google,
     * on s'assure qu'il a été émis pour notre Client ID, puis on retourne un token
     * Sanctum exploitable comme avec /login.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'credential' => ['required', 'string'],
            'role' => ['nullable', 'in:prospect,coach'],
        ]);

        $clientId = config('services.google.client_id');
        if (! $clientId) {
            Log::error('Google sign-in attempted but GOOGLE_CLIENT_ID is not configured.');

            return response()->json([
                'message' => 'Connexion Google indisponible. Contactez l\'administrateur.',
            ], 503);
        }

        $payload = $this->verifyIdToken($data['credential'], $clientId);

        if (! $payload) {
            throw ValidationException::withMessages([
                'credential' => ['Le jeton Google est invalide ou expiré.'],
            ]);
        }

        if (empty($payload['email_verified']) || $payload['email_verified'] !== true) {
            throw ValidationException::withMessages([
                'credential' => ['Adresse email Google non vérifiée.'],
            ]);
        }

        $email = strtolower(trim($payload['email'] ?? ''));
        if ($email === '') {
            throw ValidationException::withMessages([
                'credential' => ['Le jeton Google ne contient pas d\'adresse email.'],
            ]);
        }

        $requestedRole = $data['role'] ?? Role::PROSPECT;

        $user = DB::transaction(function () use ($payload, $email, $requestedRole) {
            // Recherche par email pour fusionner un éventuel compte existant.
            $user = User::where('email', $email)->first();
            $isNewUser = $user === null;

            if ($isNewUser) {
                $user = User::create([
                    'first_name' => $payload['given_name'] ?? Str::before($email, '@'),
                    'last_name' => $payload['family_name'] ?? '',
                    'email' => $email,
                    // Mot de passe aléatoire non utilisable : l'utilisateur passera toujours
                    // par Google ou utilisera "mot de passe oublié" s'il veut une connexion classique.
                    'password' => Hash::make(Str::random(40)),
                    'email_verified_at' => now(),
                ]);
            }

            // Marquer l'email vérifié si ce n'était pas déjà le cas (Google l'a vérifié pour nous).
            if (! $user->email_verified_at) {
                $user->email_verified_at = now();
                $user->save();
            }

            // Assignation du rôle uniquement lors de la création.
            // Un utilisateur existant garde ses rôles actuels.
            if ($isNewUser) {
                if ($requestedRole === Role::COACH) {
                    $user->assignRole(Role::COACH);
                    $coach = Coach::create(['user_id' => $user->id]);
                    CoachContentSeeder::seed($coach, $user);
                    $user->load('coach');
                } else {
                    $user->assignRole(Role::PROSPECT);
                }
            }

            return $user;
        });

        $token = $user->createToken('google_auth')->plainTextToken;

        return response()->json([
            'message' => 'Connexion Google réussie',
            'user' => new UserResources($user->load('roles')),
            'token' => $token,
        ]);
    }

    /**
     * Vérifie cryptographiquement un ID token Google et retourne son payload.
     * Retourne null si le token est invalide, expiré ou émis pour une autre audience.
     */
    private function verifyIdToken(string $idToken, string $expectedAudience): ?array
    {
        try {
            $accessToken = new AccessToken();
            $payload = $accessToken->verify($idToken, [
                'audience' => $expectedAudience,
            ]);

            if (! $payload) {
                return null;
            }

            // Double-check de l'issuer même si la lib le fait déjà : ceinture + bretelles.
            $issuer = $payload['iss'] ?? '';
            if (! in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)) {
                return null;
            }

            return $payload;
        } catch (\Throwable $e) {
            Log::warning('Google ID token verification failed', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
