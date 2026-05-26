/**
 * LumenFlow — Goals Page (Alpine.js + Tailwind)
 *
 * CRUD de metas com progresso visual e projeções.
 */

import { goalService } from '../services/goalService.js';
import Router from '../utils/router.js';

export function registerGoalsPage(Alpine) {
  Alpine.data('goalsPage', () => ({
    goals: [],
    loading: true,
    error: null,
    filterStatus: 'active',

    modalOpen: false,
    editing: null,
    form: { name: '', scope: 'global', unit: 'kwh', value: '', period_start: '', period_end: '' },
    formErrors: {},
    saving: false,

    async init() { await this.load(); },

    async load() {
      this.loading = true;
      this.error = null;
      try {
        const res = await goalService.list({ status: this.filterStatus || undefined });
        this.goals = res?.data || res?.goals || res || [];
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar metas.';
      } finally {
        this.loading = false;
      }
    },

    progress(goal) {
      if (!goal.value) return 0;
      return Math.min(100, Math.round(((goal.current_value || 0) / goal.value) * 100));
    },

    progressColor(pct) {
      if (pct >= 100) return 'bg-red-500';
      if (pct >= 80) return 'bg-yellow-500';
      return 'bg-emerald-500';
    },

    openNew() {
      this.editing = null;
      this.form = { name: '', scope: 'global', unit: 'kwh', value: '', period_start: '', period_end: '' };
      this.formErrors = {};
      this.modalOpen = true;
    },

    openEdit(goal) {
      this.editing = goal;
      this.form = { name: goal.name, scope: goal.scope, unit: goal.unit, value: goal.value, period_start: goal.period_start?.slice(0, 10) || '', period_end: goal.period_end?.slice(0, 10) || '' };
      this.formErrors = {};
      this.modalOpen = true;
    },

    async saveForm() {
      this.formErrors = {};
      if (!this.form.name.trim()) { this.formErrors.name = 'Campo obrigatório'; return; }
      if (!this.form.value || Number(this.form.value) <= 0) { this.formErrors.value = 'Valor inválido'; return; }

      this.saving = true;
      try {
        const payload = { ...this.form, value: Number(this.form.value) };
        if (this.editing) await goalService.update(this.editing.id, payload);
        else await goalService.create(payload);
        Alpine.store('toast')?.show('Meta salva.', 'success');
        this.modalOpen = false;
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro ao salvar.', 'error');
      } finally {
        this.saving = false;
      }
    },

    async deleteGoal(goal) {
      if (!confirm('Remover esta meta?')) return;
      try {
        await goalService.delete(goal.id);
        Alpine.store('toast')?.show('Meta removida.', 'success');
        await this.load();
      } catch (err) {
        Alpine.store('toast')?.show(err?.message || 'Erro.', 'error');
      }
    },
  }));
}

let _registered = false;

export function renderGoalsPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerGoalsPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = `
<div x-data="goalsPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Metas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Acompanhe o progresso das metas de consumo</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Nova meta</button>
  </div>

  <div class="flex gap-3">
    <select x-model="filterStatus" @change="load()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todas</option>
      <option value="active">Ativas</option>
      <option value="completed">Concluídas</option>
      <option value="expired">Expiradas</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="goals.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">Nenhuma meta encontrada.</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <template x-for="goal in goals" :key="goal.id">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-semibold text-gray-900 dark:text-white" x-text="goal.name"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="goal.scope + ' • ' + goal.unit"></p>
            </div>
            <div class="flex gap-1">
              <button @click="openEdit(goal)" class="p-1 text-gray-400 hover:text-emerald-600"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button @click="deleteGoal(goal)" class="p-1 text-gray-400 hover:text-red-600"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600 dark:text-gray-400" x-text="(goal.current_value || 0) + ' / ' + goal.value + ' ' + goal.unit"></span>
            <span class="font-medium" :class="progress(goal) >= 100 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'" x-text="progress(goal) + '%'"></span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="h-2 rounded-full transition-all" :class="progressColor(progress(goal))" :style="'width:' + progress(goal) + '%'"></div>
          </div>
          <p x-show="goal.period_end" class="text-xs text-gray-400 mt-2" x-text="'Até ' + (goal.period_end?.slice(0,10) || '')"></p>
        </div>
      </template>
    </div>
  </div>

  <!-- Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="editing ? 'Editar meta' : 'Nova meta'"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label><input type="text" x-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Escopo</label><select x-model="form.scope" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="global">Global</option><option value="sector">Setor</option><option value="device">Dispositivo</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label><select x-model="form.unit" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="kwh">kWh</option><option value="brl">R$</option><option value="percent">%</option></select></div>
        </div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor alvo</label><input type="number" x-model="form.value" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.value" x-text="formErrors.value" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label><input type="date" x-model="form.period_start" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label><input type="date" x-model="form.period_end" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
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
}
