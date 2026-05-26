/**
 * LumenFlow — Forgot Password Page (Alpine.js + Tailwind)
 *
 * Campo de e-mail + mensagem genérica de sucesso (prevenção de user enumeration).
 */

import { authService } from '../services/authService.js';

export function registerForgotPasswordPage(Alpine) {
  Alpine.data('forgotPasswordPage', () => ({
    email: '',
    emailError: '',
    touched: false,
    loading: false,
    sent: false,

    validateEmail() {
      if (!this.email.trim()) return 'Campo obrigatório';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ? '' : 'E-mail inválido';
    },

    onBlur() {
      this.touched = true;
      this.emailError = this.validateEmail();
    },

    onInput() {
      if (!this.touched) return;
      this.emailError = this.validateEmail();
    },

    async submit() {
      this.touched = true;
      this.emailError = this.validateEmail();
      if (this.emailError) return;

      this.loading = true;

      try {
        await authService.forgotPassword({ email: this.email.trim().toLowerCase() });
      } catch (err) {
        if (err?.code === 'NETWORK_ERROR') {
          this.loading = false;
          Alpine.store('toast')?.show('Sem conexão com o servidor.', 'error', 8000);
          return;
        }
      }

      this.loading = false;
      this.sent = true;
    },

    darkMode: localStorage.getItem('ef_theme') === 'dark',
    toggleTheme() {
      this.darkMode = !this.darkMode;
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ef_theme', theme);
    },
  }));
}

let _registered = false;

export function renderForgotPasswordPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerForgotPasswordPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="forgotPasswordPage" class="min-h-screen flex">

  <!-- Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">Recupere o acesso à sua conta</h2>
      <p class="text-emerald-100 text-lg">Enviaremos um link seguro para o e-mail cadastrado. O link expira em 1 hora.</p>
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

      <!-- Form State -->
      <div x-show="!sent">
        <div class="text-center lg:text-left mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Recuperar senha</h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Informe seu e-mail para receber o link</p>
        </div>

        <form @submit.prevent="submit" novalidate class="space-y-5">
          <div>
            <label for="forgot-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail cadastrado</label>
            <input id="forgot-email" type="email" x-model="email" @blur="onBlur()" @input="onInput()" autocomplete="email"
              :class="emailError && touched ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
              placeholder="seu@email.com" required />
            <p x-show="emailError && touched" x-text="emailError" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
            <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span x-text="loading ? 'Enviando...' : 'Enviar link'"></span>
          </button>

          <p class="text-center text-sm"><a href="#/login" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Voltar ao login</a></p>
        </form>
      </div>

      <!-- Success State -->
      <div x-show="sent" x-cloak x-transition class="text-center space-y-4" role="status">
        <svg class="w-16 h-16 text-emerald-500 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p class="text-gray-700 dark:text-gray-300">Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.</p>
        <a href="#/login" class="inline-block text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Voltar ao login</a>
      </div>

    </div>
  </div>
</div>
`;
}
