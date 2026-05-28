/**
 * LumenFlow — Sector Dashboard Page (Alpine.js + Tailwind)
 *
 * Dashboard individual de um setor: KPIs, dispositivos, alertas.
 */

import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import { alertService } from '../services/alertService.js';
import { httpClient } from '../services/httpClient.js';
import Router from '../utils/router.js';

export function registerSectorDashboardPage(Alpine) {
  Alpine.data('sectorDashboardPage', () => ({
    sectorId: null,
    sector: null,
    devices: [],
    alerts: [],
    consumption: 0,
    loading: true,
    error: null,

    async init() {
      const hash = window.location.hash;
      const match = hash.match(/\/sectors\/(\d+)/);
      this.sectorId = match ? Number(match[1]) : null;
      if (!this.sectorId) { this.error = 'Setor não encontrado.'; this.loading = false; return; }
      await this.load();
    },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const [sRes, dRes, aRes, cRes] = await Promise.all([
          sectorService.list({ active: true }),
          deviceService.list(),
          alertService.list({ status: 'open', limit: 5 }),
          httpClient.get('/api/consumption/by-sector'),
        ]);
        const sectors = sRes?.sectors || sRes?.data || [];
        this.sector = sectors.find(s => s.id === this.sectorId);
        if (!this.sector) { this.error = 'Setor não encontrado.'; return; }

        this.devices = (dRes?.devices || dRes?.data || []).filter(d => d.sector_id === this.sectorId);
        this.alerts = (aRes?.data || aRes?.alerts || []).filter(a => a.sector_id === this.sectorId || a.sector?.id === this.sectorId).slice(0, 5);

        const cData = cRes?.data || cRes || [];
        const sectorConsumption = cData.find(c => c.sector_id === this.sectorId || c.name === this.sector.name);
        this.consumption = sectorConsumption?.total_kwh || 0;
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dados.';
      } finally {
        this.loading = false;
      }
    },

    goBack() { Router.navigate('/sectors/select'); },
    goDevices() { Router.navigate('/devices'); },
    goAlerts() { Router.navigate('/alerts'); },
  }));
}

let _registered = false;

export function renderSectorDashboardPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerSectorDashboardPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="sectorDashboardPage" class="space-y-6">
  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-16">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="goBack()" class="mt-3 text-emerald-600 font-medium">Voltar</button>
  </div>

  <div x-show="!loading && !error && sector" x-cloak class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white" x-text="sector?.name"></h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Dashboard do setor</p>
      </div>
      <button @click="goBack()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">← Voltar</button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Consumo</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="consumption.toFixed(1) + ' kWh'"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Dispositivos</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="devices.length"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Alertas abertos</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="alerts.length"></p>
      </div>
    </div>

    <!-- Devices -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dispositivos</h3>
        <button @click="goDevices()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>
      <div x-show="devices.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum dispositivo neste setor.</div>
      <div x-show="devices.length > 0" class="space-y-2">
        <template x-for="device in devices" :key="device.id">
          <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device.name"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="device.type || ''"></p>
            </div>
            <span :class="device.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="device.status || 'offline'"></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Alerts -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alertas recentes</h3>
        <button @click="goAlerts()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>
      <div x-show="alerts.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum alerta aberto.</div>
      <div x-show="alerts.length > 0" class="space-y-2">
        <template x-for="alert in alerts" :key="alert.id">
          <div class="flex items-start gap-3 p-2">
            <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'"></span>
            <div>
              <p class="text-sm text-gray-800 dark:text-gray-200" x-text="alert.title || alert.message"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="alert.created_at ? new Date(alert.created_at).toLocaleDateString('pt-BR') : ''"></p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
