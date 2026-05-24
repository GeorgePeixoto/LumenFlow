<?php

namespace App\Services;

class AuditLogger
{
    /**
     * Grava uma trilha de auditoria no Firestore. (US01-B3)
     */
    public static function log(string $companyId, ?string $userId, string $action, array $details = []): void
    {
        $firestore = FirebaseService::getInstance()->getFirestore();
        
        $data = [
            'company_id' => $companyId,
            'user_id' => $userId,
            'action' => $action,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'created_at' => date('c')
        ];
        
        // Adiciona à coleção sem precisar esperar o retorno para o fluxo normal
        $firestore->database()->collection('audit_logs')->add($data);
    }
}
