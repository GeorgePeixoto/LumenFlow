import { httpClient } from './httpClient.js';

export const goalService = {
  async list({ status = null } = {}) {
    return httpClient.get('/api/goals', { query: { status } });
  },

  async get(id) {
    return httpClient.get(`/api/goals/${encodeURIComponent(id)}`);
  },

  async create(payload) {
    return httpClient.post('/api/goals', payload);
  },

  async update(id, payload) {
    return httpClient.put(`/api/goals/${encodeURIComponent(id)}`, payload);
  },

  async delete(id) {
    return httpClient.delete(`/api/goals/${encodeURIComponent(id)}`);
  },
};
