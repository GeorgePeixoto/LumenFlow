import { httpClient } from './httpClient.js';

export const dashboardService = {
  async getKpis() {
    return httpClient.get('/api/dashboard/kpis');
  },

  async getConsumptionChart({ from, to, granularity } = {}) {
    return httpClient.get('/api/dashboard/consumption', {
      query: { from, to, granularity },
    });
  },

  async getTopSectors({ from, to, limit = 5 } = {}) {
    return httpClient.get('/api/dashboard/top-sectors', {
      query: { from, to, limit },
    });
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
