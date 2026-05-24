import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createKpiCard } from '../components/KpiCard.js';
import { createChart } from '../components/Chart.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createEmptyState } from '../components/EmptyState.js';
import { createErrorState } from '../components/ErrorState.js';
import { createSpinner } from '../components/Spinner.js';
import { createButton } from '../components/Button.js';
import { createGoalProgress } from '../components/GoalProgress.js';
import { Toast } from '../components/Toast.js';
import { sessionService } from '../services/sessionService.js';
import { dashboardService } from '../services/dashboardService.js';
import { goalService } from '../services/goalService.js';
import { formatKwh, formatCurrency } from '../utils/formatters.js';
import { connectPicker, onPeriodChange, destroyPeriodSync } from '../utils/periodSync.js';
import Router from '../utils/router.js';
import { checkGoalMilestones } from '../utils/goalMilestoneCheck.js';

const ICON_BOLT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
const ICON_DOLLAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const ICON_BELL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
const ICON_DEVICE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
const ICON_TARGET = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;

export function renderDashboardPage(content) {
  destroyPeriodSync();
  content.innerHTML = '';

  const user = sessionService.getUser();

  const { el: headerEl } = createPageHeader({
    title: t('dashboard.title'),
    description: user?.name ? t('dashboard.welcome', { name: user.name }) : '',
    breadcrumb: [{ label: t('nav.dashboard') }],
  });
  content.appendChild(headerEl);

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'kpi-grid';
  content.appendChild(kpiGrid);

  const kpis = {
    consumption: createKpiCard({ title: t('dashboard.kpi_consumption'), unit: 'kWh', icon: ICON_BOLT, loading: true, positiveIsGood: false, href: '#/financial' }),
    cost: createKpiCard({ title: t('dashboard.kpi_cost'), unit: 'R$', icon: ICON_DOLLAR, loading: true, positiveIsGood: false, href: '#/financial' }),
    alerts: createKpiCard({ title: t('dashboard.kpi_alerts'), icon: ICON_BELL, loading: true, positiveIsGood: false, href: '#/alerts' }),
    devices: createKpiCard({ title: t('dashboard.kpi_devices'), icon: ICON_DEVICE, loading: true, href: '#/devices' }),
  };

  Object.values(kpis).forEach((k) => kpiGrid.appendChild(k.el));

  // ── Goal Progress (US12-F3) ───────────────────────────────────────
  const goalProgressContainer = document.createElement('div');
  goalProgressContainer.className = 'dashboard-goal-progress';
  content.appendChild(goalProgressContainer);

  // ── Period Picker + Chart section ─────────────────────────────────
  const chartSection = document.createElement('section');
  chartSection.className = 'dashboard-section';
  content.appendChild(chartSection);

  const chartHeader = document.createElement('div');
  chartHeader.className = 'dashboard-section__header';
  const chartTitle = document.createElement('h3');
  chartTitle.className = 'dashboard-section__title';
  chartTitle.textContent = t('dashboard.chart_consumption_title');
  chartHeader.appendChild(chartTitle);

  const picker = createPeriodPicker({ onChange: connectPicker, syncUrl: true });
  chartHeader.appendChild(picker.el);
  chartSection.appendChild(chartHeader);

  const chartContainer = document.createElement('div');
  chartContainer.className = 'dashboard-chart-container';
  chartSection.appendChild(chartContainer);

  let consumptionChart = null;

  // ── Top 5 setores ─────────────────────────────────────────────────
  const sectorsSection = document.createElement('section');
  sectorsSection.className = 'dashboard-section';
  content.appendChild(sectorsSection);

  const sectorsTitle = document.createElement('h3');
  sectorsTitle.className = 'dashboard-section__title';
  sectorsTitle.textContent = t('dashboard.chart_sectors_title');
  sectorsSection.appendChild(sectorsTitle);

  const sectorsContainer = document.createElement('div');
  sectorsContainer.className = 'dashboard-chart-container';
  sectorsSection.appendChild(sectorsContainer);

  let sectorsChart = null;

  // ── Alertas recentes ──────────────────────────────────────────────
  const alertsSection = document.createElement('section');
  alertsSection.className = 'dashboard-section';
  content.appendChild(alertsSection);

  const alertsHeader = document.createElement('div');
  alertsHeader.className = 'dashboard-section__header';
  const alertsTitle = document.createElement('h3');
  alertsTitle.className = 'dashboard-section__title';
  alertsTitle.textContent = t('dashboard.recent_alerts');
  alertsHeader.appendChild(alertsTitle);

  const viewAllBtn = createButton({ label: 'Ver todos', variant: 'ghost', size: 'sm' });
  viewAllBtn.el.addEventListener('click', () => Router.navigate('/alerts'));
  alertsHeader.appendChild(viewAllBtn.el);
  alertsSection.appendChild(alertsHeader);

  const alertsList = document.createElement('div');
  alertsList.className = 'dashboard-alerts';
  alertsSection.appendChild(alertsList);

  // ── Alertas fora de horário (US07-F3) ─────────────────────────────
  const offHoursSection = document.createElement('section');
  offHoursSection.className = 'dashboard-section';
  content.appendChild(offHoursSection);

  const offHoursHeader = document.createElement('div');
  offHoursHeader.className = 'dashboard-section__header';
  const offHoursTitle = document.createElement('h3');
  offHoursTitle.className = 'dashboard-section__title';
  offHoursTitle.textContent = t('dashboard.off_hours_title');
  offHoursHeader.appendChild(offHoursTitle);

  const offHoursViewAll = createButton({ label: t('dashboard.off_hours_view_all'), variant: 'ghost', size: 'sm' });
  offHoursViewAll.el.addEventListener('click', () => Router.navigate('/alerts'));
  offHoursHeader.appendChild(offHoursViewAll.el);
  offHoursSection.appendChild(offHoursHeader);

  const offHoursList = document.createElement('div');
  offHoursList.className = 'dashboard-alerts';
  offHoursSection.appendChild(offHoursList);

  // ── Desperdício noturno (US14-F1) ─────────────────────────────────
  const nightWasteSection = document.createElement('section');
  nightWasteSection.className = 'dashboard-section';
  content.appendChild(nightWasteSection);

  const nightWasteHeader = document.createElement('div');
  nightWasteHeader.className = 'dashboard-section__header';
  const nightWasteTitle = document.createElement('h3');
  nightWasteTitle.className = 'dashboard-section__title';
  nightWasteTitle.textContent = t('dashboard.night_waste_title');
  nightWasteHeader.appendChild(nightWasteTitle);

  const nightWasteViewAll = createButton({ label: t('dashboard.night_waste_view_all'), variant: 'ghost', size: 'sm' });
  nightWasteViewAll.el.addEventListener('click', () => Router.navigate('/alerts?type=night_waste'));
  nightWasteHeader.appendChild(nightWasteViewAll.el);
  nightWasteSection.appendChild(nightWasteHeader);

  const nightWasteList = document.createElement('div');
  nightWasteList.className = 'dashboard-alerts';
  nightWasteSection.appendChild(nightWasteList);

  // ── Atalhos rápidos ───────────────────────────────────────────────
  const actionsSection = document.createElement('section');
  actionsSection.className = 'dashboard-section';
  content.appendChild(actionsSection);

  const actionsTitle = document.createElement('h3');
  actionsTitle.className = 'dashboard-section__title';
  actionsTitle.textContent = t('dashboard.quick_actions');
  actionsSection.appendChild(actionsTitle);

  const actionsGrid = document.createElement('div');
  actionsGrid.className = 'dashboard-actions';
  const shortcuts = [
    { label: t('nav.transparency'), href: '#/transparency', icon: ICON_BOLT },
    { label: t('nav.sectors'), href: '#/sectors', icon: ICON_TARGET },
    { label: t('nav.devices'), href: '#/devices', icon: ICON_DEVICE },
    { label: t('nav.alerts'), href: '#/alerts', icon: ICON_BELL },
  ];
  shortcuts.forEach(({ label, href, icon }) => {
    const link = document.createElement('a');
    link.className = 'dashboard-action-card';
    link.href = href;
    link.innerHTML = `<span class="dashboard-action-card__icon">${icon}</span><span>${label}</span>`;
    actionsGrid.appendChild(link);
  });
  actionsSection.appendChild(actionsGrid);

  // ── Load data ─────────────────────────────────────────────────────
  loadKpis(kpis);
  loadGoalProgress(goalProgressContainer);
  loadConsumptionChart(chartContainer, picker.getValue(), (c) => { consumptionChart = c; });
  loadTopSectors(sectorsContainer, (c) => { sectorsChart = c; });
  loadRecentAlerts(alertsList);
  loadOffHoursAlerts(offHoursList);
  loadNightWasteAlerts(nightWasteList);
  checkGoalMilestones();

  // ── Period sync ───────────────────────────────────────────────────
  onPeriodChange((period) => {
    if (consumptionChart) consumptionChart.destroy();
    chartContainer.innerHTML = '';
    loadConsumptionChart(chartContainer, period, (c) => { consumptionChart = c; });
  });

  // ── Cleanup on navigate ───────────────────────────────────────────
  const onHashChange = () => {
    if (!document.contains(content)) {
      destroyPeriodSync();
      if (consumptionChart) consumptionChart.destroy();
      if (sectorsChart) sectorsChart.destroy();
      window.removeEventListener('hashchange', onHashChange);
    }
  };
  window.addEventListener('hashchange', onHashChange);
}

// ── Data loaders ──────────────────────────────────────────────────────────────

async function loadKpis(kpis) {
  try {
    const data = await dashboardService.getKpis();
    kpis.consumption.setLoading(false);
    kpis.consumption.update({ value: formatKwh(data?.consumption_kwh, 0).replace(' kWh', ''), variation: data?.consumption_variation });
    kpis.cost.setLoading(false);
    kpis.cost.update({ value: formatCurrency(data?.estimated_cost).replace('R$ ', ''), variation: data?.cost_variation });
    kpis.alerts.setLoading(false);
    kpis.alerts.update({ value: String(data?.open_alerts ?? 0) });
    kpis.devices.setLoading(false);
    kpis.devices.update({ value: String(data?.active_devices ?? 0) });
  } catch (_) {
    Object.values(kpis).forEach((k) => { k.setLoading(false); k.update({ value: '—' }); });
  }
}

async function loadConsumptionChart(container, period, onReady) {
  container.innerHTML = '';
  const spinner = createSpinner({ size: 'md' });
  container.appendChild(spinner.el);

  try {
    const data = await dashboardService.getConsumptionChart({
      from: period?.from,
      to: period?.to,
      granularity: period?.granularity,
    });

    container.innerHTML = '';
    const labels = data?.labels || [];
    const values = data?.values || [];

    if (!labels.length) {
      const empty = createEmptyState({ title: t('dashboard.no_data') });
      container.appendChild(empty.el);
      return;
    }

    const chart = createChart({
      type: 'area',
      labels,
      datasets: [{ label: t('dashboard.kpi_consumption'), data: values, color: '--color-primary-500' }],
      height: '280px',
    });
    container.appendChild(chart.el);
    onReady(chart);
  } catch (error) {
    container.innerHTML = '';
    const err = createErrorState({
      message: error?.message || t('common.error_generic'),
      onRetry: () => loadConsumptionChart(container, period, onReady),
    });
    container.appendChild(err.el);
  }
}

async function loadTopSectors(container, onReady) {
  container.innerHTML = '';
  const spinner = createSpinner({ size: 'md' });
  container.appendChild(spinner.el);

  try {
    const data = await dashboardService.getTopSectors();
    container.innerHTML = '';
    const sectors = data?.sectors || data || [];

    if (!sectors.length) {
      const empty = createEmptyState({ title: t('dashboard.no_data') });
      container.appendChild(empty.el);
      return;
    }

    const labels = sectors.map((s) => s.name);
    const values = sectors.map((s) => s.consumption_kwh ?? s.consumption ?? 0);

    const chart = createChart({
      type: 'bar',
      labels,
      datasets: [{ label: 'kWh', data: values, color: '--color-secondary-500' }],
      height: '250px',
      options: { indexAxis: 'y' },
    });
    container.appendChild(chart.el);
    onReady(chart);
  } catch (error) {
    container.innerHTML = '';
    const err = createErrorState({
      message: error?.message || t('common.error_generic'),
      onRetry: () => loadTopSectors(container, onReady),
    });
    container.appendChild(err.el);
  }
}

async function loadRecentAlerts(container) {
  container.innerHTML = '';
  const spinner = createSpinner({ size: 'sm' });
  container.appendChild(spinner.el);

  try {
    const data = await dashboardService.getRecentAlerts();
    container.innerHTML = '';
    const alerts = data?.alerts || data?.data || data || [];

    if (!alerts.length) {
      const p = document.createElement('p');
      p.className = 'dashboard-alerts__empty';
      p.textContent = t('dashboard.no_alerts');
      container.appendChild(p);
      return;
    }

    alerts.slice(0, 5).forEach((alert) => {
      const item = document.createElement('div');
      item.className = `dashboard-alert-item dashboard-alert-item--${alert.severity || 'medium'}`;
      item.innerHTML = `
        <span class="dashboard-alert-item__dot"></span>
        <div class="dashboard-alert-item__content">
          <span class="dashboard-alert-item__title">${escapeHtml(alert.title || alert.message || 'Alerta')}</span>
          <span class="dashboard-alert-item__meta">${escapeHtml(alert.device_name || '')} ${alert.created_at ? '— ' + new Date(alert.created_at).toLocaleDateString('pt-BR') : ''}</span>
        </div>
      `;
      item.addEventListener('click', () => Router.navigate('/alerts'));
      container.appendChild(item);
    });
  } catch (_) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'dashboard-alerts__empty';
    p.textContent = t('dashboard.no_alerts');
    container.appendChild(p);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadOffHoursAlerts(container) {
  container.innerHTML = '';
  const spinner = createSpinner({ size: 'sm' });
  container.appendChild(spinner.el);

  try {
    const data = await dashboardService.getOffHoursAlerts({ limit: 5 });
    container.innerHTML = '';
    const alerts = data?.alerts || data?.data || data || [];
    const total = data?.total ?? alerts.length;

    if (!alerts.length) {
      const p = document.createElement('p');
      p.className = 'dashboard-alerts__empty';
      p.textContent = t('dashboard.off_hours_empty');
      container.appendChild(p);
      return;
    }

    // Count badge
    const countBadge = document.createElement('p');
    countBadge.className = 'dashboard-off-hours__count';
    countBadge.textContent = t('dashboard.off_hours_count', { count: total });
    container.appendChild(countBadge);

    alerts.slice(0, 5).forEach((alert) => {
      const item = document.createElement('div');
      item.className = `dashboard-alert-item dashboard-alert-item--${alert.severity || 'medium'}`;
      item.innerHTML = `
        <span class="dashboard-alert-item__dot"></span>
        <div class="dashboard-alert-item__content">
          <span class="dashboard-alert-item__title">${escapeHtml(alert.title || alert.message || t('alerts.types.off_hours'))}</span>
          <span class="dashboard-alert-item__meta">${escapeHtml(alert.device_name || alert.sector_name || '')} ${alert.created_at ? '— ' + new Date(alert.created_at).toLocaleDateString('pt-BR') : ''}</span>
        </div>
      `;
      item.addEventListener('click', () => Router.navigate('/alerts'));
      container.appendChild(item);
    });
  } catch (_) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'dashboard-alerts__empty';
    p.textContent = t('dashboard.off_hours_empty');
    container.appendChild(p);
  }
}

async function loadGoalProgress(container) {
  try {
    const response = await goalService.list({ status: 'active' });
    const goals = response?.goals || response?.data || response || [];

    if (!goals.length) return;

    // Show up to 2 most relevant goals
    const topGoals = goals.slice(0, 2);
    topGoals.forEach((goal) => {
      const label = goal.name || getDashboardScopeLabel(goal);
      const progress = createGoalProgress({
        label,
        current: goal.current_value ?? 0,
        target: goal.value ?? 1,
        unit: goal.unit === 'brl' ? 'R$' : 'kWh',
        projection: goal.projection,
        milestoneWarning: goal.milestone_warning ?? 80,
        milestoneCritical: goal.milestone_critical ?? 100,
      });
      container.appendChild(progress.el);
    });
  } catch (_) {
    // Silently skip — goal progress is non-critical
  }
}

function getDashboardScopeLabel(goal) {
  if (goal.scope === 'sector') return goal.sector_name || t('goals.scope_sector');
  if (goal.scope === 'device') return goal.device_name || t('goals.scope_device');
  return t('goals.scope_company');
}

async function loadNightWasteAlerts(container) {
  container.innerHTML = '';
  const spinner = createSpinner({ size: 'sm' });
  container.appendChild(spinner.el);

  try {
    const data = await dashboardService.getNightWasteAlerts({ limit: 5 });
    container.innerHTML = '';
    const alerts = data?.alerts || data?.data || data || [];
    const total = data?.total ?? alerts.length;

    if (!alerts.length) {
      const p = document.createElement('p');
      p.className = 'dashboard-alerts__empty';
      p.textContent = t('dashboard.night_waste_empty');
      container.appendChild(p);
      return;
    }

    const countBadge = document.createElement('p');
    countBadge.className = 'dashboard-off-hours__count';
    countBadge.textContent = t('dashboard.night_waste_count', { count: total });
    container.appendChild(countBadge);

    alerts.slice(0, 5).forEach((alert) => {
      const item = document.createElement('div');
      item.className = `dashboard-alert-item dashboard-alert-item--${alert.severity || 'medium'}`;
      item.innerHTML = `
        <span class="dashboard-alert-item__dot"></span>
        <div class="dashboard-alert-item__content">
          <span class="dashboard-alert-item__title">${escapeHtml(alert.title || alert.message || t('alerts.types.night_waste'))}</span>
          <span class="dashboard-alert-item__meta">${escapeHtml(alert.device_name || alert.sector_name || '')} ${alert.created_at ? '— ' + new Date(alert.created_at).toLocaleDateString('pt-BR') : ''}</span>
        </div>
      `;
      item.addEventListener('click', () => Router.navigate('/alerts?type=night_waste'));
      container.appendChild(item);
    });
  } catch (_) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'dashboard-alerts__empty';
    p.textContent = t('dashboard.night_waste_empty');
    container.appendChild(p);
  }
}
