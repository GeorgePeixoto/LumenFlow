/**
 * LumenFlow — Alert Service (US17)
 */
import { httpClient } from './httpClient.js';

export const alertService = {
  async list({ type, severity, status, sector_id, device_id, page, limit, sort } = {}) {
    return httpClient.get('/api/alerts', {
      query: { type, severity, status, sector_id, device_id, page, limit, sort },
    });
  },

  async get(id) {
    return httpClient.get(`/api/alerts/${encodeURIComponent(id)}`);
  },

  async acknowledge(id, comment) {
    return httpClient.patch(`/api/alerts/${encodeURIComponent(id)}/acknowledge`, { comment });
  },

  async resolve(id, comment) {
    return httpClient.patch(`/api/alerts/${encodeURIComponent(id)}/resolve`, { comment });
  },

  async bulkAcknowledge(ids) {
    return httpClient.patch('/api/alerts/bulk/acknowledge', { ids });
  },

  async bulkResolve(ids) {
    return httpClient.patch('/api/alerts/bulk/resolve', { ids });
  },

  async getCount({ status = 'open' } = {}) {
    return httpClient.get('/api/alerts/count', { query: { status } });
  },
};
