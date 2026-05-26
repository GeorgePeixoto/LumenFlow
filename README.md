# LumenFlow - Dashboard Inteligente de Gestão de Energia IoT

<p align="center">
  <i>Monitoramento em tempo real, redução de desperdícios e alertas inteligentes para o setor atacadista.</i>
</p>

## Sobre o Projeto

O **LumenFlow** é um sistema de dashboard inteligente para gestão e monitoramento de energia elétrica. Integra simulações de hardware IoT (ESP32 via Wokwi) com um backend Laravel e um frontend SPA, transformando dados brutos de sensores em indicadores visuais, painéis financeiros e alertas acionáveis.

## Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Wokwi ESP32   │────▶│  Firebase RTDB   │◀────│  Frontend SPA   │
│  (simulação)    │     │  (dados IoT)     │────▶│  (GitHub Pages) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          │ REST API
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Laravel API     │
                                                 │  (backend/)      │
                                                 │  + MySQL         │
                                                 └─────────────────┘
```

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Frontend | Vanilla JS (ES6 Modules) + Tailwind CSS + Alpine.js | `src/` + `index.html` |
| Backend | Laravel 13 + PHP 8.3 + MySQL 8.4 | `backend/` |
| IoT | ESP32 (C++) via Wokwi → Firebase RTDB | `wokwi/` |
| Real-time | Firebase Realtime Database | Cloud |

## Estrutura do Repositório

```
LumenFlow/
├── backend/            ← API Laravel (PHP)
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   └── ...
├── src/                ← Frontend SPA
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
├── wokwi/              ← Firmware ESP32
├── index.html          ← Entry point do frontend
├── TASKS.md            ← Planejamento de tasks
└── TASKS_LOG.md        ← Registro de execução
```

## Como Executar

### Pré-requisitos

- PHP 8.3+
- MySQL 8.4+
- Composer
- Servidor local para frontend (Live Server, http-server, etc.)

### Frontend

1. Abra um servidor local na raiz (ex: Live Server no VS Code)
2. Acesse `http://localhost:5500`

> Com `DEMO_MODE: true` em `src/config.js`, o sistema usa dados mockados. Com `false`, conecta à API Laravel.

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure o `.env` com suas credenciais MySQL e Firebase RTDB URL:
```
DB_DATABASE=lumenflow
DB_USERNAME=root
DB_PASSWORD=

FIREBASE_RTDB_URL=https://seu-projeto.firebaseio.com
FRONTEND_URL=http://localhost:5500
```

Depois rode as migrations e inicie o servidor:
```bash
php artisan migrate --seed
php artisan serve
```

A API estará em `http://localhost:8000/api`.

### Sincronização Firebase → MySQL

```bash
cd backend
php artisan firebase:sync
```

Roda automaticamente a cada 5 segundos via scheduler (`php artisan schedule:work`).

Para rodar o scheduler em desenvolvimento:
```bash
cd backend
php artisan schedule:work
```

## Funcionalidades

- **Dashboard em Tempo Real** — KPIs de consumo (kWh) e custo (R$)
- **Alertas Inteligentes** — Sobrecarga, desperdício noturno, consumo fora do horário, anomalias
- **Gestão de Setores e Dispositivos** — CRUD completo com thresholds configuráveis
- **Projeção Mensal** — Estimativa de consumo e custo para fim do mês
- **Painel Financeiro** — Ranking de setores, custo diário, resumo mensal
- **Metas** — Cadastro com acompanhamento de progresso percentual
- **TV Mode / Transparência** — Interface visual com semáforo (verde/amarelo/vermelho)

## Documentação

- [docs/API.md](docs/API.md) — Documentação completa dos endpoints da API
- [TASKS.md](TASKS.md) — Planejamento completo de desenvolvimento
- [TASKS_LOG.md](TASKS_LOG.md) — Registro detalhado de cada task concluída
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) — Plano de refatoração da stack
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Schema do banco de dados