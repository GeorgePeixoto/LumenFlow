# EnergyFlow - Modelo de Dados (Firebase)

## Arquitetura Definida: Híbrida (Firestore + Realtime Database)

### Justificativa da Decisão (Task F0-B3)
Para atender aos requisitos de alta frequência de escrita (sensores IoT a cada 5s) e buscas complexas (relatórios ESG e multi-tenancy), adotamos uma **arquitetura híbrida**:

1. **Firestore (Dados de Negócio):** Usado para dados relacionais (`companies`, `users`, `sectors`, `devices`, `goals`, `alerts`).
   - *Por quê?* O Firestore permite queries complexas (ex: buscar todos os dispositivos ativos da empresa X no setor Y), paginação e indexação composta. Como a precificação é por *documento lido/escrito* e essas informações mudam pouco, o custo se mantém baixo.
2. **Realtime Database - RTDB (Telemetria):** Usado exclusivamente para a **transmissão em tempo real** das leituras dos sensores.
   - *Por quê?* O RTDB cobra por *banda e armazenamento* ao invés de operações individuais. Um sensor IoT que escreve a cada 5 segundos geraria ~500.000 escritas mensais no Firestore (um custo gigantesco em escala). No RTDB, apenas sobrescrevemos o nó do dispositivo, garantindo latência minúscula para o frontend (Painel de Transparência) com custo quase zero.

---

## 1. Firestore (Coleções Principais)

### `companies` (Empresas - Multi-tenancy)
```json
{
  "company_id": "uuid",
  "name": "Atacadão Exemplo",
  "cnpj": "00.000.000/0001-00",
  "segment": "Varejo/Atacado",
  "created_at": "timestamp"
}
```

### `users` (Usuários / Representantes)
```json
{
  "user_id": "uuid",
  "company_id": "uuid (ref)",
  "name": "João Gestor",
  "email": "joao@exemplo.com",
  "password_hash": "argon2_hash",
  "role": "admin",
  "terms_accepted_at": "timestamp",
  "created_at": "timestamp"
}
```

### `sectors` (Setores / Áreas)
```json
{
  "sector_id": "uuid",
  "company_id": "uuid (ref)",
  "name": "Câmara Fria",
  "status": "active",
  "threshold_yellow": 500, // Gatilho de alerta (kW)
  "threshold_red": 800,
  "created_at": "timestamp"
}
```

### `devices` (Equipamentos / Sensores IoT)
```json
{
  "device_id": "uuid", // Deve ser o ID configurado no firmware do Wokwi
  "company_id": "uuid (ref)",
  "sector_id": "uuid (ref)",
  "name": "Compressor 01",
  "type": "compressor",
  "status": "active", // active | inactive
  "installed_at": "timestamp"
}
```

### `goals` (Metas Financeiras/Sustentabilidade)
```json
{
  "goal_id": "uuid",
  "company_id": "uuid (ref)",
  "sector_id": "uuid (opcional)",
  "period": "2026-05",
  "target_kwh": 10000,
  "target_brl": 5000,
  "created_at": "timestamp"
}
```

### `alerts` (Alertas e Anomalias)
```json
{
  "alert_id": "uuid",
  "company_id": "uuid (ref)",
  "device_id": "uuid (ref)",
  "type": "off_hours | overload | anomaly",
  "severity": "high | medium | low",
  "message": "Consumo atípico detectado na madrugada.",
  "status": "open | acknowledged | resolved",
  "created_at": "timestamp"
}
```

---

## 2. Realtime Database (Árvore de Telemetria)

O ESP32 (Wokwi) conectará diretamente à API REST do Firebase RTDB para enviar o estado instantâneo, e o backend PHP também registrará agregações históricas.

### `/telemetry/{company_id}/{device_id}`
Ponto de atualização constante para o Dashboard ao vivo.
```json
{
  "telemetry": {
    "COMPANY_ID_123": {
      "DEVICE_ID_456": {
        "current_a": 10.5,
        "voltage_v": 220,
        "power_w": 2310,
        "energy_kwh": 450.2, // Energia acumulada reportada pelo sensor
        "updated_at": 1716500000000
      }
    }
  }
}
```
