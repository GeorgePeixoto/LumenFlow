/**
 * LumenFlow — Dashboard Page Template (Alpine.js + Tailwind)
 *
 * KPIs em destaque do Firebase. Sem gráficos, sem alertas detalhados.
 * Consumo e Custo filtrados pelo setor selecionado.
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
<div x-data="dashboardPage" @beforeunload.window="destroy()" class="space-y-8 p-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p x-show="lastUpdate" x-cloak class="text-xs text-gray-400 mt-0.5" x-text="'Última atualização: ' + formatTime()"></p>
      <p x-show="selectedSector" x-cloak class="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span x-text="'Setor: ' + selectedSector?.name"></span>
      </p>
      <p x-show="!selectedSector" x-cloak class="text-sm text-gray-500 dark:text-gray-400 mt-2">Todos os setores</p>
    </div>
    <div class="flex items-center gap-3">
      <!-- Realtime indicator -->
      <div x-show="realtimePower !== null" x-cloak class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400" x-text="realtimePower + ' W'"></span>
      </div>
    </div>
  </div>

  <!-- KPI Cards — large, elegant, 2x2 on mobile, 4 on lg -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${bigKpiCard('consumption', 'Consumo', 'KWh', 'bolt', '#/financial')}
    ${bigKpiCard('cost', 'Custo', 'R$', 'dollar', '#/financial')}
    ${bigKpiCard('alerts', 'Alertas', '', 'bell', '#/alerts')}
    ${bigKpiCard('devices', 'Dispositivos', '', 'device', '#/devices')}
  </div>

  <!-- Sector detail card (visible only when a sector is selected) -->
  <div x-show="selectedSector" x-cloak class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-emerald-100 text-sm font-medium mb-1">Setor monitorado</p>
        <h2 class="text-2xl font-bold" x-text="selectedSector?.name"></h2>
      </div>
      <button @click="changeSector()" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
        Trocar setor
      </button>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-5">
      <div class="bg-white/10 rounded-xl p-4">
        <p class="text-emerald-100 text-xs font-medium mb-1">Potência atual</p>
        <p class="text-white font-bold text-xl" x-text="formatPower(selectedSector?.potencia)"></p>
      </div>
      <div class="bg-white/10 rounded-xl p-4">
        <p class="text-emerald-100 text-xs font-medium mb-1">Previsão com base na potência atual</p>
        <p class="text-white font-bold text-xl" x-text="formatSectorEnergy((selectedSector?.potencia || 0) / 1000)"></p>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Atalhos rápidos</h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${quickActionHTML('Transparência', '#/transparency', 'bolt')}
      ${quickActionHTML('Trocar setor', '#/sectors/select', 'swap')}
      ${quickActionHTML('Dispositivos', '#/devices', 'device')}
      ${quickActionHTML('Alertas', '#/alerts', 'bell')}
    </div>
  </section>

</div>
`;
}

function bigKpiCard(key, title, unit, icon, href) {
  const icons = {
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    device: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  };

  const accentColors = {
    consumption: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500', border: 'border-blue-100 dark:border-blue-800' },
    cost: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800' },
    alerts: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500', border: 'border-amber-100 dark:border-amber-800' },
    devices: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-500', border: 'border-purple-100 dark:border-purple-800' },
  };
  const accent = accentColors[key];

  // For the alerts card, add a pulse/badge when increased
  const isAlerts = key === 'alerts';

  return `
    <a href="${href}" :class="{ 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900': ${isAlerts} && kpis.${key}.increased }"
       class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block group">
      ${isAlerts ? `
      <!-- New alert pulse indicator -->
      <span x-show="kpis.${key}.increased" x-cloak
            class="absolute top-3 right-3 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
      </span>
      ` : ''}
      <!-- Icon badge -->
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} mb-4">
        <svg class="w-6 h-6 ${accent.icon}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[icon]}</svg>
      </div>
      <!-- Label -->
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">${title}</p>
      <!-- Value skeleton -->
      <div x-show="kpis.${key}.loading" class="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      <!-- Value -->
      <div x-show="!kpis.${key}.loading" x-cloak class="flex items-baseline gap-2">
        <span :class="${isAlerts} && kpis.${key}.value !== '0' ? 'text-amber-500' : 'text-gray-900 dark:text-white'"
              class="text-3xl font-bold tracking-tight" x-text="kpis.${key}.value"></span>
        ${unit ? `<span class="text-base text-gray-400 dark:text-gray-500 font-medium">${unit}</span>` : ''}
      </div>
    </a>
  `;
}


function quickActionHTML(label, href, icon) {
  const icons = {
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    device: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  };

  return `
    <a href="${href}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-center group">
      <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[icon]}</svg>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</span>
    </a>
  `;
}
