import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createButton } from '../components/Button.js';
import { createEmptyState } from '../components/EmptyState.js';
import { createErrorState } from '../components/ErrorState.js';
import { Toast } from '../components/Toast.js';
import { sectorService } from '../services/sectorService.js';
import { sessionService } from '../services/sessionService.js';
import { formatWatts } from '../utils/formatters.js';

const POLL_INTERVAL_MS = 15000;

const ICON_CHECK = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_ALERT = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_DANGER = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
const ICON_TV = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`;
const ICON_LOGO = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
const ICON_CLOSE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function getStatus(consumption, sector) {
  const yellow = sector.threshold_yellow;
  const red = sector.threshold_red;
  if (red != null && consumption >= red) return 'critical';
  if (yellow != null && consumption >= yellow) return 'warning';
  return 'normal';
}

function getStatusLabel(status) {
  if (status === 'critical') return t('transparency.status_critical');
  if (status === 'warning') return t('transparency.status_warning');
  return t('transparency.status_normal');
}

function getStatusIcon(status) {
  if (status === 'critical') return ICON_DANGER;
  if (status === 'warning') return ICON_ALERT;
  return ICON_CHECK;
}

function formatRelativeTime(date) {
  if (!date) return '—';
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'agora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour}h`;
  return date.toLocaleDateString('pt-BR');
}

function formatConsumption(consumption) {
  if (consumption >= 1000) {
    return { value: (consumption / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }), unit: 'kW' };
  }
  return { value: consumption.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), unit: 'W' };
}

function createSectorCard(sector) {
  const consumption = sector.current_consumption ?? 0;
  const status = getStatus(consumption, sector);
  const lastUpdate = sector.last_reading_at ? new Date(sector.last_reading_at) : null;

  const card = document.createElement('article');
  card.className = `transparency-card transparency-card--${status}`;
  card.setAttribute('aria-label', `${sector.name} — ${getStatusLabel(status)}`);
  card.dataset.sectorId = sector.id;

  const header = document.createElement('div');
  header.className = 'transparency-card__header';

  const semaphore = document.createElement('div');
  semaphore.className = `transparency-card__semaphore transparency-card__semaphore--${status}`;
  const iconSpan = document.createElement('span');
  iconSpan.className = 'transparency-card__semaphore-icon';
  iconSpan.innerHTML = getStatusIcon(status);
  semaphore.appendChild(iconSpan);
  header.appendChild(semaphore);

  const nameCol = document.createElement('div');
  const nameEl = document.createElement('h3');
  nameEl.className = 'transparency-card__name';
  nameEl.textContent = sector.name;
  nameCol.appendChild(nameEl);

  const badge = document.createElement('span');
  badge.className = `transparency-card__status-label transparency-card__status-label--${status}`;
  badge.textContent = getStatusLabel(status);
  nameCol.appendChild(badge);

  header.appendChild(nameCol);
  card.appendChild(header);

  const consumptionRow = document.createElement('div');
  consumptionRow.className = 'transparency-card__consumption';
  const valueEl = document.createElement('span');
  valueEl.className = 'transparency-card__value';
  const unitEl = document.createElement('span');
  unitEl.className = 'transparency-card__unit';
  const fmt = formatConsumption(consumption);
  valueEl.textContent = fmt.value;
  unitEl.textContent = fmt.unit;
  consumptionRow.appendChild(valueEl);
  consumptionRow.appendChild(unitEl);
  card.appendChild(consumptionRow);

  const thresholds = document.createElement('div');
  thresholds.className = 'transparency-card__thresholds';
  if (sector.threshold_yellow != null) {
    const span = document.createElement('span');
    span.textContent = t('transparency.threshold_warning', { value: formatWatts(sector.threshold_yellow) });
    thresholds.appendChild(span);
  }
  if (sector.threshold_red != null) {
    const span = document.createElement('span');
    span.textContent = t('transparency.threshold_critical', { value: formatWatts(sector.threshold_red) });
    thresholds.appendChild(span);
  }
  card.appendChild(thresholds);

  const timestampEl = document.createElement('div');
  timestampEl.className = 'transparency-card__timestamp';
  timestampEl.textContent = t('transparency.last_update', { time: formatRelativeTime(lastUpdate) });
  card.appendChild(timestampEl);

  return { el: card, status };
}

function updateSectorCard(card, sector, previousStatuses) {
  const consumption = sector.current_consumption ?? 0;
  const newStatus = getStatus(consumption, sector);
  const oldStatus = previousStatuses.get(sector.id);
  const lastUpdate = sector.last_reading_at ? new Date(sector.last_reading_at) : null;

  card.className = `transparency-card transparency-card--${newStatus}`;
  card.setAttribute('aria-label', `${sector.name} — ${getStatusLabel(newStatus)}`);

  const semaphore = card.querySelector('.transparency-card__semaphore');
  semaphore.className = `transparency-card__semaphore transparency-card__semaphore--${newStatus}`;
  semaphore.querySelector('.transparency-card__semaphore-icon').innerHTML = getStatusIcon(newStatus);

  const badgeEl = card.querySelector('.transparency-card__status-label');
  badgeEl.className = `transparency-card__status-label transparency-card__status-label--${newStatus}`;
  badgeEl.textContent = getStatusLabel(newStatus);

  const fmt = formatConsumption(consumption);
  card.querySelector('.transparency-card__value').textContent = fmt.value;
  card.querySelector('.transparency-card__unit').textContent = fmt.unit;

  card.querySelector('.transparency-card__timestamp').textContent =
    t('transparency.last_update', { time: formatRelativeTime(lastUpdate) });

  if (newStatus === 'critical' && oldStatus !== 'critical') {
    Toast.show({
      message: t('transparency.alert_critical', { name: sector.name }),
      type: 'error',
      duration: 8000,
    });
  }

  previousStatuses.set(sector.id, newStatus);
}

function createLoadingCards(count = 6) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const card = document.createElement('article');
    card.className = 'transparency-card transparency-card--loading';
    card.innerHTML = `
      <div class="transparency-card__header">
        <div class="transparency-card__semaphore"><span class="transparency-card__semaphore-icon"></span></div>
        <div>
          <h3 class="transparency-card__name">Carregando setor</h3>
          <span class="transparency-card__status-label">Status</span>
        </div>
      </div>
      <div class="transparency-card__consumption">
        <span class="transparency-card__value">0000</span>
        <span class="transparency-card__unit">kW</span>
      </div>
      <div class="transparency-card__thresholds">Limite: ...</div>
      <div class="transparency-card__timestamp">Atualizado ...</div>
    `;
    fragment.appendChild(card);
  }
  return fragment;
}

// ── Polling state ─────────────────────────────────────────────────────────────
let _pollTimer = null;
let _aborted = false;

function stopPolling() {
  _aborted = true;
  if (_pollTimer != null) {
    clearInterval(_pollTimer);
    _pollTimer = null;
  }
}

// ── TV Mode ───────────────────────────────────────────────────────────────────
let _tvOverlay = null;
let _clockTimer = null;

function createTvOverlay(grid) {
  const overlay = document.createElement('div');
  overlay.className = 'tv-overlay';

  // Header
  const hdr = document.createElement('div');
  hdr.className = 'tv-overlay__header';

  const brand = document.createElement('div');
  brand.className = 'tv-overlay__brand';
  const logo = document.createElement('span');
  logo.className = 'tv-overlay__logo';
  logo.innerHTML = ICON_LOGO;
  brand.appendChild(logo);
  const company = document.createElement('span');
  company.className = 'tv-overlay__company';
  const user = sessionService.getUser();
  company.textContent = user?.company_name || 'EnergyFlow';
  brand.appendChild(company);
  hdr.appendChild(brand);

  const clock = document.createElement('span');
  clock.className = 'tv-overlay__clock';
  clock.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  hdr.appendChild(clock);

  const exitBtn = document.createElement('button');
  exitBtn.className = 'tv-overlay__exit';
  exitBtn.innerHTML = `${ICON_CLOSE} <span>${t('transparency.exit_tv_mode')}</span>`;
  exitBtn.addEventListener('click', closeTvMode);
  hdr.appendChild(exitBtn);

  overlay.appendChild(hdr);

  // Body — clone the grid
  const body = document.createElement('div');
  body.className = 'tv-overlay__body';
  const tvGrid = grid.cloneNode(true);
  tvGrid.id = 'tv-grid';
  body.appendChild(tvGrid);
  overlay.appendChild(body);

  // Footer — legend
  const footer = document.createElement('div');
  footer.className = 'tv-overlay__footer';

  const legend = document.createElement('div');
  legend.className = 'tv-overlay__legend';
  const items = [
    { cls: 'normal', label: t('transparency.legend_normal') },
    { cls: 'warning', label: t('transparency.legend_warning') },
    { cls: 'critical', label: t('transparency.legend_critical') },
  ];
  items.forEach(({ cls, label }) => {
    const item = document.createElement('span');
    item.className = 'tv-overlay__legend-item';
    item.innerHTML = `<span class="tv-overlay__legend-dot tv-overlay__legend-dot--${cls}"></span>${label}`;
    legend.appendChild(item);
  });
  footer.appendChild(legend);

  const calcNote = document.createElement('span');
  calcNote.textContent = t('transparency.legend_calc');
  footer.appendChild(calcNote);

  overlay.appendChild(footer);

  // Clock interval
  _clockTimer = setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, 1000);

  // ESC to close
  overlay._onKeyDown = (e) => { if (e.key === 'Escape') closeTvMode(); };
  document.addEventListener('keydown', overlay._onKeyDown);

  return overlay;
}

function openTvMode(grid) {
  if (_tvOverlay) return;
  _tvOverlay = createTvOverlay(grid);
  document.body.appendChild(_tvOverlay);
  document.body.style.overflow = 'hidden';
}

function closeTvMode() {
  if (!_tvOverlay) return;
  if (_clockTimer) { clearInterval(_clockTimer); _clockTimer = null; }
  if (_tvOverlay._onKeyDown) document.removeEventListener('keydown', _tvOverlay._onKeyDown);
  _tvOverlay.remove();
  _tvOverlay = null;
  document.body.style.overflow = '';
}

// ── Sync TV grid on poll ──────────────────────────────────────────────────────
function syncTvGrid(sectors, previousStatuses) {
  if (!_tvOverlay) return;
  const tvGrid = _tvOverlay.querySelector('#tv-grid');
  if (!tvGrid) return;

  sectors.forEach((sector) => {
    const card = tvGrid.querySelector(`[data-sector-id="${sector.id}"]`);
    if (card) {
      updateSectorCard(card, sector, previousStatuses);
    } else {
      const { el } = createSectorCard(sector);
      tvGrid.appendChild(el);
    }
  });

  const sectorIds = new Set(sectors.map((s) => String(s.id)));
  tvGrid.querySelectorAll('[data-sector-id]').forEach((card) => {
    if (!sectorIds.has(card.dataset.sectorId)) card.remove();
  });
}

// ── Legend component ──────────────────────────────────────────────────────────

function createLegend() {
  const container = document.createElement('aside');
  container.className = 'transparency-legend';
  container.setAttribute('aria-label', t('transparency.legend_title'));

  const title = document.createElement('h4');
  title.className = 'transparency-legend__title';
  title.textContent = t('transparency.legend_title');
  container.appendChild(title);

  const items = document.createElement('div');
  items.className = 'transparency-legend__items';

  const levels = [
    { cls: 'normal', label: t('transparency.status_normal'), desc: t('transparency.legend_normal') },
    { cls: 'warning', label: t('transparency.status_warning'), desc: t('transparency.legend_warning') },
    { cls: 'critical', label: t('transparency.status_critical'), desc: t('transparency.legend_critical') },
  ];

  levels.forEach(({ cls, label, desc }) => {
    const item = document.createElement('div');
    item.className = 'transparency-legend__item';

    const dot = document.createElement('span');
    dot.className = `transparency-legend__dot transparency-legend__dot--${cls}`;
    dot.setAttribute('aria-hidden', 'true');
    item.appendChild(dot);

    const text = document.createElement('div');
    text.className = 'transparency-legend__text';

    const labelEl = document.createElement('strong');
    labelEl.textContent = label;
    text.appendChild(labelEl);

    const descEl = document.createElement('span');
    descEl.textContent = ` — ${desc}`;
    text.appendChild(descEl);

    item.appendChild(text);
    items.appendChild(item);
  });

  container.appendChild(items);

  const calc = document.createElement('p');
  calc.className = 'transparency-legend__calc';
  calc.textContent = t('transparency.legend_calc');
  container.appendChild(calc);

  return container;
}

// ── Main render ───────────────────────────────────────────────────────────────

export function renderTransparencyPage(content) {
  stopPolling();
  closeTvMode();
  _aborted = false;
  content.innerHTML = '';

  const tvBtn = createButton({
    label: t('transparency.tv_mode'),
    variant: 'secondary',
    size: 'sm',
    icon: ICON_TV,
  });

  const header = createPageHeader({
    title: t('transparency.title'),
    description: t('transparency.subtitle'),
    breadcrumb: [
      { label: 'Dashboard', href: '#/dashboard' },
      { label: t('transparency.title') },
    ],
    actions: [tvBtn.el],
  });
  content.appendChild(header.el);

  const grid = document.createElement('div');
  grid.className = 'transparency-grid';
  grid.setAttribute('role', 'region');
  grid.setAttribute('aria-label', t('transparency.title'));
  content.appendChild(grid);

  grid.appendChild(createLoadingCards(6));

  // Legend component
  const legend = createLegend();
  content.appendChild(legend);

  tvBtn.el.addEventListener('click', () => openTvMode(grid));

  const previousStatuses = new Map();
  loadAndStartPolling(grid, previousStatuses);

  // Check URL param for auto-fullscreen
  const hash = window.location.hash;
  if (hash.includes('fullscreen=1')) {
    setTimeout(() => openTvMode(grid), 500);
  }

  // Cancel polling when navigating away
  const onHashChange = () => {
    if (!document.contains(grid)) {
      stopPolling();
      closeTvMode();
      window.removeEventListener('hashchange', onHashChange);
    }
  };
  window.addEventListener('hashchange', onHashChange);
}

async function loadAndStartPolling(grid, previousStatuses) {
  const sectors = await fetchSectors(grid, previousStatuses);
  if (_aborted || !sectors) return;

  _pollTimer = setInterval(async () => {
    if (_aborted) { stopPolling(); return; }
    await pollUpdate(grid, previousStatuses);
  }, POLL_INTERVAL_MS);
}

async function fetchSectors(grid, previousStatuses) {
  try {
    const response = await sectorService.list({ active: true });
    const sectors = response?.sectors || response?.data || response || [];

    if (_aborted) return null;
    grid.innerHTML = '';

    if (!sectors.length) {
      const empty = createEmptyState({
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
        title: t('transparency.no_sectors'),
        description: t('sectors.subtitle'),
      });
      grid.appendChild(empty.el);
      return null;
    }

    sectors.forEach((sector) => {
      const { el, status } = createSectorCard(sector);
      grid.appendChild(el);
      previousStatuses.set(sector.id, status);
    });

    return sectors;
  } catch (error) {
    if (_aborted) return null;
    grid.innerHTML = '';
    const errorState = createErrorState({
      message: error?.message || t('common.error_generic'),
      onRetry: () => {
        grid.innerHTML = '';
        grid.appendChild(createLoadingCards(6));
        fetchSectors(grid, previousStatuses).then((s) => {
          if (s && !_aborted) {
            _pollTimer = setInterval(() => pollUpdate(grid, previousStatuses), POLL_INTERVAL_MS);
          }
        });
      },
    });
    grid.appendChild(errorState.el);
    return null;
  }
}

async function pollUpdate(grid, previousStatuses) {
  try {
    const response = await sectorService.list({ active: true });
    const sectors = response?.sectors || response?.data || response || [];
    if (_aborted) return;

    sectors.forEach((sector) => {
      const card = grid.querySelector(`[data-sector-id="${sector.id}"]`);
      if (card) {
        updateSectorCard(card, sector, previousStatuses);
      } else {
        const { el, status } = createSectorCard(sector);
        grid.appendChild(el);
        previousStatuses.set(sector.id, status);
      }
    });

    const sectorIds = new Set(sectors.map((s) => String(s.id)));
    grid.querySelectorAll('[data-sector-id]').forEach((card) => {
      if (!sectorIds.has(card.dataset.sectorId)) {
        card.remove();
        previousStatuses.delete(card.dataset.sectorId);
      }
    });

    // Sync TV overlay if open
    syncTvGrid(sectors, previousStatuses);
  } catch (_) {
    // Silently skip failed poll
  }
}
