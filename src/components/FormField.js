/**
 * EnergyFlow — FormField wrapper
 *
 * Wrapper consistente para label, input slot, helper text e mensagem de erro.
 * Usado internamente por Input, Select, Textarea, etc.
 */

let fieldCounter = 0;

/**
 * @param {Object} props
 * @param {string}  [props.label]      - Texto do label
 * @param {boolean} [props.required]   - Marca como obrigatorio
 * @param {string}  [props.helper]     - Texto auxiliar
 * @param {string}  [props.error]      - Mensagem de erro
 * @param {string}  [props.id]         - ID para associar label/input (auto-gerado se omitido)
 * @returns {{ container: HTMLElement, inputSlot: HTMLElement, setError: Function, setHelper: Function, getId: Function }}
 */
export function createFormField({
  label = '',
  required = false,
  helper = '',
  error = '',
  id = null,
} = {}) {
  const fieldId = id || `ef-field-${++fieldCounter}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  // Container
  const container = document.createElement('div');
  container.className = 'ef-field';

  // Label
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'ef-field__label';
    labelEl.setAttribute('for', fieldId);

    const labelText = document.createTextNode(label);
    labelEl.appendChild(labelText);

    if (required) {
      const reqSpan = document.createElement('span');
      reqSpan.className = 'ef-field__required';
      reqSpan.textContent = '*';
      reqSpan.setAttribute('aria-hidden', 'true');
      labelEl.appendChild(reqSpan);
    }

    container.appendChild(labelEl);
  }

  // Input slot (onde o input/select/textarea sera inserido)
  const inputSlot = document.createElement('div');
  inputSlot.className = 'ef-field__input-wrap';
  container.appendChild(inputSlot);

  // Helper text
  const helperEl = document.createElement('p');
  helperEl.className = 'ef-field__helper';
  helperEl.id = helperId;
  helperEl.textContent = helper;
  if (!helper) helperEl.style.display = 'none';
  container.appendChild(helperEl);

  // Error
  const errorEl = document.createElement('p');
  errorEl.className = 'ef-field__error';
  errorEl.id = errorId;
  errorEl.setAttribute('role', 'alert');
  errorEl.textContent = error;
  if (!error) errorEl.style.display = 'none';
  container.appendChild(errorEl);

  if (error) {
    container.classList.add('ef-field--error');
  }

  // API
  function setError(msg) {
    errorEl.textContent = msg || '';
    errorEl.style.display = msg ? '' : 'none';
    container.classList.toggle('ef-field--error', !!msg);

    // Atualizar aria-invalid no input dentro do slot
    const input = inputSlot.querySelector('input, select, textarea');
    if (input) {
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
  }

  function setHelper(msg) {
    helperEl.textContent = msg || '';
    helperEl.style.display = msg ? '' : 'none';
  }

  function getId() {
    return fieldId;
  }

  function getErrorId() {
    return errorId;
  }

  function getHelperId() {
    return helperId;
  }

  return { container, inputSlot, setError, setHelper, getId, getErrorId, getHelperId };
}
