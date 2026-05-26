/**
 * LumenFlow — Firebase Realtime Database Listeners.
 *
 * Usa Server-Sent Events (SSE) do Firebase REST API para receber
 * atualizações em tempo real sem SDK pesado.
 * Fallback: polling a cada POLLING_INTERVAL_MS se SSE não disponível.
 */
import Config from '../config.js';

const BASE_URL = Config.FIREBASE_RTDB_URL;

let _listeners = new Map();

function buildSSEUrl(path) {
  return `${BASE_URL}/${path}.json`;
}

/**
 * Inicia um listener SSE para um path do Firebase RTDB.
 * Chama onChange sempre que o dado muda.
 *
 * @param {string} path - ex: 'sensores', 'dashboard/readings/live'
 * @param {Function} onChange - callback(data) chamado a cada mudança
 * @returns {Function} unsubscribe - chama para parar de escutar
 */
export function onValue(path, onChange) {
  if (_listeners.has(path)) {
    stop(path);
  }

  const url = buildSSEUrl(path);
  let eventSource;

  try {
    eventSource = new EventSource(url);

    eventSource.addEventListener('put', (event) => {
      try {
        const payload = JSON.parse(event.data);
        onChange(payload.data);
      } catch (e) {
        console.warn(`[Firebase] Erro ao parsear evento de ${path}:`, e);
      }
    });

    eventSource.addEventListener('patch', (event) => {
      try {
        const payload = JSON.parse(event.data);
        onChange(payload.data);
      } catch (e) {
        console.warn(`[Firebase] Erro ao parsear patch de ${path}:`, e);
      }
    });

    eventSource.onerror = () => {
      console.warn(`[Firebase] Conexão SSE perdida para ${path}. Reconectando...`);
    };

    _listeners.set(path, { eventSource, onChange });
  } catch (e) {
    console.warn(`[Firebase] SSE não suportado, usando polling para ${path}`);
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`${url}`);
        if (res.ok) {
          const data = await res.json();
          onChange(data);
        }
      } catch (_) {}
    }, Config.POLLING_INTERVAL_MS);

    _listeners.set(path, { intervalId, onChange });
  }

  return () => stop(path);
}

/**
 * Para de escutar um path específico.
 * @param {string} path
 */
export function stop(path) {
  const listener = _listeners.get(path);
  if (!listener) return;

  if (listener.eventSource) {
    listener.eventSource.close();
  }
  if (listener.intervalId) {
    clearInterval(listener.intervalId);
  }

  _listeners.delete(path);
}

/**
 * Para todos os listeners ativos.
 */
export function stopAll() {
  for (const path of _listeners.keys()) {
    stop(path);
  }
}

/**
 * Retorna true se há um listener ativo para o path.
 * @param {string} path
 * @returns {boolean}
 */
export function isListening(path) {
  return _listeners.has(path);
}

/**
 * Leitura única (GET) de um path do Firebase.
 * @param {string} path
 * @returns {Promise<*>}
 */
export async function get(path) {
  const res = await fetch(`${BASE_URL}/${path}.json`);
  if (!res.ok) throw new Error(`Firebase GET ${path} failed: ${res.status}`);
  return res.json();
}
