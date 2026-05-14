/**
 * EnergyFlow — Device Detail Page (US16-F1, US16-F2)
 *
 * Shows device info, time-series chart with anomaly highlights,
 * anomaly table with tooltips, and maintenance history.
 */
import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createChart } from '../components/Chart.js';
import { createDataTable } from '../components/DataTable.js';
import { createButton } from '../components/Button.js';
import { createModal } from '../components/Modal.js';
import { createInput } from '../components/Input.js';
import { createSelect } from '../components/Select.js';
import { createSpinner } from '../components/Spinner.js';
import { createEmptyState } from '../components/EmptyState.js';
import { createErrorState } from '../components/ErrorState.js';
import { Toast } from '../components/Toast.js';
import { deviceService } from '../services/deviceService.js';
import { formatKwh } from '../utils/formatters.js';
import Router from '../utils/router.js';

export async function renderDeviceDetailPage(content, { id }) {
  content.innerHTML = '';

  const spinner = createSpinner({ size: 'lg' });
  content.appendChild(spinner.el);

  let device;
  try {
    device = await deviceService.get(id);
  } catch (err) {
    content.innerHTML = '';
    const errState = createErrorState({
      message: err?.message || t('common.error_generic'),
      onRetry: () => renderDeviceDetailPage(content, { id }),
    });
    content.appendChild(errState.el);
    return;
  }

  content.innerHTML = '';

  // ── Header ──────────────────────────────────────────────────────────
  const { el: headerEl } = createPageHeader({
    title: device.name || t('device_detail.title'),
    description: `${device.type ? t(`devices.types.${device.type}`) || device.type : ''} ${device.sector_name ? '— ' + device.sector_name : ''}`,
    breadcrumb: [
      { label: t('nav.devices'), href: '#/devices' },
      { label: device.name || id },
    ],
  });
  content.appendChild(headerEl);

  // ── Device info card ────────────────────────────────────────────────
  const infoCard = document.createElement('div');
  infoCard.className = 'device-detail-info';
  infoCard.innerHTML = `
    <div class="device-detail-info__grid">
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.device_id')}</span>
        <span class="device-detail-info__value">${escapeHtml(device.device_id || '—')}</span>
      </div>
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.sector')}</span>
        <span class="device-detail-info__value">${escapeHtml(device.sector_name || '—')}</span>
      </div>
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.type')}</span>
        <span class="device-detail-info__value">${escapeHtml(device.type ? (t(`devices.types.${device.type}`) || device.type) : '—')}</span>
      </div>
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.status')}</span>
        <span class="device-detail-info__value">${device.active !== false ? t('devices.status_active') : t('devices.status_inactive')}</span>
      </div>
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.last_reading')}</span>
        <span class="device-detail-info__value">${device.last_reading != null ? formatKwh(device.last_reading) : t('devices.never_read')}</span>
      </div>
      <div class="device-detail-info__item">
        <span class="device-detail-info__label">${t('devices.install_date')}</span>
        <span class="device-detail-info__value">${device.install_date ? new Date(device.install_date).toLocaleDateString('pt-BR') : '—'}</span>
      </div>
    </div>
  `;
  content.appendChild(infoCard);

  // ── Tabs ────────────────────────────────────────────────────────────
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'device-detail-tabs';

  const tabs = [
    { key: 'readings', label: t('device_detail.tab_readings') },
    { key: 'anomalies', label: t('device_detail.tab_anomalies') },
    { key: 'maintenance', label: t('device_detail.tab_maintenance') },
  ];

  let activeTab = 'readings';
  const tabBtns = {};

  const tabNav = document.createElement('nav');
  tabNav.className = 'device-detail-tabs__nav';
  tabs.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = 'device-detail-tabs__btn';
    btn.textContent = label;
    btn.addEventListener('click', () => switchTab(key));
    tabNav.appendChild(btn);
    tabBtns[key] = btn;
  });
  tabsContainer.appendChild(tabNav);

  const tabContent = document.createElement('div');
  tabContent.className = 'device-detail-tabs__content';
  tabsContainer.appendChild(tabContent);
  content.appendChild(tabsContainer);

  function switchTab(key) {
    activeTab = key;
    Object.entries(tabBtns).forEach(([k, btn]) => {
      btn.classList.toggle('device-detail-tabs__btn--active', k === key);
    });
    renderTabContent(key);
  }

  function renderTabContent(key) {
    tabContent.innerHTML = '';
    if (key === 'readings') renderReadingsTab();
    else if (key === 'anomalies') renderAnomaliesTab();
    else if (key === 'maintenance') renderMaintenanceTab();
  }

  // ── Readings Tab ────────────────────────────────────────────────────
  function renderReadingsTab() {
    const section = document.createElement('div');
    section.className = 'device-detail-readings';

    const pickerRow = document.createElement('div');
    pickerRow.className = 'device-detail-readings__picker';
    const picker = createPeriodPicker({ onChange: (period) => loadChart(period) });
    pickerRow.appendChild(picker.el);
    section.appendChild(pickerRow);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'device-detail-chart';
    section.appendChild(chartContainer);
    tabContent.appendChild(section);

    loadChart(picker.getValue());

    async function loadChart(period) {
      chartContainer.innerHTML = '';
      const sp = createSpinner({ size: 'md' });
      chartContainer.appendChild(sp.el);

      try {
        const data = await deviceService.getReadings(id, {
          from: period?.from,
          to: period?.to,
          granularity: period?.granularity,
        });
        chartContainer.innerHTML = '';
        const labels = data?.labels || [];
        const values = data?.values || [];
        const anomalies = data?.anomalies || [];

        if (!labels.length) {
          chartContainer.appendChild(createEmptyState({ title: t('dashboard.no_data') }).el);
          return;
        }

        // Build point colors: red for anomaly points
        const pointColors = labels.map((_, i) =>
          anomalies.includes(i) ? 'var(--color-danger)' : 'var(--color-primary-500)'
        );

        const chart = createChart({
          type: 'area',
          labels,
          datasets: [{
            label: t('dashboard.kpi_consumption'),
            data: values,
            color: '--color-primary-500',
            pointBackgroundColor: pointColors,
            pointRadius: labels.map((_, i) => anomalies.includes(i) ? 6 : 2),
          }],
          height: '300px',
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => {
                    if (anomalies.includes(ctx.dataIndex)) {
                      const expected = data?.expected_values?.[ctx.dataIndex];
                      const actual = values[ctx.dataIndex];
                      const percent = expected ? Math.round(((actual - expected) / expected) * 100) : 0;
                      return t('device_detail.anomaly_reason', { percent });
                    }
                    return '';
                  }
                }
              }
            }
          },
        });
        chartContainer.appendChild(chart.el);
      } catch (err) {
        chartContainer.innerHTML = '';
        chartContainer.appendChild(createErrorState({
          message: err?.message || t('common.error_generic'),
          onRetry: () => loadChart(period),
        }).el);
      }
    }
  }

  // ── Anomalies Tab ───────────────────────────────────────────────────
  function renderAnomaliesTab() {
    const section = document.createElement('div');
    section.className = 'device-detail-anomalies';
    tabContent.appendChild(section);

    const table = createDataTable({
      columns: [
        { key: 'date', header: t('device_detail.maintenance_date'), accessor: (r) => r.detected_at ? new Date(r.detected_at).toLocaleString('pt-BR') : '—', sortable: true },
        { key: 'expected', header: t('alerts.detail_expected'), accessor: (r) => r.expected_value != null ? formatKwh(r.expected_value) : '—' },
        { key: 'actual', header: t('alerts.detail_value'), accessor: (r) => r.actual_value != null ? formatKwh(r.actual_value) : '—' },
        {
          key: 'reason',
          header: t('alerts.detail_type'),
          render: (r) => {
            const el = document.createElement('span');
            el.className = 'device-detail-anomaly-reason';
            el.setAttribute('tabindex', '0');
            const percent = r.expected_value ? Math.round(((r.actual_value - r.expected_value) / r.expected_value) * 100) : 0;
            el.textContent = t('alerts.types.anomaly');
            // Tooltip (US16-F2)
            const tooltip = document.createElement('span');
            tooltip.className = 'device-detail-tooltip';
            tooltip.textContent = t('device_detail.anomaly_reason', { percent });
            el.appendChild(tooltip);
            return el;
          },
        },
      ],
      loading: true,
      empty: { title: t('device_detail.no_anomalies') },
    });
    section.appendChild(table.el);

    loadAnomalies(table);
  }

  async function loadAnomalies(table) {
    try {
      const data = await deviceService.getAnomalies(id);
      const anomalies = data?.anomalies || data?.data || data || [];
      table.setRows(anomalies);
    } catch (err) {
      table.setError(err?.message || t('common.error_generic'));
    }
  }

  // ── Maintenance Tab ─────────────────────────────────────────────────
  function renderMaintenanceTab() {
    const section = document.createElement('div');
    section.className = 'device-detail-maintenance';

    const addBtn = createButton({ label: t('device_detail.maintenance_new'), variant: 'primary', size: 'sm' });
    addBtn.el.addEventListener('click', openMaintenanceModal);
    section.appendChild(addBtn.el);

    const table = createDataTable({
      columns: [
        { key: 'date', header: t('device_detail.maintenance_date'), accessor: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '—', sortable: true },
        { key: 'type', header: t('device_detail.maintenance_type'), accessor: (r) => r.type || '—' },
        { key: 'notes', header: t('device_detail.maintenance_notes'), accessor: (r) => r.notes || '—' },
      ],
      loading: true,
      empty: { title: t('device_detail.maintenance_no_records') },
    });
    section.appendChild(table.el);
    tabContent.appendChild(section);

    loadMaintenance(table);
  }

  async function loadMaintenance(table) {
    try {
      const data = await deviceService.getMaintenance(id);
      const records = data?.records || data?.data || data || [];
      table.setRows(records);
    } catch (err) {
      table.setError(err?.message || t('common.error_generic'));
    }
  }

  function openMaintenanceModal() {
    const form = document.createElement('form');
    form.className = 'device-detail-maintenance-form';

    const dateInput = createInput({ label: t('device_detail.maintenance_date'), type: 'date', required: true });
    const typeInput = createInput({ label: t('device_detail.maintenance_type'), required: true });
    const notesInput = createInput({ label: t('device_detail.maintenance_notes') });

    form.appendChild(dateInput.el);
    form.appendChild(typeInput.el);
    form.appendChild(notesInput.el);

    const saveBtn = createButton({ label: t('common.save'), variant: 'primary' });
    const cancelBtn = createButton({ label: t('common.cancel'), variant: 'ghost' });

    const modal = createModal({
      title: t('device_detail.maintenance_new'),
      content: form,
      footer: [cancelBtn.el, saveBtn.el],
      size: 'sm',
    });

    cancelBtn.el.addEventListener('click', () => modal.close());
    saveBtn.el.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await deviceService.addMaintenance(id, {
          date: dateInput.getValue(),
          type: typeInput.getValue(),
          notes: notesInput.getValue(),
        });
        Toast.show({ message: t('device_detail.maintenance_save_success'), type: 'success' });
        modal.close();
        switchTab('maintenance');
      } catch (err) {
        Toast.show({ message: err?.message || t('common.error'), type: 'error' });
      }
    });

    document.body.appendChild(modal.el);
    modal.open();
  }

  // ── Initialize first tab ────────────────────────────────────────────
  switchTab('readings');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
