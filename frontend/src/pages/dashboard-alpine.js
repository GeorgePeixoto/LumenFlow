/**
 * LumenFlow — Dashboard Page (Alpine.js component)
 *
 * KPIs filtrados pelo setor selecionado (salvo no localStorage).
 * Sem gráficos, sem metas, sem alertas detalhados — apenas dados do Firebase.
 */

import { dashboardService } from '../services/dashboardService.js';
import { alertService } from '../services/alertService.js';
import { sessionService } from '../services/sessionService.js';
import { formatKwh, formatCurrency } from '../utils/formatters.js';
import Router from '../utils/router.js';

const SELECTED_SECTOR_KEY = 'lf_selected_sector';
const TARIFA = 0.85; // R$/kWh

export function registerDashboardPage(Alpine) {
  Alpine.data('dashboardPage', () => ({
    // ── KPIs ────────────────────────────────────────────────
    kpis: {
      consumption: { value: '—', unit: 'kWh', loading: true },
      cost: { value: '—', unit: 'R$', loading: true },
      alerts: { value: '0', loading: false },
      devices: { value: '—', loading: true },
    },

    accumulatedKwh: 0,
    previousReadings: {},

    // ── Setor selecionado ────────────────────────────────────
    selectedSector: null,

    // ── User ────────────────────────────────────────────────
    get userName() {
      const user = sessionService.getUser();
      return user?.name || '';
    },

    get realtimePower() {
      const rt = Alpine.store('realtime');
      return rt?.totalPower ?? null;
    },

    // ── Auto Refresh ─────────────────────────────────────────
    lastUpdate: null,
    _interval: null,

    // ── Init ────────────────────────────────────────────────
    init() {
      Alpine.store('realtime')?.startListening();

      // Ler setor salvo no localStorage
      try {
        const stored = localStorage.getItem(SELECTED_SECTOR_KEY);
        if (stored) this.selectedSector = JSON.parse(stored);
      } catch (_) { }

      this.loadKpis();
      this._interval = setInterval(() => this.loadKpis(), 10000);
    },

    destroy() {
      if (this._interval) clearInterval(this._interval);
    },

    // ── Data Loader ─────────────────────────────────────────

    async loadKpis() {
      try {
        // ── Firebase data + alert count (parallel) ───────────
        const [data, countData] = await Promise.all([
          dashboardService.getPublicData(),
          alertService.getCount({ status: 'open' }).catch(() => ({ count: 0 })),
        ]);

        const readings = data?.latest_readings || {};
        const total_devices = data?.total_devices || 0;

        let hasSelectedSectorData = false;
        let selectedSectorReading = null;

        if (this.selectedSector) {
          // Filtrar pelo setor selecionado: encontrar a chave cujo `nome` bate
          for (const [key, reading] of Object.entries(readings)) {
            if (key === this.selectedSector.id || reading.nome === this.selectedSector.name) {
              selectedSectorReading = reading;
              hasSelectedSectorData = true;
              break;
            }
          }
        }

        const isFirstLoad = !this.previousReadings || Object.keys(this.previousReadings).length === 0;

        if (isFirstLoad) {
          this.previousReadings = { _initialized: true };
        }

        const consumptionCards = data?.consumption_cards || {};
        let accumulatedKwh = 0;
        let cost = 0;

        if (this.selectedSector) {
          const sectorKey = this.selectedSector.id;
          const card = consumptionCards[sectorKey];
          if (card) {
            accumulatedKwh = card.kwh || 0;
            cost = card.cost || 0;
          }
        } else {
          for (const card of Object.values(consumptionCards)) {
            accumulatedKwh += card.kwh || 0;
            cost += card.cost || 0;
          }
        }

        this.accumulatedKwh = accumulatedKwh;

        // Atualizar setor selecionado com dados brutos para o card monitorado
        if (this.selectedSector && hasSelectedSectorData) {
          this.selectedSector = {
            ...this.selectedSector,
            potencia: selectedSectorReading.potencia || 0,
            energia_kwh: selectedSectorReading.energia_kwh || 0,
          };
        }

        const kwhTruncated = Math.floor(this.accumulatedKwh * 1000) / 1000;
        this.kpis.consumption = {
          value: formatKwh(kwhTruncated, 3).replace(' kWh', ''),
          unit: 'KWh',
          loading: false,
        };
        this.kpis.cost = {
          value: formatCurrency(cost).replace('R$\u00a0', '').replace('R$ ', ''),
          unit: 'R$',
          loading: false,
        };
        this.kpis.devices = {
          value: String(total_devices),
          loading: false,
        };

        // ── Alertas: total abertos buscado do backend ─────────
        const prevAlertCount = parseInt(this.kpis.alerts.value, 10) || 0;
        const newAlertCount = countData?.count ?? 0;
        const alertsIncreased = newAlertCount > prevAlertCount;
        this.kpis.alerts = { value: String(newAlertCount), loading: false, increased: alertsIncreased };

        // Toast de notificação quando novos alertas chegam
        if (alertsIncreased && !isFirstLoad) {
          const diff = newAlertCount - prevAlertCount;
          const msg = diff === 1
            ? '⚠️ Novo alerta recebido!'
            : `⚠️ ${diff} novos alertas recebidos!`;
          Alpine.store('toast')?.show(msg, 'warning', 5000);
        }

        this.lastUpdate = new Date();
      } catch (_) {
        Object.keys(this.kpis).forEach(k => {
          this.kpis[k] = { ...this.kpis[k], value: '—', loading: false };
        });
      }
    },

    // ── Navigation ──────────────────────────────────────────

    goTo(path) {
      Router.navigate(path);
    },

    changeSector() {
      Router.navigate('/sectors/select');
    },

    // ── Formatters ──────────────────────────────────────────

    formatSectorEnergy(val) {
      if (val == null) return '—';
      const kwhTruncated = Math.floor(val * 1000) / 1000;
      return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(kwhTruncated) + ' KWh';
    },

    formatPower(w) {
      if (w == null) return '—';
      return w >= 1000 ? (w / 1000).toFixed(2) + ' W' : w.toFixed(1) + ' W';
    },

    formatTime() {
      if (!this.lastUpdate) return '';
      return this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
  }));
}
