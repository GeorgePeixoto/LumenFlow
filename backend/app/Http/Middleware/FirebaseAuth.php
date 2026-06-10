<?php

namespace App\Http\Middleware;

use App\Services\FirebaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FirebaseAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('testing') && \Illuminate\Support\Facades\Auth::check()) {
            $user = \Illuminate\Support\Facades\Auth::user();
            $request->setUserResolver(fn() => $user);
            return $next($request);
        }

        $header = $request->header('Authorization', '');
        $token = null;

        if (str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
        } else {
            $token = $request->query('token') ?: $request->input('token');
        }

        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'AUTH_REQUIRED',
                    'message' => 'Token nao fornecido.',
                ],
            ], 401);
        }

        $authService = app(FirebaseAuthService::class);
        $verify = $authService->verifyToken($token);

        if (!$verify['success']) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_TOKEN',
                    'message' => $verify['error'] ?? 'Token invalido.',
                ],
            ], 401);
        }

        $request->attributes->set('firebase_user', $verify);

        $email = $verify['email'] ?? null;
        if ($email) {
            $user = \App\Models\User::where('email', $email)->first();

            // Se o usuário não existir no banco local (ex: criado diretamente no Firebase), criamos ele localmente de forma resiliente
            if (!$user) {
                $user = \App\Models\User::create([
                    'name' => explode('@', $email)[0],
                    'email' => $email,
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                ]);
            }

            // Define o resolvedor de usuário na requisição para que $request->user() retorne nosso model User
            $request->setUserResolver(fn() => $user);

            // Adicionalmente autentica na fachada Auth do Laravel para compatibilidade geral
            \Illuminate\Support\Facades\Auth::setUser($user);
        }

        return $next($request);
    }
}
