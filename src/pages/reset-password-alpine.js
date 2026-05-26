/**
 * LumenFlow — Reset Password Page (Alpine.js + Tailwind)
 *
 * Recebe token via query string. Campos: nova senha + confirmação.
 * Exibe erro se token ausente/expirado.
 */

import { authService } from '../services/authService.js';
import Router from '../utils/router.js';

export function registerResetPasswordPage(Alpine) {
  Alpine.data('resetPasswordPage', () => ({
    password: '',
    passwordConfirm: '',
    showPassword: false,
    showPasswordConfirm: false,
    loading: false,
    globalError: '',
    tokenExpired: false,
    token: '',

    errors: { password: '', passwordConfirm: '' },
    touched: { password: false, passwordConfirm: false },

    init() {
      const query = Router.currentQuery ? Router.currentQuery() : {};
      this.token = query.token || '';
      if (!this.token) this.tokenExpired = true;
    },

    _validatePassword() {
      if (!this.password) return 'Campo obrigatório';
      if (this.password.length < 8) return 'Mínimo 8 caracteres';
      if (!/[a-zA-Z]/.test(this.password)) return 'Deve conter ao menos uma letra';
      if (!/[0-9]/.test(this.password)) return 'Deve conter ao menos um número';
      return '';
    },

    _validateConfirm() {
      if (!this.passwordConfirm) return 'Campo obrigatório';
      if (this.password !== this.passwordConfirm) return 'Senhas não conferem';
      return '';
    },

    onBlur(field) {
      this.touched[field] = true;
      this.errors[field] = field === 'password' ? this._validatePassword() : this._validateConfirm();
    },

    onInput(field) {
      if (!this.touched[field]) return;
      this.errors[field] = field === 'password' ? this._validatePassword() : this._validateConfirm();
      if (field === 'password' && this.touched.passwordConfirm) {
        this.errors.passwordConfirm = this._validateConfirm();
      }
    },

    async submit() {
      this.touched.password = true;
      this.touched.passwordConfirm = true;
      this.errors.password = this._validatePassword();
      this.errors.passwordConfirm = this._validateConfirm();
      if (this.errors.password || this.errors.passwordConfirm) return;

      this.loading = true;
      this.globalError = '';

      try {
        await authService.resetPassword({ token: this.token, password: this.password });
        Alpine.store('toast')?.show('Senha redefinida com sucesso. Faça login.', 'success', 7000);
        Router.navigate('/login');
      } catch (err) {
        this.loading = false;
        const code = err?.code || '';

        if (code === 'AUTH_TOKEN_INVALID' || code === 'AUTH_TOKEN_EXPIRED') {
          this.tokenExpired = true;
          return;
        }
        if (code === 'NETWORK_ERROR') {
          Alpine.store('toast')?.show('Sem conexão com o servidor.', 'error', 8000);
          return;
        }
        this.globalError = err?.message || 'Ocorreu um erro. Tente novamente.';
      }
    },

    darkMode: localStorage.getItem('ef_theme') === 'dark',
    toggleTheme() {
      this.darkMode = !this.darkMode;
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', this.darkMode);
      localStorage.setItem('ef_theme', theme);
    },
  }));
}

let _registered = false;

export function renderResetPasswordPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerResetPasswordPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="resetPasswordPage" class="min-h-screen flex">

  <!-- Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">Crie uma nova senha segura</h2>
      <p class="text-emerald-100 text-lg">Use ao menos 8 caracteres combinando letras, números e símbolos.</p>
    </div>
    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 relative">

    <button @click="toggleTheme" class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Alternar tema">
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-sm space-y-8">

      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        LumenFlow
      </div>

      <!-- Token Expired State -->
      <div x-show="tokenExpired" x-cloak class="text-center space-y-4">
        <svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p class="text-gray-700 dark:text-gray-300">Link expirado ou inválido. Solicite um novo.</p>
        <a href="#/forgot-password" class="inline-block text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Solicitar novo link</a>
      </div>

      <!-- Form State -->
      <div x-show="!tokenExpired">
        <div class="text-center lg:text-left mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Escolha uma nova senha segura</p>
        </div>

        <form @submit.prevent="submit" novalidate class="space-y-5">

          <div x-show="globalError" x-transition x-cloak role="alert" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <span x-text="globalError"></span>
          </div>

          <!-- New Password -->
          <div>
            <label for="reset-pass" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova senha</label>
            <div class="relative">
              <input id="reset-pass" :type="showPassword ? 'text' : 'password'" x-model="password" @blur="onBlur('password')" @input="onInput('password')" autocomplete="new-password"
                :class="errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg x-show="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPassword" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-400">Mín. 8 caracteres com letra, número e símbolo</p>
            <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="reset-pass-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar nova senha</label>
            <div class="relative">
              <input id="reset-pass-confirm" :type="showPasswordConfirm ? 'text' : 'password'" x-model="passwordConfirm" @blur="onBlur('passwordConfirm')" @input="onInput('passwordConfirm')" autocomplete="new-password"
                :class="errors.passwordConfirm && touched.passwordConfirm ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg x-show="!showPasswordConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPasswordConfirm" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p x-show="errors.passwordConfirm && touched.passwordConfirm" x-text="errors.passwordConfirm" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
            <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span x-text="loading ? 'Redefinindo...' : 'Redefinir'"></span>
          </button>
        </form>
      </div>

    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
