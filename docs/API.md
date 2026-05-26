# LumenFlow API — Documentação de Endpoints

> Base URL: `http://localhost:8000/api`
> Autenticação: Bearer Token (Laravel Sanctum)

---

## Autenticação

### POST /auth/register

Cria uma nova conta de usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senhaSegura123",
  "password_confirmation": "senhaSegura123",
  "company_name": "TechNova Ltda",
  "cnpj": "12.345.678/0001-90",
  "segment": "varejo"
}
```

**Resposta 201:**
```json
{
  "user": { "id": 1, "name": "João Silva", "email": "joao@empresa.com" },
  "token": "1|abc123..."
}
```

---

### POST /auth/login

Autentica o usuário e retorna token.

**Body:**
```json
{
  "email": "joao@empresa.com",
  "password": "senhaSegura123",
  "remember_me": true
}
```

**Resposta 200:**
```json
{
  "user": { "id": 1, "name": "João Silva", "email": "joao@empresa.com", "company_name": "TechNova Ltda" },
  "token": "2|xyz789..."
}
```

**Erros:** `401` (credenciais inválidas), `429` (muitas tentativas)

---

### POST /auth/forgot-password

Envia link de recuperação de senha.

**Body:**
```json
{ "email": "joao@empresa.com" }
```

**Resposta 200:**
```json
{ "message": "Link enviado com sucesso." }
```

---

### POST /auth/reset-password

Redefine a senha com token recebido por e-mail.

**Body:**
```json
{
  "token": "reset-token-aqui",
  "password": "novaSenha123",
  "password_confirmation": "novaSenha123"
}
```

---

### POST /auth/logout 🔒

Revoga o token atual.

**Resposta 200:**
```json
{ "message": "Sessão encerrada." }
```

---

### GET /auth/me 🔒

Retorna dados do usuário autenticado.

**Resposta 200:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@empresa.com",
  "company_name": "TechNova Ltda",
  "cnpj": "12.345.678/0001-90",
  "segment": "varejo"
}
```

---

## Dashboard

### GET /dashboard/kpis 🔒

KPIs principais do dashboard.

**Resposta 200:**
```json
{
  "consumption_kwh": 1250.5,
  "consumption_variation": -3.2,
  "estimated_cost": 875.35,
  "cost_variation": -2.8,
  "open_alerts": 4,
  "active_devices": 12
}
```

---

### GET /dashboard/consumption 🔒

Dados para gráfico de consumo por período.

**Query params:** `from` (date), `to` (date), `granularity` (hour|day|week|month)

**Resposta 200:**
```json
{
  "labels": ["2026-05-20", "2026-05-21", "2026-05-22"],
  "values": [180.5, 195.2, 172.8]
}
```

---

### GET /dashboard/top-sectors 🔒

Ranking dos setores com maior consumo.

**Query params:** `from` (date), `to` (date), `limit` (int, default 5)

**Resposta 200:**
```json
{
  "sectors": [
    { "name": "Refrigeração", "consumption_kwh": 520.3 },
    { "name": "Iluminação", "consumption_kwh": 310.1 }
  ]
}
```

---

### GET /dashboard/projection 🔒

Projeção de consumo/custo para o mês atual.

**Resposta 200:**
```json
{
  "projected_kwh": 3200.0,
  "projected_cost": 2240.0,
  "days_elapsed": 20,
  "days_remaining": 11
}
```

---

## Setores

### GET /sectors 🔒

Lista todos os setores do usuário.

**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Refrigeração",
      "description": "Câmaras frias e freezers",
      "threshold_yellow": 800,
      "threshold_red": 1200,
      "active": true,
      "devices_count": 4
    }
  ]
}
```

---

### POST /sectors 🔒

Cria um novo setor.

**Body:**
```json
{
  "name": "Refrigeração",
  "description": "Câmaras frias",
  "threshold_yellow": 800,
  "threshold_red": 1200
}
```

---

### GET /sectors/{id} 🔒

Detalhes de um setor com seus dispositivos.

---

### PUT /sectors/{id} 🔒

Atualiza um setor.

---

### DELETE /sectors/{id} 🔒

Remove um setor (soft delete).

---

## Dispositivos

### GET /devices 🔒

Lista todos os dispositivos do usuário.

**Query params:** `sector_id` (filtro opcional)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "sector_id": 1,
      "name": "Freezer Principal",
      "type": "freezer",
      "power_watts": 450,
      "status": "online",
      "active": true
    }
  ]
}
```

---

### POST /devices 🔒

Cria um novo dispositivo.

**Body:**
```json
{
  "sector_id": 1,
  "name": "Freezer Principal",
  "type": "freezer",
  "power_watts": 450
}
```

---

### GET /devices/{id} 🔒

Detalhes de um dispositivo.

---

### PUT /devices/{id} 🔒

Atualiza um dispositivo.

---

### DELETE /devices/{id} 🔒

Remove um dispositivo.

---

### GET /devices/{id}/readings 🔒

Leituras de consumo do dispositivo.

**Query params:** `from` (date), `to` (date), `limit` (int)

---

### GET /devices/{id}/anomalies 🔒

Anomalias detectadas no dispositivo.

---

## Alertas

### GET /alerts 🔒

Lista alertas com filtros.

**Query params:** `status` (open|acknowledged|resolved), `type` (overload|off_hours|night_waste|anomaly), `severity` (low|medium|high|critical), `limit`, `sort` (-created_at)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "overload",
      "severity": "high",
      "title": "Sobrecarga detectada",
      "message": "Setor Refrigeração acima do limite",
      "status": "open",
      "created_at": "2026-05-26T14:30:00Z",
      "sector": { "id": 1, "name": "Refrigeração" },
      "device": null
    }
  ]
}
```

---

### GET /alerts/{id} 🔒

Detalhes de um alerta.

---

### GET /alerts/summary 🔒

Resumo de alertas por tipo e status.

---

### GET /alerts/count 🔒

Contagem de alertas abertos.

**Query params:** `status` (default: open)

**Resposta 200:**
```json
{ "count": 4 }
```

---

### PATCH /alerts/{id}/acknowledge 🔒

Marca alerta como reconhecido.

---

### PATCH /alerts/{id}/resolve 🔒

Marca alerta como resolvido.

---

## Metas

### GET /goals 🔒

Lista metas do usuário.

**Query params:** `status` (active|completed|expired)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "scope": "global",
      "name": "Limite mensal",
      "unit": "kwh",
      "value": 5000,
      "current_value": 2340,
      "progress": 46.8,
      "period_start": "2026-05-01",
      "period_end": "2026-05-31",
      "status": "active"
    }
  ]
}
```

---

### POST /goals 🔒

Cria uma nova meta.

**Body:**
```json
{
  "name": "Limite mensal",
  "scope": "global",
  "unit": "kwh",
  "value": 5000,
  "period_start": "2026-05-01",
  "period_end": "2026-05-31"
}
```

---

### GET /goals/{id} 🔒

Detalhes de uma meta.

---

### PUT /goals/{id} 🔒

Atualiza uma meta.

---

### DELETE /goals/{id} 🔒

Remove uma meta.

---

### GET /goals/projections 🔒

Projeção de todas as metas ativas.

**Resposta 200:**
```json
[
  {
    "goal_id": 1,
    "name": "Limite mensal",
    "projected_value": 3890.25,
    "projected_progress": 77.8,
    "projection_status": "on_track"
  }
]
```

---

### GET /goals/{id}/projection 🔒

Projeção de uma meta específica.

---

## Tarifas

### GET /tariffs 🔒

Lista tarifas cadastradas.

**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Convencional",
      "type": "conventional",
      "value_kwh": 0.70,
      "flag_color": "green",
      "active": true
    }
  ]
}
```

---

### POST /tariffs 🔒

Cria uma nova tarifa.

---

### PUT /tariffs/{id} 🔒

Atualiza uma tarifa.

---

### DELETE /tariffs/{id} 🔒

Remove uma tarifa.

---

## Horário Comercial

### GET /business-hours 🔒

Retorna configuração de horário comercial.

---

### PUT /business-hours 🔒

Atualiza horário comercial (usado para detecção off-hours).

**Body:**
```json
{
  "days": [1, 2, 3, 4, 5],
  "start_time": "08:00",
  "end_time": "18:00"
}
```

---

## Financeiro

### GET /financial/summary 🔒

Resumo financeiro do período.

**Query params:** `from` (date), `to` (date)

**Resposta 200:**
```json
{
  "total_cost": 2450.80,
  "total_kwh": 3500.5,
  "avg_cost_per_kwh": 0.70,
  "variation": -5.2
}
```

---

### GET /financial/daily 🔒

Custo diário no período.

**Query params:** `from` (date), `to` (date)

---

### GET /financial/ranking 🔒

Ranking de setores por custo.

---

## Consumo

### GET /consumption 🔒

Leituras de consumo com filtros.

**Query params:** `from`, `to`, `sector_id`, `device_id`, `granularity`

---

### GET /consumption/summary 🔒

Resumo de consumo no período.

---

### GET /consumption/by-sector 🔒

Consumo agrupado por setor.

---

### GET /consumption/hourly 🔒

Consumo hora a hora (últimas 24h).

---

## Firebase Sync

### POST /firebase/sync 🔒

Dispara sincronização manual do Firebase.

---

### GET /firebase/preview 🔒

Preview dos dados atuais no Firebase (sem persistir).

---

## Notas

- 🔒 = Requer header `Authorization: Bearer {token}`
- Todas as respostas de erro seguem o formato: `{ "message": "...", "errors": {} }`
- Paginação: endpoints de listagem aceitam `page` e `per_page`
- Datas no formato ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ssZ`)
