/**
 * LumenFlow — Financial Page (US10-F2)
 *
 * KPI cards, daily consumption chart, tariff config link.
 */
import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createKpiCard } from '../components/KpiCard.js';
import { createChart } from '../components/Chart.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createButton } from '../components/Button.js';
import { createSpinner } from '../components/Spinner.js';
import { createEmptyState } from '../components/EmptyState.js';
import { createErrorState } from '../components/ErrorState.js';
import { formatKwh, formatCurrency } from '../utils/formatters.js';
import { financialService } from '../services/financialService.js';
import Router from '../utils/router.js';

const ICON_BOLT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
const ICON_DOLLAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const ICON_TREND = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;

export async function renderFinancialPage(content) {
  content.innerHTML = '';

  const { el: headerEl } = createPageHeader({
    title: t('financial.title'),
    breadcrumb: [{ label: t('nav.financial') }],
  });
  content.appendChild(headerEl);

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'kpi-grid';
  content.appendChild(kpiGrid);

  const kpis = {
    accumulated: createKpiCard({ title: t('financial.kpi_accumulated'), unit: 'kWh', icon: ICON_BOLT, loading: true }),
    cost: createKpiCard({ title: t('financial.kpi_cost_accumulated'), unit: 'R$', icon: ICON_DOLLAR, loading: true }),
    projection: createKpiCard({ title: t('financial.kpi_projection'), unit: 'R$', icon: ICON_TREND, loading: true }),
  };
  Object.values(kpis).forEach((k) => kpiGrid.appendChild(k.el));

  // ── Month progress bar (US10-F1) ─────────────────────────────────
  const progressSection = document.createElement('div');
  progressSection.className = 'financial-progress';
  content.appendChild(progressSection);

  // ── Tariff link ───────────────────────────────────────────────────
  const tariffRow = document.createElement('div');
  tariffRow.className = 'financial-tariff-row';
  const tariffInfo = document.createElement('span');
  tariffInfo.className = 'financial-tariff-info';
  tariffInfo.textContent = t('financial.tariff_current') + ': —';
  tariffRow.appendChild(tariffInfo);

  const tariffBtn = createButton({ label: t('financial.tariff_manage'), variant: 'secondary', size: 'sm' });
  tariffBtn.el.addEventListener('click', () => Router.navigate('/tariffs'));
  tariffRow.appendChild(tariffBtn.el);
  content.appendChild(tariffRow);

  // ── Daily chart ───────────────────────────────────────────────────
  const chartSection = document.createElement('section');
  chartSection.className = 'financial-section';

  const chartHeader = document.createElement('div');
  chartHeader.className = 'dashboard-section__header';
  const chartTitle = document.createElement('h3');
  chartTitle.className = 'dashboard-section__title';
  chartTitle.textContent = t('financial.chart_daily_title');
  chartHeader.appendChild(chartTitle);
  chartSection.appendChild(chartHeader);

  const chartContainer = document.createElement('div');
  chartContainer.className = 'financial-chart';
  chartSection.appendChild(chartContainer);
  content.appendChild(chartSection);

  // ── Ranking section ───────────────────────────────────────────────
  const rankingSection = document.createElement('section');
  rankingSection.className = 'financial-section';
  const rankingTitle = document.createElement('h3');
  rankingTitle.className = 'dashboard-section__title';
  rankingTitle.textContent = t('financial.ranking_title');
  rankingSection.appendChild(rankingTitle);

  const rankingContainer = document.createElement('div');
  rankingContainer.className = 'financial-ranking';
  rankingSection.appendChild(rankingContainer);
  content.appendChild(rankingSection);

  // ── Load data ─────────────────────────────────────────────────────
  loadFinancialData(kpis, progressSection, tariffInfo, chartContainer, rankingContainer);
}

async function loadFinancialData(kpis, progressSection, tariffInfo, chartContainer, rankingContainer) {
  try {
    const data = await financialService.getSummary();

    kpis.accumulated.setLoading(false);
    kpis.accumulated.update({ value: formatKwh(data?.accumulated_kwh, 0).replace(' kWh', ''), variation: data?.consumption_variation });

    kpis.cost.setLoading(false);
    kpis.cost.update({ value: formatCurrency(data?.accumulated_cost).replace('R$ ', ''), variation: data?.cost_variation });

    kpis.projection.setLoading(false);
    kpis.projection.update({ value: formatCurrency(data?.projection_cost).replace('R$ ', '') });

    // Month progress (US10-F1)
    const dayOfMonth = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);
    const consumptionProgress = data?.consumption_progress ?? Math.round(((data?.accumulated_kwh || 0) / (data?.budget_kwh || 1)) * 100);

    progressSection.innerHTML = `
      <div class="financial-progress__bar-wrapper">
        <div class="financial-progress__header">
          <span>${t('financial.kpi_vs_last_month')}</span>
          <span>${monthProgress}% do mês</span>
        </div>
        <div class="financial-progress__bar">
          <div class="financial-progress__fill financial-progress__fill--time" style="width:${monthProgress}%"></div>
        </div>
        <div class="financial-progress__header" style="margin-top:var(--space-2)">
          <span>${t('financial.kpi_accumulated')}</span>
          <span>${consumptionProgress}%</span>
        </div>
        <div class="financial-progress__bar">
          <div class="financial-progress__fill financial-progress__fill--consumption ${consumptionProgress > monthProgress ? 'financial-progress__fill--over' : ''}" style="width:${Math.min(consumptionProgress, 100)}%"></div>
        </div>
      </div>
    `;

    // Tariff info
    if (data?.current_tariff) {
      tariffInfo.textContent = `${t('financial.tariff_current')}: R$ ${data.current_tariff.rate_kwh}/kWh`;
    }

    // Daily chart
    loadDailyChart(chartContainer, data);

    // Ranking
    loadRanking(rankingContainer, data);
  } catch (err) {
    Object.values(kpis).forEach((k) => { k.setLoading(false); k.update({ value: '—' }); });
    chartContainer.appendChild(createErrorState({ message: err?.message || t('common.error_generic') }).el);
  }
}

function loadDailyChart(container, data) {
  container.innerHTML = '';
  const labels = data?.daily_labels || [];
  const values = data?.daily_values || [];

  if (!labels.length) {
    container.appendChild(createEmptyState({ title: t('financial.no_data') }).el);
    return;
  }

  const chart = createChart({
    type: 'bar',
    labels,
    datasets: [
      { label: t('financial.chart_daily_avg'), data: values, color: '--color-primary-500' },
    ],
    height: '280px',
  });
  container.appendChild(chart.el);
}

function loadRanking(container, data) {
  container.innerHTML = '';
  const sectors = data?.ranking_sectors || [];

  if (!sectors.length) {
    container.appendChild(createEmptyState({
      title: t('financial.no_data'),
      action: { label: t('financial.tariff_manage'), onClick: () => Router.navigate('/tariffs') },
    }).el);
    return;
  }

  const list = document.createElement('div');
  list.className = 'financial-ranking__list';
  sectors.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'financial-ranking__item';
    item.innerHTML = `
      <span class="financial-ranking__pos">${i + 1}</span>
      <span class="financial-ranking__name">${escapeHtml(s.name)}</span>
      <span class="financial-ranking__value">${formatKwh(s.consumption_kwh, 1)}</span>
      <span class="financial-ranking__share">${s.share != null ? s.share + '%' : ''}</span>
    `;
    list.appendChild(item);
  });
  container.appendChild(list);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
