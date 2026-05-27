#!/usr/bin/env node

/**
 * Monitor de Dados IoT em Tempo Real
 *
 * Script para monitorar os dados do Firebase e verificar se estão chegando
 * em tempo real através da API Laravel.
 */

const API_BASE_URL = 'http://localhost:8000/api';
const FIREBASE_URL = 'https://projeto-pi-bf5a6-default-rtdb.firebaseio.com/sensores.json';
const API_KEY = 'BOPPF4U94KPksHZnFTDe2eB-FgokY5h7m0l7B7EyCwGCZNhUNdf2Rs_VKXNXzJPqwnffRgcBZCi4S0KEj8W-Jyk';

let checkCount = 0;
let lastData = {};

// Função para verificar dados via API
async function checkViaAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/public`);
        const result = await response.json();

        if (result.success) {
            const now = new Date().toLocaleTimeString();
            const data = result.data;

            // Verificar mudanças nos dados
            const changes = [];

            // Verificar dispositivos
            Object.keys(data.latest_readings || {}).forEach(device => {
                const reading = data.latest_readings[device];
                if (!lastData[device] ||
                    lastData[device].timestamp !== reading.timestamp ||
                    lastData[device].potencia !== reading.potencia) {
                    changes.push({
                        device,
                        field: reading.nome,
                        oldPower: lastData[device]?.potencia,
                        newPower: reading.potencia,
                        timestamp: reading.timestamp
                    });
                }
            });

            // Se houver mudanças, mostrar
            if (changes.length > 0) {
                console.log(`\n[${now}] MUDANÇAS DETECTADAS:`);
                changes.forEach(change => {
                    console.log(`  📡 ${change.field} (${change.device}):`);
                    console.log(`     Potência: ${change.oldPower?.toFixed(2) ?? 'N/A'} W → ${change.newPower.toFixed(2)} W`);
                    console.log(`     Timestamp: ${new Date(change.timestamp * 1000).toLocaleTimeString()}`);
                });
            }

            // Atualizar último dado
            Object.keys(data.latest_readings || {}).forEach(device => {
                lastData[device] = data.latest_readings[device];
            });

            // Status geral
            checkCount++;
            console.log(`[${now}] Check #${checkCount} - Dispositivos: ${data.total_devices} | Ativos: ${data.active_devices}`);

        } else {
            console.error(`[${new Date().toLocaleTimeString()}] Erro na API:`, result.error);
        }
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Erro ao conectar com a API:`, error.message);
    }
}

// Função para verificar dados direto do Firebase
async function checkFirebaseDirect() {
    try {
        const url = `${FIREBASE_URL}?auth=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && typeof data === 'object') {
            console.log(`\n[DIRETO DO FIREBASE] Dispositivos encontrados: ${Object.keys(data).length}`);
            Object.keys(data).forEach(device => {
                const sensor = data[device];
                console.log(`  - ${device}: ${sensor.nome || 'Sem nome'} (${sensor.potencia?.toFixed(2) || 0} W)`);
            });
        }
    } catch (error) {
        console.error('Erro ao acessar Firebase diretamente:', error.message);
    }
}

// Iniciar monitoramento
console.log('🚀 Iniciando monitoramento de dados IoT...');
console.log(`📡 API URL: ${API_BASE_URL}`);
console.log(`🔥 Firebase URL: ${FIREBASE_URL}`);
console.log('\nPressione Ctrl+C para parar\n');

// Verificar a cada 5 segundos
setInterval(checkViaAPI, 5000);

// Verificar Firebase a cada 30 segundos
setInterval(checkFirebaseDirect, 30000);

// Primeira verificação
checkViaAPI();
checkFirebaseDirect();