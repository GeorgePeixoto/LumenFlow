# Esquema do Banco de Dados (Firebase RTDB)

Este documento define a estrutura de dados (JSON Tree) que o simulador Wokwi deve enviar para o Firebase Realtime Database. O frontend (LumenFlow) está programado para ler exatamente esses nós para renderizar o Dashboard em tempo real.

## Estrutura JSON

```json
{
  "dashboard": {
    "readings": {
      "live": {
        "estimativaCusto_R": 1450.80,
        "timestamp": 1716500000000,
        "totalEnergy_kWh": 1150.75,
        "totalPower_W": 3800
      }
    }
  },
  "sensores": {
    "setor_producao": {
      "corrente": 10.4,
      "energia_kwh": 700.25,
      "fator_pf": 0.95,
      "nome": "Produção (Motor AC)",
      "potencia": 2300,
      "tensao": 220
    },
    "setor_iluminacao": {
      "corrente": 6.8,
      "energia_kwh": 450.50,
      "fator_pf": 0.92,
      "nome": "Iluminação Principal",
      "potencia": 1500,
      "tensao": 220
    }
  }
}
```

## Dicionário de Dados

### 1. Nó `/dashboard/readings/live`
Este nó contém os totais globais que alimentam os **KPIs (Cards principais)** do dashboard. O ESP32 no Wokwi deve somar os valores de todos os setores e atualizar esse nó.

* `estimativaCusto_R` (Number): Custo financeiro estimado acumulado (em Reais).
* `timestamp` (Number): Carimbo de tempo da última leitura (em milissegundos).
* `totalEnergy_kWh` (Number): Energia total consumida globalmente.
* `totalPower_W` (Number): Potência instantânea total no momento da leitura (soma das potências).

### 2. Nó `/sensores/{id_do_setor}`
Este nó contém os dados individuais de cada setor/equipamento. Ele alimenta a **tabela de setores** e o ranking. Cada chave (ex: `setor_producao`) é um ID único.

* `nome` (String): Nome amigável do setor para ser exibido na tela.
* `corrente` (Number): Corrente elétrica instantânea lida pelo sensor (Amperes).
* `potencia` (Number): Potência instantânea calculada (`tensao * corrente * fator_pf`) em Watts.
* `energia_kwh` (Number): Energia acumulada por esse setor (kWh).
* `tensao` (Number): Tensão da rede elétrica no setor (Geralmente fixo, ex: 110 ou 220).
* `fator_pf` (Number): Fator de potência do equipamento (ex: 0.95).

---

## Regras de Segurança (Rules)
Para garantir que o Wokwi consiga escrever no banco e o Frontend consiga ler sem bloqueios de CORS ou Auth, você deve aplicar estas regras na aba **"Regras"** do Firebase Realtime Database:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
*(Nota: Para a apresentação final acadêmica, regras abertas são aceitáveis para evitar falhas ao vivo, mas em um ambiente real deveriam exigir autenticação).*
