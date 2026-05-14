import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createButton } from '../components/Button.js';
import { createCheckbox } from '../components/Checkbox.js';
import { createInput } from '../components/Input.js';
import { createSelect } from '../components/Select.js';
import { createSpinner } from '../components/Spinner.js';
import { createErrorState } from '../components/ErrorState.js';
import { Toast } from '../components/Toast.js';
import { settingsService } from '../services/settingsService.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Belem', label: 'Belém (GMT-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
];

function createTimeInput(label, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bh-time-input';

  const lbl = document.createElement('label');
  lbl.className = 'bh-time-input__label';
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const input = document.createElement('input');
  input.type = 'time';
  input.className = 'bh-time-input__field';
  input.value = value || '08:00';
  wrapper.appendChild(input);

  return { el: wrapper, getValue: () => input.value, setValue: (v) => { input.value = v; }, setDisabled: (d) => { input.disabled = d; } };
}

function createDayRow(dayKey, config) {
  const row = document.createElement('div');
  row.className = 'bh-day-row';

  const enabled = config?.enabled !== false;
  const startVal = config?.start || '08:00';
  const endVal = config?.end || '18:00';

  const checkbox = createCheckbox({ label: t(`business_hours.days.${dayKey}`), checked: enabled });
  row.appendChild(checkbox.el);

  const times = document.createElement('div');
  times.className = 'bh-day-row__times';

  const startInput = createTimeInput(t('business_hours.start'), startVal);
  const endInput = createTimeInput(t('business_hours.end'), endVal);
  times.appendChild(startInput.el);
  times.appendChild(endInput.el);
  row.appendChild(times);

  const closedLabel = document.createElement('span');
  closedLabel.className = 'bh-day-row__closed';
  closedLabel.textContent = t('business_hours.closed');
  closedLabel.hidden = enabled;
  row.appendChild(closedLabel);

  function updateState() {
    const on = checkbox.isChecked();
    startInput.setDisabled(!on);
    endInput.setDisabled(!on);
    times.style.opacity = on ? '1' : '0.4';
    closedLabel.hidden = on;
  }

  checkbox.el.addEventListener('change', updateState);
  updateState();

  return {
    el: row,
    getValue: () => ({
      enabled: checkbox.isChecked(),
      start: startInput.getValue(),
      end: endInput.getValue(),
    }),
    setValue: (cfg) => {
      checkbox.setChecked(cfg.enabled !== false);
      startInput.setValue(cfg.start || '08:00');
      endInput.setValue(cfg.end || '18:00');
      updateState();
    },
  };
}

export function renderSettingsPage(content) {
  content.innerHTML = '';

  const { el: headerEl } = createPageHeader({
    title: t('nav.settings'),
    breadcrumb: [
      { label: 'Dashboard', href: '#/dashboard' },
      { label: t('nav.settings') },
    ],
  });
  content.appendChild(headerEl);

  // Business hours section
  const section = document.createElement('section');
  section.className = 'settings-section';
  content.appendChild(section);

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'settings-section__title';
  sectionTitle.textContent = t('business_hours.title');
  section.appendChild(sectionTitle);

  const sectionDesc = document.createElement('p');
  sectionDesc.className = 'settings-section__desc';
  sectionDesc.textContent = t('business_hours.subtitle');
  section.appendChild(sectionDesc);

  const body = document.createElement('div');
  body.className = 'settings-section__body';
  section.appendChild(body);

  // Loading
  const spinner = createSpinner({ size: 'md' });
  body.appendChild(spinner.el);

  loadBusinessHours(body, section);
}

async function loadBusinessHours(body, section) {
  try {
    const data = await settingsService.getBusinessHours();
    renderForm(body, data);
  } catch (error) {
    body.innerHTML = '';
    if (error?.status === 404) {
      renderForm(body, null);
    } else {
      const err = createErrorState({
        message: error?.message || t('common.error_generic'),
        onRetry: () => {
          body.innerHTML = '';
          const spinner = createSpinner({ size: 'md' });
          body.appendChild(spinner.el);
          loadBusinessHours(body, section);
        },
      });
      body.appendChild(err.el);
    }
  }
}

function renderForm(body, data) {
  body.innerHTML = '';

  const form = document.createElement('div');
  form.className = 'bh-form';

  // Timezone
  const tzRow = document.createElement('div');
  tzRow.className = 'bh-timezone-row';
  const tzSelect = createSelect({
    label: t('business_hours.timezone'),
    options: TIMEZONES,
    value: data?.timezone || 'America/Sao_Paulo',
  });
  tzRow.appendChild(tzSelect.el);
  form.appendChild(tzRow);

  // Days
  const daysContainer = document.createElement('div');
  daysContainer.className = 'bh-days';

  const dayRows = {};
  DAYS.forEach((day) => {
    const config = data?.days?.[day] || getDefaultForDay(day);
    const row = createDayRow(day, config);
    dayRows[day] = row;
    daysContainer.appendChild(row.el);
  });
  form.appendChild(daysContainer);

  // Save button
  const actions = document.createElement('div');
  actions.className = 'bh-actions';
  const saveBtn = createButton({ label: 'Salvar', variant: 'primary' });
  actions.appendChild(saveBtn.el);
  form.appendChild(actions);

  saveBtn.el.addEventListener('click', async () => {
    saveBtn.setLoading(true);
    const payload = {
      timezone: tzSelect.getValue(),
      days: {},
    };
    DAYS.forEach((day) => {
      payload.days[day] = dayRows[day].getValue();
    });

    try {
      await settingsService.saveBusinessHours(payload);
      Toast.show({ message: t('business_hours.save_success'), type: 'success' });
    } catch (error) {
      Toast.show({ message: error?.message || t('common.error_generic'), type: 'error' });
    } finally {
      saveBtn.setLoading(false);
    }
  });

  body.appendChild(form);
}

function getDefaultForDay(day) {
  if (day === 'saturday') return { enabled: false, start: '08:00', end: '12:00' };
  if (day === 'sunday') return { enabled: false, start: '08:00', end: '12:00' };
  return { enabled: true, start: '08:00', end: '18:00' };
}
