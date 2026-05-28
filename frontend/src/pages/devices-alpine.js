/**
 * LumenFlow — Devices Page (Alpine.js + Tailwind)
 *
 * Lista de dispositivos IoT — somente leitura, dados do Firebase.
 * Busca, filtro por setor. Sem CRUD.
 */

import { dashboardService } from '../services/dashboardService.js';

export function registerDevicesPage(Alpine) {
  Alpine.data('devicesPage', () => ({
    devices: [],
    loading: true,
    error: null,
    search: '',
    filterSector: '',

    async init() { await this.load(); },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        this.devices = await dashboardService.getFirebaseDevices();
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dispositivos.';
      } finally {
        this.loading = false;
      }
    },

    get sectorOptions() {
      const set = new Set(this.devices.map(d => d.name));
      return [...set].sort();
    },

    get filtered() {
      let list = this.devices;
      const q = this.search.trim().toLowerCase();
      if (q) list = list.filter(d => d.name.toLowerCase().includes(q) || d.sector.toLowerCase().includes(q));
      if (this.filterSector) list = list.filter(d => d.name === this.filterSector);
      return list;
    },

    statusBadge(device) {
      if (device.status === 'online') return { text: 'Online', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      return { text: 'Offline', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    },

    formatPower(w) {
      if (w == null) return '—';
      return w >= 1000 ? (w / 1000).toFixed(1) + ' kW' : w.toFixed(1) + ' W';
    },

    formatEnergy(kwh) {
      if (kwh == null) return '—';
      return kwh.toFixed(2) + ' kWh';
    },
  }));
}

let _registered = false;

export function renderDevicesPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerDevicesPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="devicesPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dispositivos</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Monitoramento de dispositivos IoT em tempo real</p>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-3">
    <input type="text" x-model="search" placeholder="Buscar..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
    <select x-model="filterSector" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos os setores</option>
      <template x-for="s in sectorOptions" :key="s"><option :value="s" x-text="s"></option></template>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button>
  </div>

  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="filtered.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhum dispositivo encontrado.</div>
    <table x-show="filtered.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Setor</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Potência</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">Energia</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="device in filtered" :key="device.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="device.name"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell" x-text="device.sector"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell" x-text="formatPower(device.potencia)"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell" x-text="formatEnergy(device.energia_kwh)"></td>
            <td class="px-4 py-3"><span :class="statusBadge(device).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="statusBadge(device).text"></span></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
