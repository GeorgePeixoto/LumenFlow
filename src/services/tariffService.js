/**
 * LumenFlow — Tariff Service (US10-F3)
 */
import { httpClient } from './httpClient.js';

export const tariffService = {
  async list() {
    return httpClient.get('/api/tariffs');
  },

  async get(id) {
    return httpClient.get(`/api/tariffs/${encodeURIComponent(id)}`);
  },

  async create(payload) {
    return httpClient.post('/api/tariffs', payload);
  },

  async update(id, payload) {
    return httpClient.put(`/api/tariffs/${encodeURIComponent(id)}`, payload);
  },

  async delete(id) {
    return httpClient.delete(`/api/tariffs/${encodeURIComponent(id)}`);
  },
};
