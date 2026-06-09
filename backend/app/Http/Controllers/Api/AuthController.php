<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseAuthService;
use App\Support\FirebaseHttpOptions;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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
                'id' => $user->id,
                'uid' => $firebaseResult['uid'],
                'email' => $firebaseResult['email'],
                'name' => $displayName,
                'company_name' => $user->company_name,
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

        $dbUser = User::where('email', $authResult['email'])->first();

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'token' => $authResult['idToken'],
            'user' => [
                'id' => $dbUser ? $dbUser->id : null,
                'uid' => $authResult['uid'],
                'email' => $authResult['email'],
                'name' => $dbUser ? $dbUser->name : null,
                'company_name' => $dbUser ? $dbUser->company_name : null,
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

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Usuário não autenticado'
            ], 401);
        }

        $firebaseUser = $request->attributes->get('firebase_user');

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'uid' => $firebaseUser['uid'] ?? ('fake-uid-' . md5($user->email)),
                'email' => $user->email,
                'name' => $user->name,
                'company_name' => $user->company_name,
            ]
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     *
     * Gera token UUID, salva no banco, envia e-mail via SMTP (MailHog em dev).
     * Sempre retorna sucesso (prevenção de user enumeration).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $email = strtolower(trim($request->email));

        // Buscar usuário no banco local
        $user = User::where('email', $email)->first();

        if ($user) {
            // Remover tokens antigos para este e-mail
            DB::table('password_resets')->where('email', $email)->delete();

            // Gerar novo token UUID
            $token = Str::uuid()->toString();

            // Salvar na tabela password_resets
            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => $token,
                'created_at' => now(),
            ]);

            // Enviar e-mail
            try {
                Mail::to($email)->send(new ResetPasswordMail($email, $token, $user->name));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Erro ao enviar e-mail de recuperação: ' . $e->getMessage());
            }
        }

        // Sempre retorna sucesso (não revelar se e-mail existe ou não)
        return response()->json([
            'success' => true,
            'message' => 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.',
        ]);
    }

    /**
     * POST /api/auth/reset-password
     *
     * Valida token, atualiza senha no Firebase Auth e no banco local.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $email = strtolower(trim($request->email));
        $token = $request->token;
        $newPassword = $request->password;

        // Buscar token no banco
        $resetRecord = DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'token' => ['Token inválido ou expirado.'],
            ]);
        }

        // Verificar expiração (1 hora)
        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            DB::table('password_resets')->where('email', $email)->delete();

            throw ValidationException::withMessages([
                'token' => ['Token expirado. Solicite um novo link de recuperação.'],
            ]);
        }

        // Buscar usuário local
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Usuário não encontrado.'],
            ]);
        }

        // Atualizar senha no Firebase Auth
        try {
            // Encontrar o UID do Firebase pelo email
            $firebaseAuth = app(FirebaseAuthService::class);

            // Precisamos usar o Admin SDK para buscar o usuário por email e atualizar
            // Vamos usar a abordagem de buscar pelo email no Firebase
            $this->updateFirebasePassword($email, $newPassword);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Erro ao atualizar senha no Firebase: ' . $e->getMessage());
            // Continuar mesmo se Firebase falhar — pelo menos atualizar local
        }

        // Atualizar senha local
        $user->update([
            'password' => bcrypt($newPassword),
        ]);

        // Remover token utilizado
        DB::table('password_resets')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Senha redefinida com sucesso.',
        ]);
    }

    /**
     * Atualiza a senha do usuário no Firebase Auth usando Admin SDK.
     */
    private function updateFirebasePassword(string $email, string $newPassword): void
    {
        try {
            $config = config('firebase.connections.auth');

            $factory = (new \Kreait\Firebase\Factory)
                ->withServiceAccount([
                    'type' => 'service_account',
                    'project_id' => !empty($config['storage_bucket'])
                        ? explode('.', $config['storage_bucket'])[0]
                        : ($config['project_id'] ?? null),
                    'private_key_id' => null,
                    'private_key' => $config['private_key'],
                    'client_email' => $config['client_email'],
                    'client_id' => null,
                    'auth_uri' => null,
                    'token_uri' => null,
                    'auth_provider_x509_cert_url' => null,
                    'client_x509_cert_url' => null,
                ]);

            $clientOptions = \Kreait\Firebase\Http\HttpClientOptions::default()
                ->withGuzzleConfigOptions(FirebaseHttpOptions::build());

            $factory = $factory->withHttpClientOptions($clientOptions);

            $auth = $factory->createAuth();

            // Buscar usuário pelo e-mail
            $firebaseUser = $auth->getUserByEmail($email);

            // Atualizar senha
            $auth->updateUser($firebaseUser->uid, ['password' => $newPassword]);
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
