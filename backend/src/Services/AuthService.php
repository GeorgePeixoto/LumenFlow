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
}
