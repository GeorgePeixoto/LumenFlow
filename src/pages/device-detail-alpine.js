/**
 * LumenFlow — Device Detail Page (Alpine.js + Tailwind)
 *
 * Detalhes do dispositivo: info, leituras (chart placeholder), anomalias, manutenção.
 */

import { deviceService } from '../services/deviceService.js';
import { httpClient } from '../services/httpClient.js';
import Router from '../utils/router.js';

export function registerDeviceDetailPage(Alpine) {
  Alpine.data('deviceDetailPage', () => ({
    deviceId: null,
    device: null,
    loading: true,
    error: null,
    activeTab: 'readings',

    readings: [],
    readingsLoading: false,
    anomalies: [],
    anomaliesLoading: false,
    maintenance: [],
    maintenanceLoading: false,

    // Maintenance modal
    modalOpen: false,
    maintForm: { date: '', type: '', notes: '' },
    maintSaving: false,

    async init() {
      const hash = window.location.hash;
      const match = hash.match(/\/devices\/(\d+)/);
      this.deviceId = match ? Number(match[1]) : null;
      if (!this.deviceId) { this.error = 'Dispositivo não encontrado.'; this.loading = false; return; }
      await this.loadDevice();
    },

    async loadDevice() {
      this.loading = true;
      this.error = null;
      try {
        this.device = await deviceService.get(this.deviceId);
        await this.loadTab();
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dispositivo.';
      } finally {
        this.loading = false;
      }
    },

    async switchTab(tab) {
      this.activeTab = tab;
      await this.loadTab();
    },

    async loadTab() {
      if (this.activeTab === 'readings') await this.loadReadings();
      else if (this.activeTab === 'anomalies') await this.loadAnomalies();
      else if (this.activeTab === 'maintenance') await this.loadMaintenance();
    },

    async loadReadings() {
      this.readingsLoading = true;
      try {
        const data = await deviceService.getReadings(this.deviceId, {});
        this.readings = data?.values?.map((v, i) => ({
          label: data.labels?.[i] || '',
          value: v,
          isAnomaly: (data.anomalies || []).includes(i),
        })) || [];
      } catch { this.readings = []; }
      finally { this.readingsLoading = false; }
    },

    async loadAnomalies() {
      this.anomaliesLoading = true;
      try {
        const data = await deviceService.getAnomalies(this.deviceId);
        this.anomalies = data?.anomalies || data?.data || data || [];
      } catch { this.anomalies = []; }
      finally { this.anomaliesLoading = false; }
    },

    async loadMaintenance() {
      this.maintenanceLoading = true;
      try {
        const data = await deviceService.getMaintenance(this.deviceId);
        this.maintenance = data?.records || data?.data || data || [];
      } catch { this.maintenance = []; }
      finally { this.maintenanceLoading = false; }
    },

    openMaintenanceModal() {
      this.maintForm = { date: '', type: '', notes: '' };
      this.modalOpen = true;
    },

    async saveMaintenance() {
      if (!this.maintForm.date || !this.maintForm.type) return;
      this.maintSaving = true;
      try {
        await deviceService.addMaintenance(this.deviceId, this.maintForm);
        Alpine.store('toast')?.show('Manutenção registrada.', 'success');
        this.modalOpen = false;
        await this.loadMaintenance();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
      } finally {
        this.maintSaving = false;
      }
    },

    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('pt-BR');
    },

    formatDateTime(d) {
      if (!d) return '—';
      return new Date(d).toLocaleString('pt-BR');
    },

    deviationPercent(row) {
      if (!row.expected_value) return 0;
      return Math.round(((row.actual_value - row.expected_value) / row.expected_value) * 100);
    },

    goBack() { Router.navigate('/devices'); },
  }));
}

let _registered = false;

export function renderDeviceDetailPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerDeviceDetailPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="deviceDetailPage" class="space-y-6">
  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-16">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="goBack()" class="mt-3 text-emerald-600 font-medium">Voltar</button>
  </div>

  <div x-show="!loading && !error && device" x-cloak class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white" x-text="device?.name"></h1>
        <p class="text-sm text-gray-500 dark:text-gray-400" x-text="(device?.type || '') + (device?.sector_name ? ' — ' + device.sector_name : '')"></p>
      </div>
      <button @click="goBack()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">← Voltar</button>
    </div>

    <!-- Info Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div><p class="text-xs text-gray-500 dark:text-gray-400">ID</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.device_id || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Setor</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.sector_name || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Tipo</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.type || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Status</p><p class="text-sm font-medium" :class="device?.active !== false ? 'text-emerald-600' : 'text-gray-400'" x-text="device?.active !== false ? 'Ativo' : 'Inativo'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Última leitura</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.last_reading != null ? device.last_reading.toFixed(2) + ' kWh' : 'Sem leitura'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Instalação</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="formatDate(device?.install_date)"></p></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <nav class="flex border-b border-gray-200 dark:border-gray-700">
        <button @click="switchTab('readings')" :class="activeTab === 'readings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Leituras</button>
        <button @click="switchTab('anomalies')" :class="activeTab === 'anomalies' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Anomalias</button>
        <button @click="switchTab('maintenance')" :class="activeTab === 'maintenance' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Manutenção</button>
      </nav>

      <div class="p-5">
        <!-- Readings Tab -->
        <div x-show="activeTab === 'readings'">
          <div x-show="readingsLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!readingsLoading && readings.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Sem leituras disponíveis.</div>
          <div x-show="!readingsLoading && readings.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Período</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Consumo (kWh)</th><th class="text-center py-2 text-gray-500 dark:text-gray-400">Anomalia</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="(r, idx) in readings" :key="idx">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="r.label"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="r.value?.toFixed(2)"></td>
                    <td class="py-2 text-center"><span x-show="r.isAnomaly" class="inline-block w-2 h-2 rounded-full bg-red-500"></span></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Anomalies Tab -->
        <div x-show="activeTab === 'anomalies'">
          <div x-show="anomaliesLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!anomaliesLoading && anomalies.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma anomalia detectada.</div>
          <div x-show="!anomaliesLoading && anomalies.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Esperado</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Real</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Desvio</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="row in anomalies" :key="row.id || row.detected_at">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDateTime(row.detected_at)"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="row.expected_value != null ? row.expected_value.toFixed(2) + ' kWh' : '—'"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="row.actual_value != null ? row.actual_value.toFixed(2) + ' kWh' : '—'"></td>
                    <td class="py-2 text-right font-medium" :class="deviationPercent(row) > 0 ? 'text-red-600' : 'text-emerald-600'" x-text="(deviationPercent(row) > 0 ? '+' : '') + deviationPercent(row) + '%'"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Maintenance Tab -->
        <div x-show="activeTab === 'maintenance'">
          <div class="flex justify-end mb-4">
            <button @click="openMaintenanceModal()" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">Nova manutenção</button>
          </div>
          <div x-show="maintenanceLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!maintenanceLoading && maintenance.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum registro de manutenção.</div>
          <div x-show="!maintenanceLoading && maintenance.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-left py-2 text-gray-500 dark:text-gray-400">Tipo</th><th class="text-left py-2 text-gray-500 dark:text-gray-400">Observações</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="rec in maintenance" :key="rec.id || rec.date">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDate(rec.date)"></td>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="rec.type || '—'"></td>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="rec.notes || '—'"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Maintenance Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova manutenção</h2>
      <form @submit.prevent="saveMaintenance()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" x-model="maintForm.date" required class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><input type="text" x-model="maintForm.type" required placeholder="Preventiva, Corretiva..." class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label><textarea x-model="maintForm.notes" rows="3" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="maintSaving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
}
