import { httpClient } from './httpClient.js';

function normalizeSectorPayload(values = {}) {
  const payload = {
    name: values.name?.trim(),
    description: values.description?.trim() || null,
  };

  if (values.threshold_yellow !== '' && values.threshold_yellow != null) {
    payload.threshold_yellow = Number(values.threshold_yellow);
  }

  if (values.threshold_red !== '' && values.threshold_red != null) {
    payload.threshold_red = Number(values.threshold_red);
  }

  return payload;
}

export const sectorService = {
  async list({ active = null, search = '' } = {}) {
    return httpClient.get('/api/sectors', {
      query: { active, search: search?.trim() },
    });
  },

  async create(values) {
    const payload = normalizeSectorPayload(values);
    const response = await httpClient.post('/api/sectors', payload);
    const sector = response?.sector;

    if (sector?.id && (payload.threshold_yellow != null || payload.threshold_red != null)) {
      return this.update(sector.id, payload);
    }

    return response;
  },

  async update(id, values) {
    return httpClient.put(`/api/sectors/${encodeURIComponent(id)}`, normalizeSectorPayload(values));
  },

  async deactivate(id) {
    return httpClient.delete(`/api/sectors/${encodeURIComponent(id)}`);
  },
};
