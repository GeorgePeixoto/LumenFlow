/**
 * LumenFlow — AppShell (Alpine.js + Tailwind)
 *
 * Layout autenticado: header + sidebar + content area.
 * Singleton API mantida para compatibilidade com o router.
 */
import { performLogout } from '../utils/logout.js';
import { sessionService } from '../services/sessionService.js';

const SIDEBAR_COLLAPSED_KEY = 'ef_sidebar_collapsed';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',     icon: 'dashboard' },
  { path: '/transparency', label: 'Transparência', icon: 'transparency' },
  { path: '/devices',      label: 'Dispositivos',  icon: 'devices' },
  { path: '/alerts',       label: 'Alertas',       icon: 'alerts' },
  { path: '/goals',        label: 'Metas',         icon: 'goals',     hidden: true },
  { path: '/financial',    label: 'Financeiro',    icon: 'financial' },
  { path: '/reports',      label: 'Relatórios',    icon: 'reports' },
  { path: '/settings',     label: 'Configurações', icon: 'settings' },
];

function getIconSvg(name) {
  const icons = {
    dashboard:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    transparency: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    devices:      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    alerts:       '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    goals:        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    financial:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    reports:      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    settings:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    swap:         '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    logout:       '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    logo:         '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    sun:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon:         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    menu:         '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    close:        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  };
  return icons[name] || '';
}

export const AppShell = (() => {
  let _shell = null;
  let _content = null;
  let _activePath = '';

  function getUser() {
    return sessionService.getUser() || {};
  }

  function initials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }

  function build(container) {
    const user = getUser();
    const collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';

    _shell = document.createElement('div');
    _shell.setAttribute('x-data', JSON.stringify({
      sidebarOpen: false,
      collapsed: collapsed,
      dropdownOpen: false,
      darkMode: localStorage.getItem('ef_theme') === 'dark',
    }));
    _shell.className = 'flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900';

    const navItemsHtml = NAV_ITEMS.filter(item => !item.hidden).map(item => `
      <a href="#${item.path}"
         @click="if(window.innerWidth < 768) sidebarOpen = false"
         class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${_activePath === item.path ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}"
         data-path="${item.path}">
        <span class="shrink-0">${getIconSvg(item.icon)}</span>
        <span x-show="!collapsed || sidebarOpen" x-cloak class="truncate">${item.label}</span>
      </a>
    `).join('');

    _shell.innerHTML = `
      <!-- Mobile backdrop -->
      <div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 z-30 bg-black/50 md:hidden" x-transition.opacity></div>

      <!-- Sidebar -->
      <aside :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full', collapsed && !sidebarOpen ? 'md:w-16' : 'md:w-60']"
             class="fixed inset-y-0 left-0 z-40 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-200 md:translate-x-0 md:static md:z-auto flex flex-col">

        <!-- Logo -->
        <div class="flex items-center gap-2 px-4 h-16 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <a href="#/dashboard" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span>${getIconSvg('logo')}</span>
            <span x-show="!collapsed || sidebarOpen" x-cloak class="font-bold text-lg">LumenFlow</span>
          </a>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          ${navItemsHtml}
        </nav>

        <!-- Swap sector + collapse -->
        <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <a href="#/sectors/select" @click="if(window.innerWidth < 768) sidebarOpen = false" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
            <span class="shrink-0">${getIconSvg('swap')}</span>
            <span x-show="!collapsed || sidebarOpen" x-cloak>Trocar setor</span>
          </a>
          <button @click="collapsed = !collapsed; localStorage.setItem('${SIDEBAR_COLLAPSED_KEY}', collapsed)" class="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full transition-colors">
            <svg x-show="!collapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <svg x-show="collapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span x-show="!collapsed" x-cloak class="text-xs">Recolher</span>
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
          <div class="flex items-center gap-3">
            <button @click="sidebarOpen = true" class="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              ${getIconSvg('menu')}
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">${user.company_name || ''}</span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Theme toggle -->
            <button @click="darkMode = !darkMode; localStorage.setItem('ef_theme', darkMode ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', darkMode); document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" aria-label="Alternar tema">
              <span x-show="!darkMode">${getIconSvg('moon')}</span>
              <span x-show="darkMode" x-cloak>${getIconSvg('sun')}</span>
            </button>
            <!-- Avatar dropdown -->
            <div class="relative">
              <button @click="dropdownOpen = !dropdownOpen" class="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center justify-center" aria-haspopup="true" :aria-expanded="dropdownOpen">
                ${initials(user.name)}
              </button>
              <div x-show="dropdownOpen" x-cloak @click.outside="dropdownOpen = false" x-transition class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">${user.name || '—'}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">${user.email || ''}</p>
                </div>
                <button id="app-shell-logout-btn" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  ${getIconSvg('logout')}
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main id="app-content" class="flex-1 overflow-y-auto p-4 sm:p-6"></main>
      </div>
    `;

    container.innerHTML = '';
    container.appendChild(_shell);

    _content = _shell.querySelector('#app-content');

    // Inicializar Alpine no shell dinâmico
    window.Alpine?.initTree(_shell);

    _shell.querySelector('#app-shell-logout-btn')?.addEventListener('click', () => performLogout());
  }

  return {
    mount(container) {
      if (!_shell || !container.contains(_shell)) {
        build(container);
      }
      return _content;
    },

    unmount() {
      _shell = null;
      _content = null;
      _activePath = '';
    },

    setActivePath(path) {
      _activePath = path;
      if (!_shell) return;
      _shell.querySelectorAll('[data-path]').forEach(el => {
        const itemPath = el.dataset.path;
        const active = path === itemPath || (itemPath !== '/' && path.startsWith(itemPath + '/'));
        if (active) {
          el.className = el.className.replace(/text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/, 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400');
        } else {
          el.className = el.className.replace(/bg-emerald-50 text-emerald-700 dark:bg-emerald-900\/30 dark:text-emerald-400/, 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white');
        }
      });
    },

    updateUser(user) {
      // Rebuild would be needed for full update; minimal for now
    },

    isMounted() { return !!_shell; },
    getContentArea() { return _content; },
  };
})();
