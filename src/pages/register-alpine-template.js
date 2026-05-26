/**
 * LumenFlow — Register Page Template (Alpine.js + Tailwind)
 */

import { registerRegisterPage } from './register-alpine.js';

let _registered = false;

export function renderRegisterPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerRegisterPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="registerPage" class="min-h-screen flex">

  <!-- Branding Panel -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-6">
      <h2 class="text-3xl font-bold leading-tight">Gestão inteligente de energia para sua empresa</h2>
      <p class="text-emerald-100 text-lg">Monitore, analise e reduza o consumo energético com dados em tempo real.</p>
      <ul class="space-y-3 text-emerald-100">
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Dashboard de consumo em tempo real</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Alertas automáticos de desperdício</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Relatórios ESG mensais</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Metas e acompanhamento financeiro</li>
      </ul>
    </div>
    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-white dark:bg-gray-900 relative overflow-y-auto">

    <!-- Theme Toggle -->
    <button @click="toggleTheme" class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Alternar tema">
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-md space-y-6">

      <!-- Mobile Logo -->
      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        LumenFlow
      </div>

      <!-- Header -->
      <div class="text-center lg:text-left">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Criar conta</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Cadastre sua empresa</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" novalidate aria-label="Criar conta" class="space-y-4">

        <!-- Global Error -->
        <div x-show="globalError" x-transition x-cloak role="alert" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <span x-text="globalError"></span>
        </div>

        <!-- Section: Empresa -->
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-2">Dados da empresa</p>

        <!-- Company Name -->
        <div>
          <label for="reg-company" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da empresa</label>
          <input id="reg-company" type="text" x-model="companyName" @blur="onBlur('companyName')" @input="onInput('companyName')" autocomplete="organization"
            :class="errors.companyName && touched.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.companyName && touched.companyName" x-text="errors.companyName" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- CNPJ + Segment row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="reg-cnpj" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
            <input id="reg-cnpj" type="text" x-model="cnpj" @input="onCnpjInput()" @blur="onBlur('cnpj')" placeholder="00.000.000/0000-00" maxlength="18"
              :class="errors.cnpj && touched.cnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
            <p x-show="errors.cnpj && touched.cnpj" x-text="errors.cnpj" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
          <div>
            <label for="reg-segment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segmento</label>
            <select id="reg-segment" x-model="segment" @blur="onBlur('segment')" @change="onInput('segment')"
              :class="errors.segment && touched.segment ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors" required>
              <option value="" disabled>Selecione o segmento</option>
              <template x-for="opt in segments" :key="opt.value">
                <option :value="opt.value" x-text="opt.label"></option>
              </template>
            </select>
            <p x-show="errors.segment && touched.segment" x-text="errors.segment" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
        </div>

        <!-- Section: Responsável -->
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-2">Responsável pela conta</p>

        <!-- Responsible Name -->
        <div>
          <label for="reg-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome completo</label>
          <input id="reg-name" type="text" x-model="responsibleName" @blur="onBlur('responsibleName')" @input="onInput('responsibleName')" autocomplete="name"
            :class="errors.responsibleName && touched.responsibleName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.responsibleName && touched.responsibleName" x-text="errors.responsibleName" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Email -->
        <div>
          <label for="reg-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail corporativo</label>
          <input id="reg-email" type="email" x-model="email" @blur="onBlur('email')" @input="onInput('email')" autocomplete="email"
            :class="errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.email && touched.email" x-text="errors.email" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Passwords row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Password -->
          <div>
            <label for="reg-pass" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <div class="relative">
              <input id="reg-pass" :type="showPassword ? 'text' : 'password'" x-model="password" @blur="onBlur('password')" @input="onInput('password')" autocomplete="new-password"
                :class="errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :aria-label="showPassword ? 'Ocultar' : 'Mostrar'">
                <svg x-show="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPassword" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-400">Mín. 8 caracteres com letra, número e símbolo</p>
            <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
          <!-- Confirm -->
          <div>
            <label for="reg-pass-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar senha</label>
            <div class="relative">
              <input id="reg-pass-confirm" :type="showPasswordConfirm ? 'text' : 'password'" x-model="passwordConfirm" @blur="onBlur('passwordConfirm')" @input="onInput('passwordConfirm')" autocomplete="new-password"
                :class="errors.passwordConfirm && touched.passwordConfirm ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :aria-label="showPasswordConfirm ? 'Ocultar' : 'Mostrar'">
                <svg x-show="!showPasswordConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPasswordConfirm" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p x-show="errors.passwordConfirm && touched.passwordConfirm" x-text="errors.passwordConfirm" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
        </div>

        <!-- Terms -->
        <div class="pt-2">
          <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" x-model="termsAccepted" class="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800" />
            <span class="text-sm text-gray-600 dark:text-gray-400">Li e aceito os <a href="#" class="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">termos de uso</a>.</span>
          </label>
          <p x-show="errors.terms" x-text="errors.terms" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
          <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span x-text="loading ? 'Cadastrando...' : 'Cadastrar'"></span>
        </button>

        <!-- Login link -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Já tem conta? <a href="#/login" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Entrar</a>
        </p>
      </form>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
