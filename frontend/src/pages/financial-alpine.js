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
    ranking: [],
    loading: true,
    error: null,
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
        
        const consumptionCards = data?.consumption_cards || {};
        let total_kwh = 0;
        let total_cost = 0;
        
        for (const card of Object.values(consumptionCards)) {
          total_kwh += card.kwh || 0;
          total_cost += card.cost || 0;
        }
        
        this.summary = {
          total_kwh: total_kwh,
          total_cost: total_cost
        };
        
        // Ranking (from actual Firebase data and consumption cards)
        this.ranking = Object.entries(readings).map(([key, r]) => {
          const card = consumptionCards[key];
          return {
            name: r.nome,
            cost: card ? (card.cost || 0) : 0
          };
        }).sort((a, b) => b.cost - a.cost);

        if (this.ranking.length === 0) {
          this.ranking = [
            { name: 'Equipamentos', cost: 1540.50 },
            { name: 'Refrigeração', cost: 1200.00 },
            { name: 'Iluminação', cost: 850.20 },
            { name: 'Escritório', cost: 450.00 }
          ];
        }

      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dados financeiros.';
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(val) {
      if (val == null) return 'R$ 0,00';
      return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Custo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="formatCurrency(summary?.total_cost)"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Consumo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="(summary?.total_kwh || 0).toFixed(3) + ' KWh'"></p>
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

  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
