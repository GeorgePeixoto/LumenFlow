/**
 * EnergyFlow — Ação de logout (US02-F4).
 *
 * Orquestra todas as etapas do logout em um único lugar:
 *   1. POST /api/auth/logout no backend (invalida token no servidor).
 *   2. Limpa sessão local (token + dados do usuário em cache).
 *   3. Invalida cache do authGuard (força nova validação na próxima entrada).
 *   4. Exibe Toast de confirmação.
 *   5. Navega para /login.
 *
 * O passo 1 é executado em best-effort — se falhar (rede, servidor), os
 * passos 2–5 são executados de qualquer forma. Isso garante que o usuário
 * sempre consiga sair localmente, mesmo com o backend indisponível.
 *
 * Uso (AppShell — F2-F1):
 *   import { performLogout } from '../utils/logout.js';
 *   logoutBtn.addEventListener('click', performLogout);
 */
import { authService }        from '../services/authService.js';
import { sessionService }     from '../services/sessionService.js';
import { invalidateSessionCache } from './authGuard.js';
import { Toast }              from '../components/Toast.js';
import { t }                  from '../i18n/pt-BR.js';
import Router                 from './router.js';

/** Flag para evitar logout duplo (ex: clique duplo no botão). */
let _loggingOut = false;

/**
 * Executa o logout completo: backend + local + UI.
 * @returns {Promise<void>}
 */
export async function performLogout() {
  if (_loggingOut) return;
  _loggingOut = true;

  try {
    // Best-effort: invalida token no backend
    await authService.logout();
  } catch {
    // Falha silenciosa — logout local prossegue de qualquer forma
  } finally {
    // Sempre limpa estado local
    sessionService.destroy();
    invalidateSessionCache();
    _loggingOut = false;
  }

  Toast.show({ message: t('auth.logout.success'), type: 'info' });
  Router.navigate('/login');
}
