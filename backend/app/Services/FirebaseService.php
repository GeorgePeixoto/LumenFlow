<?php

namespace App\Services;

use Kreait\Firebase\Database;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Http\HttpClientOptions;
use Kreait\Firebase\ServiceAccount;
use Illuminate\Support\Facades\Config;

class FirebaseService
{
    protected $factory;
    protected $connection;

    public function __construct(string $connection = 'wokwi')
    {
        $this->connection = $connection;
        $this->factory = $this->createFactory();
    }

    protected function createFactory(): Factory
    {
        $config = Config::get('firebase.connections.' . $this->connection);

        if (empty($config)) {
            throw new \Exception("Firebase connection '{$this->connection}' not configured.");
        }

        $httpOptions = [
            'timeout' => config('firebase.database.http_client.timeout', 30),
            'connect_timeout' => config('firebase.database.http_client.connect_timeout', 10),
        ];
        $verifySetting = config('firebase.http.verify', true);
        $caBundle = config('firebase.http.ca_bundle');

        $verifyBool = filter_var($verifySetting, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($verifyBool === false) {
            $httpOptions['verify'] = false;
        } elseif (!empty($caBundle) && is_string($caBundle) && file_exists($caBundle)) {
            $httpOptions['verify'] = $caBundle;
        } elseif (!empty($caBundle)) {
            \Illuminate\Support\Facades\Log::warning('Ignorando FIREBASE_HTTP_CA_BUNDLE inválido: ' . $caBundle);
        }

        $clientOptions = HttpClientOptions::default()
            ->withGuzzleConfigOptions($httpOptions);

        $factory = (new Factory())
            ->withHttpClientOptions($clientOptions)
            ->withServiceAccount($this->getServiceAccount($config));

        if (!empty($config['database_url'])) {
            $factory->withDatabaseUri($config['database_url']);
        }

        return $factory;
    }

    public function getServiceAccount(array $config): array
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

    public function getDatabase(): Database
    {
        return $this->factory->createDatabase();
    }

    public function getStorage()
    {
        return $this->factory->createStorage();
    }

    public function getConnectionName(): string
    {
        return $this->connection;
    }
}