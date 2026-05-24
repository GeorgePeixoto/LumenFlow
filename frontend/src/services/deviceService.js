import { httpClient } from './httpClient.js';

export const DEVICE_TYPES = [
  { value: 'compressor', labelKey: 'devices.types.compressor' },
  { value: 'motor', labelKey: 'devices.types.motor' },
  { value: 'lighting', labelKey: 'devices.types.lighting' },
  { value: 'air_conditioning', labelKey: 'devices.types.air_conditioning' },
  { value: 'refrigerator', labelKey: 'devices.types.refrigerator' },
  { value: 'other', labelKey: 'devices.types.other' },
];

function normalizeDevicePayload(values = {}, { editing = false } = {}) {
  const payload = {
    name: values.name?.trim(),
    type: values.type,
    sector_id: values.sector_id,
    installed_at: values.installed_at || null,
    overload_threshold_w:
      values.overload_threshold_w === '' || values.overload_threshold_w == null
        ? null
        : Number(values.overload_threshold_w),
    is_critical: !!values.is_critical,
  };

  if (!editing) {
    payload.device_id = values.device_id?.trim();
  }

  return payload;
}

export const deviceService = {
  async list({ sector_id = '', type = '', active = null } = {}) {
    return httpClient.get('/api/devices', {
      query: { sector_id, type, active },
    });
  },

  async get(id) {
    return httpClient.get(`/api/devices/${encodeURIComponent(id)}`);
  },

  async create(values) {
    return httpClient.post('/api/devices', normalizeDevicePayload(values));
  },

  async update(id, values) {
    return httpClient.put(
      `/api/devices/${encodeURIComponent(id)}`,
      normalizeDevicePayload(values, { editing: true }),
    );
  },

  async deactivate(id) {
    return httpClient.delete(`/api/devices/${encodeURIComponent(id)}`);
  },

  async getReadings(id, { from, to, granularity } = {}) {
    return httpClient.get(`/api/devices/${encodeURIComponent(id)}/readings`, {
      query: { from, to, granularity },
    });
  },

  async getAnomalies(id, { from, to } = {}) {
    return httpClient.get(`/api/devices/${encodeURIComponent(id)}/anomalies`, {
      query: { from, to },
    });
  },

  async getMaintenance(id) {
    return httpClient.get(`/api/devices/${encodeURIComponent(id)}/maintenance`);
  },

  async addMaintenance(id, payload) {
    return httpClient.post(`/api/devices/${encodeURIComponent(id)}/maintenance`, payload);
  },
};
