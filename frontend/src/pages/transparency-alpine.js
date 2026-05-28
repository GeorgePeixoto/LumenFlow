/**
 * LumenFlow — Transparency Page (Alpine.js + Tailwind)
 *
 * TV Mode / Painel de transparência com semáforo por setor.
 * Auto-refresh a cada 10s. Fullscreen toggle.
 * Dados vêm do Firebase via /api/dashboard/public.
 */

import { dashboardService } from '../services/dashboardService.js';

export function registerTransparencyPage(Alpine) {
  Alpine.data('transparencyPage', () => ({
    sectors: [],
    loading: true,
    error: null,
    lastUpdate: null,
    fullscreen: false,
    _interval: null,

    async init() {
      await this.load();
      this._interval = setInterval(() => this.load(), 10000);
    },

    destroy() {
      if (this._interval) clearInterval(this._interval);
    },

    async load() {
      try {
        const data = await dashboardService.getPublicData();
        const readings = data?.latest_readings || {};

        this.sectors = Object.entries(readings).map(([deviceId, reading]) => {
          const kwh = reading.energia_kwh || 0;
          const potencia = reading.potencia || 0;
          return {
            id: deviceId,
            name: reading.nome || deviceId,
            consumption: kwh,
            potencia: potencia,
            status: this._getStatus(kwh),
          };
        });

        this.lastUpdate = new Date();
        this.error = null;
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dados.';
      } finally {
        this.loading = false;
      }
    },

    _getStatus(consumption) {
      // Thresholds baseados em kWh
      if (consumption >= 10) return 'critical';
      if (consumption >= 5) return 'warning';
      return 'normal';
    },

    statusConfig(status) {
      const map = {
        normal: { label: 'Normal', bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', icon: 'check' },
        warning: { label: 'Atenção', bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-400', icon: 'alert' },
        critical: { label: 'Crítico', bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-700 dark:text-red-400', icon: 'danger' },
      };
      return map[status] || map.normal;
    },

    formatPower(w) {
      if (w == null) return '—';
      return w >= 1000 ? (w / 1000).toFixed(1) + ' W' : w.toFixed(1) + ' W';
    },

    formatTime() {
      if (!this.lastUpdate) return '';
      return this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
        this.fullscreen = true;
      } else {
        document.exitFullscreen?.();
        this.fullscreen = false;
      }
    },
  }));
}

let _registered = false;

export function renderTransparencyPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerTransparencyPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="transparencyPage" @beforeunload.window="destroy()" class="space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transparência</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Painel de status em tempo real</p>
    </div>
    <div class="flex items-center gap-3">
      <span x-show="lastUpdate" class="text-xs text-gray-400" x-text="'Atualizado: ' + formatTime()"></span>
      <button @click="toggleFullscreen()" class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="Tela cheia">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
      </button>
    </div>
  </div>

  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-16"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="sectors.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">Nenhum setor encontrado.</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <template x-for="sector in sectors" :key="sector.id">
        <div class="rounded-xl border-2 p-6 text-center transition-all" :class="statusConfig(sector.status).border + ' bg-white dark:bg-gray-800'">
          <!-- Status Icon -->
          <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" :class="statusConfig(sector.status).bg + '/20'">
            <template x-if="sector.status === 'normal'">
              <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </template>
            <template x-if="sector.status === 'warning'">
              <svg class="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </template>
            <template x-if="sector.status === 'critical'">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </template>
          </div>

          <h3 class="font-semibold text-gray-900 dark:text-white text-lg" x-text="sector.name"></h3>
          <p class="text-2xl font-bold mt-2" :class="statusConfig(sector.status).text" x-text="sector.consumption.toFixed(2) + ' W'"></p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1" x-text="formatPower(sector.potencia)"></p>
          <p class="text-sm mt-1 font-medium" :class="statusConfig(sector.status).text" x-text="statusConfig(sector.status).label"></p>
        </div>
      </template>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
