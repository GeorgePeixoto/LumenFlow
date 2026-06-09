/**
 * LumenFlow — Settings Page (Alpine.js + Tailwind)
 *
 * Configuração de horário comercial (business hours) e médias de consumo por setor.
 */

import { httpClient } from '../services/httpClient.js';
import { dashboardService } from '../services/dashboardService.js';

const DAYS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export function registerSettingsPage(Alpine) {
  Alpine.data('settingsPage', () => ({
    // ── Business Hours ──────────────────────────────────────
    days: DAYS.map(d => ({ ...d, enabled: d.key !== 'saturday' && d.key !== 'sunday', start: '08:00', end: '18:00' })),
    loading: true,
    saving: false,
    error: null,

    // ── Sector Averages ─────────────────────────────────────
    sectorAverages: [],
    loadingAverages: true,
    savingAverages: false,

    async init() {
      await Promise.all([this.load(), this.loadAverages()]);
    },

    // ── Business Hours Methods ──────────────────────────────
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const res = await httpClient.get('/api/business-hours');
        const data = res?.data || res || {};
        if (data.days && Array.isArray(data.days)) {
          this.days = DAYS.map(d => {
            const cfg = data.days.find(x => x.day === d.key) || {};
            return { ...d, enabled: cfg.enabled !== false, start: cfg.start || '08:00', end: cfg.end || '18:00' };
          });
        }
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar configurações.';
      } finally {
        this.loading = false;
      }
    },

    async save() {
      this.saving = true;
      try {
        const payload = { days: this.days.map(d => ({ day: d.key, enabled: d.enabled, start: d.start, end: d.end })) };
        await httpClient.put('/api/business-hours', payload);
        Alpine.store('toast')?.show('Configurações salvas.', 'success');
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
      } finally {
        this.saving = false;
      }
    },

    // ── Sector Averages Methods ─────────────────────────────
    async loadAverages() {
      this.loadingAverages = true;
      try {
        const publicData = await dashboardService.getAuthenticatedDashboardData();
        const readings = publicData?.latest_readings || {};

        // Carregar médias salvas
        let savedAverages = [];
        try {
          const res = await httpClient.get('/api/sector-averages');
          savedAverages = res?.averages || [];
        } catch (_) {}

        // Construir lista de setores com médias
        this.sectorAverages = Object.entries(readings).map(([deviceId, reading]) => {
          const sectorName = deviceId;
          const sectorLabel = reading.nome || deviceId;

          // Buscar média salva (manual tem prioridade)
          const manualAvg = savedAverages.find(a => a.sector_name === sectorName && a.is_manual_override);
          const autoAvg = savedAverages.find(a => a.sector_name === sectorName && !a.is_manual_override);

          return {
            sector_name: sectorName,
            sector_label: sectorLabel,
            average_kwh: manualAvg?.average_kwh || autoAvg?.average_kwh || 0,
            is_manual_override: !!manualAvg,
            auto_average: autoAvg?.average_kwh || 0,
          };
        });
      } catch (err) {
        console.warn('Erro ao carregar médias:', err);
      } finally {
        this.loadingAverages = false;
      }
    },

    async saveAverages() {
      this.savingAverages = true;
      try {
        const payload = {
          averages: this.sectorAverages.map(a => ({
            sector_name: a.sector_name,
            average_kwh: parseFloat(a.average_kwh) || 0,
            is_manual_override: a.is_manual_override,
          })),
        };
        await httpClient.put('/api/sector-averages', payload);
        Alpine.store('toast')?.show('Médias de consumo salvas.', 'success');
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar médias.', 'error');
      } finally {
        this.savingAverages = false;
      }
    },

    formatNumber(val) {
      if (val == null || val === 0) return '—';
      return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    },
  }));
}

let _registered = false;

export function renderSettingsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerSettingsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="settingsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Horário comercial e preferências</p>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <!-- Business Hours -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horário comercial</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Alertas de consumo fora de horário usam esta configuração.</p>

    <div class="space-y-3">
      <template x-for="day in days" :key="day.key">
        <div class="flex items-center gap-4 flex-wrap">
          <label class="flex items-center gap-2 w-28">
            <input type="checkbox" x-model="day.enabled" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300" x-text="day.label"></span>
          </label>
          <div class="flex items-center gap-2" x-show="day.enabled">
            <input type="time" x-model="day.start" class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <span class="text-gray-400">—</span>
            <input type="time" x-model="day.end" class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <span x-show="!day.enabled" class="text-sm text-gray-400">Fechado</span>
        </div>
      </template>
    </div>

    <div class="mt-6 flex justify-end">
      <button @click="save()" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium flex items-center gap-2">
        <svg x-show="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Salvar
      </button>
    </div>
  </div>

  <!-- Sector Averages -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Médias de consumo por setor</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Defina o valor de referência de consumo (kWh). Alertas são gerados quando o consumo ultrapassar 130% deste valor.</p>

    <div x-show="loadingAverages" class="flex justify-center py-6"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

    <div x-show="!loadingAverages" x-cloak class="space-y-4">
      <template x-for="avg in sectorAverages" :key="avg.sector_name">
        <div class="flex items-center gap-4 flex-wrap p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div class="w-40">
            <p class="text-sm font-medium text-gray-900 dark:text-white" x-text="avg.sector_label"></p>
            <p class="text-xs text-gray-400" x-text="'Auto: ' + formatNumber(avg.auto_average) + ' kWh'"></p>
          </div>
          <label class="flex items-center gap-2 shrink-0">
            <input type="checkbox" x-model="avg.is_manual_override" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span class="text-xs text-gray-600 dark:text-gray-400">Definir manualmente</span>
          </label>
          <div class="flex items-center gap-2" x-show="avg.is_manual_override">
            <input type="number" step="0.0001" min="0" x-model="avg.average_kwh" class="w-32 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <span class="text-xs text-gray-500">kWh</span>
          </div>
        </div>
      </template>

      <div x-show="sectorAverages.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">Nenhum setor encontrado.</div>
    </div>

    <div class="mt-6 flex justify-end" x-show="sectorAverages.length > 0 && !loadingAverages">
      <button @click="saveAverages()" :disabled="savingAverages" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium flex items-center gap-2">
        <svg x-show="savingAverages" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Salvar Médias
      </button>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
