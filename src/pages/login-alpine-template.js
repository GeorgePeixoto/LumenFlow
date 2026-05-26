/**
 * LumenFlow — Login Page Template (Alpine.js + Tailwind)
 *
 * Renderiza o HTML da página de login com Alpine directives.
 * Mantém compatibilidade com o router existente (renderLoginPage).
 */

import { registerLoginPage } from './login-alpine.js';

let _registered = false;

export function renderLoginPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerLoginPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="loginPage" class="min-h-screen flex">

  <!-- Branding Panel (hidden on mobile) -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      LumenFlow
    </div>

    <div class="space-y-6">
      <h2 class="text-3xl font-bold leading-tight">Bem-vindo de volta ao LumenFlow</h2>
      <p class="text-emerald-100 text-lg">
        Continue monitorando o consumo energético da sua empresa com inteligência e precisão.
      </p>
      <ul class="space-y-3 text-emerald-100">
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Dashboard atualizado em tempo real
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Alertas automáticos de anomalias
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Relatórios ESG prontos para download
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Metas e controle financeiro integrados
        </li>
      </ul>
    </div>

    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 relative">

    <!-- Theme Toggle -->
    <button
      @click="toggleTheme"
      class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      aria-label="Alternar tema"
    >
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-sm space-y-8">

      <!-- Mobile Logo -->
      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        LumenFlow
      </div>

      <!-- Header -->
      <div class="text-center lg:text-left">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Entrar</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Bem-vindo de volta</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" novalidate aria-label="Entrar" class="space-y-5">

        <!-- Global Error Banner -->
        <div
          x-show="globalError"
          x-transition
          x-cloak
          role="alert"
          aria-live="assertive"
          class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          <span x-text="globalError"></span>
        </div>

        <!-- Email -->
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autocomplete="email"
            x-model="email"
            @blur="onBlur('email')"
            @input="onInput('email')"
            :class="errors.email && touched.email ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors"
            placeholder="seu@email.com"
            required
          />
          <p x-show="errors.email && touched.email" x-text="errors.email" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Password -->
        <div>
          <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
          <div class="relative">
            <input
              id="login-password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              x-model="password"
              @blur="onBlur('password')"
              @input="onInput('password')"
              :class="errors.password && touched.password ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <svg x-show="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg x-show="showPassword" x-cloak width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              x-model="rememberMe"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">Lembre-se de mim</span>
          </label>
          <a href="#/forgot-password" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
            Esqueci a senha
          </a>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2"
        >
          <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span x-text="loading ? 'Entrando...' : 'Entrar'"></span>
        </button>

        <!-- Register Link -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Não tem conta?
          <a href="#/register" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">Criar conta</a>
        </p>

        <!-- Demo Mode -->
        <template x-if="showDemo">
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="loginDemo"
              :disabled="demoLoading"
              class="w-full py-2.5 px-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg x-show="demoLoading" x-cloak class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span x-text="demoLoading ? 'Entrando...' : 'Entrar como Demo'"></span>
            </button>
          </div>
        </template>

      </form>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
