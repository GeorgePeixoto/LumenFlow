/**
 * LumenFlow - HTTP client
 *
 * Wrapper centralizado sobre fetch. Todos os services devem passar por aqui
 * para manter base URL, auth, parsing e erros HTTP consistentes.
 *
 * Uso:
 *   import { httpClient } from './httpClient.js';
 *   const health = await httpClient.get('/api/health');
 */

import Config from '../config.js';

const AUTH_EXPIRED_EVENT = 'auth:expired';
const JSON_CONTENT_TYPE = 'application/json';

let authToken = readStoredToken();

export class ApiError extends Error {
  constructor({
    code = 'HTTP_ERROR',
    message = 'Erro ao comunicar com a API.',
    status = 0,
    details = null,
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function normalizeEndpoint(endpoint) {
  if (!endpoint) return '';
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const base = trimTrailingSlash(Config.API_BASE_URL);
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api') && path.startsWith('/api/')) {
    path = path.slice(4);
  }

  return `${base}${path}`;
}

function appendQuery(url, query) {
  if (!query || Object.keys(query).length === 0) return url;

  const origin = globalThis.location?.origin ?? Config.API_BASE_URL;
  const target = new URL(url, origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach(item => target.searchParams.append(key, item));
      return;
    }
    target.searchParams.set(key, value);
  });

  return target.toString();
}

function safeStorage(type) {
  try {
    return globalThis.window?.[type] ?? null;
  } catch {
    return null;
  }
}

function readStoredToken() {
  const session = safeStorage('sessionStorage');
  const local = safeStorage('localStorage');

  return session?.getItem(Config.TOKEN_STORAGE_KEY)
    || local?.getItem(Config.TOKEN_STORAGE_KEY)
    || null;
}

function writeStoredToken(token, { remember = false } = {}) {
  const primary = remember ? safeStorage('localStorage') : safeStorage('sessionStorage');
  const secondary = remember ? safeStorage('sessionStorage') : safeStorage('localStorage');

  secondary?.removeItem(Config.TOKEN_STORAGE_KEY);
  secondary?.removeItem(Config.REMEMBER_STORAGE_KEY);

  if (!token) {
    primary?.removeItem(Config.TOKEN_STORAGE_KEY);
    primary?.removeItem(Config.REMEMBER_STORAGE_KEY);
    return;
  }

  primary?.setItem(Config.TOKEN_STORAGE_KEY, token);
  primary?.setItem(Config.REMEMBER_STORAGE_KEY, remember ? '1' : '0');
}

function dispatchAuthExpired(error) {
  if (!globalThis.window) return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: error }));
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    return response.text();
  }

  return response.json();
}

async function createApiError(response, fallbackPayload = null) {
  const payload = fallbackPayload ?? await parseResponse(response).catch(() => null);
  const apiError = payload?.error ?? {};

  return new ApiError({
    code: apiError.code || `HTTP_${response.status}`,
    message: apiError.message || response.statusText || 'Erro ao comunicar com a API.',
    status: response.status,
    details: payload,
  });
}

async function request(method, endpoint, {
  body = undefined,
  query = undefined,
  headers = {},
  signal = undefined,
  credentials = 'same-origin',
} = {}) {
  const url = appendQuery(normalizeEndpoint(endpoint), query);
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', JSON_CONTENT_TYPE);
  }

  if (authToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    credentials,
  }).catch((error) => {
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Nao foi possivel conectar com a API.',
      status: 0,
      details: error,
    });
  });

  const payload = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    const error = await createApiError(response, payload);

    if (response.status === 401) {
      dispatchAuthExpired(error);
    }

    throw error;
  }

  return payload;
}

export const httpClient = {
  get(endpoint, options = {}) {
    return request('GET', endpoint, options);
  },

  post(endpoint, body, options = {}) {
    return request('POST', endpoint, { ...options, body });
  },

  put(endpoint, body, options = {}) {
    return request('PUT', endpoint, { ...options, body });
  },

  patch(endpoint, body, options = {}) {
    return request('PATCH', endpoint, { ...options, body });
  },

  delete(endpoint, options = {}) {
    return request('DELETE', endpoint, options);
  },

  setAuthToken(token, { remember = false, persist = true } = {}) {
    authToken = token || null;
    if (persist) writeStoredToken(authToken, { remember });
  },

  getAuthToken() {
    return authToken;
  },

  clearAuthToken() {
    authToken = null;
    writeStoredToken(null);
  },

  isApiError(error) {
    return error instanceof ApiError || (isPlainObject(error) && 'code' in error && 'status' in error);
  },
};

export { AUTH_EXPIRED_EVENT };
