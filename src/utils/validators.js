/**
 * LumenFlow — Validadores reutilizáveis para formulários.
 *
 * Cada função retorna null (válido) ou string de erro (inválido).
 * Design intencional: componentes de formulário chamam validate(value) e
 * exibem o retorno — null = sem erro, string = mensagem de erro.
 *
 * Uso:
 *   import { validateEmail, validateCnpj, validatePassword } from './validators.js';
 *   validateEmail('foo@bar.com')  => null
 *   validateEmail('nope')         => 'E-mail inválido.'
 *   validateCnpj('11.222.333/0001-81') => null
 */

// --- Campos obrigatórios ---

/**
 * Valida que o campo não está vazio.
 * @param {string} value
 * @returns {string|null}
 */
export function validateRequired(value) {
  if (value == null || String(value).trim() === '') return 'Campo obrigatório.';
  return null;
}

// --- E-mail ---

/**
 * Valida formato de e-mail.
 * @param {string} value
 * @returns {string|null}
 */
export function validateEmail(value) {
  if (!value) return 'Campo obrigatório.';
  // RFC 5322 simplificado — cobre 99% dos casos reais
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(String(value).trim())) return 'E-mail inválido.';
  return null;
}

// --- CNPJ ---

/**
 * Valida CNPJ completo (formato e dígitos verificadores).
 * Aceita com ou sem máscara (xx.xxx.xxx/xxxx-xx).
 * @param {string} value
 * @returns {string|null}
 */
export function validateCnpj(value) {
  if (!value) return 'Campo obrigatório.';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 14) return 'CNPJ inválido.';
  if (/^(\d)\1+$/.test(digits)) return 'CNPJ inválido.'; // todos iguais

  function calcDigit(cnpj, len) {
    let weights = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = cnpj.slice(0, len).split('').reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  if (calcDigit(digits, 12) !== Number(digits[12])) return 'CNPJ inválido.';
  if (calcDigit(digits, 13) !== Number(digits[13])) return 'CNPJ inválido.';
  return null;
}

// --- Senha ---

/**
 * Valida comprimento mínimo da senha (8 chars).
 * @param {string} value
 * @returns {string|null}
 */
export function validatePasswordMin(value) {
  if (!value || value.length < 8) return 'Mínimo 8 caracteres.';
  return null;
}

/**
 * Valida força da senha: ao menos uma letra, um número e um caractere especial.
 * @param {string} value
 * @returns {string|null}
 */
export function validatePasswordStrength(value) {
  if (!value) return 'Campo obrigatório.';
  if (validatePasswordMin(value)) return validatePasswordMin(value);
  if (!/[A-Za-z]/.test(value)) return 'Use ao menos uma letra.';
  if (!/[0-9]/.test(value)) return 'Use ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Use ao menos um caractere especial.';
  return null;
}

/**
 * Valida que confirmação de senha é igual à senha original.
 * @param {string} password
 * @param {string} confirmation
 * @returns {string|null}
 */
export function validatePasswordMatch(password, confirmation) {
  if (password !== confirmation) return 'Senhas não conferem.';
  return null;
}

// --- Número ---

/**
 * Valida que o valor é um número válido, opcionalmente com min/max.
 * @param {string|number} value
 * @param {{ min?: number, max?: number }} [opts]
 * @returns {string|null}
 */
export function validateNumber(value, { min, max } = {}) {
  if (value == null || value === '') return 'Campo obrigatório.';
  const n = Number(value);
  if (isNaN(n)) return 'Valor numérico inválido.';
  if (min !== undefined && n < min) return `Valor mínimo: ${min}.`;
  if (max !== undefined && n > max) return `Valor máximo: ${max}.`;
  return null;
}

// --- Composição ---

/**
 * Executa uma lista de validadores em sequência e retorna o primeiro erro.
 * Útil para campos com múltiplas regras.
 *
 * @param {string} value
 * @param {Array<function>} fns  - ex: [validateRequired, validateEmail]
 * @returns {string|null}
 */
export function validate(value, fns) {
  for (const fn of fns) {
    const err = fn(value);
    if (err) return err;
  }
  return null;
}
