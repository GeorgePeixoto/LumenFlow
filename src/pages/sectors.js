import { t } from '../i18n/pt-BR.js';
import { createButton } from '../components/Button.js';
import { createCheckbox } from '../components/Checkbox.js';
import { createDataTable } from '../components/DataTable.js';
import { createInput } from '../components/Input.js';
import { createModal } from '../components/Modal.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createTextarea } from '../components/Textarea.js';
import { Toast } from '../components/Toast.js';
import { confirm } from '../components/ConfirmDialog.js';
import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import { formatWatts } from '../utils/formatters.js';

const PAGE_SIZE = 20;

function createBadge(label, tone = 'success') {
  const badge = document.createElement('span');
  badge.className = `ef-badge ef-badge--${tone}`;
  badge.textContent = label;
  return badge;
}

function apiMessage(error) {
  if (error?.code === 'SECTOR_NAME_EXISTS' || error?.code === 'SECTOR_NAME_TAKEN') {
    return t('sectors.error_name_taken');
  }
  if (error?.code === 'SECTOR_HAS_ACTIVE_DEVICES') {
    return t('sectors.error_has_devices');
  }
  return error?.message || t('common.error_generic');
}

function validateSectorForm(fields) {
  let valid = true;
  const name = fields.name.getValue().trim();
  const yellow = fields.thresholdYellow.getValue();
  const red = fields.thresholdRed.getValue();

  fields.name.setError('');
  fields.thresholdYellow.setError('');
  fields.thresholdRed.setError('');

  if (!name) {
    fields.name.setError(t('validation.required'));
    valid = false;
  }

  if (name.length > 100) {
    fields.name.setError(t('validation.field_too_long', { max: 100 }));
    valid = false;
  }

  const yellowValue = yellow === '' ? null : Number(yellow);
  const redValue = red === '' ? null : Number(red);

  if (yellow !== '' && (!Number.isFinite(yellowValue) || yellowValue <= 0)) {
    fields.thresholdYellow.setError(t('validation.number_invalid'));
    valid = false;
  }

  if (red !== '' && (!Number.isFinite(redValue) || redValue <= 0)) {
    fields.thresholdRed.setError(t('validation.number_invalid'));
    valid = false;
  }

  if (yellowValue !== null && redValue !== null && yellowValue >= redValue) {
    fields.thresholdRed.setError(t('sectors.threshold_order_invalid'));
    valid = false;
  }

  return valid;
}

function openSectorModal({ sector = null, onSaved }) {
  const isEdit = !!sector;
  const form = document.createElement('form');
  form.className = 'resource-form';

  const fields = {
    name: createInput({
      label: t('sectors.name'),
      value: sector?.name || '',
      required: true,
      maxLength: 100,
    }),
    description: createTextarea({
      label: t('sectors.description'),
      placeholder: t('sectors.description_placeholder'),
      value: sector?.description || '',
      rows: 3,
      maxLength: 280,
    }),
    thresholdYellow: createInput({
      label: t('sectors.threshold_warning'),
      type: 'number',
      value: sector?.threshold_yellow ?? '',
      helper: t('sectors.threshold_warning_helper'),
    }),
    thresholdRed: createInput({
      label: t('sectors.threshold_critical'),
      type: 'number',
      value: sector?.threshold_red ?? '',
      helper: t('sectors.threshold_critical_helper'),
    }),
  };

  form.append(
    fields.name.el,
    fields.description.el,
    fields.thresholdYellow.el,
    fields.thresholdRed.el,
  );

  const cancelBtn = createButton({
    label: t('common.cancel'),
    variant: 'ghost',
    onClick: () => modal.close(),
  });

  const saveBtn = createButton({
    label: t('common.save'),
    type: 'submit',
  });

  const modal = createModal({
    title: isEdit ? t('sectors.edit') : t('sectors.new'),
    content: form,
    footer: [cancelBtn, saveBtn],
    size: 'md',
    closeOnBackdrop: false,
    onClose: () => modal.el.remove(),
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateSectorForm(fields)) return;

    saveBtn.setLoading(true);
    try {
      const payload = {
        name: fields.name.getValue(),
        description: fields.description.getValue(),
        threshold_yellow: fields.thresholdYellow.getValue(),
        threshold_red: fields.thresholdRed.getValue(),
      };

      if (isEdit) {
        await sectorService.update(sector.id, payload);
      } else {
        await sectorService.create(payload);
      }

      Toast.show({ type: 'success', message: t('sectors.save_success') });
      modal.close();
      onSaved?.();
    } catch (error) {
      if (error?.code === 'SECTOR_NAME_EXISTS' || error?.code === 'SECTOR_NAME_TAKEN') {
        fields.name.setError(t('sectors.error_name_taken'));
      } else {
        Toast.show({ type: 'error', message: apiMessage(error) });
      }
    } finally {
      saveBtn.setLoading(false);
    }
  });

  document.body.appendChild(modal.el);
  modal.open();
}

export function renderSectorsPage(content) {
  let sectors = [];
  let devices = [];
  let page = 1;

  content.innerHTML = '';

  const newBtn = createButton({
    label: t('sectors.new'),
    onClick: () => openSectorModal({ onSaved: load }),
  });

  const { el: headerEl } = createPageHeader({
    title: t('sectors.title'),
    description: t('sectors.subtitle'),
    breadcrumb: [{ label: t('nav.dashboard'), href: '#/dashboard' }, { label: t('nav.sectors') }],
    actions: [newBtn],
  });

  const body = document.createElement('div');
  body.className = 'page-body resource-page';

  const toolbar = document.createElement('div');
  toolbar.className = 'resource-toolbar';

  const search = createInput({
    label: t('common.search'),
    placeholder: t('common.search'),
    onInput: () => {
      page = 1;
      renderRows();
    },
  });

  const showInactive = createCheckbox({
    label: t('sectors.show_inactive'),
    onChange: () => {
      page = 1;
      load();
    },
  });

  toolbar.append(search.el, showInactive.el);

  const table = createDataTable({
    columns: [
      { key: 'name', header: t('sectors.name'), accessor: row => row.name, sortable: true },
      {
        key: 'devices',
        header: t('sectors.devices'),
        accessor: row => t('sectors.devices_count', { count: activeDeviceCount(row.id) }),
      },
      {
        key: 'thresholds',
        header: t('sectors.thresholds'),
        render: row => {
          const wrap = document.createElement('span');
          wrap.className = 'resource-muted';
          const yellow = row.threshold_yellow ? formatWatts(row.threshold_yellow * 1000) : '—';
          const red = row.threshold_red ? formatWatts(row.threshold_red * 1000) : '—';
          wrap.textContent = `${yellow} / ${red}`;
          return wrap;
        },
      },
      {
        key: 'status',
        header: t('sectors.status'),
        render: row => createBadge(
          row.active ? t('sectors.status_active') : t('sectors.status_inactive'),
          row.active ? 'success' : 'neutral',
        ),
      },
      {
        key: '_actions',
        header: t('common.actions'),
        align: 'right',
        render: row => rowActions(row),
      },
    ],
    pageSize: PAGE_SIZE,
    empty: { title: t('sectors.no_sectors'), description: t('common.no_results_filtered') },
    onPageChange: nextPage => {
      page = nextPage;
      renderRows();
    },
  });

  body.append(toolbar, table.el);
  content.append(headerEl, body);

  function activeDeviceCount(sectorId) {
    return devices.filter(device => device.sector_id === sectorId && device.active).length;
  }

  function filteredRows() {
    const query = search.getValue().trim().toLowerCase();
    return sectors.filter(sector => !query || sector.name.toLowerCase().includes(query));
  }

  function renderRows() {
    const rows = filteredRows();
    const start = (page - 1) * PAGE_SIZE;
    table.setRows(rows.slice(start, start + PAGE_SIZE));
    table.setPage(page, rows.length);
  }

  function rowActions(row) {
    const wrap = document.createElement('div');
    wrap.className = 'resource-actions';

    wrap.appendChild(createButton({
      label: t('common.edit'),
      variant: 'ghost',
      size: 'sm',
      onClick: () => openSectorModal({ sector: row, onSaved: load }),
    }));

    if (row.active) {
      wrap.appendChild(createButton({
        label: t('common.deactivate'),
        variant: 'danger',
        size: 'sm',
        onClick: () => deactivateSector(row),
      }));
    }

    return wrap;
  }

  async function deactivateSector(row) {
    const ok = await confirm({
      title: t('sectors.confirm_deactivate_title'),
      message: t('sectors.confirm_deactivate_message', { name: row.name }),
      confirmText: t('common.deactivate'),
    });
    if (!ok) return;

    try {
      await sectorService.deactivate(row.id);
      Toast.show({ type: 'success', message: t('sectors.deactivate_success') });
      load();
    } catch (error) {
      Toast.show({ type: 'error', message: apiMessage(error) });
    }
  }

  async function load() {
    table.setLoading(true);
    try {
      const [sectorResponse, deviceResponse] = await Promise.all([
        sectorService.list({ active: showInactive.isChecked() ? null : true }),
        deviceService.list(),
      ]);
      sectors = sectorResponse.sectors || [];
      devices = deviceResponse.devices || [];
      renderRows();
    } catch (error) {
      table.setError(error?.message || t('common.error_generic'), load);
    }
  }

  load();
}
