/**
 * EnergyFlow — Checkbox & Radio components
 *
 * Uso:
 *   import { createCheckbox, createRadio } from './components/Checkbox.js';
 *   const { el, isChecked } = createCheckbox({ label: 'Aceito os termos' });
 */

let checkCounter = 0;

/**
 * @param {Object}   props
 * @param {string}   props.label     - Label text
 * @param {boolean} [props.checked]  - Marcado inicialmente
 * @param {boolean} [props.disabled] - Desabilitado
 * @param {string}  [props.name]     - name attr
 * @param {string}  [props.value]    - value attr (para radio groups)
 * @param {string}  [props.id]       - ID customizado
 * @param {Function}[props.onChange]  - Callback(checked, event)
 * @returns {{ el: HTMLElement, input: HTMLInputElement, isChecked: Function, setChecked: Function, setDisabled: Function }}
 */
export function createCheckbox({
  label = '',
  checked = false,
  disabled = false,
  name = '',
  value = '',
  id = null,
  onChange = null,
} = {}) {
  return _createCheck('checkbox', { label, checked, disabled, name, value, id, onChange });
}

/**
 * @param {Object} props - Mesmas props de createCheckbox
 */
export function createRadio(props = {}) {
  return _createCheck('radio', props);
}

function _createCheck(type, {
  label = '',
  checked = false,
  disabled = false,
  name = '',
  value = '',
  id = null,
  onChange = null,
}) {
  const checkId = id || `ef-check-${++checkCounter}`;

  const container = document.createElement('label');
  container.className = 'ef-check';
  container.setAttribute('for', checkId);

  const input = document.createElement('input');
  input.type = type;
  input.className = 'ef-check__input';
  input.id = checkId;
  input.checked = checked;
  input.disabled = disabled;
  if (name) input.name = name;
  if (value) input.value = value;

  const labelEl = document.createElement('span');
  labelEl.className = 'ef-check__label';
  labelEl.textContent = label;

  if (onChange) {
    input.addEventListener('change', (e) => onChange(e.target.checked, e));
  }

  container.appendChild(input);
  container.appendChild(labelEl);

  return {
    el: container,
    input,
    isChecked: () => input.checked,
    setChecked: (v) => { input.checked = !!v; },
    setDisabled: (v) => { input.disabled = !!v; },
  };
}
