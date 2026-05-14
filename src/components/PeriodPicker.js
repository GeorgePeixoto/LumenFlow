/**
 * EnergyFlow — PeriodPicker (F2-F7).
 *
 * Seletor de período reutilizável para gráficos e relatórios.
 * Presets: Hoje, Últimos 7 dias, Últimos 30 dias, Mês atual, Mês anterior,
 *          Personalizado (abre dois inputs de data nativos).
 *
 * Emite { from, to, preset, granularity } via onChange.
 * Granularidade calculada automaticamente pelo intervalo selecionado:
 *   ≤ 2 dias  → 'hour'
 *   ≤ 31 dias → 'day'
 *   ≤ 90 dias → 'week'
 *   > 90 dias → 'month'
 *
 * Sincronização de URL (syncUrl: true): atualiza silenciosamente o hash
 * com ?from=YYYY-MM-DD&to=YYYY-MM-DD via history.replaceState, sem
 * disparar hashchange/re-rota. Na inicialização, lê from/to da URL se
 * presentes e os usa como valor inicial.
 *
 * Decisão de lib: sem flatpickr ou vanilla-datepicker. Dois <input type="date">
 * nativos cobrem o caso "Personalizado" com acessibilidade built-in e zero
 * dependência externa. Para o B2B desktop-first do EnergyFlow, o date input
 * nativo tem UX aceitável. Se um calendário visual for necessário no futuro,
 * pode ser adicionado apenas neste componente sem afetar o resto.
 *
 * Uso:
 *   import { createPeriodPicker } from './components/PeriodPicker.js';
 *
 *   const picker = createPeriodPicker({
 *     onChange: ({ from, to, preset, granularity }) => loadChart(from, to),
 *     syncUrl:  true,
 *   });
 *   container.appendChild(picker.el);
 *
 *   picker.getValue();                     // { from, to, preset, granularity }
 *   picker.setValue({ from, to, preset }); // atualiza sem disparar onChange
 *
 * @param {Object}   props
 * @param {Object}   [props.value]           – valor inicial { from?, to?, preset? }
 * @param {Function} [props.onChange]        – callback({ from, to, preset, granularity })
 * @param {boolean}  [props.syncUrl=false]   – sincroniza com query string do hash
 * @returns {{ el: HTMLElement, getValue: Function, setValue: Function }}
 */
import { t }                                               from '../i18n/pt-BR.js';
import { presetRanges, daysBetween, fromIsoDate, toIsoDate } from '../utils/dates.js';

// ── Presets ──────────────────────────────────────────────────────────────────

const PRESET_KEYS = ['today', 'last7', 'last30', 'currentMonth', 'previousMonth', 'custom'];

const PRESET_LABELS = {
  today:         () => t('period.today'),
  last7:         () => t('period.last_7'),
  last30:        () => t('period.last_30'),
  currentMonth:  () => t('period.current_month'),
  previousMonth: () => t('period.previous_month'),
  custom:        () => t('period.custom'),
};

// ── Granularidade ────────────────────────────────────────────────────────────

function calcGranularity(from, to) {
  try {
    const days = daysBetween(fromIsoDate(from), fromIsoDate(to));
    if (days <= 2)  return 'hour';
    if (days <= 31) return 'day';
    if (days <= 90) return 'week';
    return 'month';
  } catch {
    return 'day';
  }
}

// ── URL helpers ──────────────────────────────────────────────────────────────

function readUrlDates() {
  const hash = window.location.hash; // e.g. '#/dashboard?from=...&to=...'
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return {};
  const params = new URLSearchParams(hash.slice(qIdx + 1));
  return { from: params.get('from') || '', to: params.get('to') || '' };
}

function writeUrlDates(from, to) {
  const hash   = window.location.hash;
  const qIdx   = hash.indexOf('?');
  const path   = qIdx === -1 ? hash : hash.slice(0, qIdx);
  const params = new URLSearchParams(qIdx === -1 ? '' : hash.slice(qIdx + 1));
  params.set('from', from);
  params.set('to', to);
  history.replaceState(null, '', `${path}?${params}`);
}

// ── Resolve preset → { from, to } ───────────────────────────────────────────

function resolvePreset(key) {
  const ranges = presetRanges();
  const range  = ranges[key];
  if (!range) return null;
  return { from: toIsoDate(range.from), to: toIsoDate(range.to) };
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createPeriodPicker({
  value    = {},
  onChange = null,
  syncUrl  = false,
} = {}) {

  // ── Resolve estado inicial ────────────────────────────────────────
  let _preset = value.preset || 'currentMonth';
  let _from   = value.from   || '';
  let _to     = value.to     || '';

  // Se syncUrl, lê da URL — prevalece sobre o valor passado
  if (syncUrl) {
    const urlDates = readUrlDates();
    if (urlDates.from && urlDates.to) {
      _from   = urlDates.from;
      _to     = urlDates.to;
      _preset = 'custom'; // vindo de URL → tratar como custom
    }
  }

  // Se ainda sem datas, resolve o preset padrão
  if (!_from || !_to) {
    const resolved = resolvePreset(_preset);
    if (resolved) { _from = resolved.from; _to = resolved.to; }
  }

  // ── Raiz ─────────────────────────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'period-picker';

  // ── Presets ───────────────────────────────────────────────────────
  const presetsEl = document.createElement('div');
  presetsEl.className = 'period-picker__presets';
  presetsEl.setAttribute('role', 'group');
  presetsEl.setAttribute('aria-label', t('period.label'));

  const btnEls = {};

  for (const key of PRESET_KEYS) {
    const btn = document.createElement('button');
    btn.className   = 'period-picker__btn';
    btn.textContent = PRESET_LABELS[key]();
    btn.dataset.preset = key;
    btn.addEventListener('click', () => selectPreset(key));
    presetsEl.appendChild(btn);
    btnEls[key] = btn;
  }

  el.appendChild(presetsEl);

  // ── Painel custom ─────────────────────────────────────────────────
  const customEl = document.createElement('div');
  customEl.className = 'period-picker__custom';
  customEl.hidden = true;

  // Label "De"
  const fromLabel = document.createElement('label');
  fromLabel.className = 'period-picker__date-label';
  const fromSpan = document.createElement('span');
  fromSpan.textContent = t('period.from');
  const fromInput = document.createElement('input');
  fromInput.type      = 'date';
  fromInput.className = 'period-picker__date-input';
  fromInput.setAttribute('aria-label', t('period.from'));
  fromLabel.appendChild(fromSpan);
  fromLabel.appendChild(fromInput);

  // Separador
  const sep = document.createElement('span');
  sep.className = 'period-picker__sep';
  sep.textContent = '–';
  sep.setAttribute('aria-hidden', 'true');

  // Label "Até"
  const toLabel = document.createElement('label');
  toLabel.className = 'period-picker__date-label';
  const toSpan = document.createElement('span');
  toSpan.textContent = t('period.to');
  const toInput = document.createElement('input');
  toInput.type      = 'date';
  toInput.className = 'period-picker__date-input';
  toInput.setAttribute('aria-label', t('period.to'));
  toLabel.appendChild(toSpan);
  toLabel.appendChild(toInput);

  // Botão Aplicar
  const applyBtn = document.createElement('button');
  applyBtn.className   = 'period-picker__apply-btn';
  applyBtn.textContent = t('period.apply');
  applyBtn.addEventListener('click', applyCustom);

  // Validação inline
  const customError = document.createElement('span');
  customError.className = 'period-picker__custom-error';
  customError.setAttribute('role', 'alert');
  customError.hidden = true;

  customEl.appendChild(fromLabel);
  customEl.appendChild(sep);
  customEl.appendChild(toLabel);
  customEl.appendChild(applyBtn);
  customEl.appendChild(customError);
  el.appendChild(customEl);

  // ── Inicializa UI ─────────────────────────────────────────────────
  updateActiveBtn();
  if (_preset === 'custom') {
    customEl.hidden = false;
    fromInput.value = _from;
    toInput.value   = _to;
  }

  // ── Handlers ──────────────────────────────────────────────────────

  function selectPreset(key) {
    _preset = key;
    updateActiveBtn();

    if (key === 'custom') {
      customEl.hidden = false;
      fromInput.value = _from;
      toInput.value   = _to;
      fromInput.focus();
      return; // aguarda "Aplicar"
    }

    customEl.hidden    = true;
    customError.hidden = true;

    const resolved = resolvePreset(key);
    if (resolved) {
      _from = resolved.from;
      _to   = resolved.to;
      emit();
    }
  }

  function applyCustom() {
    customError.hidden = true;
    const from = fromInput.value;
    const to   = toInput.value;

    if (!from || !to) {
      customError.textContent = t('validation.required');
      customError.hidden = false;
      return;
    }
    if (from > to) {
      customError.textContent = t('validation.date_range_invalid');
      customError.hidden = false;
      return;
    }

    _from = from;
    _to   = to;
    emit();
  }

  function emit() {
    if (syncUrl) writeUrlDates(_from, _to);
    onChange?.({ from: _from, to: _to, preset: _preset, granularity: calcGranularity(_from, _to) });
  }

  function updateActiveBtn() {
    for (const [key, btn] of Object.entries(btnEls)) {
      btn.classList.toggle('period-picker__btn--active', key === _preset);
      btn.setAttribute('aria-pressed', key === _preset ? 'true' : 'false');
    }
  }

  // ── API pública ───────────────────────────────────────────────────

  function getValue() {
    return { from: _from, to: _to, preset: _preset, granularity: calcGranularity(_from, _to) };
  }

  function setValue({ from, to, preset } = {}) {
    if (preset) _preset = preset;
    if (from)   _from   = from;
    if (to)     _to     = to;

    if (_preset !== 'custom') {
      const resolved = resolvePreset(_preset);
      if (resolved) { _from = resolved.from; _to = resolved.to; }
      customEl.hidden = true;
    } else {
      fromInput.value = _from;
      toInput.value   = _to;
      customEl.hidden = false;
    }

    updateActiveBtn();
  }

  return { el, getValue, setValue };
}
