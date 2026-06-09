import { httpClient } from './httpClient.js';

/**
 * Busca dados públicos do Firebase e retorna de forma normalizada.
 * Cache simples para evitar múltiplas chamadas no mesmo tick.
 */
let _publicCache = null;
let _publicCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

async function fetchPublicData() {
  const now = Date.now();
  if (_publicCache && (now - _publicCacheTime) < CACHE_TTL) {
    return _publicCache;
  }
  const response = await httpClient.get('/api/dashboard/public');
  if (response.success && response.data) {
    _publicCache = response.data;
    _publicCacheTime = now;
    return response.data;
  }
  throw new Error('Failed to load dashboard data');
}

export const dashboardService = {
  async getPublicData() {
    return fetchPublicData();
  },

  async getAuthenticatedDashboardData() {
    const response = await httpClient.get('/api/dashboard');
    return response?.data || response;
  },

  async getKpis() {
    const data = await fetchPublicData();

    // Somar energia_kwh de todas as leituras (latest_readings)
    let totalEnergiaKwh = 0;
    let totalPotencia = 0;
    const readings = data.latest_readings || {};

    for (const deviceId in readings) {
      totalEnergiaKwh += readings[deviceId].energia_kwh || 0;
      totalPotencia += readings[deviceId].potencia || 0;
    }

    // Custo = energia × tarifa R$ 0,85/kWh
    const tarifa = 0.85;
    const totalCost = totalEnergiaKwh * tarifa;

    return {
      month_kwh: totalEnergiaKwh,
      monthly_cost: totalCost,
      active_devices: data.active_devices || 0,
      total_devices: data.total_devices || 0,
      open_alerts: 0,
      consumption_variation: 0,
      cost_variation: 0,
      total_potencia: totalPotencia,
    };
  },

  async getConsumptionChart({ from, to, granularity } = {}) {
    return httpClient.get('/api/dashboard/consumption', {
      query: { from, to, granularity },
    });
  },

  async getTopSectors({ from, to, limit = 5 } = {}) {
    const data = await fetchPublicData();
    const setorData = data.setor_data || {};

    const sectors = Object.entries(setorData).map(([name, sData]) => ({
      name,
      total_kwh: sData.total_energia_kwh || 0,
      consumo: sData.total_energia_kwh || 0,
      potencia: sData.total_potencia || 0,
    }));

    return {
      sectors: sectors
        .sort((a, b) => b.total_kwh - a.total_kwh)
        .slice(0, limit),
    };
  },

  /**
   * Retorna a lista de dispositivos do Firebase (latest_readings)
   * transformada em array de objetos para a tela de Dispositivos.
   */
  async getFirebaseDevices() {
    const data = await fetchPublicData();
    const readings = data.latest_readings || {};
    const devicesStatus = data.devices_status || {};

    return Object.entries(readings).map(([deviceId, reading]) => ({
      id: deviceId,
      firebase_id: deviceId,
      name: reading.nome || deviceId,
      potencia: reading.potencia || 0,
      energia_kwh: reading.energia_kwh || 0,
      timestamp: reading.timestamp || null,
      status: devicesStatus[deviceId]?.active ? 'online' : 'offline',
      sector: deviceId, // ex: "Setor_A"
    }));
  },

  /**
   * Retorna os setores do Firebase para a tela de seleção de setor.
   * Cada setor tem: id, nome, potência, energia_kwh.
   */
  async getFirebaseSectors() {
    const data = await fetchPublicData();
    const readings = data.latest_readings || {};

    return Object.entries(readings).map(([deviceId, reading]) => ({
      id: deviceId,
      name: reading.nome || deviceId,
      potencia: reading.potencia || 0,
      energia_kwh: reading.energia_kwh || 0,
      timestamp: reading.timestamp || null,
    }));
  },

  async getRecentAlerts({ limit = 5 } = {}) {
    return httpClient.get('/api/alerts', {
      query: { status: 'open', limit, sort: '-created_at' },
    });
  },

  async getOffHoursAlerts({ from, to, limit = 5 } = {}) {
    return httpClient.get('/api/alerts', {
      query: { type: 'off_hours', from, to, limit, sort: '-created_at' },
    });
  },

  async getNightWasteAlerts({ from, to, limit = 5 } = {}) {
    return httpClient.get('/api/alerts', {
      query: { type: 'night_waste', from, to, limit, sort: '-created_at' },
    });
  },

  async getOpenAlertsCount() {
    return httpClient.get('/api/alerts/count', {
      query: { status: 'open' },
    });
  },
};
