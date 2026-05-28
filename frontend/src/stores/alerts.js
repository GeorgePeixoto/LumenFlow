/**
 * LumenFlow — Alpine Store: Alerts
 *
 * Gerencia contagem de alertas abertos e polling periódico.
 * Uso: Alpine.store('alerts').openCount
 */
import { alertService } from '../services/alertService.js';
import Config from '../config.js';

const POLL_INTERVAL_MS = 30000;

export function registerAlertsStore(Alpine) {
  Alpine.store('alerts', {
    openCount: 0,
    recent: [],
    loading: false,
    _intervalId: null,

    async fetch() {
      this.loading = true;
      try {
        const countData = await alertService.getCount({ status: 'open' });
        this.openCount = countData?.count ?? 0;
      } catch (_) {}
      this.loading = false;
    },

    async fetchRecent(limit = 5) {
      try {
        const data = await alertService.list({ status: 'open', limit, sort: '-created_at' });
        this.recent = data?.alerts || data?.data || [];
      } catch (_) {
        this.recent = [];
      }
    },

    startPolling() {
      if (this._intervalId) return;
      this.fetch();
      this._intervalId = setInterval(() => this.fetch(), POLL_INTERVAL_MS);
    },

    stopPolling() {
      if (this._intervalId) {
        clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    get hasBadge() {
      return this.openCount > 0;
    },

    get badgeText() {
      if (this.openCount > 99) return '99+';
      return String(this.openCount);
    },
  });
}
