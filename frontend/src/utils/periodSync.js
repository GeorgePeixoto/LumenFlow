import EventBus from './eventBus.js';

const PERIOD_CHANGE_EVENT = 'period:change';

let _currentPeriod = null;
let _pageUnsubscribers = [];

/**
 * Connects a PeriodPicker instance to the global period sync system.
 * When the picker changes, it emits 'period:change' on the EventBus,
 * notifying all subscribed components on the same page.
 *
 * Usage:
 *   import { connectPicker, onPeriodChange, destroyPeriodSync } from '../utils/periodSync.js';
 *
 *   const picker = createPeriodPicker({ onChange: connectPicker });
 *   onPeriodChange(({ from, to, granularity }) => reloadChart(from, to, granularity));
 *
 *   // On page teardown:
 *   destroyPeriodSync();
 *
 * @param {{ from: string, to: string, preset: string, granularity: string }} period
 */
export function connectPicker(period) {
  _currentPeriod = period;
  EventBus.emit(PERIOD_CHANGE_EVENT, period);
}

/**
 * Subscribe a component/chart to period changes.
 * Returns an unsubscribe function. All subscriptions are also
 * cleared when destroyPeriodSync() is called.
 *
 * @param {Function} handler - receives { from, to, preset, granularity }
 * @returns {Function} unsubscribe
 */
export function onPeriodChange(handler) {
  const unsub = EventBus.on(PERIOD_CHANGE_EVENT, handler);
  _pageUnsubscribers.push(unsub);
  return unsub;
}

/**
 * Returns the current period value (last emitted).
 * Useful for components that mount after the picker has already emitted.
 *
 * @returns {{ from: string, to: string, preset: string, granularity: string } | null}
 */
export function getCurrentPeriod() {
  return _currentPeriod;
}

/**
 * Tears down all period subscriptions for the current page.
 * Call this when navigating away from a page that uses period sync.
 */
export function destroyPeriodSync() {
  _pageUnsubscribers.forEach((unsub) => unsub());
  _pageUnsubscribers = [];
  _currentPeriod = null;
}
