import { httpClient } from './httpClient.js';

export const settingsService = {
  async getBusinessHours() {
    return httpClient.get('/api/settings/business-hours');
  },

  async saveBusinessHours(payload) {
    return httpClient.put('/api/settings/business-hours', payload);
  },
};
