<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessHourController;
use App\Http\Controllers\Api\ConsumptionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\FirebaseSyncController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SectorAverageController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\TariffController;
use App\Http\Controllers\Api\WokwiSyncController;
use App\Http\Controllers\Api\SensorDataController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (sem autenticação)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (firebase)
|--------------------------------------------------------------------------
*/
Route::middleware('firebase')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Sensor, Wokwi, Dashboard
    Route::get('/sensors/{device}/readings', [SensorDataController::class, 'getDeviceReadings']);
    Route::get('/sensors/{device}/latest', [SensorDataController::class, 'getLatestReading']);
    Route::get('/sensors/devices', [SensorDataController::class, 'getDevices']);
    Route::get('/dashboard/public', [SensorDataController::class, 'getDashboard']);
    Route::post('/wokwi/sync', [WokwiSyncController::class, 'syncData']);
    Route::get('/wokwi/devices', [WokwiSyncController::class, 'getActiveDevices']);
    Route::get('/wokwi/devices/{device}/status', [WokwiSyncController::class, 'getDeviceStatus']);

    // Dashboard
    Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('/dashboard/consumption', [DashboardController::class, 'consumption']);
    Route::get('/dashboard/top-sectors', [DashboardController::class, 'topSectors']);
    Route::get('/dashboard/projection', [DashboardController::class, 'projection']);
    Route::get('/dashboard', [SensorDataController::class, 'getAuthenticatedDashboard']);

    // Setores
    Route::apiResource('sectors', SectorController::class);

    // Dispositivos
    Route::get('/devices/{device}/readings', [DeviceController::class, 'readings']);
    Route::get('/devices/{device}/anomalies', [DeviceController::class, 'anomalies']);
    Route::get('/devices/{device}/maintenance', [DeviceController::class, 'maintenance']);
    Route::post('/devices/{device}/maintenance', [DeviceController::class, 'storeMaintenance']);
    Route::apiResource('devices', DeviceController::class);

    // Alertas
    Route::get('/alerts/summary', [AlertController::class, 'summary']);
    Route::get('/alerts/count', [AlertController::class, 'count']);
    Route::patch('/alerts/bulk/acknowledge', [AlertController::class, 'bulkAcknowledge']);
    Route::patch('/alerts/bulk/resolve', [AlertController::class, 'bulkResolve']);
    Route::patch('/alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    Route::patch('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    Route::post('/alerts/{alert}/notify', [AlertController::class, 'notify']);
    Route::apiResource('alerts', AlertController::class)->only(['index', 'show']);

    // Metas
    Route::get('/goals/projections', [GoalController::class, 'projections']);
    Route::get('/goals/{goal}/projection', [GoalController::class, 'projection']);
    Route::apiResource('goals', GoalController::class);

    // Tarifas
    Route::apiResource('tariffs', TariffController::class);

    // Horário comercial (alias para frontend que usa /settings/business-hours)
    Route::get('/business-hours', [BusinessHourController::class, 'index']);
    Route::put('/business-hours', [BusinessHourController::class, 'upsert']);
    Route::get('/settings/business-hours', [BusinessHourController::class, 'index']);
    Route::put('/settings/business-hours', [BusinessHourController::class, 'upsert']);

    // Financeiro
    Route::get('/financial/summary', [FinancialController::class, 'summary']);
    Route::get('/financial/daily', [FinancialController::class, 'daily']);
    Route::get('/financial/ranking', [FinancialController::class, 'ranking']);

    // Consumo
    Route::get('/consumption', [ConsumptionController::class, 'index']);
    Route::get('/consumption/summary', [ConsumptionController::class, 'summary']);
    Route::get('/consumption/by-sector', [ConsumptionController::class, 'bySector']);
    Route::get('/consumption/hourly', [ConsumptionController::class, 'hourly']);

    // Firebase Sync
    Route::post('/firebase/sync', [FirebaseSyncController::class, 'sync']);
    Route::get('/firebase/preview', [FirebaseSyncController::class, 'preview']);

    // Relatórios
    Route::get('/reports/consumption-pdf', [ReportController::class, 'consumptionPdf']);
    Route::get('/reports/consumption-data', [ReportController::class, 'consumptionData']);

    // Médias de consumo por setor
    Route::get('/sector-averages', [SectorAverageController::class, 'index']);
    Route::put('/sector-averages', [SectorAverageController::class, 'upsert']);
});
