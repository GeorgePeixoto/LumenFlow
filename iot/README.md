# Documentação da Camada IoT (Simulação Wokwi)

Conforme a task **F0-I1** e **F0-I2**, este diretório contém os arquivos para rodar a simulação física virtualizada de um equipamento monitorado pelo EnergyFlow.

### Justificativa do Sensor (PZEM-004T vs Potenciômetro)
O backlog sugeria o uso do módulo **PZEM-004T** (um medidor de grandezas elétricas AC muito comum em IoT). No entanto, a plataforma online de simulação Wokwi não possui suporte nativo para simular corrente alternada (AC) ou o chip específico do PZEM.
**Solução adotada:** Utilizei um simples **Potenciômetro** conectado a uma porta analógica (ADC) do ESP32. O código C++ no `sketch.ino` lê a posição analógica do potenciômetro (0 a 4095) e mapeia matematicamente para uma faixa de Amperes (0A a 20A). Assumindo a tensão fixa de 220V, o próprio ESP32 calcula a Potência e o Acúmulo de Energia (kWh) antes de enviar. Isso garante que a API receba exatamente o mesmo *schema* de dados que um PZEM real enviaria, abstraindo a limitação da simulação.

### Identificação do Dispositivo (`device_id`)
Como padrão para o projeto, o `device_id` é hardcoded no topo do arquivo (ex: `DEV_001`). No entanto, o código já imprime via Serial o **Endereço MAC** da placa (`WiFi.macAddress()`). Em um ambiente de produção real, usar o MAC Address como identificador único é a prática padrão do mercado, permitindo auto-provisionamento (plug-and-play). O envio dos dados é vinculado diretamente a um `COMPANY_ID`, garantindo a arquitetura multi-tenant planejada.

### Frequência de Envio
O intervalo padrão foi definido para **5.000 ms (5 segundos)**. Esse valor é um excelente meio-termo: é rápido o suficiente para que os painéis (transparência e alertas de anomalia) reajam quase instantaneamente a picos no equipamento, mas como estamos escrevendo diretamente no Firebase Realtime Database, os custos de rede/servidor se mantêm mínimos.

### Como rodar e validar (End-to-End)
1. Acesse [wokwi.com](https://wokwi.com) e inicie um projeto ESP32.
2. Copie o conteúdo de `diagram.json` para a aba do diagrama.
3. Copie o conteúdo de `sketch.ino` para a aba de código.
4. Ajuste a variável `FIREBASE_URL` no código para a URL do seu banco, se necessário.
5. Inicie a simulação. Mova o potenciômetro e abra o console (F12) no frontend ou bata no endpoint `/api/telemetry` do nosso PHP para verificar os dados chegando!
