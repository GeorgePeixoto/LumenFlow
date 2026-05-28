/**
 * LumenFlow — Dashboard Page (Alpine.js component)
 *
 * KPIs filtrados pelo setor selecionado (salvo no localStorage).
 * Sem gráficos, sem metas, sem alertas detalhados — apenas dados do Firebase.
 */

import { dashboardService } from '../services/dashboardService.js';
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
      cost:        { value: '—', unit: 'R$',  loading: true },
      alerts:      { value: '0', loading: false },
      devices:     { value: '—', loading: true },
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
      } catch (_) {}

      this.loadKpis();
      this._interval = setInterval(() => this.loadKpis(), 10000);
    },

    destroy() {
      if (this._interval) clearInterval(this._interval);
    },

    // ── Data Loader ─────────────────────────────────────────

    async loadKpis() {
      try {
        const data = await dashboardService.getPublicData();
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
          this.previousReadings = {};
          if (this.selectedSector) {
            if (hasSelectedSectorData) {
              const val = selectedSectorReading.energia_kwh || 0;
              this.accumulatedKwh = val;
              this.previousReadings[this.selectedSector.id || selectedSectorReading.nome] = val;
            } else {
              this.accumulatedKwh = 0;
            }
          } else {
            let total = 0;
            for (const [key, reading] of Object.entries(readings)) {
              const val = reading.energia_kwh || 0;
              total += val;
              this.previousReadings[key] = val;
            }
            this.accumulatedKwh = total;
          }
        } else {
          // Cargas subsequentes: acumula valor bruto ao detectar mudança
          if (this.selectedSector) {
            if (hasSelectedSectorData) {
              const sectorKey = this.selectedSector.id || selectedSectorReading.nome;
              const prev = this.previousReadings[sectorKey] ?? null;
              const current = selectedSectorReading.energia_kwh || 0;

              if (prev !== null && current !== prev) {
                this.accumulatedKwh += current;
              }
              this.previousReadings[sectorKey] = current;
            }
          } else {
            for (const [key, reading] of Object.entries(readings)) {
              const prev = this.previousReadings[key] ?? null;
              const current = reading.energia_kwh || 0;

              if (prev !== null && current !== prev) {
                this.accumulatedKwh += current;
              }
              this.previousReadings[key] = current;
            }
          }
        }

        // Atualizar setor selecionado com dados brutos para o card monitorado
        if (this.selectedSector && hasSelectedSectorData) {
          this.selectedSector = {
            ...this.selectedSector,
            potencia: selectedSectorReading.potencia || 0,
            energia_kwh: selectedSectorReading.energia_kwh || 0,
          };
        }

        const cost = this.accumulatedKwh * TARIFA;

        this.kpis.consumption = {
          value: formatKwh(this.accumulatedKwh, 2).replace(' kWh', ''),
          unit: 'kWh',
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
        this.kpis.alerts = { value: '0', loading: false };
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

    formatPower(w) {
      if (w == null) return '—';
      return w >= 1000 ? (w / 1000).toFixed(2) + ' kW' : w.toFixed(1) + ' W';
    },

    formatTime() {
      if (!this.lastUpdate) return '';
      return this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
  }));
}
