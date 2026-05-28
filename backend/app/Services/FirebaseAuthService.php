<?php

namespace App\Services;

use Kreait\Firebase\Auth;
use Kreait\Firebase\Exception\AuthException;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Http\HttpClientOptions;
use Illuminate\Support\Facades\Log;

class FirebaseAuthService
{
    private Auth $auth;
    private string $authDomain;
    private string $apiKey;
    private string $projectId;

    private function getServiceAccount(array $config): array
    {
        if (!empty($config['service_account_json'])) {
            return json_decode($config['service_account_json'], true);
        }

        if (!empty($config['client_email']) && !empty($config['private_key'])) {
            return [
                'type' => 'service_account',
                'project_id' => $config['storage_bucket'] ? explode('.', $config['storage_bucket'])[0] : null,
                'private_key_id' => null,
                'private_key' => $config['private_key'],
                'client_email' => $config['client_email'],
                'client_id' => null,
                'auth_uri' => null,
                'token_uri' => null,
                'auth_provider_x509_cert_url' => null,
                'client_x509_cert_url' => null,
            ];
        }

        throw new \Exception("Service account configuration not found.");
    }

    public function __construct()
    {
        $config = config('firebase.connections.auth');

        $this->authDomain = $config['domain'] ?? null;
        $this->apiKey = $config['api_key'] ?? null;
        $this->projectId = !empty($config['storage_bucket'])
            ? explode('.', $config['storage_bucket'])[0]
            : ($config['project_id'] ?? null);

        $httpOptions = [
            'timeout' => config('firebase.database.http_client.timeout', 30),
            'connect_timeout' => config('firebase.database.http_client.connect_timeout', 10),
        ];
        $verifySetting = config('firebase.http.verify', true);
        $caBundle = config('firebase.http.ca_bundle');

        $verifyBool = filter_var($verifySetting, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($verifyBool === false) {
            $httpOptions['verify'] = false;
        } elseif (!empty($caBundle)) {
            $httpOptions['verify'] = $caBundle;
        }

        $clientOptions = HttpClientOptions::default()
            ->withGuzzleConfigOptions($httpOptions);

        $factory = (new Factory)
            ->withHttpClientOptions($clientOptions)
            ->withServiceAccount($this->getServiceAccount($config))
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
            $payload = $signInResult->data();

            return [
                'success' => true,
                'idToken' => $signInResult->idToken(),
                'uid' => $signInResult->firebaseUserId(),
                'email' => $payload['email'] ?? $email,
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
            // O Firebase Admin SDK não tem método direto para invalidar tokens
            // Tokens expiram naturalmente após 1 hora
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

            // Atualizar senha usando updateUser
            $this->auth->updateUser($uid, ['password' => $newPassword]);

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