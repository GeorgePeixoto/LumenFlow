<?php
/**
 * EnergyFlow API - Ponto de Entrada Único (Front Controller)
 * 
 * Todo o tráfego da API é direcionado para este arquivo, garantindo
 * que apenas este script fique acessível publicamente e protegendo
 * o código-fonte em /src e /config.
 */

// Se o Composer já tiver sido executado (vendor criado), carrega o autoload
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
    
    // Carrega as variáveis de ambiente (.env) caso a biblioteca exista e o arquivo também
    if (class_exists(\Dotenv\Dotenv::class) && file_exists(__DIR__ . '/../.env')) {
        $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
        $dotenv->load();
    }
}

// Configuração básica de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Roteamento: Healthcheck (F0-B5)
if ($requestUri === '/api/health' && $requestMethod === 'GET') {
    $controller = new \App\Controllers\HealthController();
    $controller->check();
    exit();
}

// Roteamento: Validação IoT End-to-End (F0-I3)
if ($requestUri === '/api/telemetry' && $requestMethod === 'GET') {
    $controller = new \App\Controllers\TelemetryController();
    $controller->getLatest();
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
