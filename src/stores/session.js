/**
 * LumenFlow — Alpine Store: Session (US02)
 *
 * Gerencia estado de autenticação reativamente.
 * Uso: Alpine.store('session').isAuthenticated
 */
import { authService } from '../services/authService.js';
import { sessionService } from '../services/sessionService.js';
import { Toast } from '../components/Toast.js';
import { t } from '../i18n/pt-BR.js';

export function registerSessionStore(Alpine) {
  Alpine.store('session', {
    user: null,
    token: null,

    get isAuthenticated() {
      return !!this.token;
    },

    init() {
      this.restore();
    },

    restore() {
      this.token = sessionService.getToken();
      this.user = sessionService.getUser();
    },

    async login(email, password, remember = false) {
      const response = await authService.login({ email, password, rememberMe: remember });

      if (response?.token) {
        this.token = response.token;
        this.user = response.user || null;

        if (response.user) {
          sessionService.setUser(response.user);
        }
      }

      return response;
    },

    async logout() {
      try {
        await authService.logout();
      } catch (_) {}

      this.token = null;
      this.user = null;
      sessionService.destroy();
      Toast.show({ message: t('auth.logout.success'), type: 'info' });
    },

    updateUser(user) {
      this.user = user;
      sessionService.setUser(user);
    },

    clear() {
      this.token = null;
      this.user = null;
      sessionService.destroy();
    },
  });
}
