# Registro de Execução — Tasks de Desenvolvimento

> Este documento registra em detalhes o que foi feito em cada task concluída.

---

## TASK 0.1 — Adicionar Tailwind CSS Play CDN ao `index.html`

**Status**: ✅ Concluída
**Data**: 2026-05-25

### O que foi feito

Adicionado o script do Tailwind CSS Play CDN no `<head>` do `index.html`, logo após os imports de fontes do Google Fonts e antes dos `<link>` de CSS existentes.

### Alteração realizada

**Arquivo**: `index.html` (linha 11)

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Posição no arquivo

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>   <!-- ← ADICIONADO -->
<link rel="stylesheet" href="./src/styles/tokens.css">
...
```

### Por que nessa posição

O Tailwind CDN precisa ser carregado antes de qualquer elemento que use suas classes utilitárias. Colocá-lo após as fontes e antes dos CSS existentes garante que:
1. As fontes já estão disponíveis para o Tailwind usar
2. Os CSS existentes ainda funcionam (não há conflito, pois Tailwind usa classes utilitárias que só se aplicam quando explicitamente usadas)
3. Durante a transição, ambos os sistemas (CSS custom + Tailwind) coexistem

### Verificação

Para testar, basta abrir o `index.html` no browser e adicionar temporariamente uma classe Tailwind a qualquer elemento:
```html
<div class="bg-green-500 text-white p-4">Teste Tailwind</div>
```
Se o fundo ficar verde com texto branco e padding, o Tailwind está funcional.

### Impacto

- Nenhuma funcionalidade existente foi alterada
- Os 34 arquivos CSS continuam carregando normalmente
- O Tailwind só se aplica quando classes utilitárias são usadas explicitamente

---

## TASK 1.5 — Form Requests separados

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Extraída a validação inline dos controllers para Form Request classes dedicadas:

| Form Request | Controller | Validações |
|-------------|-----------|-----------|
| `LoginRequest` | AuthController@login | email (required, email), password (required) |
| `RegisterRequest` | AuthController@register | name, email (unique), password (confirmed, min:8), company fields |
| `StoreSectorRequest` | SectorController@store | name (required), thresholds (numeric, red >= yellow) |
| `UpdateSectorRequest` | SectorController@update | authorize via route model, campos opcionais |
| `StoreDeviceRequest` | DeviceController@store | authorize (setor do user), sector_id (exists), name, type |
| `UpdateDeviceRequest` | DeviceController@update | authorize via device→sector→user, campos opcionais |

### Verificação

```bash
php artisan test --testsuite=Feature → 24 testes, 59 assertions, PASSED
```

---

## TASK 1.10 — API Resources

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criadas API Resource classes para formatar respostas JSON de forma consistente:

| Resource | Campos expostos |
|----------|----------------|
| `SectorResource` | id, name, description, thresholds, active, devices_count, devices (when loaded) |
| `DeviceResource` | id, sector_id, name, type, power_watts, status, active, sector (when loaded) |
| `AlertResource` | id, type, severity, title, message, status, acknowledged_at, resolved_at, sector, device |
| `GoalResource` | id, scope, name, unit, value, current_value, progress (%), period_start/end, status |
| `TariffResource` | id, name, type, value_kwh, flag_color, active |

Controllers atualizados: `SectorController`, `DeviceController`.

### Verificação

```bash
php artisan test --testsuite=Feature → 24 testes, 59 assertions, PASSED
```

---

## TASK 1.24 — ConsumptionService

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `app/Services/ConsumptionService.php` com lógica extraída do DashboardController:

| Método | Propósito |
|--------|-----------|
| `getKpis(User)` | KPIs completos (today, month, variation, power, cost, alerts, devices) |
| `getConsumptionChart(User, from, to, granularity)` | Dados agrupados para gráficos |
| `getTopSectors(User, from, to, limit)` | Ranking de setores por consumo |
| `getMonthlyProjection(User)` | Projeção de consumo/custo para fim do mês |
| `getAccumulatedBySector(User, from, to)` | Consumo acumulado por setor |

DashboardController refatorado para usar injeção de dependência do ConsumptionService.
Adicionado endpoint `GET /api/dashboard/projection`.

### Verificação

```bash
php artisan test --testsuite=Feature → 24 testes, 59 assertions, PASSED
```

---

## TASK 1.25 — AlertDetectionService

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `app/Services/AlertDetectionService.php` com 4 tipos de detecção automática:

| Método | Tipo | Lógica |
|--------|------|--------|
| `detectOverload()` | overload | Consumo do setor > threshold_red na última hora |
| `detectOffHours()` | off_hours | Consumo > 500W fora do horário comercial |
| `detectNightWaste()` | night_waste | Consumo > 300W entre 22h e 6h |
| `detectAnomaly()` | anomaly | Consumo do device > 2x a média dos últimos 7 dias |

Cooldowns para evitar duplicatas (2h, 6h, 8h, 4h respectivamente).
Integrado ao `firebase:sync` — alertas gerados automaticamente após cada sync.

### Verificação

```bash
php artisan tinker → detectAll() → {"overload":1,"off_hours":3,"night_waste":3,"anomaly":0}
php artisan test → 24 testes, PASSED
```

---

## TASK 1.26 — GoalProjectionService

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `backend/app/Services/GoalProjectionService.php` com lógica de projeção de metas:

| Método | Propósito |
|--------|-----------|
| `projectAll(User)` | Projeta todas as metas ativas do usuário |
| `project(Goal, User)` | Projeção individual: calcula taxa diária, valor projetado, status |
| `calculateCurrentValue(Goal, User)` | Calcula valor atual baseado no escopo (global/sector/device) e unidade (kwh/reais/percent) |
| `getConsumptionKwh(Goal, User, from, to)` | Busca consumo real no período, filtrado por escopo |
| `determineProjectionStatus(Goal, projectedProgress)` | Classifica: on_track (<80%), warning (80-99%), at_risk (≥100%) |

### Endpoints adicionados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/goals/projections` | Projeção de todas as metas ativas |
| GET | `/api/goals/{goal}/projection` | Projeção de uma meta específica |

### Resposta da API

```json
{
  "goal_id": 1,
  "name": "Limite mensal de consumo",
  "scope": "global",
  "unit": "kwh",
  "target_value": 5000.00,
  "current_value": 2340.50,
  "projected_value": 3890.25,
  "daily_rate": 150.03,
  "progress": 46.8,
  "projected_progress": 77.8,
  "days_elapsed": 16,
  "days_remaining": 15,
  "days_total": 31,
  "projection_status": "on_track",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31"
}
```

### Lógica de projeção

1. Calcula consumo real no período decorrido (baseado em `consumption_readings`)
2. Deriva taxa diária média (`current_value / days_elapsed`)
3. Projeta para o período total (`daily_rate * total_days`)
4. Compara projeção com a meta para determinar status

### Arquivos criados/alterados

- `backend/app/Services/GoalProjectionService.php` (novo)
- `backend/app/Http/Controllers/Api/GoalController.php` (adicionados métodos `projections` e `projection`)
- `backend/routes/api.php` (adicionadas 2 rotas)

---

## TASK 1.29 — tests/Unit/ConsumptionServiceTest.php

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `backend/tests/Unit/ConsumptionServiceTest.php` com 8 testes cobrindo todos os métodos do ConsumptionService:

| Teste | Método testado | O que valida |
|-------|---------------|-------------|
| `test_get_kpis_with_readings` | getKpis() | KPIs corretos com leituras (today, month, power, cost, devices) |
| `test_get_kpis_empty_returns_zeros` | getKpis() | Retorna zeros quando não há leituras |
| `test_get_consumption_chart_groups_by_day` | getConsumptionChart() | Agrupamento por dia com campos period, total_kwh, avg_power_w |
| `test_get_top_sectors_ranking` | getTopSectors() | Ranking correto (maior consumo primeiro) |
| `test_get_monthly_projection` | getMonthlyProjection() | Estrutura da projeção com campos obrigatórios |
| `test_get_accumulated_by_sector` | getAccumulatedBySector() | Acumulado por setor com nome e total_kwh |
| `test_multi_tenant_isolation` | getKpis() | Dados de outro usuário não aparecem |

### Verificação

```bash
php vendor/bin/phpunit --testsuite=Unit → 8 testes, 32 assertions, PASSED
```

---

## TASK 1.30 — tests/Unit/AlertDetectionServiceTest.php

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `backend/tests/Unit/AlertDetectionServiceTest.php` com 11 testes cobrindo todos os métodos do AlertDetectionService:

| Teste | Método testado | O que valida |
|-------|---------------|-------------|
| `test_detect_overload_creates_alert` | detectOverload() | Cria alerta quando consumo > threshold_red |
| `test_detect_overload_skips_below_threshold` | detectOverload() | Não cria alerta quando consumo está normal |
| `test_detect_overload_respects_cooldown` | detectOverload() | Não duplica alerta dentro do cooldown de 2h |
| `test_detect_off_hours_creates_alert` | detectOffHours() | Cria alerta quando há consumo >500W fora do horário |
| `test_detect_off_hours_skips_during_business_hours` | detectOffHours() | Não cria alerta durante horário comercial |
| `test_detect_night_waste_creates_alert` | detectNightWaste() | Cria alerta quando há consumo >300W entre 22h-6h |
| `test_detect_night_waste_skips_daytime` | detectNightWaste() | Não cria alerta durante o dia |
| `test_detect_anomaly_creates_alert` | detectAnomaly() | Cria alerta quando consumo > 2x a média de 7 dias |
| `test_detect_anomaly_skips_normal_consumption` | detectAnomaly() | Não cria alerta quando consumo está dentro do normal |
| `test_detect_all_runs_all_detections` | detectAll() | Retorna array com as 4 chaves de detecção |
| `test_multi_tenant_isolation` | detectOverload() | Dados de outro usuário não geram alertas |

### Verificação

```bash
php vendor/bin/phpunit → 42 testes, 109 assertions, PASSED (suite completa)
```

---

## TASK 2.7 — Atualizar config.js

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

- Adicionado `FIREBASE_RTDB_URL: 'https://projeto-pi-bf5a6-default-rtdb.firebaseio.com'`
- `DEMO_MODE` alterado para `false`
- Versão atualizada para `0.2.0`
- `firebaseRealtimeService.js` agora importa URL do Config

---

## TASK 2.1 — HTTP Client para Laravel API

**Status**: ✅ Concluída (já existente)
**Data**: 2026-05-26

### O que foi feito

O `src/services/httpClient.js` já implementa 100% dos critérios de aceite: fetch wrapper com auth token automático, parsing JSON, erro estruturado (`ApiError`), evento `auth:expired` no 401. Todos os services já o utilizam. Nenhuma alteração necessária.

---

## TASK 2.20 — Converter Login Page para Alpine.js + Tailwind

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criados dois arquivos para a versão Alpine.js + Tailwind da página de login:

| Arquivo | Propósito |
|---------|-----------|
| `src/pages/login-alpine.js` | Componente Alpine.data('loginPage') com lógica reativa |
| `src/pages/login-alpine-template.js` | Função `renderLoginPageAlpine(container)` com HTML Tailwind |

### Funcionalidades mantidas

- Validação progressiva (blur) com feedback visual
- Campos: e-mail, senha (com toggle de visibilidade)
- Checkbox "Lembre-se de mim"
- Link "Esqueci a senha" → `#/forgot-password`
- Link "Criar conta" → `#/register`
- Banner de erro global (credenciais inválidas, bloqueio, rede)
- Botão Demo (condicional via `Config.DEMO_MODE`)
- Theme toggle (dark/light)
- Branding panel lateral (hidden no mobile)
- Logo mobile
- Loading state no submit
- Integração com `authService.login()` e `sessionService.setUser()`
- Navegação para `/sectors/select` após sucesso

### Design

- Layout split: branding (emerald gradient) à esquerda, form à direita
- Responsivo: branding oculto em mobile, form centralizado
- Dark mode completo via classes Tailwind `dark:`
- Acessibilidade: labels, aria-label, role="alert", aria-live

---

## TASK 2.25 — Página Dashboard (Alpine + Tailwind)

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criados dois arquivos para a versão Alpine.js + Tailwind do dashboard:

| Arquivo | Propósito |
|---------|-----------|
| `src/pages/dashboard-alpine.js` | Componente Alpine.data('dashboardPage') com toda a lógica reativa |
| `src/pages/dashboard-alpine-template.js` | Função `renderDashboardPageAlpine(container)` com HTML Tailwind |

### Seções implementadas

1. **KPI Cards** (consumo, custo, alertas, dispositivos) — loading skeleton, variação %
2. **Goal Progress** — barra de progresso com cores por status (verde/amarelo/vermelho)
3. **Gráfico de consumo** — period picker (hoje/7d/30d), loading/error/empty states, canvas Chart.js
4. **Top 5 setores** — bar chart horizontal com loading/error/empty states
5. **Alertas recentes** — lista com severity dots, click para navegar
6. **Alertas fora de horário** — contagem + lista
7. **Desperdício noturno** — contagem + lista
8. **Real-time power** — indicador com ping animation (dados do Firebase store)
9. **Atalhos rápidos** — grid de links (transparência, setores, dispositivos, alertas)

### Critérios de aceite

- KPIs com loading state e dados reais via `dashboardService`
- Gráfico atualiza ao mudar período
- Empty/error states com retry
- Integração com `Alpine.store('realtime')` para potência instantânea
- Arquivo de lógica com ~230 linhas (distribuído entre stores e componentes)

---

## TASK 3.9 — Configurar Laravel Scheduler

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Ajustado o scheduler em `backend/routes/console.php`:
- Intervalo alterado de `everyFiveMinutes()` para `everyFiveSeconds()`
- `withoutOverlapping()` mantido para evitar execuções concorrentes
- Output redirecionado para `storage/logs/firebase-sync.log`

Adicionado logging com timestamp no command `SyncFirebaseReadings`:
- Cada execução loga `[YYYY-MM-DD HH:MM:SS]` + mensagem + quantidade de registros

### Critérios de aceite

- ✅ Command executa a cada 5 segundos via `php artisan schedule:work`
- ✅ Dados do Firebase persistem em `consumption_readings` no MySQL
- ✅ Não duplica registros (check `exists()` por sector_id + read_at)
- ✅ Loga cada sync com timestamp e quantidade de registros

---

## TASK 3.10 — Detecção automática de alertas no sync job

**Status**: ✅ Concluída (já implementada)
**Data**: 2026-05-26

### O que foi feito

O command `firebase:sync` já integra a detecção automática de alertas via `AlertDetectionService::detectAll()` após cada sync bem-sucedido. Executa para todos os usuários e loga quantidade de alertas gerados por usuário.

---

## TASK 3.14 — Criar `.env.example` no Laravel

**Status**: ✅ Concluída (já existente)
**Data**: 2026-05-26

### O que foi feito

O arquivo `backend/.env.example` já existia com todas as configurações necessárias: APP, DB (MySQL), Firebase RTDB, CORS (FRONTEND_URL), mail, cache, session.

---

## TASK 3.13 — Documentar endpoints da API

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Criado `docs/API.md` com documentação completa de todos os 50 endpoints da API:

| Grupo | Endpoints |
|-------|-----------|
| Auth | register, login, forgot-password, reset-password, logout, me |
| Dashboard | kpis, consumption, top-sectors, projection |
| Sectors | CRUD completo (apiResource) |
| Devices | CRUD + readings + anomalies |
| Alerts | index, show, summary, count, acknowledge, resolve |
| Goals | CRUD + projections |
| Tariffs | CRUD completo |
| Business Hours | index, upsert (2 aliases) |
| Financial | summary, daily, ranking |
| Consumption | index, summary, by-sector, hourly |
| Firebase Sync | sync (manual), preview |

Inclui: payloads de request/response, query params, códigos de erro, notas sobre autenticação e paginação.

---

## TASK 3.12 — Atualizar README.md

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Atualizado `README.md` com:
- Seção de pré-requisitos (PHP 8.3+, MySQL 8.4+, Composer)
- Instruções detalhadas de configuração do `.env` (DB + Firebase + CORS)
- Correção do intervalo do scheduler (5 minutos → 5 segundos)
- Comando `php artisan schedule:work` para desenvolvimento
- Link para `docs/API.md` na seção de documentação

---

## TASK 3.15 — Rodar `php artisan test` — 100% passando

**Status**: ✅ Concluída
**Data**: 2026-05-26

### Resultado

```
42 testes, 109 assertions, PASSED (4.7s)
```

Suites: Feature (24 testes) + Unit (18 testes). Zero falhas, zero warnings.

---

## TASK 2.26 — Converter todas as páginas restantes para Alpine.js + Tailwind

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Convertidas todas as 14 páginas restantes do frontend para Alpine.js + Tailwind CSS, seguindo o padrão `registerXxxPage(Alpine)` + `renderXxxPageAlpine(container)`:

| Arquivo criado | Página |
|----------------|--------|
| `src/pages/login-alpine.js` | Login |
| `src/pages/register-alpine.js` | Cadastro (com máscara CNPJ) |
| `src/pages/forgot-password-alpine.js` | Esqueci a senha |
| `src/pages/reset-password-alpine.js` | Redefinir senha |
| `src/pages/sector-select-alpine.js` | Seleção de setor |
| `src/pages/sectors-alpine.js` | CRUD de setores |
| `src/pages/devices-alpine.js` | CRUD de dispositivos |
| `src/pages/device-detail-alpine.js` | Detalhe do dispositivo (tabs: leituras, anomalias, manutenção) |
| `src/pages/alerts-alpine.js` | Lista de alertas com filtros |
| `src/pages/goals-alpine.js` | CRUD de metas com progresso |
| `src/pages/financial-alpine.js` | Painel financeiro |
| `src/pages/tariffs-alpine.js` | CRUD de tarifas |
| `src/pages/settings-alpine.js` | Configuração de horário comercial |
| `src/pages/transparency-alpine.js` | Painel TV com semáforo por setor |
| `src/pages/sector-dashboard-alpine.js` | Dashboard individual do setor |

### Padrão seguido

- Cada arquivo exporta `registerXxxPage(Alpine)` e `renderXxxPageAlpine(container)`
- Componentes usam `Alpine.data()` com estado reativo
- Templates usam classes Tailwind (dark mode via `dark:` prefix)
- Loading/error/empty states em todas as páginas
- Modais para CRUD (create/edit) com validação inline
- Integração com services existentes (`httpClient`, `deviceService`, `sectorService`, etc.)

---

## TASK 2.27 — Atualizar `app.js` para usar páginas Alpine

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Reescrito `src/app.js` para:
- Importar todas as versões Alpine (`*-alpine.js`) em vez das legacy
- Remover imports de: `installMocks`, `Toast`, `t`, `registerOffHoursPlugin`, `alertPolling`, `initAlertDetailModal`
- Remover chamadas: `installMocks()`, `registerOffHoursPlugin()`, `initAlertDetailModal()`, `alertPolling.start()`
- Todas as rotas agora chamam `renderXxxPageAlpine(container)`
- Adicionado suporte a dark mode class (`document.documentElement.classList.add('dark')`)
- Placeholder de "Relatórios" simplificado com Tailwind

### Impacto

O frontend agora depende exclusivamente das páginas Alpine.js + Tailwind. As páginas legacy e o sistema de mocks podem ser removidos nas próximas tasks (3.1-3.8).

---

## TASK 3.1 — Remover pasta `mocks/`

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Deletada a pasta `src/mocks/` com 3 arquivos: `install.js`, `mockData.js`, `mockHandler.js`. O `app.js` já não importa nem chama `installMocks()`.

---

## TASK 3.2 — Remover CSS legacy

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Deletada toda a pasta `src/styles/` (23 arquivos CSS). Removidos os 23 `<link rel="stylesheet">` do `index.html`. Adicionado Alpine.js CDN e estilos mínimos inline (`[x-cloak]`, font-family).

---

## TASK 3.3 — Remover componentes legacy

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Deletados 21 componentes PascalCase legacy: AlertBadge, AlertDetailModal, Button, Chart, Checkbox, ConfirmDialog, DataTable, EmptyState, ErrorState, FormField, GoalProgress, Input, KpiCard, Modal, PageHeader, PasswordInput, PeriodPicker, Select, Spinner, Textarea, Toast.

Mantidos: `AppShell.js` (ainda usado pelo router/authGuard) e todos os componentes Alpine (`*-alpine.js`).

---

## TASK 3.4 — Remover utilitários legacy

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Deletados 7 utilitários não mais importados: `eventBus.js`, `alertPolling.js`, `offHoursPlugin.js`, `periodSync.js`, `goalMilestoneCheck.js`, `termsModal.js`, `debounce.js`.

Mantidos: `router.js`, `authGuard.js`, `formatters.js`, `dates.js`, `validators.js`, `storage.js`, `logout.js` (ainda usados pelo app, AppShell ou páginas Alpine).

---

## TASK 3.5 — Remover páginas legacy

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Deletadas todas as 16 páginas legacy originais (sem sufixo `-alpine`). O `app.js` já importa exclusivamente as versões Alpine.

---

## TASK 3.6 — Limpar `index.html`

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

- Removidos 23 `<link rel="stylesheet">` apontando para CSS deletados
- Adicionado `<script defer>` do Alpine.js CDN
- Adicionado `<style>` com `[x-cloak] { display: none !important; }` e `font-family: Inter`
- Mantidos: Tailwind CDN, Chart.js CDN, Google Fonts, `app.js` module

---

## TASK 3.7 — Corrigir imports quebrados após cleanup

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Corrigidos 2 arquivos que importavam `Toast` (componente deletado):

- `src/utils/logout.js` — removido import de `Toast` e `t`, substituído `Toast.show(...)` por `window.Alpine?.store('toast')?.show(...)`
- `src/stores/session.js` — removido import de `Toast` e `t`, substituído `Toast.show(...)` por `Alpine.store('toast')?.show(...)`

### Verificação

Grep por imports de arquivos deletados retorna zero resultados. Nenhuma referência quebrada no projeto.

---

## TASK 3.8 — Migrar AppShell para Tailwind + remover i18n

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

1. **Reescrito `src/components/AppShell.js`** — substituído DOM imperativo + classes CSS custom por HTML com Tailwind inline:
   - Sidebar responsiva (mobile drawer + desktop collapsible)
   - Header com toggle de tema (dark/light), avatar dropdown com logout
   - Navegação com highlight do item ativo
   - Mesma API pública mantida (`mount`, `unmount`, `setActivePath`, `updateUser`, `isMounted`, `getContentArea`)

2. **Removida pasta `src/i18n/`** — não mais importada por nenhum arquivo

3. **Verificação final** — zero imports quebrados no projeto

---

## TASK 4.1 — Bootstrap Alpine (registrar stores e componentes globais)

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

- Criado `src/bootstrap.js` que importa e chama `registerToastStore`, `registerSessionStore`, `registerAlertsStore`, `registerRealtimeStore`
- Adicionado listener `alpine:init` no `app.js` que chama `bootstrapAlpine(window.Alpine)` antes do Alpine processar o DOM
- Adicionado container de toast global no `index.html` (`x-data="toastContainer"`)

### Impacto

Todos os `Alpine.store('toast')`, `Alpine.store('session')`, `Alpine.store('alerts')`, `Alpine.store('realtime')` agora funcionam corretamente em runtime.

---

## TASK 4.2 — Corrigir assinatura do Toast `show()`

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Alterado `src/components/toast-alpine.js`:
- `show({ message, type, duration })` → `show(message, type = 'info', duration)`
- Agora compatível com todos os callers que usam `show('msg', 'type')`

---

## TASK 4.3 — Corrigir endpoint do AuthGuard

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Alterado `src/utils/authGuard.js`:
- `httpClient.get('/users/me')` → `httpClient.get('/auth/me')`
- Agora bate com a rota real do Laravel (`GET /api/auth/me`)

---

## TASK 4.4 — Corrigir mapeamento de KPIs do Dashboard

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Alterado `src/pages/dashboard-alpine.js` em `loadKpis()`:
- `data.consumption_kwh` → `data.month_kwh`
- `data.estimated_cost` → `data.monthly_cost`
- Variações agora multiplicadas por 100 (backend retorna decimal 0.05 = 5%)

---

## TASK 4.5 — Corrigir formato do Chart e Top Sectors

**Status**: ✅ Concluída
**Data**: 2026-05-26

### O que foi feito

Alterado `src/pages/dashboard-alpine.js`:
- `loadChart()`: transforma `response.data` (array de `{ period, total_kwh }`) em `{ labels, values }`
- `loadTopSectors()`: usa `s.total_kwh` em vez de `s.consumption_kwh`

Agora o frontend consome corretamente o formato retornado pelo `ConsumptionService` do Laravel.
