/**
 * LumenFlow — Guard de rotas (US02-F3).
 *
 * Fornece dois wrappers de rota:
 *
 *   requireAuth(handler)  — página privada: valida sessão, redireciona ao
 *                           login se não autenticado ou token expirado.
 *
 *   requireGuest(handler) — página pública (login, register): redireciona ao
 *                           dashboard se o usuário já estiver autenticado.
 *
 * Estratégia de validação:
 *   1. Verificação local rápida: sessionService.isAuthenticated() — sem rede.
 *      Se não há token → redireciona imediatamente.
 *   2. Verificação remota com debounce: GET /api/users/me uma vez a cada
 *      SESSION_CHECK_INTERVAL_MS (padrão 60 s). Evita chamada em toda
 *      navegação SPA mantendo a garantia de sessão válida no servidor.
 *      Um 401 dispara o evento auth:expired → o handler global em app.js
 *      chama sessionService.destroy() e redireciona ao login com Toast.
 *   3. Atualização do cache: resposta de /me atualiza sessionService.setUser()
 *      para manter dados frescos (nome da empresa, etc.).
 *
 * Uso no app.js:
 *   import { requireAuth, requireGuest } from './utils/authGuard.js';
 *   Router.register('/dashboard', requireAuth(() => renderDashboard(app)));
 *   Router.register('/login',     requireGuest(() => renderLoginPage(app)));
 */
import { sessionService } from '../services/sessionService.js';
import { httpClient }     from '../services/httpClient.js';
import { AppShell }       from '../components/AppShell.js';
import Router             from './router.js';

/** Intervalo mínimo entre validações remotas (ms). */
const SESSION_CHECK_INTERVAL_MS = 60_000;

/** Timestamp da última validação remota bem-sucedida. */
let _lastRemoteCheck = 0;

/** Promise da validação em andamento (evita chamadas paralelas). */
let _pendingCheck = null;

/**
 * Valida a sessão no servidor (GET /api/users/me).
 * Usa cache de 60 s para não chamar a cada navegação.
 * Atualiza sessionService.setUser() com dados frescos.
 * @returns {Promise<boolean>}  true se sessão válida
 */
async function validateRemote() {
  // Cache ainda válido
  if (Date.now() - _lastRemoteCheck < SESSION_CHECK_INTERVAL_MS) return true;

  // Evita chamadas paralelas (ex: múltiplos links clicados rapidamente)
  if (_pendingCheck) return _pendingCheck;

  _pendingCheck = httpClient.get('/users/me')
    .then((user) => {
      _lastRemoteCheck = Date.now();
      if (user) sessionService.setUser(user);
      return true;
    })
    .catch(() => {
      // 401 já foi tratado pelo httpClient (dispara auth:expired)
      // Outros erros (rede, 5xx): mantém sessão localmente para não
      // deslogar o usuário por instabilidade de rede.
      _lastRemoteCheck = Date.now();
      return true;
    })
    .finally(() => { _pendingCheck = null; });

  return _pendingCheck;
}

/** Invalida o cache de validação remota (ex: após logout). */
export function invalidateSessionCache() {
  _lastRemoteCheck = 0;
  _pendingCheck = null;
}

/**
 * Wrapper para rotas privadas.
 * Se não autenticado → navega para /login imediatamente.
 * Se autenticado → valida remotamente (com cache) e renderiza a página.
 *
 * @param {Function} handler  - handler original da rota (params) => void
 * @returns {Function}
 */
export function requireAuth(handler) {
  return async (params) => {
    // 1. Verificação local rápida (sem rede)
    if (!sessionService.isAuthenticated()) {
      Router.navigate('/login');
      return;
    }

    // 2. Monta AppShell (se não montado) e obtém a content area
    const container = document.getElementById('app');
    const content = AppShell.mount(container);

    // 3. Atualiza item ativo na sidebar
    const path = window.location.hash.slice(1).split('?')[0] || '/';
    AppShell.setActivePath(path);

    // 4. Renderiza a página no content area imediatamente
    handler(content, params);

    // 5. Valida sessão no servidor em background
    validateRemote().then((valid) => {
      if (valid) {
        const user = sessionService.getUser();
        if (user) AppShell.updateUser(user);
      }
    });
  };
}

/**
 * Wrapper para rotas públicas (login, register, forgot-password).
 * Se já autenticado → navega para /dashboard.
 *
 * @param {Function} handler
 * @returns {Function}
 */
export function requireGuest(handler) {
  return (params) => {
    if (sessionService.isAuthenticated()) {
      Router.navigate('/sectors/select');
      return;
    }
    // Desmonta AppShell ao ir para rota pública
    if (AppShell.isMounted()) AppShell.unmount();
    handler(params);
  };
}
