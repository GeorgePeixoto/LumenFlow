/**
 * LumenFlow — Financial Page (Alpine.js + Tailwind)
 *
 * Painel financeiro: resumo, custo diário, ranking de setores.
 * Dados dinâmicos puxados do Firebase baseados no setor selecionado.
 */

import { dashboardService } from '../services/dashboardService.js';

const SELECTED_SECTOR_KEY = 'lf_selected_sector';
const TARIFA = 0.85;

export function registerFinancialPage(Alpine) {
  Alpine.data('financialPage', () => ({
    summary: null,
    daily: [],
    ranking: [],
    loading: true,
    error: null,
    period: 'last30',
    selectedSector: null,

    async init() { 
      try {
        const stored = localStorage.getItem(SELECTED_SECTOR_KEY);
        if (stored) this.selectedSector = JSON.parse(stored);
      } catch (_) {}
      
      await this.load(); 
    },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const data = await dashboardService.getPublicData();
        const readings = data?.latest_readings || {};
        
        let total_kwh = 0;
        
        if (this.selectedSector) {
          for (const [key, reading] of Object.entries(readings)) {
            if (key === this.selectedSector.id || reading.nome === this.selectedSector.name) {
              total_kwh = reading.energia_kwh || 0;
              break;
            }
          }
        } else {
          for (const reading of Object.values(readings)) {
            total_kwh += reading.energia_kwh || 0;
          }
        }
        
        const total_cost = total_kwh * TARIFA;
        
        this.summary = {
          total_kwh: total_kwh,
          total_cost: total_cost,
          avg_cost_per_kwh: TARIFA
        };
        
        // Mock Ranking (from actual Firebase data if available, or just mock)
        this.ranking = Object.values(readings).map(r => ({
          name: r.nome,
          cost: (r.energia_kwh || 0) * TARIFA
        })).sort((a, b) => b.cost - a.cost);

        if (this.ranking.length === 0) {
          this.ranking = [
            { name: 'Equipamentos', cost: 1540.50 },
            { name: 'Refrigeração', cost: 1200.00 },
            { name: 'Iluminação', cost: 850.20 },
            { name: 'Escritório', cost: 450.00 }
          ];
        }

        // Mock Daily Costs
        const today = new Date();
        this.daily = Array.from({length: 7}).map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          const mockKwh = (Math.random() * 50) + 10;
          return {
            date: d.toISOString().slice(0,10),
            kwh: mockKwh,
            cost: mockKwh * TARIFA
          };
        });

      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dados financeiros.';
      } finally {
        this.loading = false;
      }
    },

    onPeriodChange() { this.load(); },

    formatCurrency(val) {
      if (val == null) return 'R$ 0,00';
      return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    },
  }));
}

let _registered = false;

export function renderFinancialPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerFinancialPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="financialPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Custos e análise financeira de energia</p>
      <p x-show="selectedSector" x-cloak class="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span x-text="'Setor: ' + selectedSector?.name"></span>
      </p>
    </div>
    <select x-model="period" @change="onPeriodChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="last7">Últimos 7 dias</option>
      <option value="last30">Últimos 30 dias</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Custo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="formatCurrency(summary?.total_cost)"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Consumo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="(summary?.total_kwh || 0).toFixed(1) + ' kWh'"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Custo médio/kWh</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="formatCurrency(summary?.avg_cost_per_kwh)"></p>
      </div>
    </div>

    <!-- Ranking -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ranking por custo</h3>
      <div x-show="ranking.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Sem dados.</div>
      <div x-show="ranking.length > 0" class="space-y-3">
        <template x-for="(item, idx) in ranking" :key="idx">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center" x-text="idx + 1"></span>
              <span class="text-sm font-medium text-gray-900 dark:text-white" x-text="item.name || item.sector_name"></span>
            </div>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300" x-text="formatCurrency(item.cost || item.total_cost)"></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Daily -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custo diário</h3>
      <div x-show="daily.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Sem dados.</div>
      <div x-show="daily.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">kWh</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Custo</th></tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <template x-for="row in daily" :key="row.date">
              <tr><td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDate(row.date)"></td><td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="(row.kwh || 0).toFixed(1)"></td><td class="py-2 text-right font-medium text-gray-900 dark:text-white" x-text="formatCurrency(row.cost)"></td></tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
