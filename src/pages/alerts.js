/**
 * EnergyFlow — Alerts Page (US17-F2)
 *
 * Central de alertas with DataTable, filters, actions, and bulk operations.
 */
import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createDataTable } from '../components/DataTable.js';
import { createButton } from '../components/Button.js';
import { createSelect } from '../components/Select.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { Toast } from '../components/Toast.js';
import { alertService } from '../services/alertService.js';
import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import Router from '../utils/router.js';
import eventBus from '../utils/eventBus.js';

export async function renderAlertsPage(content) {
  content.innerHTML = '';

  const { el: headerEl } = createPageHeader({
    title: t('alerts.title'),
    breadcrumb: [{ label: t('nav.alerts') }],
  });
  content.appendChild(headerEl);

  // ── Filters ─────────────────────────────────────────────────────────
  const filtersRow = document.createElement('div');
  filtersRow.className = 'alerts-filters';

  const typeFilter = createSelect({
    label: t('alerts.filter_type'),
    options: [
      { value: '', label: t('common.filter') },
      { value: 'off_hours', label: t('alerts.types.off_hours') },
      { value: 'anomaly', label: t('alerts.types.anomaly') },
      { value: 'overload', label: t('alerts.types.overload') },
      { value: 'goal', label: t('alerts.types.goal') },
      { value: 'night_waste', label: t('alerts.types.night_waste') },
    ],
  });

  const severityFilter = createSelect({
    label: t('alerts.filter_severity'),
    options: [
      { value: '', label: t('common.filter') },
      { value: 'low', label: t('alerts.severities.low') },
      { value: 'medium', label: t('alerts.severities.medium') },
      { value: 'high', label: t('alerts.severities.high') },
      { value: 'critical', label: t('alerts.severities.critical') },
    ],
  });

  const statusFilter = createSelect({
    label: t('alerts.filter_status'),
    options: [
      { value: '', label: t('common.filter') },
      { value: 'open', label: t('alerts.statuses.open') },
      { value: 'acknowledged', label: t('alerts.statuses.acknowledged') },
      { value: 'resolved', label: t('alerts.statuses.resolved') },
    ],
  });

  const sectorFilter = createSelect({
    label: t('alerts.filter_sector'),
    options: [{ value: '', label: t('devices.all_sectors') }],
  });

  filtersRow.appendChild(typeFilter.el);
  filtersRow.appendChild(severityFilter.el);
  filtersRow.appendChild(statusFilter.el);
  filtersRow.appendChild(sectorFilter.el);
  content.appendChild(filtersRow);

  // Pre-fill type filter from URL params
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (urlParams.get('type')) {
    typeFilter.setValue(urlParams.get('type'));
  }

  // Load sectors for filter
  try {
    const sectorsData = await sectorService.list();
    const sectors = sectorsData?.sectors || sectorsData?.data || sectorsData || [];
    sectors.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      sectorFilter.el.querySelector('select')?.appendChild(opt);
    });
  } catch (_) { /* non-critical */ }

  // ── Bulk actions ────────────────────────────────────────────────────
  const bulkRow = document.createElement('div');
  bulkRow.className = 'alerts-bulk-actions';
  bulkRow.hidden = true;

  const ackBulkBtn = createButton({ label: t('alerts.acknowledge_bulk'), variant: 'secondary', size: 'sm' });
  const resolveBulkBtn = createButton({ label: t('alerts.resolve_bulk'), variant: 'secondary', size: 'sm' });
  bulkRow.appendChild(ackBulkBtn.el);
  bulkRow.appendChild(resolveBulkBtn.el);
  content.appendChild(bulkRow);

  // ── DataTable ───────────────────────────────────────────────────────
  let selectedIds = [];
  let currentPage = 1;
  const pageSize = 20;

  const table = createDataTable({
    columns: [
      {
        key: 'select',
        header: '',
        width: '40px',
        render: (r) => {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = selectedIds.includes(r.id);
          cb.addEventListener('change', () => {
            if (cb.checked) selectedIds.push(r.id);
            else selectedIds = selectedIds.filter((x) => x !== r.id);
            bulkRow.hidden = selectedIds.length === 0;
          });
          return cb;
        },
      },
      { key: 'severity', header: t('alerts.filter_severity'), render: (r) => severityBadge(r.severity), width: '100px' },
      { key: 'type', header: t('alerts.filter_type'), accessor: (r) => t(`alerts.types.${r.type}`) || r.type },
      { key: 'device', header: t('alerts.detail_device'), accessor: (r) => r.device_name || '—' },
      { key: 'sector', header: t('alerts.detail_sector'), accessor: (r) => r.sector_name || '—', hideOnMobile: true },
      { key: 'status', header: t('alerts.filter_status'), render: (r) => statusBadge(r.status) },
      { key: 'date', header: t('alerts.detail_triggered_at'), accessor: (r) => r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '—', sortable: true },
      {
        key: '_actions',
        header: '',
        align: 'right',
        render: (r) => {
          const wrap = document.createElement('div');
          wrap.className = 'alerts-row-actions';
          const viewBtn = createButton({ label: t('alerts.see_details'), variant: 'ghost', size: 'sm' });
          viewBtn.el.addEventListener('click', () => eventBus.emit('alert:show-detail', r));
          wrap.appendChild(viewBtn.el);

          if (r.status === 'open') {
            const ackBtn = createButton({ label: t('alerts.acknowledge'), variant: 'ghost', size: 'sm' });
            ackBtn.el.addEventListener('click', () => acknowledgeAlert(r.id));
            wrap.appendChild(ackBtn.el);
          }
          if (r.status !== 'resolved') {
            const resBtn = createButton({ label: t('alerts.resolve'), variant: 'ghost', size: 'sm' });
            resBtn.el.addEventListener('click', () => resolveAlert(r.id));
            wrap.appendChild(resBtn.el);
          }
          return wrap;
        },
      },
    ],
    loading: true,
    pageSize,
    onPageChange: (p) => { currentPage = p; loadAlerts(); },
    onSort: () => loadAlerts(),
  });
  content.appendChild(table.el);

  // ── Filter change handlers ──────────────────────────────────────────
  [typeFilter, severityFilter, statusFilter, sectorFilter].forEach((f) => {
    const select = f.el.querySelector('select');
    if (select) select.addEventListener('change', () => { currentPage = 1; loadAlerts(); });
  });

  // ── Data loading ────────────────────────────────────────────────────
  async function loadAlerts() {
    table.setLoading(true);
    try {
      const params = {
        type: typeFilter.getValue?.() || '',
        severity: severityFilter.getValue?.() || '',
        status: statusFilter.getValue?.() || '',
        sector_id: sectorFilter.getValue?.() || '',
        page: currentPage,
        limit: pageSize,
        sort: '-created_at',
      };
      const data = await alertService.list(params);
      const alerts = data?.alerts || data?.data || data || [];
      const total = data?.total ?? alerts.length;
      table.setRows(alerts);
      table.setPage(currentPage, total);
    } catch (err) {
      table.setError(err?.message || t('common.error_generic'), () => loadAlerts());
    }
  }

  async function acknowledgeAlert(id) {
    try {
      await alertService.acknowledge(id);
      Toast.show({ message: t('alerts.acknowledge_success'), type: 'success' });
      loadAlerts();
    } catch (err) {
      Toast.show({ message: err?.message || t('common.error'), type: 'error' });
    }
  }

  async function resolveAlert(id) {
    try {
      await alertService.resolve(id);
      Toast.show({ message: t('alerts.resolve_success'), type: 'success' });
      loadAlerts();
    } catch (err) {
      Toast.show({ message: err?.message || t('common.error'), type: 'error' });
    }
  }

  // Bulk actions
  ackBulkBtn.el.addEventListener('click', async () => {
    try {
      await alertService.bulkAcknowledge(selectedIds);
      Toast.show({ message: t('alerts.bulk_success', { count: selectedIds.length }), type: 'success' });
      selectedIds = [];
      bulkRow.hidden = true;
      loadAlerts();
    } catch (err) {
      Toast.show({ message: err?.message || t('common.error'), type: 'error' });
    }
  });

  resolveBulkBtn.el.addEventListener('click', async () => {
    try {
      await alertService.bulkResolve(selectedIds);
      Toast.show({ message: t('alerts.bulk_success', { count: selectedIds.length }), type: 'success' });
      selectedIds = [];
      bulkRow.hidden = true;
      loadAlerts();
    } catch (err) {
      Toast.show({ message: err?.message || t('common.error'), type: 'error' });
    }
  });

  // Initial load
  loadAlerts();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function severityBadge(severity) {
  const el = document.createElement('span');
  el.className = `alerts-badge alerts-badge--${severity || 'medium'}`;
  el.textContent = t(`alerts.severities.${severity}`) || severity || '—';
  return el;
}

function statusBadge(status) {
  const el = document.createElement('span');
  el.className = `alerts-badge alerts-badge--status-${status || 'open'}`;
  el.textContent = t(`alerts.statuses.${status}`) || status || '—';
  return el;
}
