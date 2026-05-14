/**
 * EnergyFlow — Utilitários de manipulação de datas.
 *
 * Implementação própria (sem date-fns ou moment).
 * Rationale: as operações necessárias (início/fim de mês, diff, ranges)
 * são simples o suficiente para não justificar uma dependência externa.
 * date-fns via CDN adicionaria ~30 KB por algo resolvível em <100 linhas.
 * Se o escopo crescer (fuso horário complexo, i18n de datas avançada),
 * date-fns pode ser incluído sem refatorar — as funções abaixo têm a
 * mesma assinatura da lib.
 *
 * Uso:
 *   import { startOfMonth, endOfMonth, daysBetween } from './dates.js';
 *   startOfMonth(new Date('2026-05-09'))  => Date('2026-05-01T00:00:00')
 *   daysBetween(a, b)                     => 30
 */

// --- Início / fim de períodos ---

/**
 * Retorna o início do dia (00:00:00.000).
 * @param {Date} date
 * @returns {Date}
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Retorna o fim do dia (23:59:59.999).
 * @param {Date} date
 * @returns {Date}
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Retorna o primeiro dia do mês às 00:00:00.
 * @param {Date} date
 * @returns {Date}
 */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Retorna o último dia do mês às 23:59:59.999.
 * @param {Date} date
 * @returns {Date}
 */
export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Retorna o primeiro dia da semana (segunda-feira) para a data fornecida.
 * @param {Date} date
 * @returns {Date}
 */
export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day; // ajusta para segunda
  d.setDate(d.getDate() + diff);
  return startOfDay(d);
}

// --- Cálculos ---

/**
 * Número de dias inteiros entre duas datas (valor absoluto).
 * @param {Date} a
 * @param {Date} b
 * @returns {number}
 */
export function daysBetween(a, b) {
  const msPerDay = 86400000;
  return Math.abs(Math.round((b.getTime() - a.getTime()) / msPerDay));
}

/**
 * Adiciona N dias a uma data, retornando nova Date.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Adiciona N meses a uma data, retornando nova Date.
 * Preserva o dia (ajusta para último dia do mês se necessário).
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Subtrai N meses de uma data.
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
export function subMonths(date, months) {
  return addMonths(date, -months);
}

// --- Formatação ISO ---

/**
 * Converte Date para string ISO date (YYYY-MM-DD) no fuso local.
 * @param {Date} date
 * @returns {string}  ex: '2026-05-09'
 */
export function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converte string YYYY-MM-DD em Date local (sem offset de fuso).
 * @param {string} isoDate  ex: '2026-05-09'
 * @returns {Date}
 */
export function fromIsoDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// --- Ranges predefinidos (usados pelo PeriodPicker) ---

/**
 * Retorna ranges predefinidos relativos a "hoje".
 * @returns {Object.<string, { from: Date, to: Date, label: string }>}
 */
export function presetRanges() {
  const today = new Date();
  return {
    today: {
      label: 'Hoje',
      from: startOfDay(today),
      to: endOfDay(today),
    },
    last7: {
      label: 'Últimos 7 dias',
      from: startOfDay(addDays(today, -6)),
      to: endOfDay(today),
    },
    last30: {
      label: 'Últimos 30 dias',
      from: startOfDay(addDays(today, -29)),
      to: endOfDay(today),
    },
    currentMonth: {
      label: 'Mês atual',
      from: startOfMonth(today),
      to: endOfMonth(today),
    },
    previousMonth: {
      label: 'Mês anterior',
      from: startOfMonth(subMonths(today, 1)),
      to: endOfMonth(subMonths(today, 1)),
    },
  };
}

// --- Utilitários ---

/**
 * Verifica se duas datas são o mesmo dia (ignora hora).
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Verifica se a data está entre from e to (inclusive).
 * @param {Date} date
 * @param {Date} from
 * @param {Date} to
 * @returns {boolean}
 */
export function isInRange(date, from, to) {
  return date >= from && date <= to;
}
