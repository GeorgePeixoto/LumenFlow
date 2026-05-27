<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Exception\AuthException;
use Illuminate\Support\Facades\Log;

class FirebaseAuthService
{
    private Auth $auth;
    private string $authDomain;
    private string $apiKey;
    private string $projectId;

    public function __construct()
    {
        $this->authDomain = config('firebase.auth.domain');
        $this->apiKey = config('firebase.auth.api_key');
        $this->projectId = config('firebase.auth.project_id');

        $factory = (new Factory)
            ->withServiceAccount(config('firebase.credentials'))
            ->withProjectId($this->projectId);

        $this->auth = $factory->createAuth();
    }

    /**
     * Cria um novo usuário no Firebase Auth
     */
    public function createUser(string $email, string $password): array
    {
        try {
            $user = $this->auth->createUser([
                'email' => $email,
                'password' => $password,
            ]);

            return [
                'success' => true,
                'uid' => $user->uid,
                'email' => $user->email,
                'message' => 'Usuário criado com sucesso'
            ];
        } catch (AuthException $e) {
            Log::error('Erro ao criar usuário Firebase: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Autentica um usuário com email e senha
     */
    public function authenticateUser(string $email, string $password): array
    {
        try {
            $signInResult = $this->auth->signInWithEmailAndPassword($email, $password);

            return [
                'success' => true,
                'idToken' => $signInResult->idToken(),
                'uid' => $signInResult->firebaseUserId(),
                'email' => $signInResult->email(),
                'message' => 'Login realizado com sucesso'
            ];
        } catch (AuthException $e) {
            Log::error('Erro ao autenticar usuário: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verifica um token JWT
     */
    public function verifyToken(string $idToken): array
    {
        try {
            $verifiedIdToken = $this->auth->verifyIdToken($idToken);

            return [
                'success' => true,
                'uid' => $verifiedIdToken->claims()->get('sub'),
                'email' => $verifiedIdToken->claims()->get('email'),
                'exp' => $verifiedIdToken->claims()->get('exp')
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao verificar token: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Desautentica um usuário (revoga token)
     */
    public function signOut(string $idToken): array
    {
        try {
            $this->auth->invalidate($idToken);

            return [
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao realizar logout: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Altera a senha de um usuário
     */
    public function changePassword(string $idToken, string $newPassword): array
    {
        try {
            // Verificar token primeiro
            $verifiedIdToken = $this->auth->verifyIdToken($idToken);
            $uid = $verifiedIdToken->claims()->get('sub');

            // Atualizar senha
            $this->auth->changeUserPassword($uid, $newPassword);

            return [
                'success' => true,
                'message' => 'Senha alterada com sucesso'
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao alterar senha: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}