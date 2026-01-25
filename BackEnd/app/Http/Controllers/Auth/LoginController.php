<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        $user = $request->user();
        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
             'token' => $token,
            'user' => $user,
            ] );
    }
    

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    
    {
          /** @var \Laravel\Sanctum\PersonalAccessToken|null $token */
        $token = $request->user()?->currentAccessToken();
        
        if ($token) {
            $token->delete();
        }

        return response()->noContent();
    }
}
