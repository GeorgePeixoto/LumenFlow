/**
 * LumenFlow — Bootstrap Alpine.js
 *
 * Registra todos os stores e componentes globais antes do router iniciar.
 * Deve ser chamado no evento 'alpine:init' para garantir timing correto.
 */
import { registerToastStore } from './components/toast-alpine.js';
import { registerSessionStore } from './stores/session.js';
import { registerAlertsStore } from './stores/alerts.js';
import { registerRealtimeStore } from './stores/realtime.js';

export function bootstrapAlpine(Alpine) {
  registerToastStore(Alpine);
  registerSessionStore(Alpine);
  registerAlertsStore(Alpine);
  registerRealtimeStore(Alpine);
}
