<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;
use Kreait\Firebase\Database;
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

        $factory = (new Factory())->withServiceAccount($this->getServiceAccount($config));

        if (!empty($config['database_url'])) {
            $factory->withDatabaseUri($config['database_url']);
        }

        return $factory;
    }

    protected function getServiceAccount(array $config): ServiceAccount
    {
        if (!empty($config['service_account_json'])) {
            return ServiceAccount::fromJson($config['service_account_json']);
        }

        if (!empty($config['client_email']) && !empty($config['private_key'])) {
            return ServiceAccount::fromArray([
                'client_email' => $config['client_email'],
                'private_key' => $config['private_key'],
                'project_id' => $config['storage_bucket'] ? explode('.', $config['storage_bucket'])[0] : null,
            ]);
        }

        throw new \Exception('Service account configuration is missing.');
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