<?php

namespace App\Services;

use Kreait\Firebase\Factory;

/**
 * Classe responsável por gerenciar a conexão única com o ecossistema Firebase.
 * Implementa o padrão Singleton para evitar a criação de múltiplas instâncias
 * desnecessárias da fábrica do Firebase durante uma mesma requisição.
 */
class FirebaseService
{
    private static ?FirebaseService $instance = null;
    private $firebaseFactory;

    private function __construct()
    {
        $credentialsPath = $_ENV['FIREBASE_CREDENTIALS'] ?? '';
        $databaseUrl = $_ENV['FIREBASE_DATABASE_URL'] ?? '';

        // Inicia a fábrica do Firebase passando as credenciais seguras
        $this->firebaseFactory = (new Factory())
            ->withServiceAccount(__DIR__ . '/../../' . $credentialsPath);

        // Se uma URL do Realtime Database for definida, configura a fábrica para usá-la
        if (!empty($databaseUrl)) {
            $this->firebaseFactory = $this->firebaseFactory->withDatabaseUri($databaseUrl);
        }
    }

    /**
     * Retorna a instância única do serviço (Singleton)
     */
    public static function getInstance(): FirebaseService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Instancia o cliente do Realtime Database
     */
    public function getRealtimeDatabase()
    {
        return $this->firebaseFactory->createDatabase();
    }

    /**
     * Instancia o cliente do Firestore
     */
    public function getFirestore()
    {
        return $this->firebaseFactory->createFirestore();
    }
    
    /**
     * Instancia o cliente de Autenticação (útil para validar tokens JWT)
     */
    public function getAuth()
    {
        return $this->firebaseFactory->createAuth();
    }
}
