# Plano de Refatoração — LumenFlow

## 1. Diagnóstico do Projeto e Ferramentas

### Stack Atual (Protótipo)

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | JavaScript ES6+ (Vanilla, sem framework) |
| Módulos | ES Modules nativos (import/export no browser) |
| Bundler | **Nenhum** — arquivos servidos diretamente via Live Server |
| CSS | CSS nativo com Design Tokens (custom properties) |
| Gráficos | Chart.js 4.4.7 (via CDN) |
| Backend | Firebase Realtime Database (REST, sem SDK) |
| Roteamento | SPA hash-based custom router |
| Testes | **Nenhum** — zero arquivos de teste no projeto |
| Linter/Formatter | **Nenhum** configurado |
| Build/CI | **Nenhum** |
| Tipagem | **Nenhuma** |

### Stack Definitiva (Pós-Refatoração)

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | Vanilla JS (ES6 Modules) + **Alpine.js** + **Tailwind CSS** (CDN Play) | Alpine.js adiciona reatividade declarativa sem build step. Tailwind elimina CSS custom e acelera UI. Ambos funcionam via CDN, compatível com GitHub Pages |
| **Backend** | **Laravel** (PHP 8.2+) | Framework completo: Eloquent ORM, migrations, API Resources, Sanctum (auth), queues, scheduler. Produtivo e bem documentado |
| **Banco de dados** | **MySQL** (via Laravel Eloquent) + **Firebase RTDB** (dados IoT real-time) | MySQL para dados estruturados (usuários, setores, metas, alertas). Firebase mantido exclusivamente para stream de dados IoT do Wokwi |
| **Real-time** | Firebase RTDB listeners (frontend direto) + polling curto (3-5s) para dados derivados | Frontend escuta Firebase para dados do Wokwi (latência <1s). Dados processados (KPIs, alertas) vêm do Laravel via polling |
| **Gráficos** | Chart.js 4.x (CDN) | Mantido — funciona bem, equipe já conhece |
| **Testes** | PHPUnit (backend) + testes manuais (frontend) | PHPUnit vem integrado ao Laravel. Frontend testado manualmente via browser |
| **Hospedagem** | GitHub Pages (frontend) + servidor PHP local/remoto (backend) | Frontend 100% estático. Backend Laravel roda local (`php artisan serve`) ou em VPS futuramente |

### Ferramentas de Qualidade

| Ferramenta | Onde | Propósito |
|-----------|------|-----------|
| **Laravel Pint** | Backend | Formatter PSR-12 automático (vem com Laravel) |
| **PHPStan (level 5)** | Backend | Análise estática PHP — captura bugs de tipo |
| **PHPUnit** | Backend | Testes unitários e de integração |
| **ESLint** (config mínima, sem build) | Frontend | `npx eslint .` manual para capturar bugs JS |
| **Prettier** | Frontend | Formatação consistente (rodado manualmente ou via extensão VS Code) |

---

## 2. Mapeamento de Code Smells e Arquivos Críticos

| Arquivo/Módulo | Problema Encontrado | Princípio Violado |
|---|---|---|
| `src/pages/dashboard.js` (482 linhas) | Função `renderDashboardPage` com ~200 linhas de DOM imperativo + 5 funções `loadX` quase idênticas (`loadRecentAlerts`, `loadOffHoursAlerts`, `loadNightWasteAlerts`) com código duplicado de spinner → fetch → render → catch | **DRY**, **SRP** |
| `src/mocks/mockHandler.js` (400+ linhas) | Um único `handleMockRequest` com 50+ `if/else` encadeados. Lógica de acumulação de custo misturada com roteamento mock | **SRP**, **Open/Closed** |
| `src/components/AppShell.js` (387 linhas) | Singleton IIFE com 15+ ícones SVG inline, lógica de drawer mobile, avatar dropdown, theme toggle — tudo num único módulo | **SRP**, acoplamento excessivo |
| `src/pages/login.js` / `src/pages/dashboard.js` | Ícones SVG duplicados (ICON_SUN, ICON_MOON, ICON_BOLT) definidos como constantes locais em múltiplos arquivos | **DRY** |
| `src/pages/login.js` + `AppShell.js` | Lógica de theme toggle duplicada (mesmas funções `getTheme`/`applyTheme`) | **DRY** |
| `src/services/firebaseRealtimeService.js` | URL do Firebase hardcoded — deveria vir do `Config` | **Dependency Inversion** |
| `src/mocks/mockHandler.js` (linhas 23-31) | Estado mutável global (`_lastCostTimestamp`, `_accumulatedCost`) persistido em localStorage dentro do mock handler | **SRP**, **Separation of Concerns** |
| `src/services/httpClient.js` + `sessionService.js` | Duas camadas gerenciando token — indireção parcialmente redundante | **Interface Segregation** |
| `src/pages/dashboard.js` (linhas 204-212) | Cleanup via `hashchange` listener que verifica `document.contains(content)` — padrão frágil de lifecycle | Acoplamento temporal, memory leak potencial |
| `index.html` | 34 `<link rel="stylesheet">` carregados sequencialmente — sem bundling | Performance, manutenibilidade |
| `src/config.js` | `console.log` executado em produção | Code smell |
| Todas as pages | Padrão repetitivo: `content.innerHTML = ''` → header → grid → fetch → render. Sem abstração de lifecycle | **DRY** |
| `src/utils/eventBus.js` + `window.dispatchEvent` | Dois sistemas de eventos paralelos para o mesmo propósito | Inconsistência arquitetural |

### Impacto da Nova Stack nos Code Smells

A migração para Alpine.js + Tailwind + Laravel **resolve automaticamente** vários destes problemas:

- **DOM imperativo** → Alpine.js usa templates declarativos (`x-for`, `x-show`, `x-text`)
- **34 CSS files** → Tailwind via CDN elimina todos os arquivos CSS custom
- **Duplicação de ícones/theme** → Componentes Alpine reutilizáveis
- **mockHandler.js inteiro** → Substituído pela API Laravel real
- **Lifecycle frágil** → Alpine.js gerencia mount/unmount automaticamente
- **Dois sistemas de eventos** → `Alpine.store()` centraliza estado reativo

---

## 3. Estratégia de Refatoração Segura (Baby Steps)

### Arquitetura do Sistema

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
                                                 │  (PHP 8.2+)     │
                                                 │  + MySQL         │
                                                 └─────────────────┘
```

**Fluxo de dados:**
1. Wokwi ESP32 publica leituras de sensores no Firebase RTDB
2. Frontend escuta Firebase diretamente (real-time, <1s de latência)
3. Laravel sincroniza Firebase → MySQL periodicamente (scheduler, a cada 5s)
4. Frontend consome API Laravel para dados processados (KPIs, alertas, metas, financeiro)
5. Laravel aplica regras de negócio (detecção de anomalias, alertas off-hours, projeções)

---

### Fase 0 — Setup da Nova Stack (1 semana)

**PR 1: Frontend — Adicionar Tailwind + Alpine.js**
1. Adicionar ao `index.html`:
   - `<script src="https://cdn.tailwindcss.com"></script>` (Tailwind Play CDN)
   - `<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>`
2. Configurar Tailwind inline (`tailwind.config` no script tag) com os design tokens atuais (cores primary, secondary, accent)
3. Remover os 34 `<link rel="stylesheet">` (serão substituídos gradualmente)
4. Manter CSS base (`reset.css`, `tokens.css`) temporariamente durante transição

**PR 2: Backend — Criar projeto Laravel**
1. `composer create-project laravel/laravel lumenflow-api`
2. Configurar `.env` (MySQL local, Firebase credentials)
3. Instalar dependências: `laravel/sanctum`, `kreait/firebase-php` (SDK Firebase para PHP)
4. Configurar CORS (`config/cors.php`) para aceitar requests do frontend
5. Criar migrations baseadas no `DATABASE_SCHEMA.md` existente

---

### Fase 1 — Backend Laravel: API Completa (2 semanas)

**PR 3: Autenticação**
- `AuthController`: register, login, logout, me
- Laravel Sanctum para tokens de API
- Middleware de autenticação nas rotas protegidas
- Testes: `tests/Feature/AuthTest.php`

**PR 4: CRUD de Recursos**
- Controllers: Sector, Device, Alert, Goal, Tariff
- API Resources para formatação consistente de responses
- Validação via Form Requests
- Testes: `tests/Feature/` para cada controller

**PR 5: Dashboard e Lógica de Negócio**
- `DashboardController`: KPIs calculados (consumo, custo, alertas abertos, devices ativos)
- `ConsumptionService`: projeções de custo, acumulados mensais
- `AlertDetectionService`: regras para off-hours, anomalias, night waste
- `FirebaseSyncService` + `SyncFirebaseData` artisan command

**PR 6: Financeiro e Metas**
- `FinancialController`: resumo, daily breakdown, ranking por setor
- `GoalController`: progresso, milestones, projeções
- `TariffController`: CRUD de tarifas (convencional/bandeira)

---

### Fase 2 — Frontend: Migração para Alpine.js + Tailwind (2 semanas)

**PR 7: Infraestrutura Alpine.js**
- Criar `src/stores/session.js` (Alpine.store para auth)
- Criar `src/stores/realtime.js` (Alpine.store para dados Firebase live)
- Criar `src/services/api.js` (fetch wrapper apontando para Laravel)
- Criar `src/services/firebase.js` (listeners Firebase RTDB)
- Manter router hash-based atual (funciona bem)

**PR 8: Layout e Componentes Base**
- Converter `AppShell` para componente Alpine (header + sidebar + content)
- Criar componentes reutilizáveis: `kpi-card`, `data-table`, `toast`, `modal`
- Substituir CSS custom por Tailwind em todos os componentes
- Theme toggle como componente Alpine (`x-data="themeToggle()"`)

**PR 9: Páginas de Auth**
- Converter `login.js`, `register.js`, `forgot-password.js` para Alpine.js
- Formulários com validação reativa (`x-model`, `x-show` para erros)
- Integrar com `AuthController` do Laravel

**PR 10: Dashboard e Páginas Principais**
- Converter `dashboard.js` para Alpine.js (elimina 482 linhas de DOM imperativo)
- Converter `alerts.js`, `devices.js`, `financial.js`, `goals.js`
- Dados real-time via `Alpine.store('realtime')` (Firebase listeners)
- Dados processados via `Alpine.store` + fetch para Laravel API

---

### Fase 3 — Integração e Limpeza (1 semana)

**PR 11: Remover código legado**
- Deletar pasta `src/mocks/` (mockHandler, mockData, install)
- Deletar todos os arquivos `src/styles/` (substituídos por Tailwind)
- Remover `DEMO_MODE` do config (dados reais via Laravel)
- Limpar imports não utilizados

**PR 12: Scheduler e Alertas Automáticos**
- Configurar Laravel scheduler: `SyncFirebaseData` a cada 5 segundos
- Implementar detecção automática de alertas no sync (off-hours, anomalias)
- Notificações de alerta via polling no frontend (3-5s)

**PR 13: Polish e Documentação**
- README atualizado com instruções de setup (frontend + backend)
- Documentação da API (endpoints, payloads, auth)
- Testes finais end-to-end manuais

---

### Estratégia de PRs

- Máximo **200 linhas alteradas** por PR
- Backend e frontend podem avançar em paralelo (PRs independentes)
- Cada PR deve ter: descrição do "antes/depois" e como testar
- Nunca refatorar + adicionar feature no mesmo PR
- Manter `DEMO_MODE` funcional até a Fase 3 (fallback durante transição)

---

## 4. Estrutura de Pastas Definitiva

### Frontend (repositório atual — GitHub Pages)

```
LumenFlow/
├── index.html                      # Entry point (Tailwind CDN + Alpine.js CDN + Chart.js CDN)
│
├── src/
│   ├── app.js                      # Bootstrap: Alpine.js init, router start, stores
│   ├── config.js                   # URLs (Laravel API, Firebase), feature flags
│   │
│   ├── components/                 # Componentes Alpine.js reutilizáveis
│   │   ├── app-shell.js            # Layout autenticado (header + sidebar + content)
│   │   ├── kpi-card.js             # Card de KPI com loading state
│   │   ├── data-table.js           # Tabela com sort, filter, pagination
│   │   ├── chart-wrapper.js        # Wrapper Alpine para Chart.js
│   │   ├── toast.js                # Notificações toast
│   │   ├── modal.js                # Modal genérico
│   │   ├── confirm-dialog.js       # Diálogo de confirmação
│   │   ├── period-picker.js        # Seletor de período (hoje, 7d, 30d)
│   │   ├── empty-state.js          # Estado vazio
│   │   ├── error-state.js          # Estado de erro com retry
│   │   ├── spinner.js              # Loading spinner
│   │   └── theme-toggle.js         # Dark/light mode toggle
│   │
│   ├── pages/                      # Cada página como função Alpine component
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── forgot-password.js
│   │   ├── reset-password.js
│   │   ├── sector-select.js
│   │   ├── dashboard.js
│   │   ├── sector-dashboard.js
│   │   ├── transparency.js
│   │   ├── devices.js
│   │   ├── device-detail.js
│   │   ├── alerts.js
│   │   ├── goals.js
│   │   ├── financial.js
│   │   ├── tariffs.js
│   │   ├── settings.js
│   │   └── sectors.js
│   │
│   ├── services/                   # Comunicação com APIs externas
│   │   ├── api.js                  # HTTP client (fetch wrapper → Laravel API)
│   │   ├── firebase.js             # Firebase RTDB listeners (real-time IoT)
│   │   └── auth.js                 # Login, logout, token management
│   │
│   ├── stores/                     # Estado global reativo (Alpine.store)
│   │   ├── session.js              # Usuário logado, token, empresa
│   │   ├── alerts.js               # Contagem de alertas, badge
│   │   └── realtime.js             # Dados IoT live do Firebase
│   │
│   ├── utils/                      # Funções puras (sem side effects)
│   │   ├── router.js               # SPA hash router (manter atual, funciona bem)
│   │   ├── formatters.js           # formatKwh, formatCurrency, formatDate, etc.
│   │   ├── validators.js           # validateEmail, validateRequired, validateCNPJ
│   │   └── dates.js                # Helpers de data
│   │
│   └── i18n/
│       └── pt-BR.js                # Strings de UI centralizadas
│
├── REFACTORING_PLAN.md
├── DATABASE_SCHEMA.md
└── README.md
```

### Backend (novo repositório — `lumenflow-api`)

```
lumenflow-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php          # Register, login, logout, me
│   │   │   ├── DashboardController.php     # KPIs, consumption chart, top sectors
│   │   │   ├── SectorController.php        # CRUD setores
│   │   │   ├── DeviceController.php        # CRUD dispositivos + readings
│   │   │   ├── AlertController.php         # CRUD alertas + bulk actions
│   │   │   ├── GoalController.php          # CRUD metas + progresso
│   │   │   ├── FinancialController.php     # Resumo financeiro, daily, ranking
│   │   │   ├── TariffController.php        # CRUD tarifas
│   │   │   └── SettingsController.php      # Business hours, preferências
│   │   ├── Middleware/
│   │   │   └── EnsureTokenIsValid.php
│   │   ├── Requests/                       # Form Requests (validação)
│   │   │   ├── LoginRequest.php
│   │   │   ├── StoreSectorRequest.php
│   │   │   └── ...
│   │   └── Resources/                      # API Resources (formatação de response)
│   │       ├── SectorResource.php
│   │       ├── DeviceResource.php
│   │       ├── AlertResource.php
│   │       └── ...
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Sector.php
│   │   ├── Device.php
│   │   ├── Alert.php
│   │   ├── Goal.php
│   │   ├── Tariff.php
│   │   ├── ConsumptionReading.php
│   │   └── BusinessHours.php
│   │
│   ├── Services/                           # Lógica de negócio (não nos controllers)
│   │   ├── FirebaseSyncService.php         # Lê Firebase RTDB → persiste em MySQL
│   │   ├── AlertDetectionService.php       # Regras: off-hours, anomalia, overload
│   │   ├── ConsumptionService.php          # KPIs, projeções, acumulados
│   │   └── GoalProjectionService.php       # Projeção de metas
│   │
│   └── Console/
│       └── Commands/
│           └── SyncFirebaseData.php        # `php artisan firebase:sync` (scheduler)
│
├── database/
│   └── migrations/
│       ├── create_users_table.php
│       ├── create_sectors_table.php
│       ├── create_devices_table.php
│       ├── create_alerts_table.php
│       ├── create_goals_table.php
│       ├── create_tariffs_table.php
│       ├── create_consumption_readings_table.php
│       └── create_business_hours_table.php
│
├── routes/
│   └── api.php                             # Todas as rotas REST agrupadas
│
├── config/
│   └── firebase.php                        # URL RTDB + credenciais
│
├── tests/
│   ├── Feature/                            # Testes de endpoint (HTTP)
│   │   ├── AuthTest.php
│   │   ├── SectorTest.php
│   │   ├── DeviceTest.php
│   │   └── AlertTest.php
│   └── Unit/                               # Testes de services
│       ├── ConsumptionServiceTest.php
│       └── AlertDetectionServiceTest.php
│
├── .env.example
├── composer.json
└── README.md
```

### Princípios Arquiteturais

1. **Separação clara frontend/backend**: dois repositórios independentes, comunicação exclusivamente via REST API
2. **Frontend estático**: funciona no GitHub Pages sem servidor — toda lógica de negócio fica no Laravel
3. **Firebase apenas para IoT real-time**: dados brutos dos sensores. Tudo processado vai para MySQL via sync
4. **Services no Laravel**: controllers magros, lógica de negócio nos Services (testável isoladamente)
5. **Migração gradual**: `DEMO_MODE` continua funcional durante toda a transição. Cada PR pode ser testado independentemente

---

## 5. Métricas de Sucesso

### KPIs Quantitativos

| Métrica | Estado Atual | Meta Pós-Refatoração | Como Medir |
|---------|-------------|---------------------|------------|
| Cobertura de testes (backend) | **0%** | ≥ 80% (controllers + services) | `php artisan test --coverage` |
| Arquivos JS com >300 linhas | **3** (dashboard, mockHandler, AppShell) | **0** | Contagem manual |
| Requests HTTP no load (frontend) | **36** (34 CSS + 1 JS + 1 CDN) | **4-6** (HTML + Tailwind CDN + Alpine CDN + Chart.js CDN + app.js) | DevTools Network |
| Tempo de resposta API (p95) | N/A (mock local) | < 200ms | Laravel Telescope ou logs |
| Latência dados IoT (Wokwi → tela) | ~2-5s (polling) | < 1s (Firebase listener direto) | Cronômetro manual |
| Linhas de CSS custom | ~2000+ (34 arquivos) | **0** (100% Tailwind) | `wc -l src/styles/**/*.css` |
| Duplicação de código frontend | ~5 blocos (ícones, theme, alert loaders) | 0 (componentes Alpine reutilizáveis) | Review manual |
| Endpoints com teste automatizado | 0 | 100% dos endpoints | `php artisan test` |

### KPIs Qualitativos

| Aspecto | Critério de Sucesso |
|---------|-------------------|
| Onboarding frontend | Dev abre `index.html` com Live Server e tudo funciona (zero build step) |
| Onboarding backend | `composer install && php artisan migrate && php artisan serve` em < 3 min |
| Adição de nova página | Criar 1 arquivo em `pages/`, registrar 1 rota no router. Sem tocar em outros arquivos |
| Adição de novo endpoint | Criar Controller + Route + Test. Service se houver lógica complexa |
| Real-time funcional | Alterar potenciômetro no Wokwi → dado aparece no dashboard em < 3 segundos |
| Auth completa | Login → sessão persiste → refresh mantém logado → logout limpa tudo |
| Modo offline graceful | Frontend mostra último dado conhecido + indicador "offline" se API cair |

### Cronograma Sugerido

| Semana | Fase | Entregável |
|--------|------|-----------|
| 1 | Fase 0 | Tailwind + Alpine.js no frontend. Projeto Laravel criado com migrations |
| 2-3 | Fase 1 | API Laravel completa (auth + CRUD + dashboard + sync Firebase) |
| 4-5 | Fase 2 | Frontend migrado para Alpine.js + Tailwind. Conectado ao Laravel |
| 6 | Fase 3 | Código legado removido. Scheduler ativo. Testes passando. Documentação |

---

## Apêndice: Endpoints da API Laravel

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/me

GET    /api/dashboard/kpis
GET    /api/dashboard/consumption?from=&to=&granularity=
GET    /api/dashboard/top-sectors?limit=5

GET    /api/sectors
POST   /api/sectors
GET    /api/sectors/{id}
PUT    /api/sectors/{id}
DELETE /api/sectors/{id}

GET    /api/devices
POST   /api/devices
GET    /api/devices/{id}
PUT    /api/devices/{id}
DELETE /api/devices/{id}
GET    /api/devices/{id}/readings
GET    /api/devices/{id}/anomalies

GET    /api/alerts
GET    /api/alerts/{id}
PUT    /api/alerts/{id}/acknowledge
PUT    /api/alerts/{id}/resolve
PUT    /api/alerts/bulk/acknowledge
PUT    /api/alerts/bulk/resolve
GET    /api/alerts/count?status=open

GET    /api/goals
POST   /api/goals
GET    /api/goals/{id}
PUT    /api/goals/{id}
DELETE /api/goals/{id}

GET    /api/financial/summary
GET    /api/financial/daily?from=&to=
GET    /api/financial/ranking

GET    /api/tariffs
POST   /api/tariffs
PUT    /api/tariffs/{id}
DELETE /api/tariffs/{id}

GET    /api/settings/business-hours
PUT    /api/settings/business-hours
```

---

> **Filosofia**: Este plano prioriza **pragmatismo** — usa ferramentas que funcionam via CDN (zero build), mantém o frontend deployável no GitHub Pages, e concentra complexidade no Laravel onde PHP brilha. A migração é incremental: o `DEMO_MODE` atual continua funcional até que o Laravel esteja pronto para substituí-lo.
