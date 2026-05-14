/**
 * LumenFlow — Event bus pub/sub para comunicação entre módulos desacoplados.
 *
 * Usado para eventos globais como auth:expired, toast:show, alert:new.
 * Evita imports circulares e acoplamento direto entre módulos.
 *
 * Uso:
 *   import EventBus from './eventBus.js';
 *
 *   // Assinar um evento
 *   const unsubscribe = EventBus.on('auth:expired', () => router.navigate('/login'));
 *
 *   // Publicar um evento
 *   EventBus.emit('toast:show', { message: 'Salvo!', type: 'success' });
 *
 *   // Cancelar assinatura (importante ao desmontar componentes/páginas)
 *   unsubscribe();
 *
 *   // Assinar apenas uma vez
 *   EventBus.once('data:ready', (payload) => renderChart(payload));
 *
 * Eventos globais utilizados no projeto:
 *   'auth:expired'   — token expirado ou 401 recebido → redirecionar ao login
 *   'toast:show'     — { message, type, duration } → exibir toast
 *   'alert:new'      — novo alerta crítico recebido do backend
 *   'period:change'  — { from, to, granularity } → sincronizar gráficos
 */

const EventBus = (() => {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  /**
   * Assina um evento.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function}  função para cancelar a assinatura
   */
  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => off(event, handler);
  }

  /**
   * Assina um evento e cancela após a primeira execução.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function}  função para cancelar antes de disparar
   */
  function once(event, handler) {
    const wrapper = (...args) => {
      off(event, wrapper);
      handler(...args);
    };
    return on(event, wrapper);
  }

  /**
   * Cancela assinatura de um handler específico.
   * @param {string} event
   * @param {Function} handler
   */
  function off(event, handler) {
    listeners.get(event)?.delete(handler);
  }

  /**
   * Publica um evento, notificando todos os assinantes.
   * @param {string} event
   * @param {*} [payload]
   */
  function emit(event, payload) {
    const handlers = listeners.get(event);
    if (!handlers || handlers.size === 0) return;
    handlers.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[EventBus] Erro no handler de "${event}":`, err);
      }
    });
  }

  /**
   * Remove todos os handlers de um evento (ou todos os eventos se omitido).
   * @param {string} [event]
   */
  function clear(event) {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  }

  return { on, once, off, emit, clear };
})();

export default EventBus;
