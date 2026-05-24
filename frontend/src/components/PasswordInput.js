/**
 * LumenFlow — PasswordInput component
 *
 * Input de senha com toggle de visibilidade (cobre US04).
 *
 * Uso:
 *   import { createPasswordInput } from './components/PasswordInput.js';
 *   const { el, getValue } = createPasswordInput({ label: 'Senha' });
 */
import { createFormField } from './FormField.js';

const EYE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

/**
 * @param {Object}   props
 * @param {string}  [props.label]       - Label
 * @param {string}  [props.placeholder] - Placeholder
 * @param {string}  [props.value]       - Valor inicial
 * @param {boolean} [props.required]    - Obrigatorio
 * @param {boolean} [props.disabled]    - Desabilitado
 * @param {string}  [props.error]       - Erro inicial
 * @param {string}  [props.helper]      - Helper text
 * @param {string}  [props.name]        - name attr
 * @param {string}  [props.id]          - ID customizado
 * @param {string}  [props.autocomplete]- Autocomplete (new-password, current-password)
 * @param {Function}[props.onInput]     - Callback em input
 * @param {Function}[props.onBlur]      - Callback em blur
 * @returns {{ el: HTMLElement, input: HTMLInputElement, getValue: Function, setValue: Function, setError: Function, setDisabled: Function, focus: Function }}
 */
export function createPasswordInput({
  label = '',
  placeholder = '',
  value = '',
  required = false,
  disabled = false,
  error = '',
  helper = '',
  name = '',
  id = null,
  autocomplete = '',
  onInput = null,
  onBlur = null,
} = {}) {
  const field = createFormField({ label, required, helper, error, id });

  field.inputSlot.classList.add('ef-field__input-wrap--icon-right');

  // Input
  const input = document.createElement('input');
  input.className = 'ef-input';
  input.type = 'password';
  input.id = field.getId();
  input.placeholder = placeholder;
  input.value = value;
  input.disabled = disabled;
  if (name) input.name = name;
  if (required) input.required = true;
  if (autocomplete) input.autocomplete = autocomplete;

  // Aria
  const describedBy = [];
  if (error) describedBy.push(field.getErrorId());
  if (helper) describedBy.push(field.getHelperId());
  if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
  if (error) input.setAttribute('aria-invalid', 'true');

  // Events
  if (onInput) input.addEventListener('input', (e) => onInput(e.target.value, e));
  if (onBlur) input.addEventListener('blur', (e) => onBlur(e.target.value, e));

  field.inputSlot.appendChild(input);

  // Toggle button
  let visible = false;
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'ef-field__icon-right';
  toggleBtn.setAttribute('aria-label', 'Mostrar senha');
  toggleBtn.setAttribute('tabindex', '-1');
  toggleBtn.innerHTML = EYE_ICON;

  toggleBtn.addEventListener('click', () => {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    toggleBtn.innerHTML = visible ? EYE_OFF_ICON : EYE_ICON;
    toggleBtn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
  });

  field.inputSlot.appendChild(toggleBtn);

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
    setDisabled: (v) => { input.disabled = !!v; toggleBtn.disabled = !!v; },
    focus: () => input.focus(),
  };
}
