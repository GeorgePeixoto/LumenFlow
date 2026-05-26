/**
 * LumenFlow — Devices Page (Alpine.js + Tailwind)
 *
 * CRUD de dispositivos com tabela, busca, filtro por setor, modal.
 */

import { deviceService } from '../services/deviceService.js';
import { sectorService } from '../services/sectorService.js';
import Router from '../utils/router.js';

export function registerDevicesPage(Alpine) {
  Alpine.data('devicesPage', () => ({
    devices: [],
    sectors: [],
    loading: true,
    error: null,
    search: '',
    filterSector: '',

    modalOpen: false,
    modalTitle: '',
    editing: null,
    form: { name: '', type: '', sector_id: '', power_watts: '' },
    formErrors: {},
    saving: false,

    confirmOpen: false,
    confirmDevice: null,

    async init() { await this.load(); },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const [dRes, sRes] = await Promise.all([
          deviceService.list(),
          sectorService.list({ active: true }),
        ]);
        this.devices = dRes?.devices || dRes?.data || [];
        this.sectors = sRes?.sectors || sRes?.data || [];
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar dispositivos.';
      } finally {
        this.loading = false;
      }
    },

    get filtered() {
      let list = this.devices;
      const q = this.search.trim().toLowerCase();
      if (q) list = list.filter(d => d.name.toLowerCase().includes(q));
      if (this.filterSector) list = list.filter(d => String(d.sector_id) === this.filterSector);
      return list;
    },

    sectorName(sectorId) {
      return this.sectors.find(s => s.id === sectorId)?.name || '—';
    },

    statusBadge(device) {
      if (!device.active) return { text: 'Inativo', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
      if (device.status === 'online') return { text: 'Online', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      return { text: 'Offline', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    },

    openNew() {
      this.editing = null;
      this.modalTitle = 'Novo dispositivo';
      this.form = { name: '', type: '', sector_id: '', power_watts: '' };
      this.formErrors = {};
      this.modalOpen = true;
    },

    openEdit(device) {
      this.editing = device;
      this.modalTitle = 'Editar dispositivo';
      this.form = { name: device.name, type: device.type || '', sector_id: String(device.sector_id || ''), power_watts: device.power_watts || '' };
      this.formErrors = {};
      this.modalOpen = true;
    },

    async saveForm() {
      this.formErrors = {};
      if (!this.form.name.trim()) { this.formErrors.name = 'Campo obrigatório'; return; }
      if (!this.form.sector_id) { this.formErrors.sector_id = 'Selecione um setor'; return; }

      this.saving = true;
      try {
        const payload = { name: this.form.name.trim(), type: this.form.type, sector_id: Number(this.form.sector_id), power_watts: this.form.power_watts ? Number(this.form.power_watts) : null };
        if (this.editing) await deviceService.update(this.editing.id, payload);
        else await deviceService.create(payload);
        Alpine.store('toast')?.show('Dispositivo salvo.', 'success');
        this.modalOpen = false;
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
      } finally {
        this.saving = false;
      }
    },

    viewDetail(device) {
      Router.navigate(`/devices/${device.id}`);
    },

    askDelete(device) { this.confirmDevice = device; this.confirmOpen = true; },

    async confirmDelete() {
      if (!this.confirmDevice) return;
      try {
        await deviceService.delete(this.confirmDevice.id);
        Alpine.store('toast')?.show('Dispositivo removido.', 'success');
        this.confirmOpen = false;
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao remover.', 'error');
      }
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
      <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie os dispositivos IoT</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors">Novo dispositivo</button>
  </div>

  <div class="flex flex-col sm:flex-row gap-3">
    <input type="text" x-model="search" placeholder="Buscar..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
    <select x-model="filterSector" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos os setores</option>
      <template x-for="s in sectors" :key="s.id"><option :value="String(s.id)" x-text="s.name"></option></template>
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
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="device in filtered" :key="device.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" @click="viewDetail(device)">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="device.name"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell" x-text="sectorName(device.sector_id)"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell" x-text="device.power_watts ? device.power_watts + ' W' : '—'"></td>
            <td class="px-4 py-3"><span :class="statusBadge(device).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="statusBadge(device).text"></span></td>
            <td class="px-4 py-3 text-right space-x-2" @click.stop>
              <button @click="openEdit(device)" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium">Editar</button>
              <button @click="askDelete(device)" class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Remover</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="modalTitle"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
          <input type="text" x-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setor</label>
          <select x-model="form.sector_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <option value="">Selecione</option>
            <template x-for="s in sectors" :key="s.id"><option :value="String(s.id)" x-text="s.name"></option></template>
          </select>
          <p x-show="formErrors.sector_id" x-text="formErrors.sector_id" class="mt-1 text-sm text-red-600"></p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <input type="text" x-model="form.type" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Potência (W)</label>
            <input type="number" x-model="form.power_watts" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Confirm -->
  <div x-show="confirmOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="confirmOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Remover dispositivo?</h3>
      <p class="text-gray-600 dark:text-gray-400 mt-2 text-sm">Esta ação não pode ser desfeita.</p>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="confirmOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancelar</button>
        <button @click="confirmDelete()" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium">Remover</button>
      </div>
    </div>
  </div>
</div>
`;
}
