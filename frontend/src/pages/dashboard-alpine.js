/**
 * LumenFlow — Dashboard Page (Alpine.js component)
 *
 * Lógica reativa do dashboard: KPIs, gráficos, alertas, metas, real-time.
 * Usa dashboardService para dados da API e Alpine.store('realtime') para IoT.
 */

import { dashboardService } from '../services/dashboardService.js';
import { goalService } from '../services/goalService.js';
import { sessionService } from '../services/sessionService.js';
import { formatKwh, formatCurrency } from '../utils/formatters.js';
import Router from '../utils/router.js';

export function registerDashboardPage(Alpine) {
  Alpine.data('dashboardPage', () => ({
    // ── KPIs ────────────────────────────────────────────────
    kpis: {
      consumption: { value: '—', variation: null, loading: true },
      cost: { value: '—', variation: null, loading: true },
      alerts: { value: '—', loading: true },
      devices: { value: '—', loading: true },
    },

    // ── Goals ───────────────────────────────────────────────
    goals: [],

    // ── Chart ───────────────────────────────────────────────
    chartLoading: true,
    chartError: null,
    chartEmpty: false,
    chartData: null,

    // ── Top Sectors ─────────────────────────────────────────
    sectorsLoading: true,
    sectorsError: null,
    sectorsEmpty: false,
    sectorsData: null,

    // ── Alerts ──────────────────────────────────────────────
    recentAlerts: [],
    recentAlertsLoading: true,
    offHoursAlerts: [],
    offHoursCount: 0,
    offHoursLoading: true,
    nightWasteAlerts: [],
    nightWasteCount: 0,
    nightWasteLoading: true,

    // ── Period ──────────────────────────────────────────────
    period: 'last7',

    // ── User ────────────────────────────────────────────────
    get userName() {
      const user = sessionService.getUser();
      return user?.name || '';
    },

    get realtimePower() {
      const rt = Alpine.store('realtime');
      return rt?.totalPower ?? null;
    },

    // ── Init ────────────────────────────────────────────────
    init() {
      Alpine.store('realtime')?.startListening();
      this.loadKpis();
      this.loadGoals();
      this.loadChart();
      this.loadTopSectors();
      this.loadRecentAlerts();
      this.loadOffHoursAlerts();
      this.loadNightWasteAlerts();
    },

    // ── Data Loaders ────────────────────────────────────────

    async loadKpis() {
      try {
        const data = await dashboardService.getKpis();
        this.kpis.consumption = {
          value: formatKwh(data?.month_kwh, 0).replace(' kWh', ''),
          variation: data?.consumption_variation != null ? data.consumption_variation * 100 : null,
          loading: false,
        };
        this.kpis.cost = {
          value: formatCurrency(data?.monthly_cost).replace('R$ ', ''),
          variation: data?.cost_variation != null ? data.cost_variation * 100 : null,
          loading: false,
        };
        this.kpis.alerts = { value: String(data?.open_alerts ?? 0), loading: false };
        this.kpis.devices = { value: String(data?.active_devices ?? 0), loading: false };
      } catch (_) {
        Object.keys(this.kpis).forEach(k => {
          this.kpis[k] = { value: '—', loading: false };
        });
      }
    },

    async loadGoals() {
      try {
        const response = await goalService.list({ status: 'active' });
        const goals = response?.goals || response?.data || response || [];
        this.goals = goals.slice(0, 2).map(g => ({
          name: g.name || this._scopeLabel(g),
          current: g.current_value ?? 0,
          target: g.value ?? 1,
          unit: g.unit === 'brl' ? 'R$' : 'kWh',
          progress: Math.min(100, Math.round(((g.current_value ?? 0) / (g.value || 1)) * 100)),
        }));
      } catch (_) {
        this.goals = [];
      }
    },

    async loadChart() {
      this.chartLoading = true;
      this.chartError = null;
      this.chartEmpty = false;

      try {
        const periodRange = this._getPeriodRange();
        const response = await dashboardService.getConsumptionChart(periodRange);
        const raw = response?.data || response || [];

        if (!raw.length) {
          this.chartEmpty = true;
        } else {
          const labels = raw.map(r => r.period);
          const values = raw.map(r => r.total_kwh);
          this.chartData = { labels, datasets: [{ label: 'Consumo (kWh)', data: values }] };
        }
      } catch (err) {
        this.chartError = err?.message || 'Erro ao carregar gráfico';
      } finally {
        this.chartLoading = false;
      }
    },

    async loadTopSectors() {
      this.sectorsLoading = true;
      this.sectorsError = null;
      this.sectorsEmpty = false;

      try {
        const data = await dashboardService.getTopSectors();
        const sectors = data?.sectors || data || [];

        if (!sectors.length) {
          this.sectorsEmpty = true;
        } else {
          const labels = sectors.map(s => s.name);
          const values = sectors.map(s => s.total_kwh ?? 0);
          this.sectorsData = { labels, datasets: [{ label: 'kWh', data: values }] };
        }
      } catch (err) {
        this.sectorsError = err?.message || 'Erro ao carregar setores';
      } finally {
        this.sectorsLoading = false;
      }
    },

    async loadRecentAlerts() {
      this.recentAlertsLoading = true;
      try {
        const data = await dashboardService.getRecentAlerts();
        const alerts = data?.alerts || data?.data || data || [];
        this.recentAlerts = alerts.slice(0, 5).map(a => this._mapAlert(a));
      } catch (_) {
        this.recentAlerts = [];
      } finally {
        this.recentAlertsLoading = false;
      }
    },

    async loadOffHoursAlerts() {
      this.offHoursLoading = true;
      try {
        const data = await dashboardService.getOffHoursAlerts({ limit: 5 });
        const alerts = data?.alerts || data?.data || data || [];
        this.offHoursCount = data?.total ?? alerts.length;
        this.offHoursAlerts = alerts.slice(0, 5).map(a => this._mapAlert(a));
      } catch (_) {
        this.offHoursAlerts = [];
      } finally {
        this.offHoursLoading = false;
      }
    },

    async loadNightWasteAlerts() {
      this.nightWasteLoading = true;
      try {
        const data = await dashboardService.getNightWasteAlerts({ limit: 5 });
        const alerts = data?.alerts || data?.data || data || [];
        this.nightWasteCount = data?.total ?? alerts.length;
        this.nightWasteAlerts = alerts.slice(0, 5).map(a => this._mapAlert(a));
      } catch (_) {
        this.nightWasteAlerts = [];
      } finally {
        this.nightWasteLoading = false;
      }
    },

    // ── Period change ───────────────────────────────────────

    onPeriodChange(period) {
      this.period = period;
      this.loadChart();
    },

    // ── Navigation ──────────────────────────────────────────

    goTo(path) {
      Router.navigate(path);
    },

    // ── Helpers ─────────────────────────────────────────────

    _mapAlert(a) {
      return {
        title: a.title || a.message || 'Alerta',
        meta: [a.device_name || a.sector_name || '', a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : ''].filter(Boolean).join(' — '),
        severity: a.severity || 'medium',
      };
    },

    _scopeLabel(goal) {
      if (goal.scope === 'sector') return goal.sector_name || 'Setor';
      if (goal.scope === 'device') return goal.device_name || 'Dispositivo';
      return 'Empresa';
    },

    _getPeriodRange() {
      const now = new Date();
      const ranges = {
        today: { from: now.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10), granularity: 'hour' },
        last7: { from: new Date(now - 7 * 86400000).toISOString().slice(0, 10), to: now.toISOString().slice(0, 10), granularity: 'day' },
        last30: { from: new Date(now - 30 * 86400000).toISOString().slice(0, 10), to: now.toISOString().slice(0, 10), granularity: 'day' },
      };
      return ranges[this.period] || ranges.last7;
    },

    // ── Variation helpers ───────────────────────────────────

    variationClass(variation, positiveIsGood = false) {
      if (variation == null) return 'text-gray-400';
      const isPositive = variation > 0;
      const isGood = positiveIsGood ? isPositive : !isPositive;
      return isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
    },

    variationText(variation) {
      if (variation == null) return '';
      const sign = variation > 0 ? '+' : '';
      return `${sign}${variation.toFixed(1)}%`;
    },

    severityDotClass(severity) {
      const map = {
        high: 'bg-red-500',
        critical: 'bg-red-600',
        medium: 'bg-yellow-500',
        low: 'bg-emerald-500',
      };
      return map[severity] || map.medium;
    },
  }));
}
