/**
 * LumenFlow — Mock Installer (Demo Mode).
 *
 * Substitui os métodos do httpClient por versões que retornam dados mock.
 * Chamado no app.js quando Config.DEMO_MODE === true.
 *
 * Uso:
 *   import { installMocks } from './mocks/install.js';
 *   if (Config.DEMO_MODE) installMocks();
 */

import { httpClient } from '../services/httpClient.js';
import { handleMockRequest } from './mockHandler.js';

const MOCK_DELAY_MIN = 150;
const MOCK_DELAY_MAX = 400;

function randomDelay() {
  return Math.floor(Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN)) + MOCK_DELAY_MIN;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function installMocks() {
  console.log('%c[LumenFlow] Modo Demo ativo — dados fictícios', 'color: #14b8a6; font-weight: bold;');

  // Salva métodos originais (caso precise restaurar)
  const _originalGet = httpClient.get.bind(httpClient);
  const _originalPost = httpClient.post.bind(httpClient);
  const _originalPut = httpClient.put.bind(httpClient);
  const _originalPatch = httpClient.patch.bind(httpClient);
  const _originalDelete = httpClient.delete.bind(httpClient);

  httpClient.get = async (endpoint, options = {}) => {
    const url = buildUrl(endpoint, options.query);
    await delay(randomDelay());
    return handleMockRequest('GET', url);
  };

  httpClient.post = async (endpoint, body, options = {}) => {
    const url = buildUrl(endpoint, options?.query);
    await delay(randomDelay());
    return handleMockRequest('POST', url, body);
  };

  httpClient.put = async (endpoint, body, options = {}) => {
    const url = buildUrl(endpoint, options?.query);
    await delay(randomDelay());
    return handleMockRequest('PUT', url, body);
  };

  httpClient.patch = async (endpoint, body, options = {}) => {
    const url = buildUrl(endpoint, options?.query);
    await delay(randomDelay());
    return handleMockRequest('PUT', url, body);
  };

  httpClient.delete = async (endpoint, options = {}) => {
    const url = buildUrl(endpoint, options?.query);
    await delay(randomDelay());
    return handleMockRequest('DELETE', url);
  };

  // Garante que o token existe para o auth guard funcionar
  httpClient.setAuthToken('demo_token_technova_2026', { remember: true, persist: true });

  // Armazena user no sessionStorage para getUser() funcionar
  const userData = { id: 'usr_001', name: 'João Silva', email: 'joao@technova.com.br', company_name: 'TechNova Indústria' };
  try {
    localStorage.setItem('ef_user', JSON.stringify(userData));
  } catch (_) {}

  // Expõe função para desinstalar mocks (debug)
  window.__restoreMocks = () => {
    httpClient.get = _originalGet;
    httpClient.post = _originalPost;
    httpClient.put = _originalPut;
    httpClient.patch = _originalPatch;
    httpClient.delete = _originalDelete;
    console.log('[LumenFlow] Mocks desinstalados.');
  };
}

function buildUrl(endpoint, query) {
  let url = endpoint.startsWith('http') ? endpoint : `http://localhost:8000/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v);
    });
    url += '?' + params.toString();
  }
  return url;
}
