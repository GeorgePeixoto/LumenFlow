/**
 * LumenFlow — Tariffs Page (Alpine.js + Tailwind)
 *
 * CRUD de tarifas de energia.
 */

import { httpClient } from '../services/httpClient.js';

export function registerTariffsPage(Alpine) {
  Alpine.data('tariffsPage', () => ({
    tariffs: [],
    loading: true,
    error: null,

    modalOpen: false,
    editing: null,
    form: { name: '', type: 'conventional', value_kwh: '', flag_color: 'green', active: true },
    formErrors: {},
    saving: false,

    async init() { await this.load(); },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const res = await httpClient.get('/api/tariffs');
        this.tariffs = res?.data || res || [];
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar tarifas.';
      } finally {
        this.loading = false;
      }
    },

    flagLabel(color) {
      const map = { green: 'Verde', yellow: 'Amarela', red1: 'Vermelha 1', red2: 'Vermelha 2' };
      return map[color] || color;
    },

    flagClass(color) {
      const map = { green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', red1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', red2: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' };
      return map[color] || map.green;
    },

    openNew() {
      this.editing = null;
      this.form = { name: '', type: 'conventional', value_kwh: '', flag_color: 'green', active: true };
      this.formErrors = {};
      this.modalOpen = true;
    },

    openEdit(tariff) {
      this.editing = tariff;
      this.form = { name: tariff.name, type: tariff.type || 'conventional', value_kwh: tariff.value_kwh, flag_color: tariff.flag_color || 'green', active: tariff.active };
      this.formErrors = {};
      this.modalOpen = true;
    },

    async saveForm() {
      this.formErrors = {};
      if (!this.form.name.trim()) { this.formErrors.name = 'Campo obrigatório'; return; }
      if (!this.form.value_kwh || Number(this.form.value_kwh) <= 0) { this.formErrors.value_kwh = 'Valor inválido'; return; }

      this.saving = true;
      try {
        const payload = { ...this.form, value_kwh: Number(this.form.value_kwh) };
        if (this.editing) await httpClient.put(`/api/tariffs/${this.editing.id}`, payload);
        else await httpClient.post('/api/tariffs', payload);
        Alpine.store('toast')?.show('Tarifa salva.', 'success');
        this.modalOpen = false;
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
      } finally {
        this.saving = false;
      }
    },

    async deleteTariff(tariff) {
      if (!confirm('Remover esta tarifa?')) return;
      try {
        await httpClient.delete(`/api/tariffs/${tariff.id}`);
        Alpine.store('toast')?.show('Tarifa removida.', 'success');
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro.', 'error');
      }
    },
  }));
}

let _registered = false;

export function renderTariffsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerTariffsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="tariffsPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tarifas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie as tarifas de energia</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Nova tarifa</button>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="tariffs.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhuma tarifa cadastrada.</div>
    <table x-show="tariffs.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Valor/kWh</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Bandeira</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="tariff in tariffs" :key="tariff.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="tariff.name"></td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300" x-text="'R$ ' + Number(tariff.value_kwh).toFixed(4)"></td>
            <td class="px-4 py-3 hidden sm:table-cell"><span :class="flagClass(tariff.flag_color)" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="flagLabel(tariff.flag_color)"></span></td>
            <td class="px-4 py-3 hidden sm:table-cell"><span :class="tariff.active ? 'text-emerald-600' : 'text-gray-400'" x-text="tariff.active ? 'Ativa' : 'Inativa'"></span></td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(tariff)" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium">Editar</button>
              <button @click="deleteTariff(tariff)" class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Remover</button>
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
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="editing ? 'Editar tarifa' : 'Nova tarifa'"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label><input type="text" x-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor por kWh (R$)</label><input type="number" step="0.0001" x-model="form.value_kwh" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.value_kwh" x-text="formErrors.value_kwh" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bandeira</label><select x-model="form.flag_color" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="green">Verde</option><option value="yellow">Amarela</option><option value="red1">Vermelha 1</option><option value="red2">Vermelha 2</option></select></div>
          <div class="flex items-end"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" x-model="form.active" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span class="text-sm text-gray-700 dark:text-gray-300">Ativa</span></label></div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
  window.Alpine?.initTree(container);
}
