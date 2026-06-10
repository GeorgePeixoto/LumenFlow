/**
 * LumenFlow — Reports Page (Alpine.js)
 *
 * Geração de relatórios PDF com filtro por setor e período.
 */

import { httpClient } from '../services/httpClient.js';
import { dashboardService } from '../services/dashboardService.js';

export function registerReportsPage(Alpine) {
  Alpine.data('reportsPage', () => ({
    sectors: [],
    selectedSector: '',
    dateFrom: '',
    dateTo: '',
    loading: true,
    generating: false,
    previewing: false,
    previewData: null,
    error: null,

    async init() {
      // Setar datas padrão: início do mês até hoje
      const now = new Date();
      this.dateTo = now.toISOString().split('T')[0];
      this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

      await this.loadSectors();
    },

    async loadSectors() {
      this.loading = true;
      this.error = null;
      try {
        const data = await dashboardService.getPublicData();
        const readings = data?.latest_readings || {};

        this.sectors = Object.entries(readings).map(([deviceId, reading]) => ({
          id: deviceId,
          name: reading.nome || deviceId,
        }));

        // Selecionar o primeiro setor por padrão
        if (this.sectors.length > 0 && !this.selectedSector) {
          this.selectedSector = this.sectors[0].id;
        }
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar setores.';
      } finally {
        this.loading = false;
      }
    },

    get selectedSectorLabel() {
      const s = this.sectors.find(s => s.id === this.selectedSector);
      return s ? s.name : this.selectedSector;
    },

    get isFormValid() {
      return this.selectedSector && this.dateFrom && this.dateTo && this.dateFrom <= this.dateTo;
    },

    async preview() {
      if (!this.isFormValid) return;

      this.previewing = true;
      this.previewData = null;
      this.error = null;

      try {
        const res = await httpClient.get('/api/reports/consumption-data', {
          query: {
            sector_name: this.selectedSector,
            date_from: this.dateFrom,
            date_to: this.dateTo,
          },
        });

        this.previewData = res;
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dados de prévia.';
      } finally {
        this.previewing = false;
      }
    },

    async generatePdf() {
      if (!this.isFormValid) return;

      this.generating = true;
      this.error = null;

      try {
        const token = httpClient.getAuthToken();
        const baseUrl = httpClient.getBaseUrl?.() || 'http://localhost:8000';
        const params = new URLSearchParams({
          sector_name: this.selectedSector,
          date_from: this.dateFrom,
          date_to: this.dateTo,
          token: token,
        });

        const downloadUrl = `${baseUrl}/api/reports/consumption-pdf?${params.toString()}`;

        // Disparar o download de forma nativa via elemento <a>
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `relatorio_consumo_${this.selectedSector}_${this.dateFrom}_${this.dateTo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Breve delay visual para dar feedback ao usuário
        setTimeout(() => {
          this.generating = false;
          Alpine.store('toast')?.show('PDF gerado com sucesso!', 'success');
        }, 1000);
      } catch (err) {
        this.error = err?.message || 'Erro ao gerar PDF.';
        Alpine.store('toast')?.show(this.error, 'error');
        this.generating = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },

    formatNumber(val, decimals = 2) {
      if (val == null) return '—';
      return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    formatCurrency(val) {
      if (val == null) return '—';
      return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  }));
}

let _registered = false;

export function renderReportsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerReportsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="reportsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Gere relatórios de consumo e custo por setor</p>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="!loading" x-cloak>
    <!-- Filters Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Configurar Relatório
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Setor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setor</label>
          <select x-model="selectedSector" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <template x-for="sector in sectors" :key="sector.id">
              <option :value="sector.id" x-text="sector.name"></option>
            </template>
          </select>
        </div>

        <!-- Data Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
          <input type="date" x-model="dateFrom" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
          <input type="date" x-model="dateTo" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
      </div>

      <div x-show="error" x-cloak class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3" x-text="error"></div>

      <div class="flex items-center gap-3 justify-end">
        <button @click="preview()" :disabled="!isFormValid || previewing"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50">
          <svg x-show="previewing" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg x-show="!previewing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Visualizar
        </button>
        <button @click="generatePdf()" :disabled="!isFormValid || generating"
          class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-2">
          <svg x-show="generating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg x-show="!generating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Gerar PDF
        </button>
      </div>
    </div>

    <!-- Preview Card -->
    <div x-show="previewData" x-cloak class="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Prévia dos Dados</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400" x-text="previewData?.total_records + ' registros'"></span>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Energia</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300" x-text="formatNumber(previewData?.total_kwh, 4) + ' kWh'"></p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Custo Total</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-300" x-text="formatCurrency(previewData?.total_cost)"></p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">Potência Média</p>
          <p class="text-lg font-bold text-amber-700 dark:text-amber-300" x-text="formatNumber(previewData?.avg_power) + ' W'"></p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">Potência Máx</p>
          <p class="text-lg font-bold text-purple-700 dark:text-purple-300" x-text="formatNumber(previewData?.max_power) + ' W'"></p>
        </div>
      </div>

      <!-- Data Table -->
      <div x-show="previewData?.records?.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Data/Hora</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Potência (W)</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Energia (kWh)</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Custo (R$)</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="record in previewData?.records?.slice(0, 50)" :key="record.recorded_at">
              <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="py-2 px-3 text-gray-900 dark:text-white" x-text="formatDate(record.recorded_at)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatNumber(record.power_w)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatNumber(record.energy_kwh, 4)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatCurrency(record.cost_estimate)"></td>
              </tr>
            </template>
          </tbody>
        </table>
        <p x-show="previewData?.records?.length > 50" class="text-center text-xs text-gray-400 mt-2">Mostrando apenas os 50 primeiros registros. O PDF conterá todos.</p>
      </div>

      <div x-show="!previewData?.records?.length" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p>Nenhum registro encontrado para o período selecionado.</p>
        <p class="text-xs mt-1">Os dados são registrados automaticamente quando o dashboard é acessado.</p>
      </div>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
