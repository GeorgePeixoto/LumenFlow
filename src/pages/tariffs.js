/**
 * EnergyFlow — Tariffs Page (US10-F3)
 *
 * DataTable of tariff history, create/edit modal, overlap validation.
 */
import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createDataTable } from '../components/DataTable.js';
import { createButton } from '../components/Button.js';
import { createModal } from '../components/Modal.js';
import { createInput } from '../components/Input.js';
import { createSelect } from '../components/Select.js';
import { Toast } from '../components/Toast.js';
import { tariffService } from '../services/tariffService.js';

export async function renderTariffsPage(content) {
  content.innerHTML = '';

  const { el: headerEl } = createPageHeader({
    title: t('tariffs.title'),
    breadcrumb: [
      { label: t('nav.financial'), href: '#/financial' },
      { label: t('tariffs.title') },
    ],
  });
  content.appendChild(headerEl);

  // ── Actions ─────────────────────────────────────────────────────────
  const actionsRow = document.createElement('div');
  actionsRow.className = 'tariffs-actions';
  const newBtn = createButton({ label: t('tariffs.new'), variant: 'primary' });
  newBtn.el.addEventListener('click', () => openTariffModal(null, table));
  actionsRow.appendChild(newBtn.el);
  content.appendChild(actionsRow);

  // ── DataTable ───────────────────────────────────────────────────────
  const table = createDataTable({
    columns: [
      { key: 'modality', header: t('tariffs.modality'), accessor: (r) => t(`tariffs.modalities.${r.modality}`) || r.modality },
      { key: 'flag', header: t('tariffs.flag'), accessor: (r) => t(`tariffs.flags.${r.flag}`) || r.flag || '—' },
      { key: 'rate_kwh', header: t('tariffs.rate_kwh'), accessor: (r) => r.rate_kwh != null ? `R$ ${Number(r.rate_kwh).toFixed(4)}` : '—' },
      { key: 'valid_from', header: t('tariffs.valid_from'), accessor: (r) => r.valid_from ? new Date(r.valid_from).toLocaleDateString('pt-BR') : '—', sortable: true },
      { key: 'valid_until', header: t('tariffs.valid_until'), accessor: (r) => r.valid_until ? new Date(r.valid_until).toLocaleDateString('pt-BR') : '—' },
      {
        key: 'status',
        header: '',
        render: (r) => {
          if (r.is_current) {
            const badge = document.createElement('span');
            badge.className = 'tariffs-badge--current';
            badge.textContent = t('tariffs.current');
            return badge;
          }
          return document.createTextNode('');
        },
      },
      {
        key: '_actions',
        header: '',
        align: 'right',
        render: (r) => {
          const editBtn = createButton({ label: t('common.edit'), variant: 'ghost', size: 'sm' });
          editBtn.el.addEventListener('click', () => openTariffModal(r, table));
          return editBtn.el;
        },
      },
    ],
    loading: true,
    empty: { title: t('tariffs.no_tariffs') },
  });
  content.appendChild(table.el);

  // ── Load data ─────────────────────────────────────────────────────
  loadTariffs(table);
}

async function loadTariffs(table) {
  table.setLoading(true);
  try {
    const data = await tariffService.list();
    const tariffs = data?.tariffs || data?.data || data || [];
    table.setRows(tariffs);
  } catch (err) {
    table.setError(err?.message || t('common.error_generic'), () => loadTariffs(table));
  }
}

function openTariffModal(tariff, table) {
  const isEdit = !!tariff;
  const form = document.createElement('form');
  form.className = 'tariff-form';

  const modalitySelect = createSelect({
    label: t('tariffs.modality'),
    options: [
      { value: 'conventional', label: t('tariffs.modalities.conventional') },
      { value: 'time_of_use', label: t('tariffs.modalities.time_of_use') },
    ],
    value: tariff?.modality || 'conventional',
  });

  const flagSelect = createSelect({
    label: t('tariffs.flag'),
    options: [
      { value: 'green', label: t('tariffs.flags.green') },
      { value: 'yellow', label: t('tariffs.flags.yellow') },
      { value: 'red_1', label: t('tariffs.flags.red_1') },
      { value: 'red_2', label: t('tariffs.flags.red_2') },
    ],
    value: tariff?.flag || 'green',
  });

  const rateInput = createInput({
    label: t('tariffs.rate_kwh'),
    type: 'number',
    value: tariff?.rate_kwh ?? '',
    required: true,
    attrs: { step: '0.0001', min: '0' },
  });

  const validFromInput = createInput({
    label: t('tariffs.valid_from'),
    type: 'date',
    value: tariff?.valid_from ? tariff.valid_from.split('T')[0] : '',
    required: true,
  });

  const validUntilInput = createInput({
    label: t('tariffs.valid_until'),
    type: 'date',
    value: tariff?.valid_until ? tariff.valid_until.split('T')[0] : '',
    placeholder: t('tariffs.valid_until_placeholder'),
  });

  form.appendChild(modalitySelect.el);
  form.appendChild(flagSelect.el);
  form.appendChild(rateInput.el);
  form.appendChild(validFromInput.el);
  form.appendChild(validUntilInput.el);

  const saveBtn = createButton({ label: t('common.save'), variant: 'primary' });
  const cancelBtn = createButton({ label: t('common.cancel'), variant: 'ghost' });

  const modal = createModal({
    title: isEdit ? t('tariffs.edit') : t('tariffs.new'),
    content: form,
    footer: [cancelBtn.el, saveBtn.el],
    size: 'sm',
  });

  cancelBtn.el.addEventListener('click', () => { modal.close(); modal.el.remove(); });

  saveBtn.el.addEventListener('click', async (e) => {
    e.preventDefault();
    const payload = {
      modality: modalitySelect.getValue(),
      flag: flagSelect.getValue(),
      rate_kwh: parseFloat(rateInput.getValue()),
      valid_from: validFromInput.getValue(),
      valid_until: validUntilInput.getValue() || null,
    };

    try {
      if (isEdit) {
        await tariffService.update(tariff.id, payload);
      } else {
        await tariffService.create(payload);
      }
      Toast.show({ message: t('tariffs.save_success'), type: 'success' });
      modal.close();
      modal.el.remove();
      loadTariffs(table);
    } catch (err) {
      const msg = err?.code === 'OVERLAP' ? t('tariffs.error_overlap') : (err?.message || t('common.error'));
      Toast.show({ message: msg, type: 'error' });
    }
  });

  document.body.appendChild(modal.el);
  modal.open();
}
