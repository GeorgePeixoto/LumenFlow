/**
 * EnergyFlow — Select component
 *
 * Uso:
 *   import { createSelect } from './components/Select.js';
 *   const { el, getValue } = createSelect({
 *     label: 'Segmento',
 *     options: [{ value: 'food', label: 'Alimentos' }, ...],
 *   });
 */
import { createFormField } from './FormField.js';

/**
 * @param {Object}   props
 * @param {string}  [props.label]       - Label
 * @param {Array<{value: string, label: string}>} [props.options] - Opcoes
 * @param {string}  [props.value]       - Valor selecionado
 * @param {string}  [props.placeholder] - Texto do option vazio (default: 'Selecione...')
 * @param {boolean} [props.required]    - Obrigatorio
 * @param {boolean} [props.disabled]    - Desabilitado
 * @param {string}  [props.error]       - Erro inicial
 * @param {string}  [props.helper]      - Helper text
 * @param {string}  [props.name]        - name attr
 * @param {string}  [props.id]          - ID customizado
 * @param {Function}[props.onChange]     - Callback em change
 * @param {Function}[props.onBlur]      - Callback em blur
 * @returns {{ el: HTMLElement, select: HTMLSelectElement, getValue: Function, setValue: Function, setError: Function, setDisabled: Function, setOptions: Function }}
 */
export function createSelect({
  label = '',
  options = [],
  value = '',
  placeholder = 'Selecione...',
  required = false,
  disabled = false,
  error = '',
  helper = '',
  name = '',
  id = null,
  onChange = null,
  onBlur = null,
} = {}) {
  const field = createFormField({ label, required, helper, error, id });

  const select = document.createElement('select');
  select.className = 'ef-select';
  select.id = field.getId();
  select.disabled = disabled;
  if (name) select.name = name;
  if (required) select.required = true;

  // Aria
  if (error) select.setAttribute('aria-invalid', 'true');
  const describedBy = [];
  if (error) describedBy.push(field.getErrorId());
  if (helper) describedBy.push(field.getHelperId());
  if (describedBy.length) select.setAttribute('aria-describedby', describedBy.join(' '));

  function renderOptions(opts, selectedValue) {
    select.innerHTML = '';

    if (placeholder) {
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = placeholder;
      placeholderOpt.disabled = true;
      placeholderOpt.selected = !selectedValue;
      select.appendChild(placeholderOpt);
    }

    for (const opt of opts) {
      const optEl = document.createElement('option');
      optEl.value = opt.value;
      optEl.textContent = opt.label;
      if (opt.value === selectedValue) optEl.selected = true;
      select.appendChild(optEl);
    }
  }

  renderOptions(options, value);

  if (onChange) select.addEventListener('change', (e) => onChange(e.target.value, e));
  if (onBlur) select.addEventListener('blur', (e) => onBlur(e.target.value, e));

  field.inputSlot.appendChild(select);

  let currentOptions = options;

  return {
    el: field.container,
    select,
    getValue: () => select.value,
    setValue: (v) => { select.value = v; },
    setError: (msg) => {
      field.setError(msg);
      const ids = [msg ? field.getErrorId() : null, helper ? field.getHelperId() : null].filter(Boolean);
      select.setAttribute('aria-describedby', ids.join(' '));
    },
    setDisabled: (v) => { select.disabled = !!v; },
    setOptions: (newOptions, selectedValue) => {
      currentOptions = newOptions;
      renderOptions(currentOptions, selectedValue || select.value);
    },
  };
}
