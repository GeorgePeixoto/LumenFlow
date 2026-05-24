<?php

namespace App\Services;

use App\Utils\CnpjValidator;

class AuthService
{
    private $firestore;

    public function __construct()
    {
        $this->firestore = FirebaseService::getInstance()->getFirestore()->database();
    }

    /**
     * Registra uma nova empresa e usuário responsável.
     * @throws \Exception
     */
    public function registerCompany(array $data)
    {
        $companyName = trim($data['company_name'] ?? '');
        $cnpj = preg_replace('/[^0-9]/', '', $data['cnpj'] ?? '');
        $segment = $data['segment'] ?? '';
        $responsibleName = trim($data['responsible_name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $termsVersion = $data['terms_version'] ?? 'v1';

        // 1. Validação estrita de CNPJ (Back-end always verifies)
        if (!CnpjValidator::isValid($cnpj)) {
            throw new \Exception('VALIDATION_ERROR:CNPJ Inválido');
        }

        // 2. Verifica unicidade do CNPJ na coleção `companies`
        $companyDocs = $this->firestore->collection('companies')->where('cnpj', '=', $cnpj)->documents();
        if (!empty(iterator_to_array($companyDocs))) {
            throw new \Exception('COMPANY_CNPJ_TAKEN');
        }

        // 3. Verifica unicidade do Email na coleção `users`
        $userDocs = $this->firestore->collection('users')->where('email', '=', $email)->documents();
        if (!empty(iterator_to_array($userDocs))) {
            throw new \Exception('USER_EMAIL_TAKEN');
        }

        // 4. Hash seguro da senha com Argon2id
        $passwordHash = password_hash($password, PASSWORD_ARGON2ID);

        // 5. Salva Company
        $companyRef = $this->firestore->collection('companies')->newDocument();
        $companyId = $companyRef->id();
        $companyRef->set([
            'company_id' => $companyId,
            'name' => $companyName,
            'cnpj' => $cnpj,
            'segment' => $segment,
            'created_at' => date('c')
        ]);

        // 6. Salva User
        $userRef = $this->firestore->collection('users')->newDocument();
        $userId = $userRef->id();
        $userRef->set([
            'user_id' => $userId,
            'company_id' => $companyId,
            'name' => $responsibleName,
            'email' => $email,
            'password_hash' => $passwordHash,
            'role' => 'admin',
            'terms_accepted_version' => $termsVersion,
            'terms_accepted_at' => date('c'),
            'created_at' => date('c')
        ]);

        // 7. Grava log de auditoria
        AuditLogger::log($companyId, $userId, 'COMPANY_REGISTERED', [
            'segment' => $segment
        ]);

        // 8. Retorna credenciais de login provisórias (O Token JWT real será implementado na US02)
        return [
            'token' => 'stub_token_' . $userId,
            'user' => [
                'id' => $userId,
                'name' => $responsibleName,
                'email' => $email,
                'role' => 'admin'
            ]
        ];
    }

    /**
     * Realiza o login, verifica bloqueio por força bruta e gera JWT.
     * @throws \Exception
     */
    public function loginUser(array $credentials)
    {
        $email = strtolower(trim($credentials['email'] ?? ''));
        $password = $credentials['password'] ?? '';
        $rememberMe = $credentials['remember_me'] ?? false;
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        // 1. Verifica Rate Limit (Bloqueio de 15min por 5 falhas)
        $this->checkRateLimit($email, $ip);

        // 2. Busca o usuário pelo E-mail
        $userDocs = $this->firestore->collection('users')->where('email', '=', $email)->documents();
        $users = iterator_to_array($userDocs);

        if (empty($users)) {
            $this->registerFailedAttempt($email, $ip);
            throw new \Exception('INVALID_CREDENTIALS');
        }

        $userDoc = reset($users);
        $userData = $userDoc->data();

        // 3. Verifica a Senha contra o hash do banco
        if (!password_verify($password, $userData['password_hash'])) {
            $this->registerFailedAttempt($email, $ip);
            throw new \Exception('INVALID_CREDENTIALS');
        }

        // Login Bem-Sucedido
        AuditLogger::log($userData['company_id'], $userData['user_id'], 'LOGIN_SUCCESS');

        // 4. Geração do Token JWT (US02-B1, US02-B2)
        $secretKey = $_ENV['JWT_SECRET'] ?? 'fallback_secret_energyflow_super_safe';
        $issuedAt = time();
        // 30 dias se lembrar de mim, 8 horas caso contrário
        $expire = $rememberMe ? ($issuedAt + (30 * 24 * 60 * 60)) : ($issuedAt + (8 * 60 * 60)); 

        $payload = [
            'iat'  => $issuedAt,
            'exp'  => $expire,
            'sub'  => $userData['user_id'],
            'company_id' => $userData['company_id'],
            'role' => $userData['role']
        ];

        $jwt = \App\Utils\JwtHelper::encode($payload, $secretKey);

        return [
            'token' => $jwt,
            'user' => [
                'id' => $userData['user_id'],
                'name' => $userData['name'],
                'email' => $userData['email'],
                'role' => $userData['role']
            ]
        ];
    }

    /**
     * Valida se houve mais de 5 falhas nos últimos 15 minutos (evitando índices compostos no Firestore)
     */
    private function checkRateLimit(string $email, string $ip)
    {
        $emailIp = $email . '|' . $ip;
        $windowStart = strtotime('-15 minutes');

        $attemptsQuery = $this->firestore->collection('login_attempts')
            ->where('email_ip', '=', $emailIp)
            ->documents();

        $count = 0;
        foreach ($attemptsQuery as $attempt) {
            $data = $attempt->data();
            $time = strtotime($data['timestamp']);
            if ($time > $windowStart) {
                $count++;
            }
        }

        if ($count >= 5) {
            throw new \Exception('RATE_LIMIT_EXCEEDED');
        }
    }

    /**
     * Grava a falha na coleção temporária
     */
    private function registerFailedAttempt(string $email, string $ip)
    {
        $emailIp = $email . '|' . $ip;
        $this->firestore->collection('login_attempts')->add([
            'email_ip' => $emailIp,
            'email' => $email,
            'ip' => $ip,
            'timestamp' => date('c')
        ]);
        
        AuditLogger::log('unknown', 'unknown', 'LOGIN_FAILED', ['email' => $email, 'ip' => $ip]);
    }
}
