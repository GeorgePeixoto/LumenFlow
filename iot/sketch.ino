#include <WiFi.h>
#include <HTTPClient.h>

// Configurações do Wi-Fi (Wokwi simula essa rede aberta automaticamente)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Configurações de Negócio (Obrigatório para multi-tenancy e mapeamento)
// Estes valores devem bater com os cadastrados no Firestore!
const char* COMPANY_ID = "COMP_001";
const char* DEVICE_ID = "DEV_001";

// Firebase URL (Altere para o seu banco)
// Exemplo: https://seu-projeto-default-rtdb.firebaseio.com
const char* FIREBASE_URL = "https://varejo-inteligente-default-rtdb.firebaseio.com";

// Pinos e Constantes Físicas
const int SENSOR_PIN = 34; // Pino analógico onde o potenciômetro está ligado
const float TENSAO_REDE = 220.0; // Tensão fixa em Volts
const int INTERVALO_ENVIO_MS = 5000; // Envia a cada 5 segundos

// Variável de estado
float energia_acumulada_kwh = 0.0;

void setup() {
  Serial.begin(115200);
  
  // 1. Conexão Wi-Fi
  Serial.print("Conectando ao Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Conectado!");
  
  // 2. Identificação do Dispositivo (Como extra, imprimimos o MAC Address)
  // O MAC Address poderia ser usado como DEVICE_ID em um cenário de auto-provisionamento.
  Serial.print("MAC Address (Pode ser usado como DEVICE_ID único): ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // 1. Leitura e Simulação (Potenciômetro -> Corrente)
    int valor_bruto = analogRead(SENSOR_PIN);
    // Mapeia 0-4095 do ADC do ESP32 para 0.0 a 20.0 Amperes (Simulando o PZEM)
    float corrente = (valor_bruto / 4095.0) * 20.0; 
    
    // 2. Cálculos de Potência e Energia
    float potencia_w = corrente * TENSAO_REDE;
    
    // Energia = Potência (kW) * Tempo (horas)
    // Se o intervalo é 5s, o tempo em horas é 5 / 3600
    float energia_step_kwh = (potencia_w / 1000.0) * (INTERVALO_ENVIO_MS / 3600000.0);
    energia_acumulada_kwh += energia_step_kwh;

    // 3. Montar o Payload JSON
    String payload = "{";
    payload += "\"current_a\": " + String(corrente, 2) + ",";
    payload += "\"voltage_v\": " + String(TENSAO_REDE, 2) + ",";
    payload += "\"power_w\": " + String(potencia_w, 2) + ",";
    payload += "\"energy_kwh\": " + String(energia_acumulada_kwh, 4) + ",";
    payload += "\"updated_at\": {\".sv\": \"timestamp\"}"; // Usa o timestamp do servidor Firebase
    payload += "}";

    // 4. Enviar para o Firebase RTDB via REST (PATCH atualiza os campos sem apagar outros nós)
    HTTPClient http;
    String url = String(FIREBASE_URL) + "/telemetry/" + String(COMPANY_ID) + "/" + String(DEVICE_ID) + ".json";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.PATCH(payload);
    
    if (httpResponseCode > 0) {
      Serial.printf("Enviado [%d] | W: %.2f | A: %.2f | kWh total: %.4f\n", 
                     httpResponseCode, potencia_w, corrente, energia_acumulada_kwh);
    } else {
      Serial.printf("Erro no envio: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
  } else {
    Serial.println("Wi-Fi desconectado!");
  }

  // Aguarda o intervalo antes do próximo envio
  delay(INTERVALO_ENVIO_MS);
}
