import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createButton } from '../components/Button.js';
import { createDataTable } from '../components/DataTable.js';
import { createModal } from '../components/Modal.js';
import { createInput } from '../components/Input.js';
import { createSelect } from '../components/Select.js';
import { Toast } from '../components/Toast.js';
import { confirm } from '../components/ConfirmDialog.js';
import { goalService } from '../services/goalService.js';
import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import { formatKwh, formatCurrency } from '../utils/formatters.js';

const ICON_TRASH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

function getScopeLabel(goal) {
  if (goal.scope === 'sector') return `${t('goals.scope_sector')}: ${goal.sector_name || '—'}`;
  if (goal.scope === 'device') return `${t('goals.scope_device')}: ${goal.device_name || '—'}`;
  return t('goals.scope_company');
}

function getStatusBadge(goal) {
  const percent = goal.progress ?? 0;
  const mc = goal.milestone_critical ?? 100;
  const mw = goal.milestone_warning ?? 80;
  let status, tone;
  if (percent >= mc) { status = t('goals.status_exceeded'); tone = 'danger'; }
  else if (percent >= mw) { status = t('goals.status_at_risk'); tone = 'warning'; }
  else { status = t('goals.status_on_track'); tone = 'success'; }
  const badge = document.createElement('span');
  badge.className = `ef-badge ef-badge--${tone}`;
  badge.textContent = status;
  return badge;
}

function createProgressBar(percent) {
  const container = document.createElement('div');
  container.className = 'goal-progress';
  const bar = document.createElement('div');
  bar.className = 'goal-progress__bar';
  const fill = document.createElement('div');
  fill.className = 'goal-progress__fill';
  const clamped = Math.min(Math.max(percent || 0, 0), 100);
  fill.style.width = `${clamped}%`;
  if (clamped >= 100) fill.classList.add('goal-progress__fill--danger');
  else if (clamped >= 80) fill.classList.add('goal-progress__fill--warning');
  else fill.classList.add('goal-progress__fill--success');
  bar.appendChild(fill);
  container.appendChild(bar);
  const label = document.createElement('span');
  label.className = 'goal-progress__label';
  label.textContent = `${Math.round(clamped)}%`;
  container.appendChild(label);
  return container;
}

function formatGoalValue(goal) {
  if (goal.unit === 'brl' || goal.unit === 'R$') return formatCurrency(goal.value);
  return formatKwh(goal.value, 0);
}

function formatProjection(goal) {
  if (goal.projection == null) return '—';
  if (goal.unit === 'brl' || goal.unit === 'R$') return formatCurrency(goal.projection);
  return formatKwh(goal.projection, 0);
}

export function renderGoalsPage(content) {
  content.innerHTML = '';
  const newBtn = createButton({ label: t('goals.new'), variant: 'primary', size: 'sm' });

  const { el: headerEl } = createPageHeader({
    title: t('goals.title'),
    breadcrumb: [
      { label: 'Dashboard', href: '#/dashboard' },
      { label: t('goals.title') },
    ],
    actions: [newBtn.el],
  });
  content.appendChild(headerEl);

  const columns = [
    { key: 'scope', header: t('goals.scope'), render: (row) => { const s = document.createElement('span'); s.textContent = getScopeLabel(row); return s; } },
    { key: 'period', header: t('goals.period'), accessor: (row) => row.period_label || row.period || '—' },
    { key: 'value', header: t('goals.value'), accessor: (row) => formatGoalValue(row) },
    { key: 'progress', header: t('goals.progress'), render: (row) => createProgressBar(row.progress) },
    { key: 'projection', header: t('goals.projection'), accessor: (row) => formatProjection(row) },
    { key: 'status', header: 'Status', render: (row) => getStatusBadge(row) },
    {
      key: '_actions',
      render: (row) => {
        const wrap = document.createElement('div');
        wrap.className = 'dt-actions';
        const editBtn = createButton({ label: '', variant: 'ghost', size: 'sm', icon: ICON_EDIT, ariaLabel: 'Editar' });
        editBtn.el.addEventListener('click', (e) => { e.stopPropagation(); openGoalModal(row, table); });
        wrap.appendChild(editBtn.el);
        const delBtn = createButton({ label: '', variant: 'ghost', size: 'sm', icon: ICON_TRASH, ariaLabel: 'Excluir' });
        delBtn.el.addEventListener('click', (e) => { e.stopPropagation(); handleDelete(row, table); });
        wrap.appendChild(delBtn.el);
        return wrap;
      },
      hideOnMobile: true,
    },
  ];

  const table = createDataTable({
    columns,
    rows: [],
    loading: true,
    empty: { title: t('goals.no_goals') },
  });
  content.appendChild(table.el);

  newBtn.el.addEventListener('click', () => openGoalModal(null, table));
  loadGoals(table);
}

async function loadGoals(table) {
  try {
    const response = await goalService.list();
    const goals = response?.goals || response?.data || response || [];
    table.setLoading(false);
    table.setRows(goals);
  } catch (error) {
    table.setLoading(false);
    table.setError(error?.message || t('common.error_generic'), () => {
      table.setLoading(true);
      loadGoals(table);
    });
  }
}

async function handleDelete(goal, table) {
  const name = goal.name || getScopeLabel(goal);
  const confirmed = await confirm({
    title: t('goals.confirm_delete_title'),
    message: t('goals.confirm_delete_message', { name }),
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
  });
  if (!confirmed) return;
  try {
    await goalService.delete(goal.id);
    Toast.show({ message: t('goals.delete_success'), type: 'success' });
    table.setLoading(true);
    loadGoals(table);
  } catch (error) {
    Toast.show({ message: error?.message || t('common.error_generic'), type: 'error' });
  }
}

// ── Modal de criar/editar meta ────────────────────────────────────────────────

async function openGoalModal(goal, table) {
  const isEdit = !!goal;
  const formEl = document.createElement('div');
  formEl.className = 'goal-modal-form';

  // Scope radio group
  const scopeGroup = document.createElement('fieldset');
  scopeGroup.className = 'goal-modal-form__fieldset';
  const scopeLegend = document.createElement('legend');
  scopeLegend.textContent = t('goals.scope');
  scopeGroup.appendChild(scopeLegend);

  const scopes = ['company', 'sector', 'device'];
  const scopeRadios = {};
  scopes.forEach((s) => {
    const label = document.createElement('label');
    label.className = 'goal-modal-form__radio';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'goal-scope';
    radio.value = s;
    if ((goal?.scope || 'company') === s) radio.checked = true;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${t('goals.scope_' + s)}`));
    scopeGroup.appendChild(label);
    scopeRadios[s] = radio;
  });
  formEl.appendChild(scopeGroup);

  // Conditional select (sector or device)
  const targetContainer = document.createElement('div');
  targetContainer.className = 'goal-modal-form__target';
  formEl.appendChild(targetContainer);

  const sectorSelect = createSelect({ label: t('goals.scope_sector'), options: [], placeholder: 'Carregando...' });
  const deviceSelect = createSelect({ label: t('goals.scope_device'), options: [], placeholder: 'Carregando...' });

  // Load sectors and devices
  loadSelectOptions(sectorSelect, deviceSelect, goal);

  function updateTargetVisibility() {
    targetContainer.innerHTML = '';
    if (scopeRadios.sector.checked) targetContainer.appendChild(sectorSelect.el);
    else if (scopeRadios.device.checked) targetContainer.appendChild(deviceSelect.el);
  }
  scopes.forEach((s) => scopeRadios[s].addEventListener('change', updateTargetVisibility));
  updateTargetVisibility();

  // Unit
  const unitSelect = createSelect({
    label: t('goals.unit'),
    options: [
      { value: 'kwh', label: t('goals.unit_kwh') },
      { value: 'brl', label: t('goals.unit_brl') },
    ],
    value: goal?.unit || 'kwh',
  });
  formEl.appendChild(unitSelect.el);

  // Value
  const valueInput = createInput({
    label: t('goals.value'),
    type: 'number',
    value: goal?.value != null ? String(goal.value) : '',
    placeholder: '0',
    required: true,
  });
  formEl.appendChild(valueInput.el);

  // Period
  const periodSelect = createSelect({
    label: t('goals.period'),
    options: [
      { value: 'current_month', label: t('goals.period_current_month') },
      { value: 'specific_month', label: t('goals.period_specific_month') },
      { value: 'custom', label: t('goals.period_custom') },
    ],
    value: goal?.period_type || 'current_month',
  });
  formEl.appendChild(periodSelect.el);

  // Milestones
  const milestoneWarning = createInput({
    label: t('goals.milestone_warning'),
    type: 'number',
    value: String(goal?.milestone_warning ?? 80),
    placeholder: '80',
  });
  const milestoneCritical = createInput({
    label: t('goals.milestone_critical'),
    type: 'number',
    value: String(goal?.milestone_critical ?? 100),
    placeholder: '100',
  });
  const milestonesRow = document.createElement('div');
  milestonesRow.className = 'goal-modal-form__row';
  milestonesRow.appendChild(milestoneWarning.el);
  milestonesRow.appendChild(milestoneCritical.el);
  formEl.appendChild(milestonesRow);

  // Footer buttons
  const cancelBtn = createButton({ label: 'Cancelar', variant: 'secondary' });
  const saveBtn = createButton({ label: isEdit ? 'Salvar' : 'Criar', variant: 'primary' });

  const modal = createModal({
    title: isEdit ? t('goals.edit') : t('goals.new'),
    content: formEl,
    footer: [cancelBtn.el, saveBtn.el],
    size: 'md',
  });

  cancelBtn.el.addEventListener('click', () => modal.close());

  saveBtn.el.addEventListener('click', async () => {
    // Validate
    const value = parseFloat(valueInput.getValue());
    if (!value || value <= 0) {
      valueInput.setError(t('validation.required'));
      return;
    }
    valueInput.setError('');

    const scope = scopes.find((s) => scopeRadios[s].checked) || 'company';
    const payload = {
      scope,
      unit: unitSelect.getValue(),
      value,
      period_type: periodSelect.getValue(),
      milestone_warning: parseInt(milestoneWarning.getValue()) || 80,
      milestone_critical: parseInt(milestoneCritical.getValue()) || 100,
    };

    if (scope === 'sector') payload.sector_id = sectorSelect.getValue();
    if (scope === 'device') payload.device_id = deviceSelect.getValue();

    saveBtn.setLoading(true);
    try {
      if (isEdit) {
        await goalService.update(goal.id, payload);
      } else {
        await goalService.create(payload);
      }
      Toast.show({ message: t('goals.save_success'), type: 'success' });
      modal.close();
      table.setLoading(true);
      loadGoals(table);
    } catch (error) {
      if (error?.code === 'GOAL_OVERLAP') {
        Toast.show({ message: t('goals.error_overlap'), type: 'error' });
      } else {
        Toast.show({ message: error?.message || t('common.error_generic'), type: 'error' });
      }
    } finally {
      saveBtn.setLoading(false);
    }
  });

  document.body.appendChild(modal.el);
  modal.open();
}

async function loadSelectOptions(sectorSelect, deviceSelect, goal) {
  try {
    const [sectorsRes, devicesRes] = await Promise.all([
      sectorService.list({ active: true }),
      deviceService.list({ active: true }),
    ]);
    const sectors = sectorsRes?.sectors || sectorsRes?.data || sectorsRes || [];
    const devices = devicesRes?.devices || devicesRes?.data || devicesRes || [];

    sectorSelect.setOptions(sectors.map((s) => ({ value: String(s.id), label: s.name })));
    deviceSelect.setOptions(devices.map((d) => ({ value: String(d.id), label: d.name })));

    if (goal?.sector_id) sectorSelect.setValue(String(goal.sector_id));
    if (goal?.device_id) deviceSelect.setValue(String(goal.device_id));
  } catch (_) {
    // Keep empty options — user can still save with company scope
  }
}
