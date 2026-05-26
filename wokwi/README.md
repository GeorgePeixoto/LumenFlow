# Wokwi — Simulação ESP32

Firmware do ESP32 que simula sensores de energia e envia dados para o Firebase Realtime Database.

## Simulação

Acesse o projeto no Wokwi: [LumenFlow ESP32 Simulation](https://wokwi.com/)

## Estrutura

```
wokwi/
├── diagram.json        ← Configuração do circuito Wokwi
├── sketch.ino          ← Firmware Arduino (ESP32)
└── README.md
```

## Dados enviados ao Firebase

O ESP32 envia leituras a cada 5 segundos para `sensores/{setor}`:

```json
{
  "nome": "Setor A",
  "potencia": 1250.5,
  "energia_kwh": 3.42,
  "corrente": 5.68,
  "tensao": 220.1,
  "fator_pf": 0.92
}
```

E um resumo em `dashboard/readings/live`:

```json
{
  "totalPower_W": 3500.2,
  "totalEnergy_kWh": 12.8,
  "estimativaCusto_R": 8.41,
  "timestamp": 1716710400000
}
```

## Como usar

1. Abra o projeto no [Wokwi Simulator](https://wokwi.com/)
2. Configure o WiFi e a URL do Firebase no `sketch.ino`
3. Inicie a simulação — os dados aparecerão no Firebase RTDB em tempo real
