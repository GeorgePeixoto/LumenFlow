/**
 * LumenFlow — AppShell (Alpine component)
 *
 * Layout autenticado: header + sidebar colapsável + content area + drawer mobile.
 * Uso: registrar com registerAppShell(Alpine) e usar x-data="appShell" no container.
 */

const SIDEBAR_COLLAPSED_KEY = 'ef_sidebar_collapsed';

const ICONS = {
  logo:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  swap:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  dashboard:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  transparency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  devices:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  alerts:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  goals:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  financial:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  reports:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  settings:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  menu:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  chevronLeft:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  logout:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

export function registerAppShell(Alpine) {
  Alpine.data('appShell', () => ({
    collapsed: JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false'),
    mobileOpen: false,
    avatarOpen: false,
    activePath: '/',

    navItems: [
      { path: '/dashboard',    label: 'Dashboard',     icon: ICONS.dashboard },
      { path: '/transparency', label: 'Transparência', icon: ICONS.transparency },
      { path: '/devices',      label: 'Dispositivos',  icon: ICONS.devices },
      { path: '/alerts',       label: 'Alertas',       icon: ICONS.alerts },
      { path: '/goals',        label: 'Metas',         icon: ICONS.goals },
      { path: '/financial',    label: 'Financeiro',    icon: ICONS.financial },
      { path: '/reports',      label: 'Relatórios',    icon: ICONS.reports },
      { path: '/settings',     label: 'Configurações', icon: ICONS.settings },
    ],

    icons: ICONS,

    init() {
      this.activePath = window.location.hash.slice(1).split('?')[0] || '/';
      window.addEventListener('hashchange', () => {
        this.activePath = window.location.hash.slice(1).split('?')[0] || '/';
        if (this.mobileOpen) this.closeDrawer();
      });
    },

    // ── Sidebar ─────────────────────────────────────────────

    toggleCollapse() {
      this.collapsed = !this.collapsed;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(this.collapsed));
    },

    get collapseIcon() {
      return this.collapsed ? ICONS.chevronRight : ICONS.chevronLeft;
    },

    // ── Mobile drawer ───────────────────────────────────────

    openDrawer() {
      this.mobileOpen = true;
      document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
      this.mobileOpen = false;
      document.body.style.overflow = '';
    },

    // ── Navigation ──────────────────────────────────────────

    isActive(path) {
      return this.activePath === path || (path !== '/' && this.activePath.startsWith(path + '/'));
    },

    navItemClass(path) {
      const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
      return this.isActive(path)
        ? `${base} bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400`
        : `${base} text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800`;
    },

    // ── Avatar dropdown ─────────────────────────────────────

    toggleAvatar() {
      this.avatarOpen = !this.avatarOpen;
    },

    closeAvatar() {
      this.avatarOpen = false;
    },

    get user() {
      return Alpine.store('session')?.user || {};
    },

    get userName() {
      return this.user.name || '—';
    },

    get userEmail() {
      return this.user.email || '';
    },

    get companyName() {
      return this.user.company_name || '';
    },

    get initials() {
      const name = this.user.name || '';
      return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    },

    get alertCount() {
      return Alpine.store('alerts')?.openCount || 0;
    },

    async logout() {
      this.closeAvatar();
      await Alpine.store('session').logout();
      window.location.hash = '#/login';
    },
  }));
}
