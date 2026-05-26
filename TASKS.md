# Tasks de Desenvolvimento — LumenFlow

> Documento gerado a partir do `REFACTORING_PLAN.md`.
> Cada task é atômica, estimada, e possui critérios de aceite claros.

---

## Legenda

| Campo | Descrição |
|-------|-----------|
| **ID** | Identificador único (FASE.NÚMERO) |
| **Prioridade** | P0 (bloqueante) · P1 (alta) · P2 (média) · P3 (baixa) |
| **Estimativa** | Story points (1 = ~2h, 2 = ~4h, 3 = ~1 dia, 5 = ~2 dias, 8 = ~3-4 dias) |
| **Dependência** | IDs de tasks que precisam estar concluídas antes |
| **Critério de Aceite** | Condição verificável para considerar a task "Done" |

---

## FASE 0 — Setup da Nova Stack

### Sprint 1 (Semana 1)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 0.1 | Adicionar Tailwind CSS Play CDN ao `index.html` | P0 | 1 | — | Frontend |
| 0.2 | Adicionar Alpine.js CDN ao `index.html` | P0 | 1 | — | Frontend |
| 0.3 | Configurar Tailwind inline com design tokens (cores primary, secondary, accent) | P0 | 2 | 0.1 | Frontend |
| 0.4 | Criar projeto Laravel (`lumenflow-api`) com Composer | P0 | 2 | — | Backend |
| 0.5 | Configurar `.env` do Laravel (MySQL local + credenciais Firebase) | P0 | 1 | 0.4 | Backend |
| 0.6 | Instalar Laravel Sanctum e configurar auth API | P0 | 2 | 0.4 | Backend |
| 0.7 | Instalar `kreait/firebase-php` (SDK Firebase para PHP) | P1 | 1 | 0.4 | Backend |
| 0.8 | Configurar CORS no Laravel (`config/cors.php`) | P0 | 1 | 0.4 | Backend |
| 0.9 | Criar todas as migrations do banco MySQL | P0 | 3 | 0.5 | Backend |
| 0.10 | Rodar migrations e validar schema no MySQL local | P0 | 1 | 0.9 | Backend |

---

### Detalhamento — Fase 0

#### TASK 0.1 — Adicionar Tailwind CSS Play CDN

**Ação**: Inserir no `<head>` do `index.html`:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Critério de Aceite**:
- [ ] Classes Tailwind (ex: `class="bg-green-500 text-white p-4"`) funcionam no browser
- [ ] Nenhum erro no console

---

#### TASK 0.2 — Adicionar Alpine.js CDN

**Ação**: Inserir antes do `</body>` no `index.html`:
```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

**Critério de Aceite**:
- [ ] `x-data`, `x-text`, `x-show` funcionam em um elemento de teste
- [ ] `Alpine` disponível no console do browser

---

#### TASK 0.3 — Configurar Tailwind com Design Tokens

**Ação**: Adicionar config inline mapeando tokens de `tokens.css`:
```html
<script>
  tailwind.config = {
    darkMode: '[data-theme="dark"]',
    theme: {
      extend: {
        colors: {
          primary: { 50:'#ecfdf5', 500:'#10b981', 600:'#059669', 700:'#047857' },
          secondary: { 50:'#eef2ff', 500:'#6366f1', 600:'#4f46e5' },
          accent: { 500:'#8bc34a', 600:'#7cb342' },
        },
        fontFamily: { sans: ['Inter', 'sans-serif'] },
      }
    }
  }
</script>
```

**Critério de Aceite**:
- [ ] `bg-primary-500` renderiza `#10b981`
- [ ] Dark mode funciona com `data-theme="dark"`

---

#### TASK 0.9 — Criar migrations MySQL

**Tabelas a criar**:

| Tabela | Campos principais |
|--------|------------------|
| `users` | id, name, email, password, company_name, cnpj, segment, timestamps |
| `sectors` | id, user_id (FK), name, threshold_yellow, threshold_red, active, timestamps |
| `devices` | id, sector_id (FK), name, type, power_watts, active, status, timestamps |
| `consumption_readings` | id, device_id, sector_id, power_w, energy_kwh, corrente, tensao, fator_pf, read_at |
| `alerts` | id, user_id, sector_id, device_id, type, severity, title, message, status, timestamps |
| `goals` | id, user_id, scope, sector_id, device_id, name, unit, value, current_value, period_start, period_end, status |
| `tariffs` | id, user_id, name, type, value_kwh, flag_color, active, timestamps |
| `business_hours` | id, user_id, day_of_week, enabled, start_time, end_time |

**Critério de Aceite**:
- [ ] `php artisan migrate` executa sem erros
- [ ] 8 tabelas criadas com foreign keys corretas

---

## FASE 1 — Backend Laravel: API Completa

### Sprint 2 (Semana 2)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 1.1 | Criar Model `User` com fillable, hidden, casts | P0 | 1 | 0.9 | Backend |
| 1.2 | Criar `AuthController` — register | P0 | 3 | 1.1, 0.6 | Backend |
| 1.3 | Criar `AuthController` — login | P0 | 2 | 1.1, 0.6 | Backend |
| 1.4 | Criar `AuthController` — logout, me | P0 | 2 | 1.3 | Backend |
| 1.5 | Criar `LoginRequest` e `RegisterRequest` (Form Requests) | P1 | 2 | 1.2 | Backend |
| 1.6 | Criar middleware de auth e proteger rotas em `api.php` | P0 | 2 | 1.4 | Backend |
| 1.7 | Escrever `tests/Feature/AuthTest.php` | P1 | 3 | 1.4 | Backend |
| 1.8 | Criar Models: Sector, Device, Alert, Goal, Tariff, ConsumptionReading, BusinessHours | P0 | 3 | 0.9 | Backend |
| 1.9 | Criar `SectorController` (index, store, show, update, destroy) | P0 | 3 | 1.8, 1.6 | Backend |
| 1.10 | Criar `SectorResource` (API Resource) | P1 | 1 | 1.9 | Backend |
| 1.11 | Criar `StoreSectorRequest` + `UpdateSectorRequest` | P1 | 1 | 1.9 | Backend |
| 1.12 | Escrever `tests/Feature/SectorTest.php` | P1 | 2 | 1.9 | Backend |

#### TASK 1.2 — AuthController: Register

**Endpoint**: `POST /api/auth/register`

**Payload**:
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "company_name": "TechNova Indústria",
  "cnpj": "12.345.678/0001-90",
  "segment": "industria"
}
```

**Response (201)**:
```json
{
  "token": "1|abc123...",
  "user": { "id": 1, "name": "João Silva", "email": "joao@empresa.com", "company_name": "TechNova Indústria" }
}
```

**Critério de Aceite**:
- [ ] Cria usuário no MySQL com senha hasheada (bcrypt)
- [ ] Retorna token Sanctum válido
- [ ] Validação rejeita email duplicado (422)
- [ ] Validação rejeita senha < 6 caracteres (422)

---

#### TASK 1.3 — AuthController: Login

**Endpoint**: `POST /api/auth/login`

**Payload**:
```json
{ "email": "joao@empresa.com", "password": "senha123" }
```

**Response (200)**:
```json
{
  "token": "2|xyz789...",
  "user": { "id": 1, "name": "João Silva", "email": "joao@empresa.com", "company_name": "TechNova Indústria" }
}
```

**Critério de Aceite**:
- [ ] Credenciais válidas retornam token + user
- [ ] Credenciais inválidas retornam 401 com `{ "error": { "code": "INVALID_CREDENTIALS" } }`
- [ ] Rate limiting: 5 tentativas por minuto (429 após exceder)

---

#### TASK 1.9 — SectorController

**Endpoints**:
- `GET /api/sectors` — lista setores do usuário autenticado
- `POST /api/sectors` — cria setor
- `GET /api/sectors/{id}` — detalhe
- `PUT /api/sectors/{id}` — atualiza
- `DELETE /api/sectors/{id}` — remove

**Critério de Aceite**:
- [ ] Listagem retorna apenas setores do usuário logado (multi-tenant)
- [ ] Criação valida campos obrigatórios (name)
- [ ] Delete retorna 204
- [ ] Usuário não pode acessar setor de outro usuário (403)

---

### Sprint 3 (Semana 3)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 1.13 | Criar `DeviceController` (CRUD + readings + anomalies) | P0 | 5 | 1.8, 1.6 | Backend |
| 1.14 | Criar `DeviceResource` + `StoreDeviceRequest` | P1 | 2 | 1.13 | Backend |
| 1.15 | Escrever `tests/Feature/DeviceTest.php` | P1 | 2 | 1.13 | Backend |
| 1.16 | Criar `AlertController` (index, show, acknowledge, resolve, bulk) | P0 | 5 | 1.8, 1.6 | Backend |
| 1.17 | Criar `AlertResource` + filtros (type, severity, status, sector_id) | P1 | 2 | 1.16 | Backend |
| 1.18 | Escrever `tests/Feature/AlertTest.php` | P1 | 3 | 1.16 | Backend |
| 1.19 | Criar `GoalController` (CRUD + progresso) | P1 | 3 | 1.8, 1.6 | Backend |
| 1.20 | Criar `TariffController` (CRUD) | P1 | 2 | 1.8, 1.6 | Backend |
| 1.21 | Criar `SettingsController` (business-hours GET/PUT) | P2 | 2 | 1.8, 1.6 | Backend |
| 1.22 | Criar `FinancialController` (summary, daily, ranking) | P1 | 3 | 1.8, 1.24 | Backend |
| 1.23 | Criar `DashboardController` (kpis, consumption, top-sectors) | P0 | 5 | 1.8, 1.24 | Backend |
| 1.24 | Criar `ConsumptionService` (KPIs, projeções, acumulados) | P0 | 5 | 1.8 | Backend |
| 1.25 | Criar `AlertDetectionService` (off-hours, anomalia, overload, night_waste) | P1 | 5 | 1.8, 1.21 | Backend |
| 1.26 | Criar `GoalProjectionService` (projeção de metas) | P2 | 3 | 1.19, 1.24 | Backend |
| 1.27 | Criar `FirebaseSyncService` (lê Firebase RTDB → persiste em MySQL) | P0 | 5 | 0.7, 1.8 | Backend |
| 1.28 | Criar artisan command `SyncFirebaseData` | P0 | 3 | 1.27 | Backend |
| 1.29 | Escrever `tests/Unit/ConsumptionServiceTest.php` | P1 | 3 | 1.24 | Backend |
| 1.30 | Escrever `tests/Unit/AlertDetectionServiceTest.php` | P1 | 3 | 1.25 | Backend |
| 1.31 | Registrar todas as rotas em `routes/api.php` | P0 | 2 | 1.9–1.23 | Backend |
| 1.32 | Testar endpoints via Postman/Insomnia | P1 | 3 | 1.31 | Backend |

#### TASK 1.16 — AlertController

**Endpoints**:
- `GET /api/alerts` — lista com filtros (type, severity, status, sector_id, limit, sort)
- `GET /api/alerts/{id}` — detalhe
- `GET /api/alerts/count?status=open` — contagem
- `PUT /api/alerts/{id}/acknowledge` — marcar como reconhecido
- `PUT /api/alerts/{id}/resolve` — marcar como resolvido
- `PUT /api/alerts/bulk/acknowledge` — bulk acknowledge (body: `{ "ids": [1,2,3] }`)
- `PUT /api/alerts/bulk/resolve` — bulk resolve

**Critério de Aceite**:
- [ ] Filtros combinam corretamente (type + severity + status)
- [ ] Acknowledge atualiza `status` e `acknowledged_at`
- [ ] Resolve atualiza `status` e `resolved_at`
- [ ] Bulk operations retornam `{ "updated": N }`
- [ ] Apenas alertas do usuário logado são acessíveis

---

#### TASK 1.23 — DashboardController

**Endpoints**:
- `GET /api/dashboard/kpis`
- `GET /api/dashboard/consumption?from=&to=&granularity=`
- `GET /api/dashboard/top-sectors?limit=5`

**Response KPIs**:
```json
{
  "consumption_kwh": 12500.75,
  "consumption_variation": -0.05,
  "estimated_cost": 8750.50,
  "cost_variation": -0.03,
  "total_power_w": 3800,
  "open_alerts": 3,
  "active_devices": 10
}
```

**Critério de Aceite**:
- [ ] KPIs calculados a partir de `consumption_readings` do período atual
- [ ] Variation compara com período anterior (mesmo intervalo)
- [ ] Consumption chart retorna `{ labels: [...], values: [...] }` agrupado por granularity
- [ ] Top sectors ordenados por consumo decrescente

---

#### TASK 1.27 — FirebaseSyncService

**Descrição**: Service que lê dados do Firebase RTDB via SDK PHP e persiste em MySQL.

**Lógica**:
1. Buscar `/sensores` do Firebase → para cada setor, criar/atualizar `consumption_readings`
2. Buscar `/dashboard/readings/live` → atualizar totais globais
3. Comparar timestamp para evitar duplicação de leituras

**Critério de Aceite**:
- [ ] Lê dados do Firebase RTDB corretamente
- [ ] Cria registros em `consumption_readings` com timestamp correto
- [ ] Não duplica leituras (verifica timestamp antes de inserir)
- [ ] Loga erros de conexão sem crashar

---

## FASE 2 — Frontend: Migração para Alpine.js + Tailwind

### Sprint 4 (Semana 4)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 2.1 | Criar `src/services/api.js` (fetch wrapper → Laravel API) | P0 | 3 | 0.8 | Frontend |
| 2.2 | Criar `src/services/firebase.js` (listeners Firebase RTDB) | P0 | 3 | — | Frontend |
| 2.3 | Criar `src/services/auth.js` (login, logout, token com Sanctum) | P0 | 3 | 2.1 | Frontend |
| 2.4 | Criar `src/stores/session.js` (Alpine.store: user, token, isAuthenticated) | P0 | 3 | 0.2, 2.3 | Frontend |
| 2.5 | Criar `src/stores/realtime.js` (Alpine.store: dados IoT live) | P0 | 3 | 0.2, 2.2 | Frontend |
| 2.6 | Criar `src/stores/alerts.js` (Alpine.store: contagem, badge, polling) | P1 | 2 | 0.2, 2.1 | Frontend |
| 2.7 | Atualizar `src/config.js` (LARAVEL_API_URL, FIREBASE_RTDB_URL) | P0 | 1 | — | Frontend |
| 2.8 | Criar componente `src/components/theme-toggle.js` | P1 | 2 | 0.2 | Frontend |
| 2.9 | Criar componente `src/components/toast.js` | P1 | 2 | 0.2 | Frontend |
| 2.10 | Criar componente `src/components/spinner.js` | P2 | 1 | 0.1, 0.2 | Frontend |
| 2.11 | Criar componente `src/components/modal.js` | P1 | 2 | 0.2 | Frontend |
| 2.12 | Criar componente `src/components/kpi-card.js` | P1 | 2 | 0.2, 0.1 | Frontend |
| 2.13 | Criar componente `src/components/data-table.js` (sort + filter + pagination) | P1 | 5 | 0.2, 0.1 | Frontend |
| 2.14 | Criar componente `src/components/period-picker.js` | P1 | 3 | 0.2 | Frontend |
| 2.15 | Criar componente `src/components/chart-wrapper.js` (Alpine + Chart.js) | P1 | 3 | 0.2 | Frontend |
| 2.16 | Criar componente `src/components/empty-state.js` | P2 | 1 | 0.2 | Frontend |
| 2.17 | Criar componente `src/components/error-state.js` (com retry) | P2 | 1 | 0.2 | Frontend |
| 2.18 | Criar componente `src/components/confirm-dialog.js` | P2 | 2 | 2.11 | Frontend |

#### TASK 2.1 — HTTP Client para Laravel API

**Descrição**: Fetch wrapper que gerencia base URL, auth token, parsing JSON e erros.

**API pública**:
```javascript
import { api } from '../services/api.js';

const kpis = await api.get('/dashboard/kpis');
const user = await api.post('/auth/login', { email, password });
api.setToken('1|abc123...');
api.clearToken();
```

**Critério de Aceite**:
- [ ] Adiciona `Authorization: Bearer {token}` automaticamente quando token existe
- [ ] Retorna JSON parseado em caso de sucesso
- [ ] Lança erro estruturado `{ code, message, status }` em caso de falha
- [ ] Dispara evento/callback quando recebe 401 (sessão expirada)

---

#### TASK 2.4 — Alpine Store: Session

**Descrição**: Store global que gerencia estado de autenticação.

```javascript
Alpine.store('session', {
  user: null,
  token: null,
  get isAuthenticated() { return !!this.token; },
  async login(email, password, remember) { ... },
  async logout() { ... },
  restore() { /* lê token do localStorage/sessionStorage */ },
});
```

**Critério de Aceite**:
- [ ] `Alpine.store('session').isAuthenticated` reativo (atualiza UI automaticamente)
- [ ] `login()` persiste token e user
- [ ] `logout()` limpa token, user e redireciona para `/login`
- [ ] `restore()` recupera sessão ao recarregar página

---

#### TASK 2.5 — Alpine Store: Realtime (Firebase)

**Descrição**: Store que escuta Firebase RTDB e expõe dados IoT reativamente.

```javascript
Alpine.store('realtime', {
  sectors: [],
  live: { totalPower_W: 0, totalEnergy_kWh: 0, estimativaCusto_R: 0 },
  connected: false,
  startListening() { ... },
  stopListening() { ... },
});
```

**Critério de Aceite**:
- [ ] Escuta `/sensores` e `/dashboard/readings/live` do Firebase
- [ ] Atualiza `sectors` e `live` automaticamente quando Firebase muda
- [ ] Latência < 1s entre mudança no Wokwi e atualização no store
- [ ] `connected` reflete estado da conexão Firebase

---

#### TASK 2.13 — Componente DataTable

**Descrição**: Tabela reutilizável com sort, filtros e paginação.

**API**:
```javascript
Alpine.data('dataTable', (config) => ({
  items: [],
  sortBy: null,
  sortDir: 'asc',
  page: 1,
  perPage: 10,
  filters: {},
  get filtered() { ... },
  get sorted() { ... },
  get paginated() { ... },
  get totalPages() { ... },
  sort(column) { ... },
  setFilter(key, value) { ... },
  goToPage(n) { ... },
}));
```

**Critério de Aceite**:
- [ ] Ordena por qualquer coluna (asc/desc toggle)
- [ ] Filtra por múltiplos critérios simultaneamente
- [ ] Paginação funcional com indicador de página atual
- [ ] Funciona com 0, 1 e 100+ itens sem quebrar

---

### Sprint 5 (Semana 5)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 2.19 | Converter AppShell para componente Alpine (`src/components/app-shell.js`) | P0 | 5 | 2.4, 2.8 | Frontend |
| 2.20 | Converter página Login para Alpine.js + Tailwind | P0 | 3 | 2.3, 2.4, 2.9 | Frontend |
| 2.21 | Converter página Register para Alpine.js + Tailwind | P1 | 3 | 2.20 | Frontend |
| 2.22 | Converter página Forgot Password para Alpine.js + Tailwind | P2 | 2 | 2.20 | Frontend |
| 2.23 | Converter página Reset Password para Alpine.js + Tailwind | P2 | 2 | 2.20 | Frontend |
| 2.24 | Converter página Sector Select para Alpine.js + Tailwind | P1 | 2 | 2.19 | Frontend |
| 2.25 | Converter página Dashboard para Alpine.js + Tailwind | P0 | 8 | 2.5, 2.12, 2.15, 2.19 | Frontend |
| 2.26 | Converter página Sector Dashboard para Alpine.js + Tailwind | P1 | 5 | 2.25 | Frontend |
| 2.27 | Converter página Transparency para Alpine.js + Tailwind | P1 | 3 | 2.19, 2.12 | Frontend |
| 2.28 | Converter página Devices (listagem) para Alpine.js + Tailwind | P0 | 3 | 2.13, 2.19 | Frontend |
| 2.29 | Converter página Device Detail para Alpine.js + Tailwind | P1 | 5 | 2.28, 2.15 | Frontend |
| 2.30 | Converter página Alerts para Alpine.js + Tailwind | P0 | 5 | 2.13, 2.6, 2.19 | Frontend |
| 2.31 | Converter página Goals para Alpine.js + Tailwind | P1 | 3 | 2.13, 2.19 | Frontend |
| 2.32 | Converter página Financial para Alpine.js + Tailwind | P1 | 3 | 2.12, 2.15, 2.19 | Frontend |
| 2.33 | Converter página Tariffs para Alpine.js + Tailwind | P1 | 3 | 2.13, 2.19 | Frontend |
| 2.34 | Converter página Settings para Alpine.js + Tailwind | P2 | 3 | 2.19 | Frontend |
| 2.35 | Converter página Sectors (CRUD) para Alpine.js + Tailwind | P1 | 3 | 2.13, 2.19 | Frontend |
| 2.36 | Atualizar `src/app.js` (bootstrap Alpine, registrar stores, iniciar router) | P0 | 3 | 2.4, 2.5, 2.6 | Frontend |
| 2.37 | Integrar auth guard com `Alpine.store('session')` | P0 | 2 | 2.4, 2.19 | Frontend |

#### TASK 2.19 — AppShell Alpine

**Descrição**: Layout autenticado com header, sidebar colapsável, content area e drawer mobile.

**Funcionalidades**:
- Header: logo, company name, theme toggle, avatar dropdown (logout)
- Sidebar: nav items com ícones, item ativo, collapse toggle, "trocar setor"
- Mobile: hamburger → drawer com backdrop
- Responsivo: sidebar collapsa em desktop, vira drawer em mobile

**Critério de Aceite**:
- [ ] Sidebar colapsa/expande com persistência em localStorage
- [ ] Drawer mobile abre/fecha com backdrop
- [ ] Avatar dropdown com logout funcional
- [ ] Item ativo na sidebar reflete a rota atual
- [ ] Company name e iniciais do avatar atualizam reativamente

---

#### TASK 2.20 — Página Login (Alpine + Tailwind)

**Descrição**: Reescrever login com Alpine.js para reatividade e Tailwind para estilo.

**Funcionalidades**:
- Layout split: branding (esquerda) + formulário (direita)
- Campos: email, senha (show/hide), "lembre-se de mim"
- Validação progressiva (blur + input)
- Error banner para credenciais inválidas
- Botão demo (se DEMO_MODE ativo)
- Theme toggle
- Links: "Esqueci a senha", "Criar conta"

**Critério de Aceite**:
- [ ] Login com credenciais válidas → redireciona para `/sectors/select`
- [ ] Login com credenciais inválidas → mostra error banner
- [ ] Validação de email no blur
- [ ] Loading state no botão durante request
- [ ] Responsivo (mobile-first)
- [ ] Dark mode funcional

---

#### TASK 2.25 — Página Dashboard (Alpine + Tailwind)

**Descrição**: Reescrever o dashboard (atualmente 482 linhas) usando Alpine.js declarativo.

**Seções**:
1. KPI cards (consumo, custo, alertas, devices) — dados do Laravel API
2. Goal progress (metas ativas) — dados do Laravel API
3. Gráfico de consumo com period picker — dados do Laravel API
4. Top 5 setores (bar chart) — dados do Laravel API
5. Alertas recentes — dados do Laravel API
6. Alertas off-hours — dados do Laravel API
7. Desperdício noturno — dados do Laravel API
8. Atalhos rápidos (links)
9. Dados real-time (potência instantânea) — dados do Firebase store

**Critério de Aceite**:
- [ ] KPIs carregam com loading state e mostram dados reais
- [ ] Gráfico de consumo atualiza ao mudar período
- [ ] Dados real-time do Firebase aparecem com latência < 1s
- [ ] Empty states quando não há dados
- [ ] Error states com botão retry
- [ ] Arquivo com < 150 linhas (lógica distribuída em stores e componentes)

---

## FASE 3 — Integração e Limpeza

### Sprint 6 (Semana 6)

| ID | Task | Prioridade | Estimativa | Dependência | Responsável |
|----|------|-----------|-----------|-------------|-------------|
| 3.1 | Deletar pasta `src/mocks/` | P0 | 1 | 2.25, 2.30 | Frontend |
| 3.2 | Deletar pasta `src/styles/` (34 arquivos CSS) | P0 | 1 | 2.25–2.35 | Frontend |
| 3.3 | Remover `<link rel="stylesheet">` restantes do `index.html` | P0 | 1 | 3.2 | Frontend |
| 3.4 | Remover `DEMO_MODE` e lógica condicional do `config.js` | P1 | 1 | 3.1 | Frontend |
| 3.5 | Deletar componentes legados não utilizados | P1 | 2 | 3.1 | Frontend |
| 3.6 | Remover `src/utils/eventBus.js` (substituído por Alpine.store) | P1 | 1 | 2.36 | Frontend |
| 3.7 | Remover `src/utils/alertPolling.js` (substituído por stores/alerts.js) | P1 | 1 | 2.6 | Frontend |
| 3.8 | Remover `src/utils/periodSync.js` (substituído por componente Alpine) | P2 | 1 | 2.14 | Frontend |
| 3.9 | Configurar Laravel scheduler: `SyncFirebaseData` a cada 5s | P0 | 2 | 1.28 | Backend |
| 3.10 | Implementar detecção automática de alertas no sync job | P0 | 3 | 1.25, 3.9 | Backend |
| 3.11 | Testar fluxo E2E: Wokwi → Firebase → Laravel → MySQL → API → Frontend | P0 | 3 | 3.9, 3.10, 2.25 | Full-stack |
| 3.12 | Atualizar `README.md` (instruções de setup frontend + backend) | P1 | 2 | 3.11 | Full-stack |
| 3.13 | Documentar endpoints da API (payloads, auth, exemplos) | P1 | 3 | 1.31 | Backend |
| 3.14 | Criar `.env.example` no Laravel | P1 | 1 | 3.11 | Backend |
| 3.15 | Rodar `php artisan test` — 100% passando | P0 | 2 | 3.10 | Backend |
| 3.16 | Teste manual E2E: login → dashboard → alertas → devices → logout | P0 | 3 | 3.11 | Full-stack |

#### TASK 3.9 — Configurar Laravel Scheduler

**Descrição**: Registrar o command `firebase:sync` no scheduler do Laravel.

**Arquivo**: `app/Console/Kernel.php`
```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('firebase:sync')->everyFiveSeconds();
}
```

**Execução**: `php artisan schedule:work` (dev) ou cron em produção.

**Critério de Aceite**:
- [ ] Command executa a cada 5 segundos quando scheduler está rodando
- [ ] Dados do Firebase aparecem em `consumption_readings` no MySQL
- [ ] Não duplica registros entre execuções
- [ ] Loga cada sync com timestamp e quantidade de registros

---

#### TASK 3.11 — Teste End-to-End Completo

**Descrição**: Validar o fluxo completo do sistema integrado.

**Passos**:
1. Iniciar Wokwi com ESP32 enviando dados ao Firebase
2. Verificar dados chegando no Firebase Console
3. Iniciar Laravel (`php artisan serve` + `php artisan schedule:work`)
4. Verificar dados sincronizados no MySQL (`consumption_readings`)
5. Abrir frontend no browser (Live Server)
6. Fazer login
7. Verificar dashboard mostrando dados real-time do Firebase
8. Verificar KPIs vindos da API Laravel
9. Mover potenciômetro no Wokwi → dado atualiza no dashboard em < 3s
10. Navegar para Alertas, Devices, Financial — dados carregam corretamente

**Critério de Aceite**:
- [ ] Latência Wokwi → Dashboard < 3 segundos
- [ ] KPIs refletem dados reais do MySQL
- [ ] Nenhum erro no console do browser
- [ ] Nenhum erro nos logs do Laravel
- [ ] Login/logout funciona corretamente

---

## Resumo de Esforço

| Fase | Tasks | Story Points | Duração |
|------|-------|-------------|---------|
| Fase 0 — Setup | 10 | 15 | 1 semana |
| Fase 1 — Backend Laravel | 32 | 95 | 2 semanas |
| Fase 2 — Frontend Alpine+Tailwind | 37 | 105 | 2 semanas |
| Fase 3 — Integração e Limpeza | 16 | 28 | 1 semana |
| **TOTAL** | **95 tasks** | **243 SP** | **6 semanas** |

---

## Definição de Done (DoD)

Uma task só é "Done" quando:

- [ ] Código implementado e funcional
- [ ] Sem erros no console (frontend) ou logs (backend)
- [ ] Testes passando (backend: PHPUnit; frontend: teste manual)
- [ ] Commit com mensagem descritiva (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`)
- [ ] PR com descrição "antes/depois" e instruções de teste

---

## Caminho Crítico

```
0.4 (Laravel) → 0.9 (Migrations) → 1.8 (Models) → 1.24 (ConsumptionService) → 1.23 (Dashboard API)
                                                                                        ↓
0.1 (Tailwind) ─→ 0.3 (Tokens) ──────────────────────────────────────────→ 2.19 (AppShell)
0.2 (Alpine) ──→ 2.4 (Store session) → 2.20 (Login) → 2.25 (Dashboard) → 3.11 (E2E)
                                                              ↑
1.27 (FirebaseSync) → 1.28 (Command) → 3.9 (Scheduler) → 3.10 (Alertas auto)
```

**Gargalo**: Frontend (Fase 2) depende do backend (Fase 1) para integração real. Mitigação: frontend avança com `DEMO_MODE` como fallback.

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Tailwind CDN não suporta `@apply` | Médio | Usar apenas classes utilitárias inline |
| Alpine.js limitado para DataTable complexo | Médio | Manter lógica em JS puro, Alpine só para binding |
| CORS entre GitHub Pages e Laravel local | Alto | Testar na Task 0.8. Usar `*` em dev |
| Scheduler 5s sobrecarrega Firebase | Médio | Cache: só buscar se timestamp mudou |
| Perda de funcionalidade durante migração | Alto | DEMO_MODE ativo até Fase 3 completa |

---

## Notas para o Time

1. **Paralelismo**: Backend e Frontend Setup podem rodar em paralelo por devs diferentes
2. **Fallback**: `DEMO_MODE` funciona até Task 3.4 — nada quebra durante migração
3. **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`)
4. **PRs**: Máximo 200 linhas. Se ultrapassar, quebrar em sub-tasks
5. **Daily**: Rodar `php artisan test` (backend) + abrir browser (frontend) ao final do dia
6. **Bloqueio**: Se uma task está bloqueada, comunicar imediatamente e puxar próxima task disponível
