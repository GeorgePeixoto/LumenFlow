import { httpClient } from './httpClient.js';

export const dashboardService = {
  async getKpis() {
    // Usar o endpoint público do dashboard
    const response = await httpClient.get('/api/dashboard/public');
    if (response.success && response.data) {
      const data = response.data;
      return {
        month_kwh: data.total_energia_kwh || 0,
        monthly_cost: (data.total_energia_kwh || 0) * 0.85, // Estimativa de custo
        active_devices: data.active_devices || 0,
        open_alerts: 0, // Não temos alertas implementados ainda
        consumption_variation: 0,
        cost_variation: 0
      };
    }
    throw new Error('Failed to load dashboard data');
  },

  async getConsumptionChart({ from, to, granularity } = {}) {
    return httpClient.get('/api/dashboard/consumption', {
      query: { from, to, granularity },
    });
  },

  async getTopSectors({ from, to, limit = 5 } = {}) {
    // Usar dados do Firebase para setores
    const response = await httpClient.get('/api/dashboard/public');
    if (response.success && response.data) {
      const sectors = Object.entries(response.data.setor_data || {}).map(([name, data]) => ({
        name,
        consumo: data.total_energia_kwh || 0,
        potencia: data.total_potencia || 0
      }));

      // Ordenar por consumo e limitar
      return sectors
        .sort((a, b) => b.consumo - a.consumo)
        .slice(0, limit);
    }
    return [];
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
