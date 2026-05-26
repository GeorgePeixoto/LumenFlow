# LumenFlow API

Backend REST API do sistema LumenFlow — monitoramento inteligente de energia para varejo.

## Stack

- **PHP 8.3** + **Laravel 13**
- **MySQL 8.4** (persistência)
- **Laravel Sanctum** (autenticação token-based)
- **Firebase RTDB** (dados live do ESP32)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate

# Configurar .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD, FIREBASE_RTDB_URL)
php artisan migrate --seed
php artisan serve
```

## Credenciais Demo

- **Email**: admin@lumenflow.com
- **Senha**: password

## Endpoints (50 rotas)

| Grupo | Rotas | Descrição |
|-------|-------|-----------|
| Auth | 6 | register, login, logout, me, forgot/reset password |
| Dashboard | 3 | kpis, consumption chart, top-sectors |
| Sectors | 5 | CRUD |
| Devices | 7 | CRUD + readings + anomalies |
| Alerts | 6 | list, show, summary, count, acknowledge, resolve |
| Goals | 5 | CRUD |
| Tariffs | 5 | CRUD |
| Financial | 3 | summary, daily, ranking |
| Business Hours | 4 | index, upsert (2 aliases) |
| Consumption | 4 | index, summary, by-sector, hourly |
| Firebase | 2 | sync, preview |

## Firebase Sync

```bash
# Sync manual
php artisan firebase:sync
php artisan firebase:sync --sector=1

# Scheduler automático (a cada 5 min)
* * * * * php artisan schedule:run >> /dev/null 2>&1
```

## Testes

```bash
php artisan test
# 24 testes | 59 assertions
```

## Estrutura

```
app/
├── Console/Commands/SyncFirebaseReadings.php
├── Http/Controllers/Api/
│   ├── AuthController.php
│   ├── DashboardController.php
│   ├── SectorController.php
│   ├── DeviceController.php
│   ├── AlertController.php
│   ├── GoalController.php
│   ├── TariffController.php
│   ├── BusinessHourController.php
│   ├── ConsumptionController.php
│   ├── FinancialController.php
│   └── FirebaseSyncController.php
├── Models/ (8 models)
└── Services/FirebaseSyncService.php
```

## Licença

Projeto acadêmico — FIAP 2026.
