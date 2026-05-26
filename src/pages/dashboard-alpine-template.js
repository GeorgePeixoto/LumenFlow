/**
 * LumenFlow — Dashboard Page Template (Alpine.js + Tailwind)
 *
 * Renderiza o HTML do dashboard com Alpine directives.
 */

import { registerDashboardPage } from './dashboard-alpine.js';

let _registered = false;

export function renderDashboardPageAlpine(container) {
  if (!_registered && window.Alpine) {
    registerDashboardPage(window.Alpine);
    _registered = true;
  }

  container.innerHTML = getDashboardHTML();
  window.Alpine?.initTree(container);
}

function getDashboardHTML() {
  return `
<div x-data="dashboardPage" class="space-y-6 p-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p x-show="userName" x-text="'Bem-vindo, ' + userName" class="text-sm text-gray-500 dark:text-gray-400 mt-1"></p>
    </div>
    <div x-show="realtimePower !== null" x-cloak class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400" x-text="realtimePower + ' W'"></span>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    ${kpiCardHTML('kpis.consumption', 'Consumo', 'kWh', 'bolt', '#/financial', false)}
    ${kpiCardHTML('kpis.cost', 'Custo', 'R$', 'dollar', '#/financial', false)}
    ${kpiCardHTML('kpis.alerts', 'Alertas', '', 'bell', '#/alerts', false)}
    ${kpiCardHTML('kpis.devices', 'Dispositivos', '', 'device', '#/devices', true)}
  </div>

  <!-- Goal Progress -->
  <template x-if="goals.length > 0">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <template x-for="goal in goals" :key="goal.name">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300" x-text="goal.name"></span>
            <span class="text-xs text-gray-500 dark:text-gray-400" x-text="goal.current + ' / ' + goal.target + ' ' + goal.unit"></span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              class="h-2.5 rounded-full transition-all duration-500"
              :class="goal.progress >= 100 ? 'bg-red-500' : goal.progress >= 80 ? 'bg-yellow-500' : 'bg-emerald-500'"
              :style="'width: ' + Math.min(100, goal.progress) + '%'"
            ></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" x-text="goal.progress + '% da meta'"></p>
        </div>
      </template>
    </div>
  </template>

  <!-- Consumption Chart -->
  <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Consumo por período</h3>
      <select
        x-model="period"
        @change="onPeriodChange(period)"
        class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      >
        <option value="today">Hoje</option>
        <option value="last7">Últimos 7 dias</option>
        <option value="last30">Últimos 30 dias</option>
      </select>
    </div>

    <!-- Loading -->
    <div x-show="chartLoading" class="flex items-center justify-center h-64">
      <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>

    <!-- Error -->
    <div x-show="chartError && !chartLoading" x-cloak class="flex flex-col items-center justify-center h-64 text-center">
      <svg class="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <p class="text-gray-600 dark:text-gray-400 text-sm" x-text="chartError"></p>
      <button @click="loadChart()" class="mt-3 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Tentar novamente</button>
    </div>

    <!-- Empty -->
    <div x-show="chartEmpty && !chartLoading && !chartError" x-cloak class="flex flex-col items-center justify-center h-64 text-center">
      <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Nenhum dado no período</p>
    </div>

    <!-- Chart Canvas -->
    <div x-show="chartData && !chartLoading && !chartError && !chartEmpty" x-cloak class="h-64">
      <canvas x-ref="consumptionChart"></canvas>
    </div>
  </section>

  <!-- Two-column: Top Sectors + Recent Alerts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Top Sectors -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Setores</h3>

      <div x-show="sectorsLoading" class="flex items-center justify-center h-48">
        <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <div x-show="sectorsError && !sectorsLoading" x-cloak class="flex flex-col items-center justify-center h-48 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-sm" x-text="sectorsError"></p>
        <button @click="loadTopSectors()" class="mt-3 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Tentar novamente</button>
      </div>

      <div x-show="sectorsEmpty && !sectorsLoading && !sectorsError" x-cloak class="flex items-center justify-center h-48">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Nenhum dado disponível</p>
      </div>

      <div x-show="sectorsData && !sectorsLoading && !sectorsError && !sectorsEmpty" x-cloak class="h-48">
        <canvas x-ref="sectorsChart"></canvas>
      </div>
    </section>

    <!-- Recent Alerts -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alertas recentes</h3>
        <button @click="goTo('/alerts')" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>

      <div x-show="recentAlertsLoading" class="flex items-center justify-center h-40">
        <svg class="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <div x-show="!recentAlertsLoading && recentAlerts.length === 0" x-cloak class="flex items-center justify-center h-40">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Nenhum alerta aberto</p>
      </div>

      <div x-show="!recentAlertsLoading && recentAlerts.length > 0" x-cloak class="space-y-3">
        <template x-for="alert in recentAlerts" :key="alert.title + alert.meta">
          <div @click="goTo('/alerts')" class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
            <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="severityDotClass(alert.severity)"></span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" x-text="alert.title"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="alert.meta"></p>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>

  <!-- Off-hours + Night Waste -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    ${alertSectionHTML('offHours', 'Alertas fora de horário', 'offHoursAlerts', 'offHoursLoading', 'offHoursCount', '/alerts', 'Nenhum alerta fora de horário')}
    ${alertSectionHTML('nightWaste', 'Desperdício noturno', 'nightWasteAlerts', 'nightWasteLoading', 'nightWasteCount', '/alerts?type=night_waste', 'Nenhum desperdício detectado')}
  </div>

  <!-- Quick Actions -->
  <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atalhos rápidos</h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${quickActionHTML('Transparência', '#/transparency', 'bolt')}
      ${quickActionHTML('Setores', '#/sectors', 'target')}
      ${quickActionHTML('Dispositivos', '#/devices', 'device')}
      ${quickActionHTML('Alertas', '#/alerts', 'bell')}
    </div>
  </section>

</div>
`;
}

function kpiCardHTML(dataPath, title, unit, icon, href, positiveIsGood) {
  const icons = {
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    device: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  };

  return `
    <a href="${href}" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow block">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">${title}</span>
        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[icon]}</svg>
      </div>
      <div x-show="${dataPath}.loading" class="h-8 flex items-center">
        <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div x-show="!${dataPath}.loading" x-cloak>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-gray-900 dark:text-white" x-text="${dataPath}.value"></span>
          <span class="text-sm text-gray-500 dark:text-gray-400">${unit}</span>
        </div>
        <p x-show="${dataPath}.variation != null" x-cloak class="text-xs mt-1" :class="variationClass(${dataPath}.variation, ${positiveIsGood})" x-text="variationText(${dataPath}.variation)"></p>
      </div>
    </a>
  `;
}

function alertSectionHTML(id, title, dataVar, loadingVar, countVar, href, emptyMsg) {
  return `
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
        <button @click="goTo('${href}')" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>

      <div x-show="${loadingVar}" class="flex items-center justify-center h-32">
        <svg class="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <div x-show="!${loadingVar} && ${dataVar}.length === 0" x-cloak class="flex items-center justify-center h-32">
        <p class="text-gray-500 dark:text-gray-400 text-sm">${emptyMsg}</p>
      </div>

      <div x-show="!${loadingVar} && ${dataVar}.length > 0" x-cloak>
        <p x-show="${countVar} > 0" class="text-xs text-gray-500 dark:text-gray-400 mb-3" x-text="${countVar} + ' ocorrência(s) no período'"></p>
        <div class="space-y-2">
          <template x-for="alert in ${dataVar}" :key="alert.title + alert.meta">
            <div @click="goTo('${href}')" class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
              <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="severityDotClass(alert.severity)"></span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" x-text="alert.title"></p>
                <p class="text-xs text-gray-500 dark:text-gray-400" x-text="alert.meta"></p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  `;
}

function quickActionHTML(label, href, icon) {
  const icons = {
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    device: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  };

  return `
    <a href="${href}" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-center">
      <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[icon]}</svg>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</span>
    </a>
  `;
}
