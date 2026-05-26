/**
 * LumenFlow — Chart Wrapper (Alpine + Chart.js)
 *
 * Componente Alpine que gerencia instância Chart.js reativamente.
 * Requer Chart.js carregado via CDN no index.html.
 *
 * Uso:
 *   <div x-data="chartWrapper({
 *     type: 'line',
 *     labels: ['Jan', 'Fev', 'Mar'],
 *     datasets: [{ label: 'Consumo', data: [10, 20, 15] }]
 *   })">
 *     <canvas x-ref="canvas"></canvas>
 *   </div>
 */

export function registerChartWrapper(Alpine) {
  Alpine.data('chartWrapper', (config = {}) => ({
    type: config.type || 'line',
    labels: config.labels || [],
    datasets: config.datasets || [],
    options: config.options || {},
    loading: config.loading ?? false,
    error: null,
    _chart: null,

    init() {
      this.$nextTick(() => {
        if (this.labels.length > 0) {
          this._render();
        }
      });
    },

    update({ labels, datasets, type, options } = {}) {
      if (labels) this.labels = labels;
      if (datasets) this.datasets = datasets;
      if (type) this.type = type;
      if (options) this.options = { ...this.options, ...options };
      this.error = null;
      this.loading = false;
      this._render();
    },

    setLoading(state) {
      this.loading = state;
    },

    setError(msg) {
      this.error = msg;
      this.loading = false;
    },

    _render() {
      if (typeof Chart === 'undefined') {
        this.error = 'Chart.js não carregado';
        return;
      }

      const canvas = this.$refs.canvas;
      if (!canvas) return;

      if (this._chart) {
        this._chart.destroy();
      }

      const ctx = canvas.getContext('2d');

      this._chart = new Chart(ctx, {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: this._buildDatasets(),
        },
        options: this._buildOptions(),
      });
    },

    _buildDatasets() {
      const colors = [
        { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981' },
        { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' },
        { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },
        { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' },
        { bg: 'rgba(139, 195, 74, 0.2)', border: '#8bc34a' },
      ];

      return this.datasets.map((ds, i) => ({
        backgroundColor: ds.backgroundColor || colors[i % colors.length].bg,
        borderColor: ds.borderColor || colors[i % colors.length].border,
        borderWidth: ds.borderWidth || 2,
        tension: ds.tension ?? 0.3,
        fill: ds.fill ?? (this.type === 'line'),
        pointRadius: ds.pointRadius ?? 3,
        ...ds,
      }));
    },

    _buildOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: this.datasets.length > 1,
            position: 'top',
          },
          tooltip: {
            enabled: true,
          },
          ...this.options.plugins,
        },
        scales: {
          x: {
            grid: { display: false },
            ...this.options.x,
          },
          y: {
            beginAtZero: true,
            ...this.options.y,
          },
        },
        ...this.options,
      };
    },

    destroy() {
      if (this._chart) {
        this._chart.destroy();
        this._chart = null;
      }
    },

    get isEmpty() {
      return this.labels.length === 0 && !this.loading;
    },
  }));
}
