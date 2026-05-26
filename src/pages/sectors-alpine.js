/**
 * LumenFlow — Sectors Page (Alpine.js + Tailwind)
 *
 * CRUD de setores com tabela, busca, modal de criação/edição, desativação.
 */

import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import Router from '../utils/router.js';

export function registerSectorsPage(Alpine) {
  Alpine.data('sectorsPage', () => ({
    sectors: [],
    devices: [],
    loading: true,
    error: null,
    search: '',
    showInactive: false,

    // Modal
    modalOpen: false,
    modalTitle: '',
    editing: null,
    form: { name: '', description: '', threshold_yellow: '', threshold_red: '' },
    formErrors: { name: '', threshold_yellow: '', threshold_red: '' },
    saving: false,

    // Confirm
    confirmOpen: false,
    confirmSector: null,
    deactivating: false,

    async init() { await this.load(); },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const [sRes, dRes] = await Promise.all([
          sectorService.list({ active: this.showInactive ? null : true }),
          deviceService.list(),
        ]);
        this.sectors = sRes?.sectors || sRes?.data || [];
        this.devices = dRes?.devices || dRes?.data || [];
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar setores.';
      } finally {
        this.loading = false;
      }
    },

    get filtered() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.sectors;
      return this.sectors.filter(s => s.name.toLowerCase().includes(q));
    },

    deviceCount(sectorId) {
      return this.devices.filter(d => d.sector_id === sectorId && d.active).length;
    },

    // ── Modal ───────────────────────────────────────────────

    openNew() {
      this.editing = null;
      this.modalTitle = 'Novo setor';
      this.form = { name: '', description: '', threshold_yellow: '', threshold_red: '' };
      this.formErrors = { name: '', threshold_yellow: '', threshold_red: '' };
      this.modalOpen = true;
    },

    openEdit(sector) {
      this.editing = sector;
      this.modalTitle = 'Editar setor';
      this.form = {
        name: sector.name || '',
        description: sector.description || '',
        threshold_yellow: sector.threshold_yellow ?? '',
        threshold_red: sector.threshold_red ?? '',
      };
      this.formErrors = { name: '', threshold_yellow: '', threshold_red: '' };
      this.modalOpen = true;
    },

    validateForm() {
      let valid = true;
      this.formErrors = { name: '', threshold_yellow: '', threshold_red: '' };

      if (!this.form.name.trim()) { this.formErrors.name = 'Campo obrigatório'; valid = false; }
      const y = this.form.threshold_yellow === '' ? null : Number(this.form.threshold_yellow);
      const r = this.form.threshold_red === '' ? null : Number(this.form.threshold_red);

      if (y !== null && (isNaN(y) || y <= 0)) { this.formErrors.threshold_yellow = 'Valor inválido'; valid = false; }
      if (r !== null && (isNaN(r) || r <= 0)) { this.formErrors.threshold_red = 'Valor inválido'; valid = false; }
      if (y !== null && r !== null && y >= r) { this.formErrors.threshold_red = 'Deve ser maior que o amarelo'; valid = false; }

      return valid;
    },

    async saveForm() {
      if (!this.validateForm()) return;
      this.saving = true;
      try {
        const payload = {
          name: this.form.name.trim(),
          description: this.form.description.trim(),
          threshold_yellow: this.form.threshold_yellow || null,
          threshold_red: this.form.threshold_red || null,
        };
        if (this.editing) {
          await sectorService.update(this.editing.id, payload);
        } else {
          await sectorService.create(payload);
        }
        Alpine.store('toast')?.show('Setor salvo com sucesso.', 'success');
        this.modalOpen = false;
        await this.load();
      } catch (err) {
        if (err?.code === 'SECTOR_NAME_EXISTS' || err?.code === 'SECTOR_NAME_TAKEN') {
          this.formErrors.name = 'Este nome já está em uso.';
        } else {
          Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
        }
      } finally {
        this.saving = false;
      }
    },

    // ── Deactivate ──────────────────────────────────────────

    askDeactivate(sector) {
      this.confirmSector = sector;
      this.confirmOpen = true;
    },

    async confirmDeactivate() {
      if (!this.confirmSector) return;
      this.deactivating = true;
      try {
        await sectorService.deactivate(this.confirmSector.id);
        Alpine.store('toast')?.show('Setor desativado.', 'success');
        this.confirmOpen = false;
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao desativar.', 'error');
      } finally {
        this.deactivating = false;
      }
    },

    toggleInactive() {
      this.showInactive = !this.showInactive;
      this.load();
    },
  }));
}

let _registered = false;

export function renderSectorsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerSectorsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="sectorsPage" class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setores</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie os setores da sua empresa</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors">Novo setor</button>
  </div>

  <!-- Toolbar -->
  <div class="flex flex-col sm:flex-row gap-3">
    <input type="text" x-model="search" placeholder="Buscar setor..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
    <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
      <input type="checkbox" :checked="showInactive" @change="toggleInactive()" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
      Mostrar inativos
    </label>
  </div>

  <!-- Loading -->
  <div x-show="loading" class="flex justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
  </div>

  <!-- Error -->
  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 hover:text-emerald-700 font-medium">Tentar novamente</button>
  </div>

  <!-- Table -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="filtered.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhum setor encontrado.</div>
    <table x-show="filtered.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Dispositivos</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Thresholds</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="sector in filtered" :key="sector.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="sector.name"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell" x-text="deviceCount(sector.id) + ' ativos'"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell" x-text="(sector.threshold_yellow || '—') + ' / ' + (sector.threshold_red || '—')"></td>
            <td class="px-4 py-3">
              <span :class="sector.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="sector.active ? 'Ativo' : 'Inativo'"></span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(sector)" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium">Editar</button>
              <button x-show="sector.active" @click="askDeactivate(sector)" class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Desativar</button>
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
          <input type="text" x-model="form.name" :class="formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
          <textarea x-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold amarelo (W)</label>
            <input type="number" x-model="form.threshold_yellow" :class="formErrors.threshold_yellow ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <p x-show="formErrors.threshold_yellow" x-text="formErrors.threshold_yellow" class="mt-1 text-sm text-red-600"></p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold vermelho (W)</label>
            <input type="number" x-model="form.threshold_red" :class="formErrors.threshold_red ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <p x-show="formErrors.threshold_red" x-text="formErrors.threshold_red" class="mt-1 text-sm text-red-600"></p>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium transition-colors flex items-center gap-2">
            <svg x-show="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Confirm Dialog -->
  <div x-show="confirmOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="confirmOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Desativar setor?</h3>
      <p class="text-gray-600 dark:text-gray-400 mt-2 text-sm" x-text="'Os dados históricos de ' + (confirmSector?.name || '') + ' serão preservados.'"></p>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="confirmOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
        <button @click="confirmDeactivate()" :disabled="deactivating" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium">Desativar</button>
      </div>
    </div>
  </div>

</div>
`;
}
