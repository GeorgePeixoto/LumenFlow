/**
 * LumenFlow — AppShell (F2-F1).
 *
 * Singleton que gerencia o layout autenticado: header + sidebar + content area.
 * Todas as páginas privadas renderizam dentro do content area, nunca substituem
 * o shell inteiro — navegação SPA sem piscar header/sidebar.
 *
 * API pública:
 *   AppShell.mount(container)       → monta o shell (se não montado) e retorna content area
 *   AppShell.unmount()              → desmonta (chamado ao ir para rota pública)
 *   AppShell.setActivePath(path)    → atualiza item ativo na sidebar
 *   AppShell.updateUser(user)       → atualiza nome/empresa no header
 *   AppShell.isMounted()            → boolean
 *   AppShell.getContentArea()       → HTMLElement | null
 */
import { t }            from '../i18n/pt-BR.js';
import { performLogout }from '../utils/logout.js';
import { sessionService }from '../services/sessionService.js';
import Storage          from '../utils/storage.js';

const SIDEBAR_COLLAPSED_KEY = 'ef_sidebar_collapsed';

// ── Ícones SVG ──────────────────────────────────────────────────────────────
const ICONS = {
  logo:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  swap:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  dashboard:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  transparency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  sectors:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  devices:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  alerts:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  goals:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  financial:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  reports:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  settings:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  menu:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close:        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevronLeft:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  logout:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  user:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

const NAV_ITEMS = [
  { path: '/dashboard',    labelKey: 'nav.dashboard',    icon: ICONS.dashboard    },
  { path: '/transparency', labelKey: 'nav.transparency', icon: ICONS.transparency },
  { path: '/devices',      labelKey: 'nav.devices',      icon: ICONS.devices      },
  { path: '/alerts',       labelKey: 'nav.alerts',       icon: ICONS.alerts       },
  { path: '/goals',        labelKey: 'nav.goals',        icon: ICONS.goals        },
  { path: '/financial',    labelKey: 'nav.financial',    icon: ICONS.financial    },
  { path: '/reports',      labelKey: 'nav.reports',      icon: ICONS.reports      },
  { path: '/settings',     labelKey: 'nav.settings',     icon: ICONS.settings     },
];

// ── AppShell singleton ───────────────────────────────────────────────────────

export const AppShell = (() => {
  let _shell       = null;
  let _content     = null;
  let _navLinks    = [];
  let _companyEl   = null;
  let _avatarName  = null;
  let _sidebarEl   = null;
  let _backdropEl  = null;
  let _collapsed   = Storage.get(SIDEBAR_COLLAPSED_KEY) === true;
  let _mobileOpen  = false;

  // ── Helpers ────────────────────────────────────────────────────

  function initials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }

  function getUser() {
    return sessionService.getUser() || {};
  }

  // ── Sidebar collapse ───────────────────────────────────────────

  function applyCollapsed() {
    if (!_shell) return;
    _shell.classList.toggle('app-shell--collapsed', _collapsed);
  }

  function toggleCollapse() {
    _collapsed = !_collapsed;
    Storage.set(SIDEBAR_COLLAPSED_KEY, _collapsed);
    applyCollapsed();
  }

  // ── Mobile drawer ──────────────────────────────────────────────

  function openDrawer() {
    _mobileOpen = true;
    _sidebarEl?.classList.add('app-sidebar--open');
    _backdropEl?.classList.add('app-backdrop--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    _mobileOpen = false;
    _sidebarEl?.classList.remove('app-sidebar--open');
    _backdropEl?.classList.remove('app-backdrop--visible');
    document.body.style.overflow = '';
  }

  // ── Avatar dropdown ────────────────────────────────────────────

  function buildAvatarDropdown(container, user) {
    let open = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'app-avatar-wrapper';

    const btn = document.createElement('button');
    btn.className = 'app-avatar';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', t('nav.profile'));

    _avatarName = document.createElement('span');
    _avatarName.className = 'app-avatar__initials';
    _avatarName.textContent = initials(user.name);
    btn.appendChild(_avatarName);

    const dropdown = document.createElement('div');
    dropdown.className = 'app-avatar-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.hidden = true;

    const userInfo = document.createElement('div');
    userInfo.className = 'app-avatar-dropdown__user';
    userInfo.innerHTML = `
      <span class="app-avatar-dropdown__name">${user.name || '—'}</span>
      <span class="app-avatar-dropdown__email">${user.email || ''}</span>
    `;
    dropdown.appendChild(userInfo);

    const divider = document.createElement('hr');
    divider.className = 'app-avatar-dropdown__divider';
    dropdown.appendChild(divider);

    const logoutItem = document.createElement('button');
    logoutItem.className = 'app-avatar-dropdown__item';
    logoutItem.setAttribute('role', 'menuitem');
    logoutItem.innerHTML = `${ICONS.logout} ${t('nav.logout')}`;
    logoutItem.addEventListener('click', () => { closeMenu(); performLogout(); });
    dropdown.appendChild(logoutItem);

    function openMenu() {
      open = true;
      dropdown.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onOutside, true);
      document.addEventListener('keydown', onKey);
    }

    function closeMenu() {
      open = false;
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('keydown', onKey);
    }

    function onOutside(e) {
      if (!wrapper.contains(e.target)) closeMenu();
    }

    function onKey(e) {
      if (e.key === 'Escape') { closeMenu(); btn.focus(); }
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      open ? closeMenu() : openMenu();
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(dropdown);
    container.appendChild(wrapper);

    return { wrapper, updateInitials: (name) => { _avatarName.textContent = initials(name); } };
  }

  // ── Build ──────────────────────────────────────────────────────

  function build(container) {
    const user = getUser();

    _shell = document.createElement('div');
    _shell.className = 'app-shell';

    // ── Header ────────────────────────────────────────────────
    const header = document.createElement('header');
    header.className = 'app-header';
    header.setAttribute('role', 'banner');

    // Hamburger (mobile)
    const hamburger = document.createElement('button');
    hamburger.className = 'app-header__hamburger';
    hamburger.setAttribute('aria-label', t('nav.open_menu'));
    hamburger.innerHTML = ICONS.menu;
    hamburger.addEventListener('click', openDrawer);
    header.appendChild(hamburger);

    // Logo
    const logoLink = document.createElement('a');
    logoLink.href = '#/dashboard';
    logoLink.className = 'app-header__logo';
    logoLink.setAttribute('aria-label', t('app.name'));
    logoLink.innerHTML = `${ICONS.logo}<span>${t('app.name')}</span>`;
    header.appendChild(logoLink);

    // Company name
    _companyEl = document.createElement('span');
    _companyEl.className = 'app-header__company';
    _companyEl.textContent = user.company_name || '';
    header.appendChild(_companyEl);

    // Actions (avatar)
    const actions = document.createElement('div');
    actions.className = 'app-header__actions';

    buildAvatarDropdown(actions, user);
    header.appendChild(actions);
    _shell.appendChild(header);

    // ── Body ──────────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'app-body';

    // Backdrop (mobile)
    _backdropEl = document.createElement('div');
    _backdropEl.className = 'app-backdrop';
    _backdropEl.setAttribute('aria-hidden', 'true');
    _backdropEl.addEventListener('click', closeDrawer);
    body.appendChild(_backdropEl);

    // Sidebar
    _sidebarEl = document.createElement('aside');
    _sidebarEl.className = 'app-sidebar';
    _sidebarEl.setAttribute('role', 'navigation');
    _sidebarEl.setAttribute('aria-label', 'Navegação principal');

    // Nav links
    const nav = document.createElement('nav');
    nav.className = 'app-nav';
    _navLinks = [];

    for (const item of NAV_ITEMS) {
      const link = document.createElement('a');
      link.href = `#${item.path}`;
      link.className = 'app-nav__item';
      link.setAttribute('title', t(item.labelKey));
      const badgeHtml = item.path === '/reports' ? '<span class="app-nav__badge">Em breve</span>' : '';
      link.innerHTML = `
        <span class="app-nav__icon" aria-hidden="true">${item.icon}</span>
        <span class="app-nav__label">${t(item.labelKey)}${badgeHtml}</span>
      `;
      link.addEventListener('click', () => {
        if (window.innerWidth < 640) closeDrawer();
      });
      nav.appendChild(link);
      _navLinks.push({ el: link, path: item.path });
    }

    _sidebarEl.appendChild(nav);

    // Trocar setor button
    const swapSectorBtn = document.createElement('a');
    swapSectorBtn.href = '#/sectors/select';
    swapSectorBtn.className = 'app-nav__item app-nav__swap-sector';
    swapSectorBtn.setAttribute('title', 'Trocar setor');
    swapSectorBtn.innerHTML = `
      <span class="app-nav__icon" aria-hidden="true">${ICONS.swap}</span>
      <span class="app-nav__label">Trocar setor</span>
    `;
    swapSectorBtn.addEventListener('click', () => {
      if (window.innerWidth < 640) closeDrawer();
    });
    _sidebarEl.appendChild(swapSectorBtn);

    // Collapse toggle (desktop only)
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'app-sidebar__collapse-btn';
    collapseBtn.setAttribute('aria-label', 'Recolher menu');
    collapseBtn.innerHTML = ICONS.chevronLeft;
    collapseBtn.addEventListener('click', () => {
      toggleCollapse();
      collapseBtn.innerHTML = _collapsed ? ICONS.chevronRight : ICONS.chevronLeft;
      collapseBtn.setAttribute('aria-label', _collapsed ? 'Expandir menu' : 'Recolher menu');
    });
    _sidebarEl.appendChild(collapseBtn);

    body.appendChild(_sidebarEl);

    // Content area
    _content = document.createElement('main');
    _content.className = 'app-main';
    _content.id = 'app-content';
    _content.setAttribute('role', 'main');
    body.appendChild(_content);

    _shell.appendChild(body);

    // Mount
    container.innerHTML = '';
    container.appendChild(_shell);
    applyCollapsed();
  }

  // ── API pública ────────────────────────────────────────────────

  return {
    /**
     * Monta o shell no container (se não montado). Retorna a content area.
     * @param {HTMLElement} container
     * @returns {HTMLElement}
     */
    mount(container) {
      if (!_shell || !container.contains(_shell)) {
        build(container);
      }
      return _content;
    },

    /** Desmonta o shell e limpa referências. */
    unmount() {
      closeDrawer();
      _shell = null;
      _content = null;
      _navLinks = [];
      _companyEl = null;
      _avatarName = null;
      _sidebarEl = null;
      _backdropEl = null;
      _mobileOpen = false;
    },

    /** Atualiza o item de navegação ativo. */
    setActivePath(path) {
      for (const { el, path: itemPath } of _navLinks) {
        const active = path === itemPath || (itemPath !== '/' && path.startsWith(itemPath + '/'));
        el.classList.toggle('app-nav__item--active', active);
        el.setAttribute('aria-current', active ? 'page' : 'false');
      }
    },

    /** Atualiza nome/empresa exibidos no header. */
    updateUser(user) {
      if (_companyEl) _companyEl.textContent = user.company_name || '';
      if (_avatarName) _avatarName.textContent = initials(user.name);
    },

    /** @returns {boolean} */
    isMounted() { return !!_shell; },

    /** @returns {HTMLElement|null} */
    getContentArea() { return _content; },
  };
})();
