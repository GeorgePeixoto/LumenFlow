/**
 * LumenFlow — Alert Polling (US17-F1)
 *
 * Polls for new critical alerts and shows toast notifications in real-time.
 * Singleton — start/stop from anywhere.
 */
import { dashboardService } from '../services/dashboardService.js';
import { Toast } from '../components/Toast.js';
import { t } from '../i18n/pt-BR.js';
import eventBus from '../utils/eventBus.js';

const POLL_INTERVAL_MS = 30000; // 30 seconds
const STORAGE_KEY = 'ef_last_alert_check';

export const NEW_ALERTS_EVENT = 'ef:new-alerts';

let _intervalId = null;
let _lastCheckTime = null;

function getLastCheckTime() {
  if (_lastCheckTime) return _lastCheckTime;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored || new Date().toISOString();
}

function setLastCheckTime(time) {
  _lastCheckTime = time;
  sessionStorage.setItem(STORAGE_KEY, time);
}

async function pollAlerts() {
  try {
    const since = getLastCheckTime();
    const now = new Date().toISOString();

    const data = await dashboardService.getRecentAlerts({ limit: 10 });
    const alerts = data?.alerts || data?.data || data || [];

    // Filter alerts created after last check
    const newAlerts = alerts.filter((a) => a.created_at && a.created_at > since);

    if (newAlerts.length > 0) {
      // Show toast for critical alerts
      const criticals = newAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
      criticals.forEach((alert) => {
        Toast.show({
          message: t('alerts.new_critical', { device: alert.device_name || alert.title || '' }),
          type: 'error',
          duration: 10000,
        });
      });

      // Emit event for badge update
      eventBus.emit(NEW_ALERTS_EVENT, { count: newAlerts.length, alerts: newAlerts });
    }

    setLastCheckTime(now);
  } catch (_) {
    // Silently fail — polling is non-critical
  }
}

export const alertPolling = {
  start() {
    if (_intervalId) return;
    setLastCheckTime(new Date().toISOString());
    _intervalId = setInterval(pollAlerts, POLL_INTERVAL_MS);
    // Initial poll after short delay
    setTimeout(pollAlerts, 3000);
  },

  stop() {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  },

  isRunning() {
    return _intervalId !== null;
  },
};
