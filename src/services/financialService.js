/**
 * EnergyFlow — Financial Service (US10)
 */
import { httpClient } from './httpClient.js';

export const financialService = {
  async getSummary({ from, to } = {}) {
    return httpClient.get('/api/financial/summary', { query: { from, to } });
  },

  async getDailyConsumption({ from, to } = {}) {
    return httpClient.get('/api/financial/daily', { query: { from, to } });
  },

  async getRanking({ by = 'sector', from, to } = {}) {
    return httpClient.get('/api/financial/ranking', { query: { by, from, to } });
  },
};
