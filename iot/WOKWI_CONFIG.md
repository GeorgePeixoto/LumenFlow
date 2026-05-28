# LumenFlow - Documentação de Configuração Wokwi

## Visão Geral

Este documento descreve como o Wokwi simula 12 equipamentos em 4 setores, enviando dados de consumo energético em tempo real para o Firebase, que são processados pela API Laravel e exibidos no frontend.

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Wokwi Web IDE  │────▶│ Firebase RTDB    │◀────│  Frontend SPA   │
│   (simulação)   │     │  (dados IoT)     │     │  (GitHub Pages) │
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

## Configuração do Firebase

### Banco de Dados 1 - Dados IoT (Wokwi)

**URL:** `https://projeto-pi-bf5a6-default-rtdb.firebaseio.com`

**API Key:** `AIzaSyB30ywU-Vx6NdemjfNs0Dt-zUnOYpBIZrs`

**Estrutura de Dados:**
```json
{
  "equipamentos": {
    "refrig-camara-01": {
      "nome": "Camara Fria 01",
      "setor": "Refrigeracao",
      "tensao": 225,
      "corrente": 15.2,
      "potencia": 3282.95,
      "energia_kwh": 1.2975,
      "fator_pf": 0.874,
      "timestamp": 1779921139
    },
    "refrig-camara-02": {
      "nome": "Camara Fria 02",
      "setor": "Refrigeracao",
      "tensao": 221,
      "corrente": 13.1,
      "potencia": 2545.52,
      "energia_kwh": 1.1517,
      "fator_pf": 0.89,
      "timestamp": 1779921139
    }
  },
  "sensores": {
    "Setor_A": {
      "nome": "Refrigeracao",
      "potencia": 6465.19,
      "energia_kwh": 3.2268,
      "timestamp": 1779921139
    },
    "Setor_B": {
      "nome": "Iluminacao",
      "potencia": 1864.09,
      "energia_kwh": 0.9497,
      "timestamp": 1779921139
    }
  },
  "dashboard": {
    "readings": {
      "live": {
        "totalPower_W": 22684.63,
        "totalEnergy_kWh": 9.3388,
        "estimativaCusto_R": 7.9380,
        "activeDevices": 12,
        "timestamp": 1779921139
      }
    }
  }
}
```

### Banco de Dados 2 - Autenticação de Usuários

**URL:** `https://pi-login-b7130-default-rtdb.firebaseio.com`

**Configurações:**
- Firebase Auth Domain: `pi-login-b7130.firebaseapp.com`
- API Key: `BOPPF4U94KPksHZnFTDe2eB-FgokY5h7m0l7B7EyCwGCZNhUNdf2Rs_VKXNXzJPqwnffRgcBZCi4S0KEj8W-Jyk`
- Project ID: `pi-login-b7130`

## Configuração do Wokwi

### Pré-requisitos
1. Acesse [wokwi.com](https://wokwi.com)
2. Crie um novo projeto de simulação
3. Use o código fornecido abaixo

### Código Arduino Completo

```cpp
/*
 * DASHBOARD INTELIGENTE PARA VAREJO
 * 12 Equipamentos em 4 Setores + Firebase
 * Energia acumulada de forma realista (por segundo)
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <time.h>

#define WIFI_SSID     "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define FIREBASE_HOST "https://projeto-pi-bf5a6-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "AIzaSyB30ywU-Vx6NdemjfNs0Dt-zUnOYpBIZrs"

FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;

struct Device {
  const char* id;
  const char* name;
  const char* sector;
  float minCurrent;
  float maxCurrent;
  float minPF;
  float maxPF;
};

Device devices[12] = {
  {"refrig-camara-01",       "Camara Fria 01",            "Refrigeracao", 12.0, 18.0, 0.85, 0.95},
  {"refrig-camara-02",       "Camara Fria 02",            "Refrigeracao", 10.0, 16.0, 0.85, 0.95},
  {"refrig-freezer-01",      "Freezer Expositor",         "Refrigeracao",  5.0,  9.0, 0.80, 0.92},
  {"ilum-galpao-01",         "Iluminacao Galpao",         "Iluminacao",    3.0,  6.0, 0.92, 0.99},
  {"ilum-escritorio-01",     "Iluminacao Escritorio",     "Iluminacao",    1.5,  3.0, 0.92, 0.99},
  {"ilum-estacionamento-01", "Iluminacao Estacionamento", "Iluminacao",    2.0,  4.0, 0.90, 0.98},
  {"equip-empilhadeira-01",  "Empilhadeira Eletrica",     "Equipamentos", 15.0, 25.0, 0.80, 0.90},
  {"equip-esteira-01",       "Esteira Transportadora",    "Equipamentos",  8.0, 14.0, 0.82, 0.92},
  {"equip-compressor-01",    "Compressor de Ar",          "Equipamentos", 10.0, 20.0, 0.78, 0.88},
  {"escrit-ar-01",           "Central Ar-Condicionado",   "Escritorio",    8.0, 15.0, 0.85, 0.95},
  {"escrit-servidor-01",     "Servidor TI",               "Escritorio",    3.0,  5.0, 0.90, 0.98},
  {"escrit-estacoes-01",     "Estacoes de Trabalho",      "Escritorio",    2.0,  4.0, 0.92, 0.99},
};

float energyAccum[12] = {0};

void loadEnergyFromFirebase() {
  Serial.println("Carregando energia acumulada do Firebase...");
  for (int i = 0; i < 12; i++) {
    String path = "/equipamentos/" + String(devices[i].id) + "/energia_kwh";
    if (Firebase.getFloat(fbdo, path)) {
      energyAccum[i] = fbdo.floatData();
      Serial.printf("  %s: %.4f kWh\n", devices[i].id, energyAccum[i]);
    } else {
      energyAccum[i] = 0.0;
      Serial.printf("  %s: sem dado anterior, iniciando em 0\n", devices[i].id);
    }
  }
  Serial.println("Energia carregada!");
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("==========================================");
  Serial.println(" LUMENFLOW - 12 EQUIPAMENTOS / 4 SETORES");
  Serial.println("==========================================");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" WiFi conectado!");
  configTime(-3 * 3600, 0, "pool.ntp.org");
  Serial.print("Sincronizando NTP");
  while (time(nullptr) < 100000) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" NTP sincronizado!");
  
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  config.timeout.serverResponse = 10000; 

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Configuração dos buffers
  fbdo.setResponseSize(4096); 
  fbdo.setBSSLBufferSize(4096, 4096); // Ajuste que resolve o erro SSL
  
  Serial.println("Firebase conectado!");

  loadEnergyFromFirebase();
}

void loop() {
  delay(10000);

  time_t now = time(nullptr);
  Serial.println("=== LEITURA DOS 12 EQUIPAMENTOS ===");

  FirebaseJson json;
  float totalPower = 0.0;
  float totalEnergy = 0.0;
  float sectorPower[4] = {0};
  float sectorEnergy[4] = {0};
  const char* sectorNames[4] = {"Refrigeracao", "Iluminacao", "Equipamentos", "Escritorio"};

  for (int i = 0; i < 12; i++) {
    float voltage = random(218, 228);
    float current = devices[i].minCurrent + (random(0, 100) / 100.0) * (devices[i].maxCurrent - devices[i].minCurrent);
    float pf = devices[i].minPF + (random(0, 100) / 100.0) * (devices[i].maxPF - devices[i].minPF);
    float power = voltage * current * pf;

    float intervalSeconds = 10.0;
    float energyIncrement = (power * intervalSeconds) / 3600000.0;
    energyAccum[i] += energyIncrement;

    totalPower += power;
    totalEnergy += energyAccum[i];
    int sectorIdx = i / 3;
    sectorPower[sectorIdx] += power;
    sectorEnergy[sectorIdx] += energyAccum[i];

    String path = "equipamentos/" + String(devices[i].id);
    json.set(path + "/nome", devices[i].name);
    json.set(path + "/setor", devices[i].sector);
    json.set(path + "/tensao", voltage);
    json.set(path + "/corrente", current);
    json.set(path + "/potencia", power);
    json.set(path + "/energia_kwh", energyAccum[i]);
    json.set(path + "/fator_pf", pf);
    json.set(path + "/timestamp", (int)now);

    Serial.printf("  %s -> %.0f W | %.4f kWh\n", devices[i].name, power, energyAccum[i]);
  }

  for (int s = 0; s < 4; s++) {
    String pathSetor = "sensores/Setor_" + String((char)('A' + s));
    json.set(pathSetor + "/nome", sectorNames[s]);
    json.set(pathSetor + "/potencia", sectorPower[s]);
    json.set(pathSetor + "/energia_kwh", sectorEnergy[s]);
    json.set(pathSetor + "/timestamp", (int)now);
  }

  json.set("dashboard/readings/live/totalPower_W", totalPower);
  json.set("dashboard/readings/live/totalEnergy_kWh", totalEnergy);
  json.set("dashboard/readings/live/estimativaCusto_R", totalEnergy * 0.85);
  json.set("dashboard/readings/live/activeDevices", 12);
  json.set("dashboard/readings/live/timestamp", (int)now);

  Serial.printf("TOTAL: %.0f W | %.4f kWh | R$ %.2f\n", totalPower, totalEnergy, totalEnergy * 0.85);

  if (Firebase.setJSON(fbdo, "/", json)) {
    Serial.println("Dados enviados com sucesso!");
  } else {
    Serial.printf("Erro: %s\n", fbdo.errorReason().c_str());
  }
  Serial.println("==========================================");
}
```

### Componentes Necessários no Wokwi

1. **ESP32 Dev Module** - Microcontrolador principal
2. **Configuração do Wi-Fi:**
   - SSID: `Wokwi-GUEST`
   - Senha: (vazio)

### Funcionamento do Sistema

1. **Inicialização:**
   - Conecta ao Wi-Fi Wokwi-GUEST
   - Sincroniza hora via NTP
   - Carrega energia acumulada do Firebase

2. **Loop Principal (a cada 10 segundos):**
   - Gera valores realistas para cada equipamento
   - Calcula potência (V × I × PF)
   - Acumula energia (kWh)
   - Envia dados para o Firebase em 3 níveis:
     - Detalhado por equipamento (`/equipamentos/`)
     - Agregado por setor (`/sensores/`)
     - Resumo geral (`/dashboard/`)

3. **Dados Simulados:**
   - Tensão: 218-228V (variação realista)
   - Corrente: Dentro de faixas específicas por equipamento
   - Fator de Potência: Entre 0.78-0.99 (dependendo do tipo)
   - Energia: Acumulada continuamente

## API Laravel - Endpoints Disponíveis

### Públicos (sem autenticação)

- `GET /api/dashboard/public` - Retorna dados agregados do dashboard
- `GET /api/sensors/{device}/readings` - Lê dados de um dispositivo específico
- `GET /api/sensors/{device}/latest` - Última leitura de um dispositivo
- `GET /api/sensors/devices` - Lista todos os dispositivos
- `GET /api/wokwi/devices` - Dispositivos ativos
- `GET /api/wokwi/devices/{device}/status` - Status de um dispositivo

### Estrutura da Resposta do Dashboard

```json
{
  "success": true,
  "data": {
    "total_devices": 4,
    "active_devices": 4,
    "total_readings": 4,
    "latest_readings": {
      "Setor_A": {
        "nome": "Refrigeracao",
        "potencia": 6465.19,
        "energia_kwh": 3.2268,
        "timestamp": 1779921267
      }
    },
    "devices_status": {
      "Setor_A": {
        "active": true,
        "last_reading": 1779921267,
        "readings_count": 1
      }
    },
    "setor_data": {
      "Refrigeracao": {
        "total_potencia": 6465.19,
        "total_energia_kwh": 3.2268,
        "devices": ["Setor_A"]
      }
    }
  }
}
```

## Frontend - Consumo dos Dados

O frontend consome os dados através do `dashboardService` atualizado:

```javascript
// Exemplo de processamento de dados
async loadKpis() {
  try {
    const response = await dashboardService.getKpis();
    if (response.success && response.data) {
      const data = response.data;
      // Calcula totais e atualiza UI
      this.totalPower = data.total_potencia || 0;
      this.totalEnergy = data.total_energia_kwh || 0;
      this.activeDevices = data.active_devices || 0;
    }
  } catch (error) {
    console.error('Erro ao carregar KPIs:', error);
  }
}
```

## Monitoramento

Para monitorar os dados em tempo real, use o script `monitor-iot.js`:

```bash
node monitor-iot.js
```

Este script verifica:
- Dados via API Laravel (a cada 5 segundos)
- Dados direto do Firebase (a cada 30 segundos)
- Detecta mudanças nos valores de potência
- Mostra status geral do sistema

## Troubleshooting

### Problemas Comuns

1. **Erro SSL no Firebase:**
   - O código já inclui `fbdo.setBSSLBufferSize(4096, 4096)` que resolve o problema
   - Verifique se a URL do Firebase está correta

2. **Dados não aparecem no dashboard:**
   - Verifique se o Firebase está recebendo os dados (no console do Firebase)
   - Confira se a API Laravel está acessando o caminho correto (`/sensores/`)

3. **Equipamentos não são simulados:**
   - O Wokwi precisa de internet para funcionar
   - Verifique se o status do ESP32 mostra "connected"

### Valores Esperados

- **Atualização:** A cada 10 segundos
- **Total de Equipamentos:** 12
- **Setores:** 4 (Refrigeracao, Iluminacao, Equipamentos, Escritorio)
- **Custo Estimado:** R$ 0,85 por kWh
- **Tensão:** ~225V (variação de 218-228V)

## Próximos Passos

1. Implementar autenticação para endpoints sensíveis
2. Adicionar cache para melhor performance
3. Implementar WebSocket para atualizações em tempo real
4. Adicionar gráficos históricos
5. Implementar notificações de alerta
6. Criar interface administrativa para gerenciar equipamentos

---

*Última atualização: 27/05/2026*