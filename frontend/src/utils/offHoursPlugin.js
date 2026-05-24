/**
 * LumenFlow — Off-hours shading plugin for Chart.js (US07-F2).
 *
 * Draws semi-transparent background bands on time-series charts
 * to highlight periods outside business hours.
 *
 * Usage with createChart:
 *   import { createChart } from '../components/Chart.js';
 *   import { offHoursPlugin, buildOffHoursBands } from '../utils/offHoursPlugin.js';
 *
 *   const bands = buildOffHoursBands(labels, businessHours);
 *   const chart = createChart({
 *     type: 'line',
 *     labels,
 *     datasets,
 *     options: {
 *       plugins: {
 *         offHours: { bands, color: 'rgba(100, 100, 100, 0.08)' }
 *       }
 *     },
 *   });
 *
 * The plugin reads `options.plugins.offHours`:
 *   - bands: Array<{ startIndex: number, endIndex: number }> — label indices to shade
 *   - color: string — fill color (default: semi-transparent gray)
 *   - legendLabel: string — label for the legend entry (optional)
 */

export const offHoursPlugin = {
  id: 'offHours',

  beforeDraw(chart) {
    const opts = chart.options.plugins?.offHours;
    if (!opts || !opts.bands || !opts.bands.length) return;

    const { ctx, chartArea: { left, right, top, bottom }, scales: { x } } = chart;
    if (!x) return;

    const color = opts.color || 'rgba(100, 100, 100, 0.08)';

    ctx.save();
    ctx.fillStyle = color;

    opts.bands.forEach(({ startIndex, endIndex }) => {
      const xStart = x.getPixelForValue(startIndex);
      const xEnd = x.getPixelForValue(endIndex);

      const clampedStart = Math.max(xStart, left);
      const clampedEnd = Math.min(xEnd, right);

      if (clampedEnd > clampedStart) {
        ctx.fillRect(clampedStart, top, clampedEnd - clampedStart, bottom - top);
      }
    });

    ctx.restore();
  },

  afterDraw(chart) {
    const opts = chart.options.plugins?.offHours;
    if (!opts || !opts.legendLabel) return;

    const { ctx, chartArea: { right, top } } = chart;
    const color = opts.color || 'rgba(100, 100, 100, 0.08)';

    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(right - 120, top - 20, 14, 14);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.legendLabel, right - 102, top - 13);
    ctx.restore();
  },
};

/**
 * Builds off-hours bands from an array of date labels and business hours config.
 *
 * @param {string[]} labels — ISO date strings or "HH:mm" time labels
 * @param {Object} businessHours — { days: { monday: { enabled, start, end }, ... }, timezone }
 * @returns {Array<{ startIndex: number, endIndex: number }>}
 */
export function buildOffHoursBands(labels, businessHours) {
  if (!labels || !labels.length || !businessHours?.days) return [];

  const bands = [];
  let bandStart = null;

  for (let i = 0; i < labels.length; i++) {
    const isOff = isOffHours(labels[i], businessHours);

    if (isOff && bandStart === null) {
      bandStart = i;
    } else if (!isOff && bandStart !== null) {
      bands.push({ startIndex: bandStart, endIndex: i });
      bandStart = null;
    }
  }

  if (bandStart !== null) {
    bands.push({ startIndex: bandStart, endIndex: labels.length - 1 });
  }

  return bands;
}

/**
 * Determines if a given label timestamp falls outside business hours.
 */
function isOffHours(label, businessHours) {
  let date;
  try {
    date = new Date(label);
    if (isNaN(date.getTime())) return false;
  } catch (_) {
    return false;
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayNames[date.getDay()];
  const dayConfig = businessHours.days[dayKey];

  if (!dayConfig || !dayConfig.enabled) return true;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeMinutes = hours * 60 + minutes;

  const [startH, startM] = (dayConfig.start || '08:00').split(':').map(Number);
  const [endH, endM] = (dayConfig.end || '18:00').split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return timeMinutes < startMinutes || timeMinutes >= endMinutes;
}

/**
 * Registers the plugin globally with Chart.js.
 * Call once at app startup if you want it available on all charts.
 */
export function registerOffHoursPlugin() {
  if (typeof Chart !== 'undefined' && Chart.register) {
    Chart.register(offHoursPlugin);
  }
}
