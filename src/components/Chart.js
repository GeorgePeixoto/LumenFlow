/**
 * LumenFlow — Chart wrapper (F4-F1).
 *
 * Encapsula Chart.js para que o resto do projeto nunca importe a lib diretamente.
 * Se um dia trocar de biblioteca, troca apenas este arquivo.
 *
 * Uso:
 *   import { createChart } from '../components/Chart.js';
 *
 *   const chart = createChart({
 *     type: 'line',           // 'line' | 'bar' | 'area' | 'doughnut'
 *     labels: ['Jan', 'Fev', 'Mar'],
 *     datasets: [{ label: 'Consumo', data: [100, 200, 150], color: '--color-primary-500' }],
 *     options: {},            // Chart.js options override (optional)
 *   });
 *   container.appendChild(chart.el);
 *
 *   chart.update({ labels, datasets });
 *   chart.destroy();
 */

function getTokenColor(token) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return raw || token;
}

function resolveColor(color) {
  if (!color) return null;
  if (color.startsWith('--')) return getTokenColor(color);
  return color;
}

function buildDatasets(datasets, type) {
  return datasets.map((ds) => {
    const color = resolveColor(ds.color) || getTokenColor('--color-primary-500');
    const base = {
      label: ds.label || '',
      data: ds.data || [],
      borderColor: color,
      backgroundColor: type === 'doughnut'
        ? (ds.colors || ds.data).map((_, i) => resolveColor(ds.colors?.[i]) || color)
        : type === 'area'
          ? color + '20'
          : color + '80',
      borderWidth: ds.borderWidth ?? 2,
      tension: ds.tension ?? 0.3,
      pointRadius: ds.pointRadius ?? 3,
      pointHoverRadius: ds.pointHoverRadius ?? 5,
      fill: type === 'area',
    };
    return { ...base, ...ds.chartjsOverrides };
  });
}

const DEFAULT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { font: { size: 11 } },
    },
  },
};

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      cornerRadius: 6,
    },
  },
};

export function createChart({
  type = 'line',
  labels = [],
  datasets = [],
  options = {},
  height = '300px',
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ef-chart';
  wrapper.style.position = 'relative';
  wrapper.style.height = height;
  wrapper.style.width = '100%';

  const canvas = document.createElement('canvas');
  wrapper.appendChild(canvas);

  const chartType = type === 'area' ? 'line' : type;
  const baseOpts = type === 'doughnut' ? DOUGHNUT_OPTIONS : DEFAULT_OPTIONS;

  const mergedOptions = deepMerge(deepMerge({}, baseOpts), options);

  if (type === 'doughnut') {
    delete mergedOptions.scales;
  }

  let chartInstance = null;

  function init() {
    if (typeof Chart === 'undefined') {
      console.warn('[LumenFlow] Chart.js not loaded. Charts will not render.');
      return;
    }
    chartInstance = new Chart(canvas, {
      type: chartType,
      data: {
        labels,
        datasets: buildDatasets(datasets, type),
      },
      options: mergedOptions,
    });
  }

  function update({ labels: newLabels, datasets: newDatasets, options: newOptions } = {}) {
    if (!chartInstance) return;
    if (newLabels) chartInstance.data.labels = newLabels;
    if (newDatasets) chartInstance.data.datasets = buildDatasets(newDatasets, type);
    if (newOptions) {
      Object.assign(chartInstance.options, newOptions);
    }
    chartInstance.update();
  }

  function destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  // Initialize after DOM insertion (Chart.js needs canvas in DOM for sizing)
  requestAnimationFrame(() => init());

  return { el: wrapper, update, destroy, getInstance: () => chartInstance };
}

// ── Deep merge helper ─────────────────────────────────────────────────────────
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
