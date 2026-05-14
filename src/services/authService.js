/**
 * EnergyFlow - Auth service
 *
 * Fachada inicial para endpoints de autenticacao. As telas de auth vao evoluir
 * estes metodos nas tasks F1, mantendo componentes sem chamadas fetch diretas.
 */

import { httpClient } from './httpClient.js';

export const authService = {
  async login({ email, password, rememberMe = false } = {}) {
    const response = await httpClient.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });

    if (response?.token) {
      httpClient.setAuthToken(response.token, { remember: rememberMe });
    }

    return response;
  },

  async register(payload) {
    return httpClient.post('/auth/register', payload);
  },

  async forgotPassword({ email } = {}) {
    return httpClient.post('/auth/forgot-password', { email });
  },

  async resetPassword({ token, password } = {}) {
    return httpClient.post('/auth/reset-password', { token, password });
  },

  async logout() {
    try {
      return await httpClient.post('/auth/logout', {});
    } finally {
      httpClient.clearAuthToken();
    }
  },

  getToken() {
    return httpClient.getAuthToken();
  },

  clearSession() {
    httpClient.clearAuthToken();
  },
};
