/**
 * LumenFlow — Alerts Page (Alpine.js + Tailwind)
 *
 * Central de alertas com filtros, ações (acknowledge/resolve).
 */

import { alertService } from '../services/alertService.js';
import Router from '../utils/router.js';

export function registerAlertsPage(Alpine) {
  Alpine.data('alertsPage', () => ({
    alerts: [],
    loading: true,
    error: null,
    filterType: '',
    filterSeverity: '',
    filterStatus: 'open',

    async init() {
      const hash = window.location.hash;
      if (hash.includes('type=')) {
        const match = hash.match(/type=([^&]+)/);
        if (match) this.filterType = match[1];
      }
      await this.load();
    },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const params = { sort: '-created_at', limit: 50 };
        if (this.filterType) params.type = this.filterType;
        if (this.filterSeverity) params.severity = this.filterSeverity;
        if (this.filterStatus) params.status = this.filterStatus;
        const res = await alertService.list(params);
        this.alerts = res?.data || res?.alerts || res || [];
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar alertas.';
      } finally {
        this.loading = false;
      }
    },

    onFilterChange() { this.load(); },

    severityBadge(severity) {
      const map = {
        critical: { text: 'Crítico', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        high: { text: 'Alto', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
        medium: { text: 'Médio', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        low: { text: 'Baixo', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      };
      return map[severity] || map.medium;
    },

    statusBadge(status) {
      const map = {
        open: { text: 'Aberto', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        acknowledged: { text: 'Reconhecido', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        resolved: { text: 'Resolvido', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      };
      return map[status] || map.open;
    },

    typeLabel(type) {
      const map = { overload: 'Sobrecarga', off_hours: 'Fora de horário', night_waste: 'Noturno', anomaly: 'Anomalia', goal: 'Meta' };
      return map[type] || type;
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    },

    async acknowledge(alert) {
      try {
        await alertService.acknowledge(alert.id);
        alert.status = 'acknowledged';
        Alpine.store('toast')?.show('Alerta reconhecido.', 'success');
      } catch (err) {
        Alpine.store('toast')?.show('Erro ao reconhecer.', 'error');
      }
    },

    async resolve(alert) {
      try {
        await alertService.resolve(alert.id);
        alert.status = 'resolved';
        Alpine.store('toast')?.show('Alerta resolvido.', 'success');
      } catch (err) {
        Alpine.store('toast')?.show('Erro ao resolver.', 'error');
      }
    },
  }));
}

let _registered = false;

export function renderAlertsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerAlertsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="alertsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Central de alertas do sistema</p>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3">
    <select x-model="filterStatus" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos status</option>
      <option value="open">Abertos</option>
      <option value="acknowledged">Reconhecidos</option>
      <option value="resolved">Resolvidos</option>
    </select>
    <select x-model="filterType" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos tipos</option>
      <option value="overload">Sobrecarga</option>
      <option value="off_hours">Fora de horário</option>
      <option value="night_waste">Noturno</option>
      <option value="anomaly">Anomalia</option>
    </select>
    <select x-model="filterSeverity" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todas severidades</option>
      <option value="critical">Crítico</option>
      <option value="high">Alto</option>
      <option value="medium">Médio</option>
      <option value="low">Baixo</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button>
  </div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="alerts.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum alerta encontrado.</div>

    <div x-show="alerts.length > 0" class="space-y-3">
      <template x-for="alert in alerts" :key="alert.id">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span :class="severityBadge(alert.severity).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="severityBadge(alert.severity).text"></span>
                <span class="text-xs text-gray-500 dark:text-gray-400" x-text="typeLabel(alert.type)"></span>
                <span :class="statusBadge(alert.status).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="statusBadge(alert.status).text"></span>
              </div>
              <p class="font-medium text-gray-900 dark:text-white" x-text="alert.title || alert.message"></p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1" x-text="(alert.sector?.name || alert.device?.name || '') + (alert.created_at ? ' — ' + formatDate(alert.created_at) : '')"></p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button x-show="alert.status === 'open'" @click="acknowledge(alert)" class="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reconhecer</button>
              <button x-show="alert.status !== 'resolved'" @click="resolve(alert)" class="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Resolver</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
