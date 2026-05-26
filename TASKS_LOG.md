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
