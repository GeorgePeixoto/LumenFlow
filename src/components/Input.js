/**
 * EnergyFlow — Input component
 *
 * Uso:
 *   import { createInput } from './components/Input.js';
 *   const { el, getValue, setValue, setError } = createInput({ label: 'E-mail', type: 'email' });
 *   form.appendChild(el);
 */
import { createFormField } from './FormField.js';

/**
 * @param {Object}   props
 * @param {string}  [props.label]       - Label text
 * @param {string}  [props.type]        - text | email | password | number | tel | url (default: text)
 * @param {string}  [props.placeholder] - Placeholder
 * @param {string}  [props.value]       - Valor inicial
 * @param {boolean} [props.required]    - Obrigatorio
 * @param {boolean} [props.disabled]    - Desabilitado
 * @param {string}  [props.error]       - Mensagem de erro inicial
 * @param {string}  [props.helper]      - Helper text
 * @param {string}  [props.icon]        - SVG string para icone esquerdo
 * @param {string}  [props.name]        - Atributo name
 * @param {string}  [props.id]          - ID customizado
 * @param {string}  [props.autocomplete]- Autocomplete
 * @param {number}  [props.maxLength]   - maxlength
 * @param {Function}[props.onInput]     - Callback em input
 * @param {Function}[props.onBlur]      - Callback em blur
 * @param {Function}[props.onChange]     - Callback em change
 * @returns {{ el: HTMLElement, input: HTMLInputElement, getValue: Function, setValue: Function, setError: Function, setDisabled: Function, focus: Function }}
 */
export function createInput({
  label = '',
  type = 'text',
  placeholder = '',
  value = '',
  required = false,
  disabled = false,
  error = '',
  helper = '',
  icon = null,
  name = '',
  id = null,
  autocomplete = '',
  maxLength = null,
  onInput = null,
  onBlur = null,
  onChange = null,
} = {}) {
  const field = createFormField({ label, required, helper, error, id });

  // Icon left
  if (icon) {
    field.inputSlot.classList.add('ef-field__input-wrap--icon-left');
    const iconEl = document.createElement('span');
    iconEl.className = 'ef-field__icon-left';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = icon;
    field.inputSlot.appendChild(iconEl);
  }

  // Input element
  const input = document.createElement('input');
  input.className = 'ef-input';
  input.type = type;
  input.id = field.getId();
  input.placeholder = placeholder;
  input.value = value;
  input.disabled = disabled;
  if (name) input.name = name;
  if (required) input.required = true;
  if (autocomplete) input.autocomplete = autocomplete;
  if (maxLength !== null) input.maxLength = maxLength;

  // Aria
  const describedBy = [];
  if (error) describedBy.push(field.getErrorId());
  if (helper) describedBy.push(field.getHelperId());
  if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
  if (error) input.setAttribute('aria-invalid', 'true');

  // Events
  if (onInput) input.addEventListener('input', (e) => onInput(e.target.value, e));
  if (onBlur) input.addEventListener('blur', (e) => onBlur(e.target.value, e));
  if (onChange) input.addEventListener('change', (e) => onChange(e.target.value, e));

  field.inputSlot.appendChild(input);

  return {
    el: field.container,
    input,
    getValue: () => input.value,
    setValue: (v) => { input.value = v; },
    setError: (msg) => {
      field.setError(msg);
      const ids = [msg ? field.getErrorId() : null, helper ? field.getHelperId() : null].filter(Boolean);
      input.setAttribute('aria-describedby', ids.join(' '));
    },
    setDisabled: (v) => { input.disabled = !!v; },
    focus: () => input.focus(),
  };
}
