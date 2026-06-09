/**
 * LumenFlow — Sector Select Page (Alpine.js + Tailwind)
 *
 * Página pós-login para selecionar o setor ativo.
 * Setores vêm dinamicamente do Firebase (via /api/dashboard/public).
 * O setor selecionado é salvo no localStorage para uso no dashboard.
 */

import { dashboardService } from '../services/dashboardService.js';
import { sessionService } from '../services/sessionService.js';
import Router from '../utils/router.js';

export const SELECTED_SECTOR_KEY = 'lf_selected_sector';

export function registerSectorSelectPage(Alpine) {
  Alpine.data('sectorSelectPage', () => ({
    sectors: [],
    loading: true,
    error: false,

    get userName() {
      return sessionService.getUser()?.name || '';
    },

    async init() {
      await this.load();
    },

    async load() {
      this.loading = true;
      this.error = false;
      try {
        this.sectors = await dashboardService.getFirebaseSectors();
      } catch (_) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    selectSector(sector) {
      // Persiste o setor selecionado para o dashboard ler
      try {
        localStorage.setItem(SELECTED_SECTOR_KEY, JSON.stringify({
          id: sector.id,
          name: sector.name,
          potencia: sector.potencia,
          energia_kwh: sector.energia_kwh,
        }));
      } catch (_) {}
      Router.navigate('/dashboard');
    },

    formatPower(w) {
      if (w == null) return '—';
      return w >= 1000 ? (w / 1000).toFixed(1) + ' kW' : w.toFixed(1) + ' W';
    },

    formatEnergy(kwh) {
      if (kwh == null) return '—';
      return kwh.toFixed(3) + ' KWh';
    },
  }));
}

let _registered = false;

export function renderSectorSelectPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerSectorSelectPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="sectorSelectPage" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-6 py-12">

  <!-- Header -->
  <div class="text-center mb-10">
    <div class="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-2xl mb-6">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      LumenFlow
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Selecione o setor</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400" x-show="userName" x-text="'Olá, ' + userName + '. Escolha o setor para monitorar.'"></p>
  </div>

  <!-- Loading -->
  <div x-show="loading" class="flex items-center justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
  </div>

  <!-- Error -->
  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400 mb-4">Erro ao carregar setores.</p>
    <button @click="load()" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Tentar novamente</button>
  </div>

  <!-- Empty -->
  <div x-show="!loading && !error && sectors.length === 0" x-cloak class="text-center py-12">
    <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Nenhum setor encontrado no Firebase.</p>
  </div>

  <!-- Sector Grid -->
  <div x-show="!loading && !error && sectors.length > 0" x-cloak class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
    <template x-for="sector in sectors" :key="sector.id">
      <button
        @click="selectSector(sector)"
        class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all text-left group"
      >
        <p class="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg" x-text="sector.name"></p>
        <div class="flex items-center gap-4 mt-3">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span class="text-sm text-gray-600 dark:text-gray-400" x-text="formatPower(sector.potencia)"></span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
            <span class="text-sm text-gray-600 dark:text-gray-400" x-text="formatEnergy(sector.energia_kwh)"></span>
          </div>
        </div>
      </button>
    </template>
  </div>

</div>
`;
  window.Alpine?.initTree(container);
}
