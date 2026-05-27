# LumenFlow - Dashboard Inteligente de Gestão de Energia IoT

<p align="center">
  <i>Monitoramento em tempo real, redução de desperdícios e alertas inteligentes para o setor atacadista.</i>
</p>

## Sobre o Projeto

O **LumenFlow** é um sistema de dashboard inteligente para gestão e monitoramento de energia elétrica. Integra simulações de hardware IoT (ESP32 via Wokwi) com um backend Laravel e um frontend SPA, transformando dados brutos de sensores em indicadores visuais, painéis financeiros e alertas acionáveis.

## Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Wokwi ESP32   │────▶│ Firebase RTDB    │◀────│  Frontend SPA   │
│  (simulação)    │     │  (dados IoT)     │     │  (GitHub Pages) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          │ REST API
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Laravel API     │
                                                 │  (backend/)      │
                                                 │    +            │
                                                 │ Firebase Auth    │
                                                 │  (usuários)     │
                                                 └─────────────────┘
```

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Frontend | Vanilla JS (ES6 Modules) + Tailwind CSS + Alpine.js | `src/` + `index.html` |
| Backend | Laravel 13 + PHP 8.3 | `backend/` |
| IoT | ESP32 (C++) via Wokwi → Firebase RTDB | `wokwi/` |
| Real-time | Firebase Realtime Database (2 instâncias) | Cloud |
| Auth | Firebase Authentication | Cloud |

## Estrutura do Repositório

```
LumenFlow/
├── backend/            ← API Laravel (PHP)
│   ├── app/
│   ├── routes/
│   ├── config/
│   └── ...
├── src/                ← Frontend SPA
│   ├── components/
│   ├── pages/
│   └── ...
├── index.html          ← Entry point do frontend
├── README.md           ← Documentação principal
└── PLAN.md             ← Planejamento de desenvolvimento
```

## Como Executar

### Pré-requisitos

- PHP 8.3+
- Composer
- Servidor local para frontend (Live Server, http-server, etc.)

### Frontend

1. Abra um servidor local na raiz (ex: Live Server no VS Code)
2. Acesse `http://localhost:5500`

> Com `DEMO_MODE: true` em `src/config.js`, o sistema usa dados mockados. Com `false`, conecta à API Laravel.

### Backend (Laravel)

```bash
cd backend
composer install --ignore-platform-reqs
cp .env.example .env
php artisan key:generate
```

Configure o `.env` com suas credenciais Firebase:
```
# Firebase Realtime Database - Dados IoT
FIREBASE_RTDB_URL=https://seu-projeto-iot.firebaseio.com

# Firebase Authentication - Usuários
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_API_KEY=sua-api-key
FIREBASE_PROJECT_ID=seu-projeto-id

FRONTEND_URL=http://localhost:5500
```

Depois inicie o servidor:
```bash
php artisan serve
```

A API estará em `http://localhost:8000/api`.

### Configuração Firebase

1. **Crie 2 projetos no Firebase Console**:
   - Projeto 1: Para dados IoT (RTDB)
   - Projeto 2: Para autenticação (Auth)

2. **Habilite RTDB** no projeto IoT:
   - Mode: Database
   - Security Rules: `true` para desenvolvimento

3. **Configure Firebase Auth**:
   - Método: Email/Password
   - Domains permitidos: `http://localhost:5500`

## Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /api/auth/login` | Login de usuário |
| `POST /api/auth/register` | Registro de novo usuário |
| `GET /api/dashboard` | Busca dados do dashboard |
| `GET /api/sensors/{device}/readings` | Lê dados do sensor específico |
| `POST /api/sensors/sync` | Sincroniza dados do Wokwi |

## Estrutura de Dados (Firebase RTDB)

```
{
  "sensors": {
    "device_001": {
      "readings": {
        "timestamp_1": {
          "voltage": 220.5,
          "current": 5.2,
          "power": 1146.6,
          "timestamp": 1620000000
        }
      }
    }
  }
}
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `FIREBASE_RTDB_URL` | URL do Firebase Realtime Database |
| `FIREBASE_AUTH_*` | Credenciais Firebase Auth |
| `FRONTEND_URL` | URL do frontend (para CORS) |

## Documentação

- [PLAN.md](PLAN.md) — Planejamento atualizado de desenvolvimento
