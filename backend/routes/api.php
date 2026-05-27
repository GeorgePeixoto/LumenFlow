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

// Rotas públicas do Wokwi e Firebase
Route::get('/sensors/{device}/readings', [SensorDataController::class, 'getDeviceReadings']);
Route::get('/sensors/{device}/latest', [SensorDataController::class, 'getLatestReading']);
Route::get('/sensors/devices', [SensorDataController::class, 'getDevices']);
Route::get('/dashboard/public', [SensorDataController::class, 'getDashboard']);
Route::post('/wokwi/sync', [WokwiSyncController::class, 'syncData']);
Route::get('/wokwi/devices', [WokwiSyncController::class, 'getActiveDevices']);
Route::get('/wokwi/devices/{device}/status', [WokwiSyncController::class, 'getDeviceStatus']);

/*
|--------------------------------------------------------------------------
| Protected Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Dashboard
    Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('/dashboard/consumption', [DashboardController::class, 'consumption']);
    Route::get('/dashboard/top-sectors', [DashboardController::class, 'topSectors']);
    Route::get('/dashboard/projection', [DashboardController::class, 'projection']);
    Route::get('/dashboard', [SensorDataController::class, 'getAuthenticatedDashboard']);
});
