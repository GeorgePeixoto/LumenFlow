/**
 * LumenFlow — Formatadores de valores para exibição na UI.
 *
 * Uso:
 *   import { formatKwh, formatCurrency, formatPercent, formatDate } from './formatters.js';
 *   formatKwh(1500)          => '1.500,00 kWh'
 *   formatCurrency(239.90)   => 'R$ 239,90'
 *   formatPercent(0.834)     => '83,4%'
 *   formatDate(new Date())   => '09/05/2026'
 */

const LOCALE = 'pt-BR';

// --- Energia ---

/**
 * Formata valor em kWh com 2 casas decimais.
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {string}  ex: '1.500,00 kWh'
 */
export function formatKwh(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return `${new Intl.NumberFormat(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)} kWh`;
}

/**
 * Formata valor em Watts.
 * @param {number} value
 * @returns {string}  ex: '2.340 W'
 */
export function formatWatts(value) {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1000) return `${formatNumber(value / 1000, 2)} kW`;
  return `${formatNumber(value, 0)} W`;
}

// --- Moeda ---

/**
 * Formata valor em reais (BRL).
 * @param {number} value
 * @returns {string}  ex: 'R$ 1.239,90'
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL' }).format(value);
}

// --- Percentual ---

/**
 * Formata valor decimal como porcentagem.
 * @param {number} value  - ex: 0.834 => '83,4%'
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata variação percentual com sinal (positivo/negativo).
 * @param {number} value  - ex: 0.05 => '+5,0%' | -0.12 => '-12,0%'
 * @returns {string}
 */
export function formatPercentDiff(value) {
  if (value == null || isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPercent(value)}`;
}

// --- Números genéricos ---

/**
 * Formata número com separadores de milhar e casas decimais.
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// --- Datas ---

/**
 * Formata Date como data curta (dd/mm/aaaa).
 * @param {Date|string|number} date
 * @returns {string}  ex: '09/05/2026'
 */
export function formatDate(date) {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE).format(d);
}

/**
 * Formata Date como data e hora.
 * @param {Date|string|number} date
 * @returns {string}  ex: '09/05/2026, 14:35'
 */
export function formatDateTime(date) {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(d);
}

/**
 * Formata Date como hora apenas.
 * @param {Date|string|number} date
 * @returns {string}  ex: '14:35'
 */
export function formatTime(date) {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(d);
}

/**
 * Formata data relativa ao momento atual (ex: "há 3 minutos").
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatRelative(date) {
  const d = toDate(date);
  if (!d) return '—';
  const diff = (d.getTime() - Date.now()) / 1000; // segundos (negativo = passado)
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60)       return rtf.format(Math.round(diff), 'second');
  if (abs < 3600)     return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400)    return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 2592000)  return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 31536000) return rtf.format(Math.round(diff / 2592000), 'month');
  return rtf.format(Math.round(diff / 31536000), 'year');
}

/**
 * Formata mês/ano por extenso.
 * @param {Date|string|number} date
 * @returns {string}  ex: 'maio de 2026'
 */
export function formatMonthYear(date) {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(d);
}

// --- Tamanhos de arquivo ---

/**
 * Formata bytes em unidade legível.
 * @param {number} bytes
 * @returns {string}  ex: '1,4 MB'
 */
export function formatFileSize(bytes) {
  if (bytes == null || isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${formatNumber(bytes / Math.pow(1024, i), 1)} ${units[i]}`;
}

// --- Helpers internos ---

/**
 * Converte input diverso em Date. Retorna null se inválido.
 * @param {Date|string|number} value
 * @returns {Date|null}
 */
function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
