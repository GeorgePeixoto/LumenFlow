<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseAuthService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $firebaseAuthService;

    public function __construct(FirebaseAuthService $firebaseAuthService)
    {
        $this->firebaseAuthService = $firebaseAuthService;
    }

    /**
     * POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $displayName = $validated['responsible_name'] ?? $validated['name'] ?? null;

        // Criar usuário no Firebase Auth
        $firebaseResult = $this->firebaseAuthService->createUser(
            $validated['email'],
            $validated['password']
        );

        if (!$firebaseResult['success']) {
            throw ValidationException::withMessages([
                'email' => [$firebaseResult['error']],
            ]);
        }

        $authResult = $this->firebaseAuthService->authenticateUser(
            $validated['email'],
            $validated['password']
        );

        if (!$authResult['success']) {
            throw ValidationException::withMessages([
                'email' => [$authResult['error']],
            ]);
        }

        // Armazenar informações adicionais no banco de dados local
        $user = \App\Models\User::create([
            'name' => $displayName,
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'company_name' => $validated['company_name'] ?? null,
            'cnpj' => $validated['cnpj'] ?? null,
            'segment' => $validated['segment'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuário registrado com sucesso',
            'token' => $authResult['idToken'],
            'user' => [
                'uid' => $firebaseResult['uid'],
                'email' => $firebaseResult['email'],
                'name' => $displayName,
                'company_name' => $validated['company_name'] ?? null,
            ]
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $authResult = $this->firebaseAuthService->authenticateUser(
            $validated['email'],
            $validated['password']
        );

        if (!$authResult['success']) {
            throw ValidationException::withMessages([
                'email' => [$authResult['error']],
            ]);
        }

        // Armazenar token na sessão
        session(['firebase_token' => $authResult['idToken']]);

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'token' => $authResult['idToken'],
            'user' => [
                'uid' => $authResult['uid'],
                'email' => $authResult['email']
            ]
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->header('Authorization');

        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            $this->firebaseAuthService->signOut($token);
        }

        // Limpar sessão
        session()->forget('firebase_token');

        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso.'
        ]);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->header('Authorization');

        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => 'Token não fornecido'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $token);
        $verifyResult = $this->firebaseAuthService->verifyToken($token);

        if (!$verifyResult['success']) {
            return response()->json([
                'success' => false,
                'error' => $verifyResult['error']
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $verifyResult
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        // Enviar link de redefinição via Firebase
        // Firebase não tem endpoint direto para isso, precisa ser via console ou email templates
        return response()->json([
            'message' => 'Por favor, verifique seu e-mail para redefinir a senha.',
        ]);
    }

    /**
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'idToken' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:8'],
        ]);

        $result = $this->firebaseAuthService->changePassword(
            $request->idToken,
            $request->newPassword
        );

        if (!$result['success']) {
            throw ValidationException::withMessages([
                'password' => [$result['error']],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Senha redefinida com sucesso.',
        ]);
    }
}
