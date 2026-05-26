/**
 * LumenFlow — Login Page (Alpine.js + Tailwind)
 *
 * Página de login reativa com validação progressiva (blur),
 * tratamento de erros da API, modo demo, e theme toggle.
 */

import { authService } from '../services/authService.js';
import { sessionService } from '../services/sessionService.js';
import Router from '../utils/router.js';
import Config from '../config.js';

export function registerLoginPage(Alpine) {
  Alpine.data('loginPage', () => ({
    email: '',
    password: '',
    rememberMe: false,
    loading: false,
    demoLoading: false,
    showPassword: false,

    errors: { email: '', password: '' },
    touched: { email: false, password: false },
    globalError: '',

    // ── Validation ──────────────────────────────────────────

    validateEmail() {
      if (!this.email.trim()) return 'Campo obrigatório';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(this.email.trim())) return 'E-mail inválido';
      return '';
    },

    validatePassword() {
      if (!this.password) return 'Campo obrigatório';
      return '';
    },

    onBlur(field) {
      this.touched[field] = true;
      this.errors[field] = field === 'email' ? this.validateEmail() : this.validatePassword();
    },

    onInput(field) {
      if (!this.touched[field]) return;
      this.errors[field] = field === 'email' ? this.validateEmail() : this.validatePassword();
    },

    runAllValidations() {
      this.touched.email = true;
      this.touched.password = true;
      this.errors.email = this.validateEmail();
      this.errors.password = this.validatePassword();
      return !this.errors.email && !this.errors.password;
    },

    get hasErrors() {
      return !!(this.errors.email || this.errors.password);
    },

    // ── Submit ──────────────────────────────────────────────

    async submit() {
      if (!this.runAllValidations()) return;

      this.loading = true;
      this.globalError = '';

      try {
        const response = await authService.login({
          email: this.email.trim().toLowerCase(),
          password: this.password,
          rememberMe: this.rememberMe,
        });

        if (response?.user) {
          sessionService.setUser(response.user);
        }

        Router.navigate('/sectors/select');
      } catch (err) {
        this.loading = false;
        this._handleError(err);
      }
    },

    // ── Demo mode ───────────────────────────────────────────

    get showDemo() {
      return Config.DEMO_MODE;
    },

    async loginDemo() {
      this.demoLoading = true;
      this.globalError = '';

      try {
        const response = await authService.login({
          email: 'joao@technova.com.br',
          password: 'demo',
          rememberMe: true,
        });

        if (response?.user) {
          sessionService.setUser(response.user);
        }

        Router.navigate('/sectors/select');
      } catch (err) {
        this.demoLoading = false;
        Alpine.store('toast')?.show('Erro ao entrar no modo demo.', 'error');
      }
    },

    // ── Error handling ──────────────────────────────────────

    _handleError(err) {
      const code = err?.code || '';

      if (code === 'INVALID_CREDENTIALS' || err?.status === 401) {
        this.globalError = 'E-mail ou senha incorretos.';
        return;
      }

      if (code === 'TOO_MANY_ATTEMPTS' || err?.status === 429) {
        this.globalError = 'Muitas tentativas. Tente novamente em alguns minutos.';
        return;
      }

      if (code === 'NETWORK_ERROR') {
        Alpine.store('toast')?.show('Sem conexão com o servidor.', 'error', 8000);
        return;
      }

      this.globalError = err?.message || 'Ocorreu um erro. Tente novamente.';
    },

    // ── Theme ───────────────────────────────────────────────

    darkMode: localStorage.getItem('ef_theme') === 'dark',

    toggleTheme() {
      this.darkMode = !this.darkMode;
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ef_theme', theme);
    },
  }));
}
