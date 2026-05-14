import Router from '../utils/router.js';
import { t } from '../i18n/pt-BR.js';
import { createButton } from '../components/Button.js';
import { createCheckbox } from '../components/Checkbox.js';
import { createDataTable } from '../components/DataTable.js';
import { createInput } from '../components/Input.js';
import { createModal } from '../components/Modal.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createSelect } from '../components/Select.js';
import { Toast } from '../components/Toast.js';
import { confirm } from '../components/ConfirmDialog.js';
import { DEVICE_TYPES, deviceService } from '../services/deviceService.js';
import { sectorService } from '../services/sectorService.js';
import { formatDate, formatWatts } from '../utils/formatters.js';

const PAGE_SIZE = 20;

function createBadge(label, tone = 'success') {
  const badge = document.createElement('span');
  badge.className = `ef-badge ef-badge--${tone}`;
  badge.textContent = label;
  return badge;
}

function typeOptions() {
  return DEVICE_TYPES.map(type => ({ value: type.value, label: t(type.labelKey) }));
}

function apiMessage(error) {
  if (error?.code === 'DEVICE_ID_EXISTS') return t('devices.error_device_id_exists');
  if (error?.code === 'SECTOR_INACTIVE') return t('devices.error_sector_inactive');
  return error?.message || t('common.error_generic');
}

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function validateDeviceForm(fields, { editing = false } = {}) {
  let valid = true;

  Object.values(fields).forEach(field => field.setError?.(''));

  if (!fields.name.getValue().trim()) {
    fields.name.setError(t('validation.required'));
    valid = false;
  }

  if (!fields.sector.getValue()) {
    fields.sector.setError(t('validation.required'));
    valid = false;
  }

  if (!fields.type.getValue()) {
    fields.type.setError(t('validation.required'));
    valid = false;
  }

  if (!editing && !fields.deviceId.getValue().trim()) {
    fields.deviceId.setError(t('validation.required'));
    valid = false;
  }

  const threshold = fields.threshold.getValue();
  if (threshold !== '' && (!Number.isFinite(Number(threshold)) || Number(threshold) <= 0)) {
    fields.threshold.setError(t('validation.number_invalid'));
    valid = false;
  }

  return valid;
}

function openDeviceModal({ device = null, sectors = [], onSaved }) {
  const editing = !!device;
  const activeSectors = sectors.filter(sector => sector.active || sector.id === device?.sector_id);
  const form = document.createElement('form');
  form.className = 'resource-form';

  const fields = {
    name: createInput({
      label: t('devices.name'),
      value: device?.name || '',
      required: true,
      maxLength: 100,
    }),
    type: createSelect({
      label: t('devices.type'),
      value: device?.type || '',
      options: typeOptions(),
      required: true,
    }),
    sector: createSelect({
      label: t('devices.sector'),
      value: device?.sector_id || '',
      options: activeSectors.map(sector => ({ value: sector.id, label: sector.name })),
      required: true,
    }),
    deviceId: createInput({
      label: t('devices.device_id'),
      value: device?.device_id || '',
      required: !editing,
      disabled: editing,
      helper: t('devices.device_id_helper'),
    }),
    installedAt: createInput({
      label: t('devices.install_date'),
      type: 'date',
      value: toDateInputValue(device?.installed_at),
    }),
    threshold: createInput({
      label: t('devices.overload_threshold'),
      type: 'number',
      value: device?.overload_threshold_w ?? '',
      helper: t('devices.overload_threshold_helper'),
    }),
    critical: createCheckbox({
      label: t('devices.is_critical'),
      checked: !!device?.is_critical,
    }),
  };

  form.append(
    fields.name.el,
    fields.type.el,
    fields.sector.el,
    fields.deviceId.el,
    fields.installedAt.el,
    fields.threshold.el,
    fields.critical.el,
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
    title: editing ? t('devices.edit') : t('devices.new'),
    content: form,
    footer: [cancelBtn, saveBtn],
    size: 'md',
    closeOnBackdrop: false,
    onClose: () => modal.el.remove(),
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateDeviceForm(fields, { editing })) return;

    saveBtn.setLoading(true);
    try {
      const payload = {
        name: fields.name.getValue(),
        type: fields.type.getValue(),
        sector_id: fields.sector.getValue(),
        device_id: fields.deviceId.getValue(),
        installed_at: fields.installedAt.getValue(),
        overload_threshold_w: fields.threshold.getValue(),
        is_critical: fields.critical.isChecked(),
      };

      if (editing) {
        await deviceService.update(device.id, payload);
      } else {
        await deviceService.create(payload);
      }

      Toast.show({ type: 'success', message: t('devices.save_success') });
      modal.close();
      onSaved?.();
    } catch (error) {
      if (error?.code === 'DEVICE_ID_EXISTS') {
        fields.deviceId.setError(apiMessage(error));
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

export function renderDevicesPage(content) {
  let devices = [];
  let sectors = [];
  let page = 1;

  content.innerHTML = '';

  const newBtn = createButton({
    label: t('devices.new'),
    onClick: () => openDeviceModal({ sectors, onSaved: load }),
  });

  const { el: headerEl } = createPageHeader({
    title: t('devices.title'),
    description: t('devices.subtitle'),
    breadcrumb: [{ label: t('nav.dashboard'), href: '#/dashboard' }, { label: t('nav.devices') }],
    actions: [newBtn],
  });

  const body = document.createElement('div');
  body.className = 'page-body resource-page';

  const toolbar = document.createElement('div');
  toolbar.className = 'resource-toolbar resource-toolbar--wide';

  const search = createInput({
    label: t('common.search'),
    placeholder: t('devices.search_placeholder'),
    onInput: () => {
      page = 1;
      renderRows();
    },
  });

  const sectorFilter = createSelect({
    label: t('devices.filter_sector'),
    placeholder: t('devices.all_sectors'),
    options: [],
    onChange: () => {
      page = 1;
      renderRows();
    },
  });

  const typeFilter = createSelect({
    label: t('devices.filter_type'),
    placeholder: t('devices.all_types'),
    options: typeOptions(),
    onChange: () => {
      page = 1;
      renderRows();
    },
  });

  const statusFilter = createSelect({
    label: t('devices.filter_status'),
    placeholder: t('devices.all_statuses'),
    options: [
      { value: 'active', label: t('devices.status_active') },
      { value: 'inactive', label: t('devices.status_inactive') },
    ],
    onChange: () => {
      page = 1;
      renderRows();
    },
  });

  toolbar.append(search.el, sectorFilter.el, typeFilter.el, statusFilter.el);

  const table = createDataTable({
    columns: [
      {
        key: 'name',
        header: t('devices.name'),
        render: row => {
          const link = document.createElement('button');
          link.className = 'resource-link';
          link.textContent = row.name;
          link.addEventListener('click', () => Router.navigate(`/devices/${row.id}`));
          return link;
        },
      },
      { key: 'type', header: t('devices.type'), accessor: row => t(`devices.types.${row.type}`) },
      { key: 'sector', header: t('devices.sector'), accessor: row => row.sector_name || sectorName(row.sector_id) },
      { key: 'device_id', header: t('devices.device_id'), accessor: row => row.device_id },
      {
        key: 'status',
        header: t('devices.status'),
        render: row => createBadge(
          row.active ? t('devices.status_active') : t('devices.status_inactive'),
          row.active ? 'success' : 'neutral',
        ),
      },
      {
        key: 'last_reading',
        header: t('devices.last_reading'),
        accessor: () => t('devices.never_read'),
      },
      {
        key: 'installed_at',
        header: t('devices.install_date'),
        accessor: row => formatDate(row.installed_at),
      },
      {
        key: '_actions',
        header: t('common.actions'),
        align: 'right',
        render: row => rowActions(row),
      },
    ],
    pageSize: PAGE_SIZE,
    empty: { title: t('devices.no_devices'), description: t('common.no_results_filtered') },
    onPageChange: nextPage => {
      page = nextPage;
      renderRows();
    },
  });

  body.append(toolbar, table.el);
  content.append(headerEl, body);

  function sectorName(id) {
    return sectors.find(sector => sector.id === id)?.name || '—';
  }

  function filteredRows() {
    const query = search.getValue().trim().toLowerCase();
    const sector = sectorFilter.getValue();
    const type = typeFilter.getValue();
    const status = statusFilter.getValue();

    return devices.filter(device => {
      const matchesQuery = !query
        || device.name.toLowerCase().includes(query)
        || (device.device_id ?? '').toLowerCase().includes(query);
      const matchesSector = !sector || device.sector_id === sector;
      const matchesType = !type || device.type === type;
      const matchesStatus =
        !status
        || (status === 'active' && device.active)
        || (status === 'inactive' && !device.active);

      return matchesQuery && matchesSector && matchesType && matchesStatus;
    });
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
      onClick: () => openDeviceModal({ device: row, sectors, onSaved: load }),
    }));

    if (row.active) {
      wrap.appendChild(createButton({
        label: t('common.deactivate'),
        variant: 'danger',
        size: 'sm',
        onClick: () => deactivateDevice(row),
      }));
    }

    return wrap;
  }

  async function deactivateDevice(row) {
    const ok = await confirm({
      title: t('devices.confirm_deactivate_title'),
      message: t('devices.confirm_deactivate_message', { name: row.name }),
      confirmText: t('common.deactivate'),
    });
    if (!ok) return;

    try {
      await deviceService.deactivate(row.id);
      Toast.show({ type: 'success', message: t('devices.deactivate_success') });
      load();
    } catch (error) {
      Toast.show({ type: 'error', message: apiMessage(error) });
    }
  }

  async function load() {
    table.setLoading(true);
    try {
      const [deviceResponse, sectorResponse] = await Promise.all([
        deviceService.list(),
        sectorService.list({ active: null }),
      ]);
      devices = deviceResponse.devices || [];
      sectors = sectorResponse.sectors || [];
      sectorFilter.setOptions(
        sectors.map(sector => ({ value: sector.id, label: sector.name })),
        sectorFilter.getValue(),
      );
      renderRows();
    } catch (error) {
      table.setError(error?.message || t('common.error_generic'), load);
    }
  }

  load();
}
