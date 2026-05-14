/**
 * LumenFlow — Textarea component
 *
 * Uso:
 *   import { createTextarea } from './components/Textarea.js';
 *   const { el, getValue } = createTextarea({ label: 'Descricao', rows: 4 });
 */
import { createFormField } from './FormField.js';

/**
 * @param {Object}   props
 * @param {string}  [props.label]       - Label
 * @param {string}  [props.placeholder] - Placeholder
 * @param {string}  [props.value]       - Valor inicial
 * @param {number}  [props.rows]        - Linhas visiveis (default: 4)
 * @param {boolean} [props.required]    - Obrigatorio
 * @param {boolean} [props.disabled]    - Desabilitado
 * @param {string}  [props.error]       - Erro inicial
 * @param {string}  [props.helper]      - Helper text
 * @param {string}  [props.name]        - name attr
 * @param {string}  [props.id]          - ID customizado
 * @param {number}  [props.maxLength]   - maxlength
 * @param {Function}[props.onInput]     - Callback em input
 * @param {Function}[props.onBlur]      - Callback em blur
 * @returns {{ el: HTMLElement, textarea: HTMLTextAreaElement, getValue: Function, setValue: Function, setError: Function, setDisabled: Function }}
 */
export function createTextarea({
  label = '',
  placeholder = '',
  value = '',
  rows = 4,
  required = false,
  disabled = false,
  error = '',
  helper = '',
  name = '',
  id = null,
  maxLength = null,
  onInput = null,
  onBlur = null,
} = {}) {
  const field = createFormField({ label, required, helper, error, id });

  const textarea = document.createElement('textarea');
  textarea.className = 'ef-textarea';
  textarea.id = field.getId();
  textarea.placeholder = placeholder;
  textarea.value = value;
  textarea.rows = rows;
  textarea.disabled = disabled;
  if (name) textarea.name = name;
  if (required) textarea.required = true;
  if (maxLength !== null) textarea.maxLength = maxLength;

  // Aria
  if (error) textarea.setAttribute('aria-invalid', 'true');
  const describedBy = [];
  if (error) describedBy.push(field.getErrorId());
  if (helper) describedBy.push(field.getHelperId());
  if (describedBy.length) textarea.setAttribute('aria-describedby', describedBy.join(' '));

  if (onInput) textarea.addEventListener('input', (e) => onInput(e.target.value, e));
  if (onBlur) textarea.addEventListener('blur', (e) => onBlur(e.target.value, e));

  field.inputSlot.appendChild(textarea);

  return {
    el: field.container,
    textarea,
    getValue: () => textarea.value,
    setValue: (v) => { textarea.value = v; },
    setError: (msg) => {
      field.setError(msg);
      const ids = [msg ? field.getErrorId() : null, helper ? field.getHelperId() : null].filter(Boolean);
      textarea.setAttribute('aria-describedby', ids.join(' '));
    },
    setDisabled: (v) => { textarea.disabled = !!v; },
  };
}
