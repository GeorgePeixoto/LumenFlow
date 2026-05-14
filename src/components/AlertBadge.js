/**
 * LumenFlow — Alert Badge (US17-F3)
 *
 * Bell icon with counter badge in AppShell header.
 * Shows dropdown with 5 most recent alerts.
 */
import { t } from '../i18n/pt-BR.js';
import { alertService } from '../services/alertService.js';
import { dashboardService } from '../services/dashboardService.js';
import eventBus from '../utils/eventBus.js';
import { NEW_ALERTS_EVENT } from '../utils/alertPolling.js';
import Router from '../utils/router.js';

const ICON_BELL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

export function createAlertBadge() {
  const wrapper = document.createElement('div');
  wrapper.className = 'alert-badge-wrapper';

  const btn = document.createElement('button');
  btn.className = 'alert-badge-btn';
  btn.setAttribute('aria-label', t('alerts.badge_label'));
  btn.innerHTML = ICON_BELL;

  const badge = document.createElement('span');
  badge.className = 'alert-badge-count';
  badge.hidden = true;
  btn.appendChild(badge);

  const dropdown = document.createElement('div');
  dropdown.className = 'alert-badge-dropdown';
  dropdown.hidden = true;

  const dropdownHeader = document.createElement('div');
  dropdownHeader.className = 'alert-badge-dropdown__header';
  dropdownHeader.innerHTML = `<span>${t('dashboard.recent_alerts')}</span>`;
  dropdown.appendChild(dropdownHeader);

  const dropdownList = document.createElement('div');
  dropdownList.className = 'alert-badge-dropdown__list';
  dropdown.appendChild(dropdownList);

  const dropdownFooter = document.createElement('div');
  dropdownFooter.className = 'alert-badge-dropdown__footer';
  const viewAllLink = document.createElement('a');
  viewAllLink.href = '#/alerts';
  viewAllLink.textContent = t('common.see_all');
  viewAllLink.addEventListener('click', () => closeDropdown());
  dropdownFooter.appendChild(viewAllLink);
  dropdown.appendChild(dropdownFooter);

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);

  let open = false;

  function openDropdown() {
    open = true;
    dropdown.hidden = false;
    setTimeout(() => {
      document.addEventListener('mousedown', onOutside);
    }, 0);
    loadRecentAlerts();
  }

  function closeDropdown() {
    open = false;
    dropdown.hidden = true;
    document.removeEventListener('mousedown', onOutside);
  }

  function onOutside(e) {
    if (btn.contains(e.target)) return;
    if (!wrapper.contains(e.target)) closeDropdown();
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // ── Load count ──────────────────────────────────────────────────────
  async function loadCount() {
    try {
      const data = await alertService.getCount({ status: 'open' });
      const count = data?.count ?? data ?? 0;
      updateBadge(count);
    } catch (_) { /* non-critical */ }
  }

  function updateBadge(count) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  // ── Load recent alerts for dropdown ─────────────────────────────────
  async function loadRecentAlerts() {
    dropdownList.innerHTML = '<div class="alert-badge-dropdown__loading">' + t('common.loading') + '</div>';
    try {
      const data = await dashboardService.getRecentAlerts({ limit: 5 });
      const alerts = data?.alerts || data?.data || data || [];
      dropdownList.innerHTML = '';

      if (!alerts.length) {
        dropdownList.innerHTML = `<div class="alert-badge-dropdown__empty">${t('dashboard.no_alerts')}</div>`;
        return;
      }

      alerts.forEach((alert) => {
        const item = document.createElement('div');
        item.className = `alert-badge-dropdown__item alert-badge-dropdown__item--${alert.severity || 'medium'}`;
        item.innerHTML = `
          <span class="alert-badge-dropdown__dot"></span>
          <div class="alert-badge-dropdown__content">
            <span class="alert-badge-dropdown__title">${escapeHtml(alert.title || alert.message || '')}</span>
            <span class="alert-badge-dropdown__meta">${alert.created_at ? timeAgo(alert.created_at) : ''}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          closeDropdown();
          eventBus.emit('alert:show-detail', alert);
        });
        dropdownList.appendChild(item);
      });
    } catch (_) {
      dropdownList.innerHTML = `<div class="alert-badge-dropdown__empty">${t('common.error')}</div>`;
    }
  }

  // ── Listen for new alerts ───────────────────────────────────────────
  eventBus.on(NEW_ALERTS_EVENT, () => loadCount());

  // Initial load
  loadCount();
  // Refresh count every 30s
  const interval = setInterval(loadCount, 30000);

  return {
    el: wrapper,
    refresh: loadCount,
    destroy: () => clearInterval(interval),
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
