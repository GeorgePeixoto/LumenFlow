/**
 * LumenFlow — Alert Detail Modal (US17-F4)
 *
 * Modal showing full alert context, mini chart, and actions.
 */
import { t } from '../i18n/pt-BR.js';
import { createModal } from './Modal.js';
import { createButton } from './Button.js';
import { createInput } from './Input.js';
import { createChart } from './Chart.js';
import { Toast } from './Toast.js';
import { alertService } from '../services/alertService.js';
import { deviceService } from '../services/deviceService.js';
import eventBus from '../utils/eventBus.js';
import { formatKwh } from '../utils/formatters.js';

let _modal = null;

export function initAlertDetailModal() {
  eventBus.on('alert:show-detail', (alert) => showAlertDetail(alert));
}

async function showAlertDetail(alert) {
  if (_modal) {
    _modal.close();
    _modal.el.remove();
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'alert-detail';

  // ── Info grid ─────────────────────────────────────────────────────
  const infoGrid = document.createElement('div');
  infoGrid.className = 'alert-detail__grid';
  infoGrid.innerHTML = `
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_device')}</span>
      <span class="alert-detail__value">${escapeHtml(alert.device_name || '—')}</span>
    </div>
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_sector')}</span>
      <span class="alert-detail__value">${escapeHtml(alert.sector_name || '—')}</span>
    </div>
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_type')}</span>
      <span class="alert-detail__value">${t(`alerts.types.${alert.type}`) || alert.type || '—'}</span>
    </div>
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_severity')}</span>
      <span class="alert-detail__value alerts-badge alerts-badge--${alert.severity || 'medium'}">${t(`alerts.severities.${alert.severity}`) || '—'}</span>
    </div>
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_status')}</span>
      <span class="alert-detail__value">${t(`alerts.statuses.${alert.status}`) || '—'}</span>
    </div>
    <div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_triggered_at')}</span>
      <span class="alert-detail__value">${alert.created_at ? new Date(alert.created_at).toLocaleString('pt-BR') : '—'}</span>
    </div>
    ${alert.actual_value != null ? `<div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_value')}</span>
      <span class="alert-detail__value">${formatKwh(alert.actual_value)}</span>
    </div>` : ''}
    ${alert.expected_value != null ? `<div class="alert-detail__field">
      <span class="alert-detail__label">${t('alerts.detail_expected')}</span>
      <span class="alert-detail__value">${formatKwh(alert.expected_value)}</span>
    </div>` : ''}
  `;
  contentEl.appendChild(infoGrid);

  // ── Message ──────────────────────────────────────────────────────
  if (alert.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'alert-detail__message';
    msgEl.textContent = alert.message;
    contentEl.appendChild(msgEl);
  }

  // ── Mini chart ────────────────────────────────────────────────────
  if (alert.device_id) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'alert-detail__chart';
    chartContainer.innerHTML = `<p style="color:var(--text-muted);font-size:var(--text-xs)">${t('common.loading')}</p>`;
    contentEl.appendChild(chartContainer);

    loadMiniChart(chartContainer, alert);
  }

  // ── Comment input ─────────────────────────────────────────────────
  const commentInput = createInput({
    label: t('alerts.comment_placeholder'),
    placeholder: t('alerts.comment_placeholder'),
  });
  contentEl.appendChild(commentInput.el);

  // ── Footer buttons ────────────────────────────────────────────────
  const footerBtns = [];
  const closeBtn = createButton({ label: t('common.close'), variant: 'ghost' });
  footerBtns.push(closeBtn.el);

  if (alert.status === 'open') {
    const ackBtn = createButton({ label: t('alerts.acknowledge'), variant: 'secondary' });
    ackBtn.el.addEventListener('click', async () => {
      try {
        await alertService.acknowledge(alert.id, commentInput.getValue());
        Toast.show({ message: t('alerts.acknowledge_success'), type: 'success' });
        _modal.close();
        eventBus.emit('alert:updated');
      } catch (err) {
        Toast.show({ message: err?.message || t('common.error'), type: 'error' });
      }
    });
    footerBtns.push(ackBtn.el);
  }

  if (alert.status !== 'resolved') {
    const resolveBtn = createButton({ label: t('alerts.resolve'), variant: 'primary' });
    resolveBtn.el.addEventListener('click', async () => {
      try {
        await alertService.resolve(alert.id, commentInput.getValue());
        Toast.show({ message: t('alerts.resolve_success'), type: 'success' });
        _modal.close();
        eventBus.emit('alert:updated');
      } catch (err) {
        Toast.show({ message: err?.message || t('common.error'), type: 'error' });
      }
    });
    footerBtns.push(resolveBtn.el);
  }

  _modal = createModal({
    title: t('alerts.detail_title'),
    content: contentEl,
    footer: footerBtns,
    size: 'lg',
  });

  closeBtn.el.addEventListener('click', () => _modal.close());

  document.body.appendChild(_modal.el);
  _modal.open();
}

async function loadMiniChart(container, alert) {
  try {
    const data = await deviceService.getReadings(alert.device_id, {});
    const labels = data?.labels || [];
    const values = data?.values || [];

    if (!labels.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';
    const chart = createChart({
      type: 'area',
      labels: labels.slice(-24),
      datasets: [{
        label: t('dashboard.kpi_consumption'),
        data: values.slice(-24),
        color: '--color-primary-500',
      }],
      height: '150px',
    });
    container.appendChild(chart.el);
  } catch (_) {
    container.innerHTML = '';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
