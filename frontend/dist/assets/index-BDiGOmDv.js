(function () { let e = document.createElement(`link`).relList; if (e && e.supports && e.supports(`modulepreload`)) return; for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e); new MutationObserver(e => { for (let t of e) if (t.type === `childList`) for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e) }).observe(document, { childList: !0, subtree: !0 }); function t(e) { let t = {}; return e.integrity && (t.integrity = e.integrity), e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy), e.crossOrigin === `use-credentials` ? t.credentials = `include` : e.crossOrigin === `anonymous` ? t.credentials = `omit` : t.credentials = `same-origin`, t } function n(e) { if (e.ep) return; e.ep = !0; let n = t(e); fetch(e.href, n) } })(); var e = Object.freeze({ API_BASE_URL: `http://localhost:8000/api`, FIREBASE_RTDB_URL: `https://projeto-pi-bf5a6-default-rtdb.firebaseio.com`, APP_NAME: `LumenFlow`, VERSION: `0.2.0`, DEFAULT_LOCALE: `pt-BR`, POLLING_INTERVAL_MS: 2e3, TOAST_DURATION_MS: 5e3, TOKEN_STORAGE_KEY: `ef_token`, REMEMBER_STORAGE_KEY: `ef_remember`, DEMO_MODE: !1 }); console.log(`[${e.APP_NAME}] config.js carregado — API: ${e.API_BASE_URL}`); var t = (() => { let e = [], t = null, n = {}, r = {}; function i(e) { let t = [], n = e.replace(/:([^/]+)/g, (e, n) => (t.push(n), `§§PARAM§§`)).replace(/[.*+?^${}()|[\]\\]/g, `\\$&`).replace(/§§PARAM§§/g, `([^/]+)`); return { regex: RegExp(`^${n}$`), keys: t } } function a(t, n) { let { regex: r, keys: a } = i(t); e.push({ regex: r, keys: a, handler: n }) } function o(e) { t = e } function s() { let e = window.location.hash; if (!e) return `/`; let t = e.slice(1), n = t.indexOf(`?`); return n === -1 ? t : t.slice(0, n) } function c() { let e = window.location.hash; if (!e) return {}; let t = e.indexOf(`?`); if (t === -1) return {}; let n = e.slice(t + 1), r = {}; for (let e of n.split(`&`)) { let [t, n] = e.split(`=`); t && (r[decodeURIComponent(t)] = n ? decodeURIComponent(n) : ``) } return r } function l(i) { r = c(); for (let t of e) { let e = i.match(t.regex); if (e) { let r = {}; t.keys.forEach((t, n) => { r[t] = decodeURIComponent(e[n + 1]) }), n = r, t.handler(r); return } } console.warn(`[Router] No route matched: "${i}"`), t && t({ path: i }) } function u(e) { window.location.hash = e } function d() { window.addEventListener(`hashchange`, () => l(s())), l(s()) } function f() { return { ...n } } function ee() { return { ...r } } return { register: a, notFound: o, navigate: u, start: d, currentParams: f, currentQuery: ee } })(), n = `auth:expired`, r = `application/json`, i = d(), a = class extends Error { constructor({ code: e = `HTTP_ERROR`, message: t = `Erro ao comunicar com a API.`, status: n = 0, details: r = null } = {}) { super(t), this.name = `ApiError`, this.code = e, this.status = n, this.details = r } }; function o(e) { return Object.prototype.toString.call(e) === `[object Object]` } function s(e) { return e.replace(/\/+$/, ``) } function c(t) { if (!t) return ``; if (/^https?:\/\//i.test(t)) return t; let n = s(e.API_BASE_URL), r = t.startsWith(`/`) ? t : `/${t}`; return n.endsWith(`/api`) && r.startsWith(`/api/`) && (r = r.slice(4)), `${n}${r}` } function l(t, n) { if (!n || Object.keys(n).length === 0) return t; let r = globalThis.location?.origin ?? e.API_BASE_URL, i = new URL(t, r); return Object.entries(n).forEach(([e, t]) => { if (!(t == null || t === ``)) { if (Array.isArray(t)) { t.forEach(t => i.searchParams.append(e, t)); return } i.searchParams.set(e, t) } }), i.toString() } function u(e) { try { return globalThis.window?.[e] ?? null } catch { return null } } function d() { let t = u(`sessionStorage`), n = u(`localStorage`); return t?.getItem(e.TOKEN_STORAGE_KEY) || n?.getItem(e.TOKEN_STORAGE_KEY) || null } function f(t, { remember: n = !1 } = {}) { let r = u(n ? `localStorage` : `sessionStorage`), i = u(n ? `sessionStorage` : `localStorage`); if (i?.removeItem(e.TOKEN_STORAGE_KEY), i?.removeItem(e.REMEMBER_STORAGE_KEY), !t) { r?.removeItem(e.TOKEN_STORAGE_KEY), r?.removeItem(e.REMEMBER_STORAGE_KEY); return } r?.setItem(e.TOKEN_STORAGE_KEY, t), r?.setItem(e.REMEMBER_STORAGE_KEY, n ? `1` : `0`) } function ee(e) { globalThis.window && window.dispatchEvent(new CustomEvent(n, { detail: e })) } async function p(e) { return e.status === 204 ? null : (e.headers.get(`content-type`) || ``).includes(r) ? e.json() : e.text() } async function te(e, t = null) { let n = t ?? await p(e).catch(() => null), r = n?.error ?? {}; return new a({ code: r.code || `HTTP_${e.status}`, message: r.message || e.statusText || `Erro ao comunicar com a API.`, status: e.status, details: n }) } async function m(e, t, { body: n = void 0, query: o = void 0, headers: s = {}, signal: u = void 0, credentials: d = `same-origin` } = {}) { let f = l(c(t), o), m = new Headers(s); m.has(`Accept`) || m.set(`Accept`, r), n !== void 0 && !m.has(`Content-Type`) && m.set(`Content-Type`, r), i && !m.has(`Authorization`) && m.set(`Authorization`, `Bearer ${i}`); let h = await fetch(f, { method: e, headers: m, body: n === void 0 ? void 0 : JSON.stringify(n), signal: u, credentials: d }).catch(e => { throw new a({ code: `NETWORK_ERROR`, message: `Nao foi possivel conectar com a API.`, status: 0, details: e }) }), g = await p(h).catch(() => null); if (!h.ok) { let e = await te(h, g); throw h.status === 401 && ee(e), e } return g } var h = { get(e, t = {}) { return m(`GET`, e, t) }, post(e, t, n = {}) { return m(`POST`, e, { ...n, body: t }) }, put(e, t, n = {}) { return m(`PUT`, e, { ...n, body: t }) }, patch(e, t, n = {}) { return m(`PATCH`, e, { ...n, body: t }) }, delete(e, t = {}) { return m(`DELETE`, e, t) }, setAuthToken(e, { remember: t = !1, persist: n = !0 } = {}) { i = e || null, n && f(i, { remember: t }) }, getAuthToken() { return i }, clearAuthToken() { i = null, f(null) }, isApiError(e) { return e instanceof a || o(e) && `code` in e && `status` in e }, getBaseUrl() { return s(e.API_BASE_URL).replace(/\/api$/, ``) } }; function g(e) { return { set(t, n) { try { return e.setItem(t, JSON.stringify(n)), !0 } catch { return console.warn(`[Storage] Falha ao salvar "${t}"`), !1 } }, get(t, n = null) { try { let r = e.getItem(t); return r === null ? n : JSON.parse(r) } catch { return n } }, remove(t) { try { e.removeItem(t) } catch { } }, removeByPrefix(t) { try { Object.keys(e).filter(e => e.startsWith(t)).forEach(t => e.removeItem(t)) } catch { } }, clear() { try { e.clear() } catch { } }, has(t) { try { return e.getItem(t) !== null } catch { return !1 } } } } var _ = { ...g(localStorage), session: g(sessionStorage) }, v = { isAuthenticated() { return !!h.getAuthToken() }, getToken() { return h.getAuthToken() }, persist(e, { remember: t = !1 } = {}) { h.setAuthToken(e, { remember: t }) }, clear() { h.clearAuthToken() }, isRemembered() { return _.get(e.REMEMBER_STORAGE_KEY) === `1` || _.session.get(e.REMEMBER_STORAGE_KEY) === `1` }, setUser(e) { (this.isRemembered() ? _ : _.session).set(`ef_user`, { id: e.id, name: e.name, email: e.email, company_name: e.company_name }) }, getUser() { return _.get(`ef_user`) || _.session.get(`ef_user`) || null }, clearUser() { _.remove(`ef_user`), _.session.remove(`ef_user`) }, destroy() { this.clear(), this.clearUser() } }, y = { async login({ email: e, password: t, rememberMe: n = !1 } = {}) { let r = await h.post(`/auth/login`, { email: e, password: t, remember_me: n }); return r?.token && h.setAuthToken(r.token, { remember: n }), r }, async register(e) { let t = await h.post(`/auth/register`, e); return t?.token && h.setAuthToken(t.token, { remember: !1 }), t }, async forgotPassword({ email: e } = {}) { return h.post(`/auth/forgot-password`, { email: e }) }, async resetPassword({ token: e, email: t, password: n } = {}) { return h.post(`/auth/reset-password`, { token: e, email: t, password: n }) }, async logout() { try { return await h.post(`/auth/logout`, {}) } finally { h.clearAuthToken() } }, getToken() { return h.getAuthToken() }, clearSession() { h.clearAuthToken() } }, b = !1; async function ne() { if (!b) { b = !0; try { await y.logout() } catch { } finally { v.destroy(), E(), b = !1 } window.Alpine?.store(`toast`)?.show(`Logout realizado.`, `info`), t.navigate(`/login`) } } var x = `ef_sidebar_collapsed`, re = [{ path: `/dashboard`, label: `Dashboard`, icon: `dashboard` }, { path: `/transparency`, label: `Transparência`, icon: `transparency` }, { path: `/devices`, label: `Dispositivos`, icon: `devices` }, { path: `/alerts`, label: `Alertas`, icon: `alerts` }, { path: `/goals`, label: `Metas`, icon: `goals`, hidden: !0 }, { path: `/financial`, label: `Financeiro`, icon: `financial` }, { path: `/reports`, label: `Relatórios`, icon: `reports` }, { path: `/settings`, label: `Configurações`, icon: `settings` }]; function S(e) { return { dashboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`, transparency: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`, devices: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`, alerts: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`, goals: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`, financial: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, reports: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, swap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`, logout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`, logo: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`, sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`, moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`, menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` }[e] || `` } var C = (() => {
  let e = null, t = null, n = ``; function r() { return v.getUser() || {} } function i(e = ``) { return e.trim().split(/\s+/).slice(0, 2).map(e => e[0]).join(``).toUpperCase() || `?` } function a(a) {
    let o = r(), s = localStorage.getItem(x) === `true`; e = document.createElement(`div`), e.setAttribute(`x-data`, JSON.stringify({ sidebarOpen: !1, collapsed: s, dropdownOpen: !1, darkMode: localStorage.getItem(`ef_theme`) === `dark` })), e.className = `flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900`; let c = re.filter(e => !e.hidden).map(e => `
      <a href="#${e.path}"
         @click="if(window.innerWidth < 768) sidebarOpen = false"
         class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${n === e.path ? `bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` : `text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white`}"
         data-path="${e.path}">
        <span class="shrink-0">${S(e.icon)}</span>
        <span x-show="!collapsed || sidebarOpen" x-cloak class="truncate">${e.label}</span>
      </a>
    `).join(``); e.innerHTML = `
      <!-- Mobile backdrop -->
      <div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 z-30 bg-black/50 md:hidden" x-transition.opacity></div>

      <!-- Sidebar -->
      <aside :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full', collapsed && !sidebarOpen ? 'md:w-16' : 'md:w-60']"
             class="fixed inset-y-0 left-0 z-40 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-200 md:translate-x-0 md:static md:z-auto flex flex-col">

        <!-- Logo -->
        <div class="flex items-center gap-2 px-4 h-16 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <a href="#/dashboard" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span>${S(`logo`)}</span>
            <span x-show="!collapsed || sidebarOpen" x-cloak class="font-bold text-lg">LumenFlow</span>
          </a>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          ${c}
        </nav>

        <!-- Swap sector + collapse -->
        <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <a href="#/sectors/select" @click="if(window.innerWidth < 768) sidebarOpen = false" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
            <span class="shrink-0">${S(`swap`)}</span>
            <span x-show="!collapsed || sidebarOpen" x-cloak>Trocar setor</span>
          </a>
          <button @click="collapsed = !collapsed; localStorage.setItem('${x}', collapsed)" class="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full transition-colors">
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
              ${S(`menu`)}
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">${o.company_name || ``}</span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Theme toggle -->
            <button @click="darkMode = !darkMode; localStorage.setItem('ef_theme', darkMode ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', darkMode); document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" aria-label="Alternar tema">
              <span x-show="!darkMode">${S(`moon`)}</span>
              <span x-show="darkMode" x-cloak>${S(`sun`)}</span>
            </button>
            <!-- Avatar dropdown -->
            <div class="relative">
              <button @click="dropdownOpen = !dropdownOpen" class="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center justify-center" aria-haspopup="true" :aria-expanded="dropdownOpen">
                ${i(o.name)}
              </button>
              <div x-show="dropdownOpen" x-cloak @click.outside="dropdownOpen = false" x-transition class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">${o.name || `—`}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">${o.email || ``}</p>
                </div>
                <button id="app-shell-logout-btn" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  ${S(`logout`)}
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main id="app-content" class="flex-1 overflow-y-auto p-4 sm:p-6"></main>
      </div>
    `, a.innerHTML = ``, a.appendChild(e), t = e.querySelector(`#app-content`), window.Alpine?.initTree(e), e.querySelector(`#app-shell-logout-btn`)?.addEventListener(`click`, () => ne())
  } return { mount(n) { return (!e || !n.contains(e)) && a(n), t }, unmount() { e = null, t = null, n = `` }, setActivePath(t) { n = t, e && e.querySelectorAll(`[data-path]`).forEach(e => { let n = e.dataset.path; t === n || n !== `/` && t.startsWith(n + `/`) ? e.className = e.className.replace(/text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/, `bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`) : e.className = e.className.replace(/bg-emerald-50 text-emerald-700 dark:bg-emerald-900\/30 dark:text-emerald-400/, `text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white`) }) }, updateUser(e) { }, isMounted() { return !!e }, getContentArea() { return t } }
})(), ie = 6e4, w = 0, T = null; async function ae() { return Date.now() - w < ie ? !0 : T || (T = h.get(`/auth/me`).then(e => (w = Date.now(), e && e.user && v.setUser(e.user), !0)).catch(() => (w = Date.now(), !0)).finally(() => { T = null }), T) } function E() { w = 0, T = null } function D(e) { return async n => { if (!v.isAuthenticated()) { t.navigate(`/login`); return } let r = document.getElementById(`app`), i = C.mount(r), a = window.location.hash.slice(1).split(`?`)[0] || `/`; C.setActivePath(a), e(i, n), ae().then(e => { if (e) { let e = v.getUser(); e && C.updateUser(e) } }) } } function O(e) { return n => { if (v.isAuthenticated()) { t.navigate(`/sectors/select`); return } C.isMounted() && C.unmount(), e(n) } } var oe = 0; function se(t) { t.store(`toast`, { toasts: [], show(t, n = `info`, r = e.TOAST_DURATION_MS) { let i = ++oe, a = { id: i, message: t, type: n, visible: !0 }; this.toasts.push(a), r > 0 && setTimeout(() => this.dismiss(i), r) }, dismiss(e) { let t = this.toasts.find(t => t.id === e); t && (t.visible = !1), setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== e) }, 300) }, success(e, t) { this.show(e, `success`, t) }, error(e, t) { this.show(e, `error`, t) }, warning(e, t) { this.show(e, `warning`, t) }, info(e, t) { this.show(e, `info`, t) } }), t.data(`toastContainer`, () => ({ get toasts() { return t.store(`toast`).toasts }, dismiss(e) { t.store(`toast`).dismiss(e) }, typeClasses(e) { let t = { success: `bg-green-600 text-white`, error: `bg-red-600 text-white`, warning: `bg-yellow-500 text-gray-900`, info: `bg-gray-700 text-white` }; return t[e] || t.info }, typeIcon(e) { let t = { success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`, warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`, info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>` }; return t[e] || t.info } })) } function ce(e) { e.store(`session`, { user: null, token: null, get isAuthenticated() { return !!this.token }, init() { this.restore() }, restore() { this.token = v.getToken(), this.user = v.getUser() }, async login(e, t, n = !1) { let r = await y.login({ email: e, password: t, rememberMe: n }); return r?.token && (this.token = r.token, this.user = r.user || null, r.user && v.setUser(r.user)), r }, async logout() { try { await y.logout() } catch { } this.token = null, this.user = null, v.destroy(), e.store(`toast`)?.show(`Logout realizado.`, `info`) }, updateUser(e) { this.user = e, v.setUser(e) }, clear() { this.token = null, this.user = null, v.destroy() } }) } var k = { async list({ type: e, severity: t, status: n, sector_id: r, device_id: i, page: a, limit: o, sort: s } = {}) { return h.get(`/api/alerts`, { query: { type: e, severity: t, status: n, sector_id: r, device_id: i, page: a, limit: o, sort: s } }) }, async get(e) { return h.get(`/api/alerts/${encodeURIComponent(e)}`) }, async acknowledge(e, t) { return h.patch(`/api/alerts/${encodeURIComponent(e)}/acknowledge`, { comment: t }) }, async resolve(e, t) { return h.patch(`/api/alerts/${encodeURIComponent(e)}/resolve`, { comment: t }) }, async bulkAcknowledge(e) { return h.patch(`/api/alerts/bulk/acknowledge`, { ids: e }) }, async bulkResolve(e) { return h.patch(`/api/alerts/bulk/resolve`, { ids: e }) }, async getCount({ status: e = `open` } = {}) { return h.get(`/api/alerts/count`, { query: { status: e } }) } }, le = 3e4; function ue(e) { e.store(`alerts`, { openCount: 0, recent: [], loading: !1, _intervalId: null, async fetch() { this.loading = !0; try { let e = await k.getCount({ status: `open` }); this.openCount = e?.count ?? 0 } catch { } this.loading = !1 }, async fetchRecent(e = 5) { try { let t = await k.list({ status: `open`, limit: e, sort: `-created_at` }); this.recent = t?.alerts || t?.data || [] } catch { this.recent = [] } }, startPolling() { this._intervalId ||= (this.fetch(), setInterval(() => this.fetch(), le)) }, stopPolling() { this._intervalId &&= (clearInterval(this._intervalId), null) }, get hasBadge() { return this.openCount > 0 }, get badgeText() { return this.openCount > 99 ? `99+` : String(this.openCount) } }) } var de = e.FIREBASE_RTDB_URL, A = new Map; function fe(e) { return `${de}/${e}.json` } function j(t, n) { A.has(t) && M(t); let r = fe(t), i; try { i = new EventSource(r), i.addEventListener(`put`, e => { try { n(JSON.parse(e.data).data) } catch (e) { console.warn(`[Firebase] Erro ao parsear evento de ${t}:`, e) } }), i.addEventListener(`patch`, e => { try { n(JSON.parse(e.data).data) } catch (e) { console.warn(`[Firebase] Erro ao parsear patch de ${t}:`, e) } }), i.onerror = () => { console.warn(`[Firebase] Conexão SSE perdida para ${t}. Reconectando...`) }, A.set(t, { eventSource: i, onChange: n }) } catch { console.warn(`[Firebase] SSE não suportado, usando polling para ${t}`); let i = setInterval(async () => { try { let e = await fetch(`${r}`); e.ok && n(await e.json()) } catch { } }, e.POLLING_INTERVAL_MS); A.set(t, { intervalId: i, onChange: n }) } return () => M(t) } function M(e) { let t = A.get(e); t && (t.eventSource && t.eventSource.close(), t.intervalId && clearInterval(t.intervalId), A.delete(e)) } function pe(e) { e.store(`realtime`, { sectors: [], live: { totalPower_W: 0, totalEnergy_kWh: 0, estimativaCusto_R: 0, timestamp: null }, connected: !1, _unsubscribers: [], startListening() { if (this.connected) return; let e = j(`sensores`, e => { e && (this.sectors = Object.entries(e).map(([e, t]) => ({ id: e, name: t.nome || e, potencia: t.potencia || 0, energia_kwh: t.energia_kwh || 0, corrente: t.corrente || 0, tensao: t.tensao || 0, fator_pf: t.fator_pf || 0 })), this.connected = !0) }), t = j(`dashboard/readings/live`, e => { e && (this.live = { totalPower_W: e.totalPower_W || 0, totalEnergy_kWh: e.totalEnergy_kWh || 0, estimativaCusto_R: e.estimativaCusto_R || 0, timestamp: e.timestamp || null }, this.connected = !0) }); this._unsubscribers = [e, t] }, stopListening() { this._unsubscribers.forEach(e => e()), this._unsubscribers = [], this.connected = !1 }, getSector(e) { return this.sectors.find(t => t.id === e) || null }, get totalPower() { return this.live.totalPower_W }, get totalEnergy() { return this.live.totalEnergy_kWh } }) } function me(e) { se(e), ce(e), ue(e), pe(e) } var he = [{ value: `food_wholesale`, label: `Alimentos e Bebidas` }, { value: `pharma_wholesale`, label: `Farmacêutico` }, { value: `building_wholesale`, label: `Materiais de Construção` }, { value: `electronics_wholesale`, label: `Eletroeletrônicos` }, { value: `textile_wholesale`, label: `Têxtil e Vestuário` }, { value: `chemical_wholesale`, label: `Químico e Petroquímico` }, { value: `agro_wholesale`, label: `Agronegócio` }, { value: `logistics`, label: `Logística e Distribuição` }, { value: `other`, label: `Outro` }]; function ge(e) { e.data(`registerPage`, () => ({ companyName: ``, cnpj: ``, segment: ``, responsibleName: ``, email: ``, password: ``, passwordConfirm: ``, termsAccepted: !1, loading: !1, showPassword: !1, showPasswordConfirm: !1, globalError: ``, cnpjLoading: !1, lastLookedUpCnpj: ``, segments: he, errors: { companyName: ``, cnpj: ``, segment: ``, responsibleName: ``, email: ``, password: ``, passwordConfirm: ``, terms: `` }, touched: { companyName: !1, cnpj: !1, segment: !1, responsibleName: !1, email: !1, password: !1, passwordConfirm: !1 }, onCnpjInput() { let e = this.cnpj.replace(/\D/g, ``).slice(0, 14); e.length <= 2 ? this.cnpj = e : e.length <= 5 ? this.cnpj = `${e.slice(0, 2)}.${e.slice(2)}` : e.length <= 8 ? this.cnpj = `${e.slice(0, 2)}.${e.slice(2, 5)}.${e.slice(5)}` : e.length <= 12 ? this.cnpj = `${e.slice(0, 2)}.${e.slice(2, 5)}.${e.slice(5, 8)}/${e.slice(8)}` : this.cnpj = `${e.slice(0, 2)}.${e.slice(2, 5)}.${e.slice(5, 8)}/${e.slice(8, 12)}-${e.slice(12)}`, this.touched.cnpj && (this.errors.cnpj = this._validateCnpj()), e.length === 14 && this.lookupCnpj(e) }, async lookupCnpj(e) { if (!(this.cnpjLoading || this.lastLookedUpCnpj === e)) { this.lastLookedUpCnpj = e, this.cnpjLoading = !0, this.errors.cnpj = ``; try { let t = await fetch(`https://open.cnpja.com/office/${e}`); if (!t.ok) throw Error(`CNPJ não encontrado`); let n = await t.json(), r = n?.status?.text; if (r && r.toLowerCase() !== `ativa`) { this.errors.cnpj = `CNPJ inativo (Status: ${r})`; return } let i = n?.company?.name, a = n?.alias; if (this.companyName = a || i || this.companyName, this.errors.companyName = ``, this.touched.companyName = !0, n?.mainActivity?.text) { let e = n.mainActivity.text.toLowerCase(), t = ``; e.includes(`alimento`) || e.includes(`bebida`) || e.includes(`restaurante`) || e.includes(`supermercado`) ? t = `food_wholesale` : e.includes(`farma`) || e.includes(`medicamento`) || e.includes(`saude`) || e.includes(`hospital`) ? t = `pharma_wholesale` : e.includes(`constru`) || e.includes(`tijolo`) || e.includes(`cimento`) || e.includes(`ferrag`) ? t = `building_wholesale` : e.includes(`eletr`) || e.includes(`comput`) || e.includes(`celular`) || e.includes(`tecnol`) ? t = `electronics_wholesale` : e.includes(`textil`) || e.includes(`vestu`) || e.includes(`roupa`) || e.includes(`calca`) ? t = `textile_wholesale` : e.includes(`quimic`) || e.includes(`petro`) || e.includes(`plastico`) ? t = `chemical_wholesale` : e.includes(`agro`) || e.includes(`fazenda`) || e.includes(`cultiv`) || e.includes(`semen`) || e.includes(`fertil`) ? t = `agro_wholesale` : (e.includes(`logist`) || e.includes(`transp`) || e.includes(`distrib`) || e.includes(`carga`)) && (t = `logistics`), t && (this.segment = t, this.touched.segment = !0, this.errors.segment = ``) } this.errors.cnpj = `` } catch { this.errors.cnpj = `CNPJ inválido ou não encontrado na Receita Federal.` } finally { this.cnpjLoading = !1 } } }, _required(e) { return e.trim() ? `` : `Campo obrigatório` }, _validateEmail() { return this.email.trim() ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ? `` : `E-mail inválido` : `Campo obrigatório` }, _validateCnpj() { let e = this.cnpj.replace(/\D/g, ``); return e ? e.length === 14 ? `` : `CNPJ deve ter 14 dígitos` : `Campo obrigatório` }, _validatePassword() { return this.password ? this.password.length < 8 ? `Mínimo 8 caracteres` : /[a-zA-Z]/.test(this.password) ? /[0-9]/.test(this.password) ? `` : `Deve conter ao menos um número` : `Deve conter ao menos uma letra` : `Campo obrigatório` }, _validatePasswordConfirm() { return this.passwordConfirm ? this.password === this.passwordConfirm ? `` : `Senhas não conferem` : `Campo obrigatório` }, onBlur(e) { if (this.touched[e] = !0, this._validateField(e), e === `cnpj`) { let e = this.cnpj.replace(/\D/g, ``); e.length === 14 && this.lookupCnpj(e) } }, onInput(e) { this.touched[e] && (this._validateField(e), e === `password` && this.touched.passwordConfirm && (this.errors.passwordConfirm = this._validatePasswordConfirm())) }, _validateField(e) { let t = { companyName: () => this._required(this.companyName), cnpj: () => this._validateCnpj(), segment: () => this.segment ? `` : `Campo obrigatório`, responsibleName: () => this._required(this.responsibleName), email: () => this._validateEmail(), password: () => this._validatePassword(), passwordConfirm: () => this._validatePasswordConfirm() }; this.errors[e] = t[e]() }, runAllValidations() { return Object.keys(this.touched).forEach(e => { this.touched[e] = !0 }), Object.keys(this.errors).forEach(e => { e === `terms` ? this.errors.terms = this.termsAccepted ? `` : `Aceite os termos de uso` : this._validateField(e) }), !Object.values(this.errors).some(Boolean) }, get hasErrors() { return Object.values(this.errors).some(Boolean) }, async submit() { if (!this.runAllValidations()) return; this.loading = !0, this.globalError = ``; let n = { company_name: this.companyName.trim(), cnpj: this.cnpj.replace(/\D/g, ``), segment: this.segment, responsible_name: this.responsibleName.trim(), email: this.email.trim().toLowerCase(), password: this.password, password_confirmation: this.passwordConfirm }; try { let r = await y.register(n); r?.user && v.setUser(r.user), e.store(`toast`)?.show(`Cadastro realizado com sucesso.`, `success`, 7e3), t.navigate(`/sectors/select`) } catch (e) { this.loading = !1, this._handleError(e) } }, _handleError(t) { let n = t?.code || ``; if (n === `COMPANY_CNPJ_TAKEN`) { this.errors.cnpj = `Este CNPJ já está cadastrado.`; return } if (n === `USER_EMAIL_TAKEN`) { this.errors.email = `Este e-mail já está em uso.`; return } if (n === `VALIDATION_ERROR` && t?.details?.errors) { for (let [e, n] of Object.entries({ company_name: `companyName`, cnpj: `cnpj`, segment: `segment`, responsible_name: `responsibleName`, email: `email`, password: `password` })) t.details.errors[e] && (this.errors[n] = t.details.errors[e]); return } if (n === `NETWORK_ERROR`) { e.store(`toast`)?.show(`Sem conexão com o servidor.`, `error`, 8e3); return } this.globalError = t?.message || `Ocorreu um erro. Tente novamente.` }, darkMode: localStorage.getItem(`ef_theme`) === `dark`, toggleTheme() { this.darkMode = !this.darkMode; let e = this.darkMode ? `dark` : `light`; document.documentElement.setAttribute(`data-theme`, e), document.documentElement.classList.toggle(`dark`, this.darkMode), localStorage.setItem(`ef_theme`, e) } })) } var N = !1; function _e(e) {
  !N && window.Alpine && (ge(window.Alpine), N = !0), e.innerHTML = `
<div x-data="registerPage" class="min-h-screen flex">

  <!-- Branding Panel -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-6">
      <h2 class="text-3xl font-bold leading-tight">Gestão inteligente de energia para sua empresa</h2>
      <p class="text-emerald-100 text-lg">Monitore, analise e reduza o consumo energético com dados em tempo real.</p>
      <ul class="space-y-3 text-emerald-100">
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Dashboard de consumo em tempo real</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Alertas automáticos de desperdício</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Relatórios ESG mensais</li>
        <li class="flex items-center gap-2"><svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Metas e acompanhamento financeiro</li>
      </ul>
    </div>
    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-white dark:bg-gray-900 relative overflow-y-auto">

    <!-- Theme Toggle -->
    <button @click="toggleTheme" class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Alternar tema">
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-md space-y-6">

      <!-- Mobile Logo -->
      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        LumenFlow
      </div>

      <!-- Header -->
      <div class="text-center lg:text-left">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Criar conta</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Cadastre sua empresa</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" novalidate aria-label="Criar conta" class="space-y-4">

        <!-- Global Error -->
        <div x-show="globalError" x-transition x-cloak role="alert" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <span x-text="globalError"></span>
        </div>

        <!-- Section: Empresa -->
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-2">Dados da empresa</p>

        <!-- Company Name -->
        <div>
          <label for="reg-company" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da empresa</label>
          <input id="reg-company" type="text" x-model="companyName" @blur="onBlur('companyName')" @input="onInput('companyName')" autocomplete="organization"
            :class="errors.companyName && touched.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.companyName && touched.companyName" x-text="errors.companyName" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- CNPJ + Segment row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="reg-cnpj" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
            <div class="relative">
              <input id="reg-cnpj" type="text" x-model="cnpj" @input="onCnpjInput()" @blur="onBlur('cnpj')" placeholder="00.000.000/0000-00" maxlength="18"
                :class="errors.cnpj && touched.cnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <div x-show="cnpjLoading" x-cloak class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            </div>
            <p x-show="errors.cnpj && touched.cnpj" x-text="errors.cnpj" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
          <div>
            <label for="reg-segment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segmento</label>
            <select id="reg-segment" x-model="segment" @blur="onBlur('segment')" @change="onInput('segment')"
              :class="errors.segment && touched.segment ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors" required>
              <option value="" disabled>Selecione o segmento</option>
              <template x-for="opt in segments" :key="opt.value">
                <option :value="opt.value" x-text="opt.label"></option>
              </template>
            </select>
            <p x-show="errors.segment && touched.segment" x-text="errors.segment" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
        </div>

        <!-- Section: Responsável -->
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-2">Responsável pela conta</p>

        <!-- Responsible Name -->
        <div>
          <label for="reg-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome completo</label>
          <input id="reg-name" type="text" x-model="responsibleName" @blur="onBlur('responsibleName')" @input="onInput('responsibleName')" autocomplete="name"
            :class="errors.responsibleName && touched.responsibleName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.responsibleName && touched.responsibleName" x-text="errors.responsibleName" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Email -->
        <div>
          <label for="reg-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail corporativo</label>
          <input id="reg-email" type="email" x-model="email" @blur="onBlur('email')" @input="onInput('email')" autocomplete="email"
            :class="errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors" required />
          <p x-show="errors.email && touched.email" x-text="errors.email" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Passwords row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Password -->
          <div>
            <label for="reg-pass" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <div class="relative">
              <input id="reg-pass" :type="showPassword ? 'text' : 'password'" x-model="password" @blur="onBlur('password')" @input="onInput('password')" autocomplete="new-password"
                :class="errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :aria-label="showPassword ? 'Ocultar' : 'Mostrar'">
                <svg x-show="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPassword" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-400">Mín. 8 caracteres com letra, número e símbolo</p>
            <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
          <!-- Confirm -->
          <div>
            <label for="reg-pass-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar senha</label>
            <div class="relative">
              <input id="reg-pass-confirm" :type="showPasswordConfirm ? 'text' : 'password'" x-model="passwordConfirm" @blur="onBlur('passwordConfirm')" @input="onInput('passwordConfirm')" autocomplete="new-password"
                :class="errors.passwordConfirm && touched.passwordConfirm ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :aria-label="showPasswordConfirm ? 'Ocultar' : 'Mostrar'">
                <svg x-show="!showPasswordConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPasswordConfirm" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p x-show="errors.passwordConfirm && touched.passwordConfirm" x-text="errors.passwordConfirm" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>
        </div>

        <!-- Terms -->
        <div class="pt-2">
          <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" x-model="termsAccepted" class="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800" />
            <span class="text-sm text-gray-600 dark:text-gray-400">Li e aceito os <a href="#" class="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">termos de uso</a>.</span>
          </label>
          <p x-show="errors.terms" x-text="errors.terms" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
          <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span x-text="loading ? 'Cadastrando...' : 'Cadastrar'"></span>
        </button>

        <!-- Login link -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Já tem conta? <a href="#/login" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Entrar</a>
        </p>
      </form>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function ve(n) { n.data(`loginPage`, () => ({ email: ``, password: ``, rememberMe: !1, loading: !1, demoLoading: !1, showPassword: !1, errors: { email: ``, password: `` }, touched: { email: !1, password: !1 }, globalError: ``, validateEmail() { return this.email.trim() ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ? `` : `E-mail inválido` : `Campo obrigatório` }, validatePassword() { return this.password ? `` : `Campo obrigatório` }, onBlur(e) { this.touched[e] = !0, this.errors[e] = e === `email` ? this.validateEmail() : this.validatePassword() }, onInput(e) { this.touched[e] && (this.errors[e] = e === `email` ? this.validateEmail() : this.validatePassword()) }, runAllValidations() { return this.touched.email = !0, this.touched.password = !0, this.errors.email = this.validateEmail(), this.errors.password = this.validatePassword(), !this.errors.email && !this.errors.password }, get hasErrors() { return !!(this.errors.email || this.errors.password) }, async submit() { if (this.runAllValidations()) { this.loading = !0, this.globalError = ``; try { let e = await y.login({ email: this.email.trim().toLowerCase(), password: this.password, rememberMe: this.rememberMe }); e?.user && v.setUser(e.user), t.navigate(`/sectors/select`) } catch (e) { this.loading = !1, this._handleError(e) } } }, get showDemo() { return e.DEMO_MODE }, async loginDemo() { this.demoLoading = !0, this.globalError = ``; try { let e = await y.login({ email: `joao@technova.com.br`, password: `demo`, rememberMe: !0 }); e?.user && v.setUser(e.user), t.navigate(`/sectors/select`) } catch { this.demoLoading = !1, n.store(`toast`)?.show(`Erro ao entrar no modo demo.`, `error`) } }, _handleError(e) { let t = e?.code || ``; if (t === `INVALID_CREDENTIALS` || e?.status === 401) { this.globalError = `E-mail ou senha incorretos.`; return } if (t === `TOO_MANY_ATTEMPTS` || e?.status === 429) { this.globalError = `Muitas tentativas. Tente novamente em alguns minutos.`; return } if (t === `NETWORK_ERROR`) { n.store(`toast`)?.show(`Sem conexão com o servidor.`, `error`, 8e3); return } this.globalError = e?.message || `Ocorreu um erro. Tente novamente.` }, darkMode: localStorage.getItem(`ef_theme`) === `dark`, toggleTheme() { this.darkMode = !this.darkMode; let e = this.darkMode ? `dark` : `light`; document.documentElement.setAttribute(`data-theme`, e), document.documentElement.classList.toggle(`dark`, this.darkMode), localStorage.setItem(`ef_theme`, e) } })) } var ye = !1; function be(e) {
  !ye && window.Alpine && (ve(window.Alpine), ye = !0), e.innerHTML = `
<div x-data="loginPage" class="min-h-screen flex">

  <!-- Branding Panel (hidden on mobile) -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      LumenFlow
    </div>

    <div class="space-y-6">
      <h2 class="text-3xl font-bold leading-tight">Bem-vindo de volta ao LumenFlow</h2>
      <p class="text-emerald-100 text-lg">
        Continue monitorando o consumo energético da sua empresa com inteligência e precisão.
      </p>
      <ul class="space-y-3 text-emerald-100">
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Dashboard atualizado em tempo real
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Alertas automáticos de anomalias
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Relatórios ESG prontos para download
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Metas e controle financeiro integrados
        </li>
      </ul>
    </div>

    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 relative">

    <!-- Theme Toggle -->
    <button
      @click="toggleTheme"
      class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      aria-label="Alternar tema"
    >
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-sm space-y-8">

      <!-- Mobile Logo -->
      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        LumenFlow
      </div>

      <!-- Header -->
      <div class="text-center lg:text-left">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Entrar</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Bem-vindo de volta</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" novalidate aria-label="Entrar" class="space-y-5">

        <!-- Global Error Banner -->
        <div
          x-show="globalError"
          x-transition
          x-cloak
          role="alert"
          aria-live="assertive"
          class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          <span x-text="globalError"></span>
        </div>

        <!-- Email -->
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autocomplete="email"
            x-model="email"
            @blur="onBlur('email')"
            @input="onInput('email')"
            :class="errors.email && touched.email ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
            class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors"
            placeholder="seu@email.com"
            required
          />
          <p x-show="errors.email && touched.email" x-text="errors.email" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Password -->
        <div>
          <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
          <div class="relative">
            <input
              id="login-password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              x-model="password"
              @blur="onBlur('password')"
              @input="onInput('password')"
              :class="errors.password && touched.password ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <svg x-show="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg x-show="showPassword" x-cloak width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              x-model="rememberMe"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">Lembre-se de mim</span>
          </label>
          <a href="#/forgot-password" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
            Esqueci a senha
          </a>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2"
        >
          <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span x-text="loading ? 'Entrando...' : 'Entrar'"></span>
        </button>

        <!-- Register Link -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Não tem conta?
          <a href="#/register" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">Criar conta</a>
        </p>

        <!-- Demo Mode -->
        <template x-if="showDemo">
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="loginDemo"
              :disabled="demoLoading"
              class="w-full py-2.5 px-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg x-show="demoLoading" x-cloak class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span x-text="demoLoading ? 'Entrando...' : 'Entrar como Demo'"></span>
            </button>
          </div>
        </template>

      </form>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function xe(e) { e.data(`forgotPasswordPage`, () => ({ email: ``, emailError: ``, touched: !1, loading: !1, sent: !1, validateEmail() { return this.email.trim() ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ? `` : `E-mail inválido` : `Campo obrigatório` }, onBlur() { this.touched = !0, this.emailError = this.validateEmail() }, onInput() { this.touched && (this.emailError = this.validateEmail()) }, async submit() { if (this.touched = !0, this.emailError = this.validateEmail(), !this.emailError) { this.loading = !0; try { await y.forgotPassword({ email: this.email.trim().toLowerCase() }) } catch (t) { if (t?.code === `NETWORK_ERROR`) { this.loading = !1, e.store(`toast`)?.show(`Sem conexão com o servidor.`, `error`, 8e3); return } } this.loading = !1, this.sent = !0 } }, darkMode: localStorage.getItem(`ef_theme`) === `dark`, toggleTheme() { this.darkMode = !this.darkMode; let e = this.darkMode ? `dark` : `light`; document.documentElement.setAttribute(`data-theme`, e), document.documentElement.classList.toggle(`dark`, this.darkMode), localStorage.setItem(`ef_theme`, e) } })) } var Se = !1; function Ce(e) {
  !Se && window.Alpine && (xe(window.Alpine), Se = !0), e.innerHTML = `
<div x-data="forgotPasswordPage" class="min-h-screen flex">

  <!-- Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">Recupere o acesso à sua conta</h2>
      <p class="text-emerald-100 text-lg">Enviaremos um link seguro para o e-mail cadastrado. O link expira em 1 hora.</p>
    </div>
    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 relative">

    <button @click="toggleTheme" class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Alternar tema">
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-sm space-y-8">

      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        LumenFlow
      </div>

      <!-- Form State -->
      <div x-show="!sent">
        <div class="text-center lg:text-left mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Recuperar senha</h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Informe seu e-mail para receber o link</p>
        </div>

        <form @submit.prevent="submit" novalidate class="space-y-5">
          <div>
            <label for="forgot-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail cadastrado</label>
            <input id="forgot-email" type="email" x-model="email" @blur="onBlur()" @input="onInput()" autocomplete="email"
              :class="emailError && touched ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
              class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
              placeholder="seu@email.com" required />
            <p x-show="emailError && touched" x-text="emailError" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
            <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span x-text="loading ? 'Enviando...' : 'Enviar link'"></span>
          </button>

          <p class="text-center text-sm"><a href="#/login" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Voltar ao login</a></p>
        </form>
      </div>

      <!-- Success State -->
      <div x-show="sent" x-cloak x-transition class="text-center space-y-4" role="status">
        <svg class="w-16 h-16 text-emerald-500 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p class="text-gray-700 dark:text-gray-300">Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.</p>
        <a href="#/login" class="inline-block text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Voltar ao login</a>
      </div>

    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function we(e) { e.data(`resetPasswordPage`, () => ({ password: ``, passwordConfirm: ``, showPassword: !1, showPasswordConfirm: !1, loading: !1, globalError: ``, tokenExpired: !1, token: ``, email: ``, errors: { password: ``, passwordConfirm: `` }, touched: { password: !1, passwordConfirm: !1 }, init() { let e = (window.location.hash || ``).split(`?`)[1] || ``, t = new URLSearchParams(e); this.token = t.get(`token`) || ``, this.email = t.get(`email`) || ``, (!this.token || !this.email) && (this.tokenExpired = !0) }, _validatePassword() { return this.password ? this.password.length < 8 ? `Mínimo 8 caracteres` : /[a-zA-Z]/.test(this.password) ? /[0-9]/.test(this.password) ? `` : `Deve conter ao menos um número` : `Deve conter ao menos uma letra` : `Campo obrigatório` }, _validateConfirm() { return this.passwordConfirm ? this.password === this.passwordConfirm ? `` : `Senhas não conferem` : `Campo obrigatório` }, onBlur(e) { this.touched[e] = !0, this.errors[e] = e === `password` ? this._validatePassword() : this._validateConfirm() }, onInput(e) { this.touched[e] && (this.errors[e] = e === `password` ? this._validatePassword() : this._validateConfirm(), e === `password` && this.touched.passwordConfirm && (this.errors.passwordConfirm = this._validateConfirm())) }, async submit() { if (this.touched.password = !0, this.touched.passwordConfirm = !0, this.errors.password = this._validatePassword(), this.errors.passwordConfirm = this._validateConfirm(), !(this.errors.password || this.errors.passwordConfirm)) { this.loading = !0, this.globalError = ``; try { await y.resetPassword({ token: this.token, email: this.email, password: this.password }), e.store(`toast`)?.show(`Senha redefinida com sucesso. Faça login.`, `success`, 7e3), t.navigate(`/login`) } catch (t) { this.loading = !1; let n = t?.code || ``; if (n === `AUTH_TOKEN_INVALID` || n === `AUTH_TOKEN_EXPIRED`) { this.tokenExpired = !0; return } if (n === `NETWORK_ERROR`) { e.store(`toast`)?.show(`Sem conexão com o servidor.`, `error`, 8e3); return } this.globalError = t?.message || `Ocorreu um erro. Tente novamente.` } } }, darkMode: localStorage.getItem(`ef_theme`) === `dark`, toggleTheme() { this.darkMode = !this.darkMode; let e = this.darkMode ? `dark` : `light`; document.documentElement.setAttribute(`data-theme`, e), document.documentElement.classList.toggle(`dark`, this.darkMode), localStorage.setItem(`ef_theme`, e) } })) } var Te = !1; function Ee(e) {
  !Te && window.Alpine && (we(window.Alpine), Te = !0), e.innerHTML = `
<div x-data="resetPasswordPage" class="min-h-screen flex">

  <!-- Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white flex-col justify-between p-12" aria-hidden="true">
    <div class="flex items-center gap-3 text-xl font-bold">
      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      LumenFlow
    </div>
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">Crie uma nova senha segura</h2>
      <p class="text-emerald-100 text-lg">Use ao menos 8 caracteres combinando letras, números e símbolos.</p>
    </div>
    <p class="text-emerald-200 text-sm">&copy; 2026 LumenFlow. Todos os direitos reservados.</p>
  </div>

  <!-- Form Panel -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 relative">

    <button @click="toggleTheme" class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Alternar tema">
      <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg x-show="darkMode" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>

    <div class="w-full max-w-sm space-y-8">

      <div class="lg:hidden flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        LumenFlow
      </div>

      <!-- Token Expired State -->
      <div x-show="tokenExpired" x-cloak class="text-center space-y-4">
        <svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p class="text-gray-700 dark:text-gray-300">Link expirado ou inválido. Solicite um novo.</p>
        <a href="#/forgot-password" class="inline-block text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Solicitar novo link</a>
      </div>

      <!-- Form State -->
      <div x-show="!tokenExpired">
        <div class="text-center lg:text-left mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Escolha uma nova senha segura</p>
        </div>

        <form @submit.prevent="submit" novalidate class="space-y-5">

          <div x-show="globalError" x-transition x-cloak role="alert" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <span x-text="globalError"></span>
          </div>

          <!-- New Password -->
          <div>
            <label for="reset-pass" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova senha</label>
            <div class="relative">
              <input id="reset-pass" :type="showPassword ? 'text' : 'password'" x-model="password" @blur="onBlur('password')" @input="onInput('password')" autocomplete="new-password"
                :class="errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg x-show="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPassword" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-400">Mín. 8 caracteres com letra, número e símbolo</p>
            <p x-show="errors.password && touched.password" x-text="errors.password" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="reset-pass-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar nova senha</label>
            <div class="relative">
              <input id="reset-pass-confirm" :type="showPasswordConfirm ? 'text' : 'password'" x-model="passwordConfirm" @blur="onBlur('passwordConfirm')" @input="onInput('passwordConfirm')" autocomplete="new-password"
                :class="errors.passwordConfirm && touched.passwordConfirm ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'"
                class="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors pr-10" required />
              <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg x-show="!showPasswordConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg x-show="showPasswordConfirm" x-cloak width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p x-show="errors.passwordConfirm && touched.passwordConfirm" x-text="errors.passwordConfirm" x-cloak class="mt-1 text-sm text-red-600 dark:text-red-400"></p>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2">
            <svg x-show="loading" x-cloak class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span x-text="loading ? 'Redefinindo...' : 'Redefinir'"></span>
          </button>
        </form>
      </div>

    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} var P = null, F = 0, De = 5e3; async function I() { let e = Date.now(); if (P && e - F < De) return P; let t = await h.get(`/api/dashboard/public`); if (t.success && t.data) return P = t.data, F = e, t.data; throw Error(`Failed to load dashboard data`) } var L = { async getPublicData() { return I() }, async getAuthenticatedDashboardData() { let e = await h.get(`/api/dashboard`); return e?.data || e }, async getKpis() { let e = await I(), t = 0, n = 0, r = e.latest_readings || {}; for (let e in r) t += r[e].energia_kwh || 0, n += r[e].potencia || 0; let i = t * .85; return { month_kwh: t, monthly_cost: i, active_devices: e.active_devices || 0, total_devices: e.total_devices || 0, open_alerts: 0, consumption_variation: 0, cost_variation: 0, total_potencia: n } }, async getConsumptionChart({ from: e, to: t, granularity: n } = {}) { return h.get(`/api/dashboard/consumption`, { query: { from: e, to: t, granularity: n } }) }, async getTopSectors({ from: e, to: t, limit: n = 5 } = {}) { let r = (await I()).setor_data || {}; return { sectors: Object.entries(r).map(([e, t]) => ({ name: e, total_kwh: t.total_energia_kwh || 0, consumo: t.total_energia_kwh || 0, potencia: t.total_potencia || 0 })).sort((e, t) => t.total_kwh - e.total_kwh).slice(0, n) } }, async getFirebaseDevices() { let e = await I(), t = e.latest_readings || {}, n = e.devices_status || {}; return Object.entries(t).map(([e, t]) => ({ id: e, firebase_id: e, name: t.nome || e, potencia: t.potencia || 0, energia_kwh: t.energia_kwh || 0, timestamp: t.timestamp || null, status: n[e]?.active ? `online` : `offline`, sector: e })) }, async getFirebaseSectors() { let e = (await I()).latest_readings || {}; return Object.entries(e).map(([e, t]) => ({ id: e, name: t.nome || e, potencia: t.potencia || 0, energia_kwh: t.energia_kwh || 0, timestamp: t.timestamp || null })) }, async getRecentAlerts({ limit: e = 5 } = {}) { return h.get(`/api/alerts`, { query: { status: `open`, limit: e, sort: `-created_at` } }) }, async getOffHoursAlerts({ from: e, to: t, limit: n = 5 } = {}) { return h.get(`/api/alerts`, { query: { type: `off_hours`, from: e, to: t, limit: n, sort: `-created_at` } }) }, async getNightWasteAlerts({ from: e, to: t, limit: n = 5 } = {}) { return h.get(`/api/alerts`, { query: { type: `night_waste`, from: e, to: t, limit: n, sort: `-created_at` } }) }, async getOpenAlertsCount() { return h.get(`/api/alerts/count`, { query: { status: `open` } }) } }, R = `pt-BR`; function Oe(e, t = 2) { return e == null || isNaN(e) ? `—` : `${new Intl.NumberFormat(R, { minimumFractionDigits: t, maximumFractionDigits: t }).format(e)} kWh` } function ke(e) { return e == null || isNaN(e) ? `—` : new Intl.NumberFormat(R, { style: `currency`, currency: `BRL` }).format(e) } var Ae = `lf_selected_sector`, je = .85; function Me(e) { e.data(`dashboardPage`, () => ({ kpis: { consumption: { value: `—`, unit: `kWh`, loading: !0 }, cost: { value: `—`, unit: `R$`, loading: !0 }, alerts: { value: `0`, loading: !1 }, devices: { value: `—`, loading: !0 } }, accumulatedKwh: 0, previousReadings: {}, selectedSector: null, get userName() { return v.getUser()?.name || `` }, get realtimePower() { return e.store(`realtime`)?.totalPower ?? null }, lastUpdate: null, _interval: null, init() { e.store(`realtime`)?.startListening(); try { let e = localStorage.getItem(Ae); e && (this.selectedSector = JSON.parse(e)) } catch { } this.loadKpis(), this._interval = setInterval(() => this.loadKpis(), 1e4) }, destroy() { this._interval && clearInterval(this._interval) }, async loadKpis() { try { let e = await L.getPublicData(), t = e?.latest_readings || {}, n = e?.total_devices || 0, r = !1, i = null; if (this.selectedSector) { for (let [e, n] of Object.entries(t)) if (e === this.selectedSector.id || n.nome === this.selectedSector.name) { i = n, r = !0; break } } if (!this.previousReadings || Object.keys(this.previousReadings).length === 0) if (this.previousReadings = {}, this.selectedSector) if (r) { let e = i.energia_kwh || 0; this.accumulatedKwh = e, this.previousReadings[this.selectedSector.id || i.nome] = e } else this.accumulatedKwh = 0; else { let e = 0; for (let [n, r] of Object.entries(t)) { let t = r.energia_kwh || 0; e += t, this.previousReadings[n] = t } this.accumulatedKwh = e } else if (this.selectedSector) { if (r) { let e = this.selectedSector.id || i.nome, t = this.previousReadings[e] ?? null, n = i.energia_kwh || 0; t !== null && n !== t && (this.accumulatedKwh += n - t), this.previousReadings[e] = n } } else for (let [e, n] of Object.entries(t)) { let t = this.previousReadings[e] ?? null, r = n.energia_kwh || 0; t !== null && r !== t && (this.accumulatedKwh += r - t), this.previousReadings[e] = r } this.selectedSector && r && (this.selectedSector = { ...this.selectedSector, potencia: i.potencia || 0, energia_kwh: i.energia_kwh || 0 }); let a = this.accumulatedKwh * je, o = Math.floor(this.accumulatedKwh * 1e3) / 1e3; this.kpis.consumption = { value: Oe(o, 3).replace(` kWh`, ``), unit: `KWh`, loading: !1 }, this.kpis.cost = { value: ke(a).replace(`R$\xA0`, ``).replace(`R$ `, ``), unit: `R$`, loading: !1 }, this.kpis.devices = { value: String(n), loading: !1 }, this.kpis.alerts = { value: `0`, loading: !1 }, this.lastUpdate = new Date } catch { Object.keys(this.kpis).forEach(e => { this.kpis[e] = { ...this.kpis[e], value: `—`, loading: !1 } }) } }, goTo(e) { t.navigate(e) }, changeSector() { t.navigate(`/sectors/select`) }, formatSectorEnergy(e) { if (e == null) return `—`; let t = Math.floor(e * 1e3) / 1e3; return new Intl.NumberFormat(`pt-BR`, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(t) + ` KWh` }, formatPower(e) { return e == null ? `—` : e >= 1e3 ? (e / 1e3).toFixed(2) + ` kW` : e.toFixed(1) + ` kW` }, formatTime() { return this.lastUpdate ? this.lastUpdate.toLocaleTimeString(`pt-BR`, { hour: `2-digit`, minute: `2-digit`, second: `2-digit` }) : `` } })) } var z = !1; function Ne(e) { !z && window.Alpine && (Me(window.Alpine), z = !0), e.innerHTML = Pe(), window.Alpine?.initTree(e) } function Pe() {
  return `
<div x-data="dashboardPage" @beforeunload.window="destroy()" class="space-y-8 p-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p x-show="lastUpdate" x-cloak class="text-xs text-gray-400 mt-0.5" x-text="'Última atualização: ' + formatTime()"></p>
      <p x-show="selectedSector" x-cloak class="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span x-text="'Setor: ' + selectedSector?.name"></span>
      </p>
      <p x-show="!selectedSector" x-cloak class="text-sm text-gray-500 dark:text-gray-400 mt-2">Todos os setores</p>
    </div>
    <div class="flex items-center gap-3">
      <!-- Realtime indicator -->
      <div x-show="realtimePower !== null" x-cloak class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400" x-text="realtimePower + ' W'"></span>
      </div>
    </div>
  </div>

  <!-- KPI Cards — large, elegant, 2x2 on mobile, 4 on lg -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${B(`consumption`, `Consumo`, `KWh`, `bolt`, `#/financial`)}
    ${B(`cost`, `Custo`, `R$`, `dollar`, `#/financial`)}
    ${B(`alerts`, `Alertas`, ``, `bell`, `#/alerts`)}
    ${B(`devices`, `Dispositivos`, ``, `device`, `#/devices`)}
  </div>

  <!-- Sector detail card (visible only when a sector is selected) -->
  <div x-show="selectedSector" x-cloak class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-emerald-100 text-sm font-medium mb-1">Setor monitorado</p>
        <h2 class="text-2xl font-bold" x-text="selectedSector?.name"></h2>
      </div>
      <button @click="changeSector()" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
        Trocar setor
      </button>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-5">
      <div class="bg-white/10 rounded-xl p-4">
        <p class="text-emerald-100 text-xs font-medium mb-1">Potência atual</p>
        <p class="text-white font-bold text-xl" x-text="formatPower(selectedSector?.potencia)"></p>
      </div>
      <div class="bg-white/10 rounded-xl p-4">
        <p class="text-emerald-100 text-xs font-medium mb-1">Energia atual</p>
        <p class="text-white font-bold text-xl" x-text="formatSectorEnergy(selectedSector?.energia_kwh)"></p>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Atalhos rápidos</h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${V(`Transparência`, `#/transparency`, `bolt`)}
      ${V(`Trocar setor`, `#/sectors/select`, `swap`)}
      ${V(`Dispositivos`, `#/devices`, `device`)}
      ${V(`Alertas`, `#/alerts`, `bell`)}
    </div>
  </section>

</div>
`} function B(e, t, n, r, i) {
  let a = { bolt: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`, dollar: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`, bell: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`, device: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>` }, o = { consumption: { bg: `bg-blue-50 dark:bg-blue-900/20`, icon: `text-blue-500`, border: `border-blue-100 dark:border-blue-800` }, cost: { bg: `bg-emerald-50 dark:bg-emerald-900/20`, icon: `text-emerald-500`, border: `border-emerald-100 dark:border-emerald-800` }, alerts: { bg: `bg-amber-50 dark:bg-amber-900/20`, icon: `text-amber-500`, border: `border-amber-100 dark:border-amber-800` }, devices: { bg: `bg-purple-50 dark:bg-purple-900/20`, icon: `text-purple-500`, border: `border-purple-100 dark:border-purple-800` } }[e]; return `
    <a href="${i}" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block group">
      <!-- Icon badge -->
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl ${o.bg} border ${o.border} mb-4">
        <svg class="w-6 h-6 ${o.icon}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${a[r]}</svg>
      </div>
      <!-- Label -->
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">${t}</p>
      <!-- Value skeleton -->
      <div x-show="kpis.${e}.loading" class="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      <!-- Value -->
      <div x-show="!kpis.${e}.loading" x-cloak class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight" x-text="kpis.${e}.value"></span>
        ${n ? `<span class="text-base text-gray-400 dark:text-gray-500 font-medium">${n}</span>` : ``}
      </div>
    </a>
  `} function V(e, t, n) {
  return `
    <a href="${t}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-center group">
      <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${{ bolt: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`, swap: `<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`, device: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`, bell: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>` }[n]}</svg>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${e}</span>
    </a>
  `} function H(e = {}) { let t = { name: e.name?.trim(), description: e.description?.trim() || null }; return e.threshold_yellow !== `` && e.threshold_yellow != null && (t.threshold_yellow = Number(e.threshold_yellow)), e.threshold_red !== `` && e.threshold_red != null && (t.threshold_red = Number(e.threshold_red)), t } var U = { async list({ active: e = null, search: t = `` } = {}) { return h.get(`/api/sectors`, { query: { active: e, search: t?.trim() } }) }, async create(e) { let t = H(e), n = await h.post(`/api/sectors`, t), r = n?.sector; return r?.id && (t.threshold_yellow != null || t.threshold_red != null) ? this.update(r.id, t) : n }, async update(e, t) { return h.put(`/api/sectors/${encodeURIComponent(e)}`, H(t)) }, async deactivate(e) { return h.delete(`/api/sectors/${encodeURIComponent(e)}`) } }; function W(e = {}, { editing: t = !1 } = {}) { let n = { name: e.name?.trim(), type: e.type, sector_id: e.sector_id, installed_at: e.installed_at || null, overload_threshold_w: e.overload_threshold_w === `` || e.overload_threshold_w == null ? null : Number(e.overload_threshold_w), is_critical: !!e.is_critical }; return t || (n.device_id = e.device_id?.trim()), n } var G = { async list({ sector_id: e = ``, type: t = ``, active: n = null } = {}) { return h.get(`/api/devices`, { query: { sector_id: e, type: t, active: n } }) }, async get(e) { return h.get(`/api/devices/${encodeURIComponent(e)}`) }, async create(e) { return h.post(`/api/devices`, W(e)) }, async update(e, t) { return h.put(`/api/devices/${encodeURIComponent(e)}`, W(t, { editing: !0 })) }, async deactivate(e) { return h.delete(`/api/devices/${encodeURIComponent(e)}`) }, async getReadings(e, { from: t, to: n, granularity: r } = {}) { return h.get(`/api/devices/${encodeURIComponent(e)}/readings`, { query: { from: t, to: n, granularity: r } }) }, async getAnomalies(e, { from: t, to: n } = {}) { return h.get(`/api/devices/${encodeURIComponent(e)}/anomalies`, { query: { from: t, to: n } }) }, async getMaintenance(e) { return h.get(`/api/devices/${encodeURIComponent(e)}/maintenance`) }, async addMaintenance(e, t) { return h.post(`/api/devices/${encodeURIComponent(e)}/maintenance`, t) } }; function Fe(e) { e.data(`sectorsPage`, () => ({ sectors: [], devices: [], loading: !0, error: null, search: ``, showInactive: !1, modalOpen: !1, modalTitle: ``, editing: null, form: { name: ``, description: ``, threshold_yellow: ``, threshold_red: `` }, formErrors: { name: ``, threshold_yellow: ``, threshold_red: `` }, saving: !1, confirmOpen: !1, confirmSector: null, deactivating: !1, async init() { await this.load() }, async load() { this.loading = !0, this.error = null; try { let [e, t] = await Promise.all([U.list({ active: this.showInactive ? null : !0 }), G.list()]); this.sectors = e?.sectors || e?.data || [], this.devices = t?.devices || t?.data || [] } catch (e) { this.error = e?.message || `Erro ao carregar setores.` } finally { this.loading = !1 } }, get filtered() { let e = this.search.trim().toLowerCase(); return e ? this.sectors.filter(t => t.name.toLowerCase().includes(e)) : this.sectors }, deviceCount(e) { return this.devices.filter(t => t.sector_id === e && t.active).length }, openNew() { this.editing = null, this.modalTitle = `Novo setor`, this.form = { name: ``, description: ``, threshold_yellow: ``, threshold_red: `` }, this.formErrors = { name: ``, threshold_yellow: ``, threshold_red: `` }, this.modalOpen = !0 }, openEdit(e) { this.editing = e, this.modalTitle = `Editar setor`, this.form = { name: e.name || ``, description: e.description || ``, threshold_yellow: e.threshold_yellow ?? ``, threshold_red: e.threshold_red ?? `` }, this.formErrors = { name: ``, threshold_yellow: ``, threshold_red: `` }, this.modalOpen = !0 }, validateForm() { let e = !0; this.formErrors = { name: ``, threshold_yellow: ``, threshold_red: `` }, this.form.name.trim() || (this.formErrors.name = `Campo obrigatório`, e = !1); let t = this.form.threshold_yellow === `` ? null : Number(this.form.threshold_yellow), n = this.form.threshold_red === `` ? null : Number(this.form.threshold_red); return t !== null && (isNaN(t) || t <= 0) && (this.formErrors.threshold_yellow = `Valor inválido`, e = !1), n !== null && (isNaN(n) || n <= 0) && (this.formErrors.threshold_red = `Valor inválido`, e = !1), t !== null && n !== null && t >= n && (this.formErrors.threshold_red = `Deve ser maior que o amarelo`, e = !1), e }, async saveForm() { if (this.validateForm()) { this.saving = !0; try { let t = { name: this.form.name.trim(), description: this.form.description.trim(), threshold_yellow: this.form.threshold_yellow || null, threshold_red: this.form.threshold_red || null }; this.editing ? await U.update(this.editing.id, t) : await U.create(t), e.store(`toast`)?.show(`Setor salvo com sucesso.`, `success`), this.modalOpen = !1, await this.load() } catch (t) { t?.code === `SECTOR_NAME_EXISTS` || t?.code === `SECTOR_NAME_TAKEN` ? this.formErrors.name = `Este nome já está em uso.` : e.store(`toast`)?.show(t?.message || `Erro ao salvar.`, `error`) } finally { this.saving = !1 } } }, askDeactivate(e) { this.confirmSector = e, this.confirmOpen = !0 }, async confirmDeactivate() { if (this.confirmSector) { this.deactivating = !0; try { await U.deactivate(this.confirmSector.id), e.store(`toast`)?.show(`Setor desativado.`, `success`), this.confirmOpen = !1, await this.load() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao desativar.`, `error`) } finally { this.deactivating = !1 } } }, toggleInactive() { this.showInactive = !this.showInactive, this.load() } })) } var K = !1; function Ie(e) {
  !K && window.Alpine && (Fe(window.Alpine), K = !0), e.innerHTML = `
<div x-data="sectorsPage" class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setores</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie os setores da sua empresa</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors">Novo setor</button>
  </div>

  <!-- Toolbar -->
  <div class="flex flex-col sm:flex-row gap-3">
    <input type="text" x-model="search" placeholder="Buscar setor..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
    <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
      <input type="checkbox" :checked="showInactive" @change="toggleInactive()" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
      Mostrar inativos
    </label>
  </div>

  <!-- Loading -->
  <div x-show="loading" class="flex justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
  </div>

  <!-- Error -->
  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 hover:text-emerald-700 font-medium">Tentar novamente</button>
  </div>

  <!-- Table -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="filtered.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhum setor encontrado.</div>
    <table x-show="filtered.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Dispositivos</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Thresholds</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="sector in filtered" :key="sector.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="sector.name"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell" x-text="deviceCount(sector.id) + ' ativos'"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell" x-text="(sector.threshold_yellow || '—') + ' / ' + (sector.threshold_red || '—')"></td>
            <td class="px-4 py-3">
              <span :class="sector.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="sector.active ? 'Ativo' : 'Inativo'"></span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(sector)" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium">Editar</button>
              <button x-show="sector.active" @click="askDeactivate(sector)" class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Desativar</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="modalTitle"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
          <input type="text" x-model="form.name" :class="formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
          <textarea x-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold amarelo (W)</label>
            <input type="number" x-model="form.threshold_yellow" :class="formErrors.threshold_yellow ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <p x-show="formErrors.threshold_yellow" x-text="formErrors.threshold_yellow" class="mt-1 text-sm text-red-600"></p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold vermelho (W)</label>
            <input type="number" x-model="form.threshold_red" :class="formErrors.threshold_red ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <p x-show="formErrors.threshold_red" x-text="formErrors.threshold_red" class="mt-1 text-sm text-red-600"></p>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium transition-colors flex items-center gap-2">
            <svg x-show="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Confirm Dialog -->
  <div x-show="confirmOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="confirmOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Desativar setor?</h3>
      <p class="text-gray-600 dark:text-gray-400 mt-2 text-sm" x-text="'Os dados históricos de ' + (confirmSector?.name || '') + ' serão preservados.'"></p>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="confirmOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
        <button @click="confirmDeactivate()" :disabled="deactivating" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium">Desativar</button>
      </div>
    </div>
  </div>

</div>
`, window.Alpine?.initTree(e)
} function Le(e) { e.data(`devicesPage`, () => ({ devices: [], loading: !0, error: null, search: ``, filterSector: ``, async init() { await this.load() }, async load() { this.loading = !0, this.error = null; try { this.devices = await L.getFirebaseDevices() } catch (e) { this.error = e?.message || `Erro ao carregar dispositivos.` } finally { this.loading = !1 } }, get sectorOptions() { return [...new Set(this.devices.map(e => e.name))].sort() }, get filtered() { let e = this.devices, t = this.search.trim().toLowerCase(); return t && (e = e.filter(e => e.name.toLowerCase().includes(t) || e.sector.toLowerCase().includes(t))), this.filterSector && (e = e.filter(e => e.name === this.filterSector)), e }, statusBadge(e) { return e.status === `online` ? { text: `Online`, class: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` } : { text: `Offline`, class: `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400` } }, formatPower(e) { return e == null ? `—` : e >= 1e3 ? (e / 1e3).toFixed(1) + ` W` : e.toFixed(1) + ` W` }, formatEnergy(e) { return e == null ? `—` : e.toFixed(3) + ` KWh` } })) } var q = !1; function Re(e) {
  !q && window.Alpine && (Le(window.Alpine), q = !0), e.innerHTML = `
<div x-data="devicesPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dispositivos</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Monitoramento de dispositivos IoT em tempo real</p>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-3">
    <input type="text" x-model="search" placeholder="Buscar..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
    <select x-model="filterSector" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos os setores</option>
      <template x-for="s in sectorOptions" :key="s"><option :value="s" x-text="s"></option></template>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button>
  </div>

  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="filtered.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhum dispositivo encontrado.</div>
    <table x-show="filtered.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Setor</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Potência</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">Energia</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="device in filtered" :key="device.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="device.name"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell" x-text="device.sector"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell" x-text="formatPower(device.potencia)"></td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell" x-text="formatEnergy(device.energia_kwh)"></td>
            <td class="px-4 py-3"><span :class="statusBadge(device).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="statusBadge(device).text"></span></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function ze(e) { e.data(`deviceDetailPage`, () => ({ deviceId: null, device: null, loading: !0, error: null, activeTab: `readings`, readings: [], readingsLoading: !1, anomalies: [], anomaliesLoading: !1, maintenance: [], maintenanceLoading: !1, modalOpen: !1, maintForm: { date: ``, type: ``, notes: `` }, maintSaving: !1, async init() { let e = window.location.hash.match(/\/devices\/(\d+)/); if (this.deviceId = e ? Number(e[1]) : null, !this.deviceId) { this.error = `Dispositivo não encontrado.`, this.loading = !1; return } await this.loadDevice() }, async loadDevice() { this.loading = !0, this.error = null; try { this.device = await G.get(this.deviceId), await this.loadTab() } catch (e) { this.error = e?.message || `Erro ao carregar dispositivo.` } finally { this.loading = !1 } }, async switchTab(e) { this.activeTab = e, await this.loadTab() }, async loadTab() { this.activeTab === `readings` ? await this.loadReadings() : this.activeTab === `anomalies` ? await this.loadAnomalies() : this.activeTab === `maintenance` && await this.loadMaintenance() }, async loadReadings() { this.readingsLoading = !0; try { let e = await G.getReadings(this.deviceId, {}); this.readings = e?.values?.map((t, n) => ({ label: e.labels?.[n] || ``, value: t, isAnomaly: (e.anomalies || []).includes(n) })) || [] } catch { this.readings = [] } finally { this.readingsLoading = !1 } }, async loadAnomalies() { this.anomaliesLoading = !0; try { let e = await G.getAnomalies(this.deviceId); this.anomalies = e?.anomalies || e?.data || e || [] } catch { this.anomalies = [] } finally { this.anomaliesLoading = !1 } }, async loadMaintenance() { this.maintenanceLoading = !0; try { let e = await G.getMaintenance(this.deviceId); this.maintenance = e?.records || e?.data || e || [] } catch { this.maintenance = [] } finally { this.maintenanceLoading = !1 } }, openMaintenanceModal() { this.maintForm = { date: ``, type: ``, notes: `` }, this.modalOpen = !0 }, async saveMaintenance() { if (!(!this.maintForm.date || !this.maintForm.type)) { this.maintSaving = !0; try { await G.addMaintenance(this.deviceId, this.maintForm), e.store(`toast`)?.show(`Manutenção registrada.`, `success`), this.modalOpen = !1, await this.loadMaintenance() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao salvar.`, `error`) } finally { this.maintSaving = !1 } } }, formatDate(e) { return e ? new Date(e).toLocaleDateString(`pt-BR`) : `—` }, formatDateTime(e) { return e ? new Date(e).toLocaleString(`pt-BR`) : `—` }, deviationPercent(e) { return e.expected_value ? Math.round((e.actual_value - e.expected_value) / e.expected_value * 100) : 0 }, goBack() { t.navigate(`/devices`) } })) } var J = !1; function Be(e) {
  !J && window.Alpine && (ze(window.Alpine), J = !0), e.innerHTML = `
<div x-data="deviceDetailPage" class="space-y-6">
  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-16">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="goBack()" class="mt-3 text-emerald-600 font-medium">Voltar</button>
  </div>

  <div x-show="!loading && !error && device" x-cloak class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white" x-text="device?.name"></h1>
        <p class="text-sm text-gray-500 dark:text-gray-400" x-text="(device?.type || '') + (device?.sector_name ? ' — ' + device.sector_name : '')"></p>
      </div>
      <button @click="goBack()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">← Voltar</button>
    </div>

    <!-- Info Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div><p class="text-xs text-gray-500 dark:text-gray-400">ID</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.device_id || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Setor</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.sector_name || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Tipo</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.type || '—'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Status</p><p class="text-sm font-medium" :class="device?.active !== false ? 'text-emerald-600' : 'text-gray-400'" x-text="device?.active !== false ? 'Ativo' : 'Inativo'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Última leitura</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device?.last_reading != null ? device.last_reading.toFixed(2) + ' kWh' : 'Sem leitura'"></p></div>
        <div><p class="text-xs text-gray-500 dark:text-gray-400">Instalação</p><p class="text-sm font-medium text-gray-900 dark:text-white" x-text="formatDate(device?.install_date)"></p></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <nav class="flex border-b border-gray-200 dark:border-gray-700">
        <button @click="switchTab('readings')" :class="activeTab === 'readings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Leituras</button>
        <button @click="switchTab('anomalies')" :class="activeTab === 'anomalies' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Anomalias</button>
        <button @click="switchTab('maintenance')" :class="activeTab === 'maintenance' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors">Manutenção</button>
      </nav>

      <div class="p-5">
        <!-- Readings Tab -->
        <div x-show="activeTab === 'readings'">
          <div x-show="readingsLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!readingsLoading && readings.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Sem leituras disponíveis.</div>
          <div x-show="!readingsLoading && readings.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Período</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Consumo (kWh)</th><th class="text-center py-2 text-gray-500 dark:text-gray-400">Anomalia</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="(r, idx) in readings" :key="idx">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="r.label"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="r.value?.toFixed(2)"></td>
                    <td class="py-2 text-center"><span x-show="r.isAnomaly" class="inline-block w-2 h-2 rounded-full bg-red-500"></span></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Anomalies Tab -->
        <div x-show="activeTab === 'anomalies'">
          <div x-show="anomaliesLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!anomaliesLoading && anomalies.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma anomalia detectada.</div>
          <div x-show="!anomaliesLoading && anomalies.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Esperado</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Real</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Desvio</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="row in anomalies" :key="row.id || row.detected_at">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDateTime(row.detected_at)"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="row.expected_value != null ? row.expected_value.toFixed(2) + ' kWh' : '—'"></td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="row.actual_value != null ? row.actual_value.toFixed(2) + ' kWh' : '—'"></td>
                    <td class="py-2 text-right font-medium" :class="deviationPercent(row) > 0 ? 'text-red-600' : 'text-emerald-600'" x-text="(deviationPercent(row) > 0 ? '+' : '') + deviationPercent(row) + '%'"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Maintenance Tab -->
        <div x-show="activeTab === 'maintenance'">
          <div class="flex justify-end mb-4">
            <button @click="openMaintenanceModal()" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">Nova manutenção</button>
          </div>
          <div x-show="maintenanceLoading" class="flex justify-center py-8"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          <div x-show="!maintenanceLoading && maintenance.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum registro de manutenção.</div>
          <div x-show="!maintenanceLoading && maintenance.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-left py-2 text-gray-500 dark:text-gray-400">Tipo</th><th class="text-left py-2 text-gray-500 dark:text-gray-400">Observações</th></tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template x-for="rec in maintenance" :key="rec.id || rec.date">
                  <tr>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDate(rec.date)"></td>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="rec.type || '—'"></td>
                    <td class="py-2 text-gray-700 dark:text-gray-300" x-text="rec.notes || '—'"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Maintenance Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova manutenção</h2>
      <form @submit.prevent="saveMaintenance()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" x-model="maintForm.date" required class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><input type="text" x-model="maintForm.type" required placeholder="Preventiva, Corretiva..." class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label><textarea x-model="maintForm.notes" rows="3" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="maintSaving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function Ve(e) { e.data(`transparencyPage`, () => ({ sectors: [], loading: !0, error: null, lastUpdate: null, fullscreen: !1, _interval: null, async init() { await this.load(), this._interval = setInterval(() => this.load(), 1e4) }, destroy() { this._interval && clearInterval(this._interval) }, async load() { try { let e = (await L.getPublicData())?.latest_readings || {}; this.sectors = Object.entries(e).map(([e, t]) => { let n = t.energia_kwh || 0, r = t.potencia || 0; return { id: e, name: t.nome || e, consumption: n, potencia: r, status: this._getStatus(n) } }), this.lastUpdate = new Date, this.error = null } catch (e) { this.error = e?.message || `Erro ao carregar dados.` } finally { this.loading = !1 } }, _getStatus(e) { return e >= 10 ? `critical` : e >= 5 ? `warning` : `normal` }, statusConfig(e) { let t = { normal: { label: `Normal`, bg: `bg-emerald-500`, border: `border-emerald-400`, text: `text-emerald-700 dark:text-emerald-400`, icon: `check` }, warning: { label: `Atenção`, bg: `bg-yellow-500`, border: `border-yellow-400`, text: `text-yellow-700 dark:text-yellow-400`, icon: `alert` }, critical: { label: `Crítico`, bg: `bg-red-500`, border: `border-red-400`, text: `text-red-700 dark:text-red-400`, icon: `danger` } }; return t[e] || t.normal }, formatPower(e) { return e == null ? `—` : e >= 1e3 ? (e / 1e3).toFixed(1) + ` W` : e.toFixed(1) + ` W` }, formatTime() { return this.lastUpdate ? this.lastUpdate.toLocaleTimeString(`pt-BR`, { hour: `2-digit`, minute: `2-digit`, second: `2-digit` }) : `` }, toggleFullscreen() { document.fullscreenElement ? (document.exitFullscreen?.(), this.fullscreen = !1) : (document.documentElement.requestFullscreen?.(), this.fullscreen = !0) } })) } var Y = !1; function He(e) {
  !Y && window.Alpine && (Ve(window.Alpine), Y = !0), e.innerHTML = `
<div x-data="transparencyPage" @beforeunload.window="destroy()" class="space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transparência</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Painel de status em tempo real</p>
    </div>
    <div class="flex items-center gap-3">
      <span x-show="lastUpdate" class="text-xs text-gray-400" x-text="'Atualizado: ' + formatTime()"></span>
      <button @click="toggleFullscreen()" class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="Tela cheia">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
      </button>
    </div>
  </div>

  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-16"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="sectors.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">Nenhum setor encontrado.</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <template x-for="sector in sectors" :key="sector.id">
        <div class="rounded-xl border-2 p-6 text-center transition-all" :class="statusConfig(sector.status).border + ' bg-white dark:bg-gray-800'">
          <!-- Status Icon -->
          <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" :class="statusConfig(sector.status).bg + '/20'">
            <template x-if="sector.status === 'normal'">
              <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </template>
            <template x-if="sector.status === 'warning'">
              <svg class="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </template>
            <template x-if="sector.status === 'critical'">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </template>
          </div>

          <h3 class="font-semibold text-gray-900 dark:text-white text-lg" x-text="sector.name"></h3>
          <p class="text-2xl font-bold mt-2" :class="statusConfig(sector.status).text" x-text="sector.consumption.toFixed(3) + ' KWh'"></p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1" x-text="formatPower(sector.potencia)"></p>
          <p class="text-sm mt-1 font-medium" :class="statusConfig(sector.status).text" x-text="statusConfig(sector.status).label"></p>
        </div>
      </template>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} var X = [{ key: `monday`, label: `Segunda` }, { key: `tuesday`, label: `Terça` }, { key: `wednesday`, label: `Quarta` }, { key: `thursday`, label: `Quinta` }, { key: `friday`, label: `Sexta` }, { key: `saturday`, label: `Sábado` }, { key: `sunday`, label: `Domingo` }]; function Ue(e) { e.data(`settingsPage`, () => ({ days: X.map(e => ({ ...e, enabled: e.key !== `saturday` && e.key !== `sunday`, start: `08:00`, end: `18:00` })), loading: !0, saving: !1, error: null, sectorAverages: [], loadingAverages: !0, savingAverages: !1, async init() { await Promise.all([this.load(), this.loadAverages()]) }, async load() { this.loading = !0, this.error = null; try { let e = await h.get(`/api/business-hours`), t = e?.data || e || {}; t.days && Array.isArray(t.days) && (this.days = X.map(e => { let n = t.days.find(t => t.day === e.key) || {}; return { ...e, enabled: n.enabled !== !1, start: n.start || `08:00`, end: n.end || `18:00` } })) } catch (e) { this.error = e?.message || `Erro ao carregar configurações.` } finally { this.loading = !1 } }, async save() { this.saving = !0; try { let t = { days: this.days.map(e => ({ day: e.key, enabled: e.enabled, start: e.start, end: e.end })) }; await h.put(`/api/business-hours`, t), e.store(`toast`)?.show(`Configurações salvas.`, `success`) } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao salvar.`, `error`) } finally { this.saving = !1 } }, async loadAverages() { this.loadingAverages = !0; try { let e = (await L.getAuthenticatedDashboardData())?.latest_readings || {}, t = []; try { t = (await h.get(`/api/sector-averages`))?.averages || [] } catch { } this.sectorAverages = Object.entries(e).map(([e, n]) => { let r = e, i = n.nome || e, a = t.find(e => e.sector_name === r && e.is_manual_override), o = t.find(e => e.sector_name === r && !e.is_manual_override); return { sector_name: r, sector_label: i, average_kwh: a?.average_kwh || o?.average_kwh || 0, is_manual_override: !!a, auto_average: o?.average_kwh || 0 } }) } catch (e) { console.warn(`Erro ao carregar médias:`, e) } finally { this.loadingAverages = !1 } }, async saveAverages() { this.savingAverages = !0; try { let t = { averages: this.sectorAverages.map(e => ({ sector_name: e.sector_name, average_kwh: parseFloat(e.average_kwh) || 0, is_manual_override: e.is_manual_override })) }; await h.put(`/api/sector-averages`, t), e.store(`toast`)?.show(`Médias de consumo salvas.`, `success`) } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao salvar médias.`, `error`) } finally { this.savingAverages = !1 } }, formatNumber(e) { return e == null || e === 0 ? `—` : Number(e).toLocaleString(`pt-BR`, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) } })) } var We = !1; function Ge(e) {
  !We && window.Alpine && (Ue(window.Alpine), We = !0), e.innerHTML = `
<div x-data="settingsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Horário comercial e preferências</p>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <!-- Business Hours -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horário comercial</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Alertas de consumo fora de horário usam esta configuração.</p>

    <div class="space-y-3">
      <template x-for="day in days" :key="day.key">
        <div class="flex items-center gap-4 flex-wrap">
          <label class="flex items-center gap-2 w-28">
            <input type="checkbox" x-model="day.enabled" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300" x-text="day.label"></span>
          </label>
          <div class="flex items-center gap-2" x-show="day.enabled">
            <input type="time" x-model="day.start" class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <span class="text-gray-400">—</span>
            <input type="time" x-model="day.end" class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <span x-show="!day.enabled" class="text-sm text-gray-400">Fechado</span>
        </div>
      </template>
    </div>

    <div class="mt-6 flex justify-end">
      <button @click="save()" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium flex items-center gap-2">
        <svg x-show="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Salvar
      </button>
    </div>
  </div>

  <!-- Sector Averages -->
  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Médias de consumo por setor</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Defina o valor de referência de consumo (kWh). Alertas são gerados quando o consumo ultrapassar 130% deste valor.</p>

    <div x-show="loadingAverages" class="flex justify-center py-6"><svg class="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

    <div x-show="!loadingAverages" x-cloak class="space-y-4">
      <template x-for="avg in sectorAverages" :key="avg.sector_name">
        <div class="flex items-center gap-4 flex-wrap p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div class="w-40">
            <p class="text-sm font-medium text-gray-900 dark:text-white" x-text="avg.sector_label"></p>
            <p class="text-xs text-gray-400" x-text="'Auto: ' + formatNumber(avg.auto_average) + ' kWh'"></p>
          </div>
          <label class="flex items-center gap-2 shrink-0">
            <input type="checkbox" x-model="avg.is_manual_override" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span class="text-xs text-gray-600 dark:text-gray-400">Definir manualmente</span>
          </label>
          <div class="flex items-center gap-2" x-show="avg.is_manual_override">
            <input type="number" step="0.0001" min="0" x-model="avg.average_kwh" class="w-32 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <span class="text-xs text-gray-500">kWh</span>
          </div>
        </div>
      </template>

      <div x-show="sectorAverages.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">Nenhum setor encontrado.</div>
    </div>

    <div class="mt-6 flex justify-end" x-show="sectorAverages.length > 0 && !loadingAverages">
      <button @click="saveAverages()" :disabled="savingAverages" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium flex items-center gap-2">
        <svg x-show="savingAverages" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Salvar Médias
      </button>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} var Z = { async list({ status: e = null } = {}) { return h.get(`/api/goals`, { query: { status: e } }) }, async get(e) { return h.get(`/api/goals/${encodeURIComponent(e)}`) }, async create(e) { return h.post(`/api/goals`, e) }, async update(e, t) { return h.put(`/api/goals/${encodeURIComponent(e)}`, t) }, async delete(e) { return h.delete(`/api/goals/${encodeURIComponent(e)}`) } }; function Ke(e) { e.data(`goalsPage`, () => ({ goals: [], loading: !0, error: null, filterStatus: `active`, modalOpen: !1, editing: null, form: { name: ``, scope: `global`, unit: `kwh`, value: ``, period_start: ``, period_end: `` }, formErrors: {}, saving: !1, async init() { await this.load() }, async load() { this.loading = !0, this.error = null; try { let e = await Z.list({ status: this.filterStatus || void 0 }); this.goals = e?.data || e?.goals || e || [] } catch (e) { this.error = e?.message || `Erro ao carregar metas.` } finally { this.loading = !1 } }, progress(e) { return e.value ? Math.min(100, Math.round((e.current_value || 0) / e.value * 100)) : 0 }, progressColor(e) { return e >= 100 ? `bg-red-500` : e >= 80 ? `bg-yellow-500` : `bg-emerald-500` }, openNew() { this.editing = null, this.form = { name: ``, scope: `global`, unit: `kwh`, value: ``, period_start: ``, period_end: `` }, this.formErrors = {}, this.modalOpen = !0 }, openEdit(e) { this.editing = e, this.form = { name: e.name, scope: e.scope, unit: e.unit, value: e.value, period_start: e.period_start?.slice(0, 10) || ``, period_end: e.period_end?.slice(0, 10) || `` }, this.formErrors = {}, this.modalOpen = !0 }, async saveForm() { if (this.formErrors = {}, !this.form.name.trim()) { this.formErrors.name = `Campo obrigatório`; return } if (!this.form.value || Number(this.form.value) <= 0) { this.formErrors.value = `Valor inválido`; return } this.saving = !0; try { let t = { ...this.form, value: Number(this.form.value) }; this.editing ? await Z.update(this.editing.id, t) : await Z.create(t), e.store(`toast`)?.show(`Meta salva.`, `success`), this.modalOpen = !1, await this.load() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao salvar.`, `error`) } finally { this.saving = !1 } }, async deleteGoal(t) { if (confirm(`Remover esta meta?`)) try { await Z.delete(t.id), e.store(`toast`)?.show(`Meta removida.`, `success`), await this.load() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro.`, `error`) } } })) } var qe = !1; function Je(e) {
  !qe && window.Alpine && (Ke(window.Alpine), qe = !0), e.innerHTML = `
<div x-data="goalsPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Metas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Acompanhe o progresso das metas de consumo</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Nova meta</button>
  </div>

  <div class="flex gap-3">
    <select x-model="filterStatus" @change="load()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todas</option>
      <option value="active">Ativas</option>
      <option value="completed">Concluídas</option>
      <option value="expired">Expiradas</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="goals.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">Nenhuma meta encontrada.</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <template x-for="goal in goals" :key="goal.id">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-semibold text-gray-900 dark:text-white" x-text="goal.name"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="goal.scope + ' • ' + goal.unit"></p>
            </div>
            <div class="flex gap-1">
              <button @click="openEdit(goal)" class="p-1 text-gray-400 hover:text-emerald-600"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button @click="deleteGoal(goal)" class="p-1 text-gray-400 hover:text-red-600"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600 dark:text-gray-400" x-text="(goal.current_value || 0) + ' / ' + goal.value + ' ' + goal.unit"></span>
            <span class="font-medium" :class="progress(goal) >= 100 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'" x-text="progress(goal) + '%'"></span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="h-2 rounded-full transition-all" :class="progressColor(progress(goal))" :style="'width:' + progress(goal) + '%'"></div>
          </div>
          <p x-show="goal.period_end" class="text-xs text-gray-400 mt-2" x-text="'Até ' + (goal.period_end?.slice(0,10) || '')"></p>
        </div>
      </template>
    </div>
  </div>

  <!-- Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="editing ? 'Editar meta' : 'Nova meta'"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label><input type="text" x-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Escopo</label><select x-model="form.scope" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="global">Global</option><option value="sector">Setor</option><option value="device">Dispositivo</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label><select x-model="form.unit" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="kwh">kWh</option><option value="brl">R$</option><option value="percent">%</option></select></div>
        </div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor alvo</label><input type="number" x-model="form.value" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.value" x-text="formErrors.value" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label><input type="date" x-model="form.period_start" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label><input type="date" x-model="form.period_end" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function Ye(e) { e.data(`alertsPage`, () => ({ alerts: [], loading: !0, error: null, filterType: ``, filterSeverity: ``, filterStatus: `open`, async init() { let e = window.location.hash; if (e.includes(`type=`)) { let t = e.match(/type=([^&]+)/); t && (this.filterType = t[1]) } await this.load() }, async load() { this.loading = !0, this.error = null; try { let e = { sort: `-created_at`, limit: 50 }; this.filterType && (e.type = this.filterType), this.filterSeverity && (e.severity = this.filterSeverity), this.filterStatus && (e.status = this.filterStatus); let t = await k.list(e); this.alerts = t?.data || t?.alerts || t || [] } catch (e) { this.error = e?.message || `Erro ao carregar alertas.` } finally { this.loading = !1 } }, onFilterChange() { this.load() }, severityBadge(e) { let t = { critical: { text: `Crítico`, class: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400` }, high: { text: `Alto`, class: `bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400` }, medium: { text: `Médio`, class: `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400` }, low: { text: `Baixo`, class: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` } }; return t[e] || t.medium }, statusBadge(e) { let t = { open: { text: `Aberto`, class: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400` }, acknowledged: { text: `Reconhecido`, class: `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400` }, resolved: { text: `Resolvido`, class: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` } }; return t[e] || t.open }, typeLabel(e) { return { overload: `Sobrecarga`, off_hours: `Fora de horário`, night_waste: `Noturno`, anomaly: `Anomalia`, goal: `Meta`, above_average: `Acima da média` }[e] || e }, formatDate(e) { return e ? new Date(e).toLocaleDateString(`pt-BR`, { day: `2-digit`, month: `2-digit`, hour: `2-digit`, minute: `2-digit` }) : `` }, async acknowledge(t) { try { await k.acknowledge(t.id), t.status = `acknowledged`, e.store(`toast`)?.show(`Alerta reconhecido.`, `success`) } catch { e.store(`toast`)?.show(`Erro ao reconhecer.`, `error`) } }, async resolve(t) { try { await k.resolve(t.id), t.status = `resolved`, e.store(`toast`)?.show(`Alerta resolvido.`, `success`) } catch { e.store(`toast`)?.show(`Erro ao resolver.`, `error`) } } })) } var Xe = !1; function Ze(e) {
  !Xe && window.Alpine && (Ye(window.Alpine), Xe = !0), e.innerHTML = `
<div x-data="alertsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Central de alertas do sistema</p>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3">
    <select x-model="filterStatus" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos status</option>
      <option value="open">Abertos</option>
      <option value="acknowledged">Reconhecidos</option>
      <option value="resolved">Resolvidos</option>
    </select>
    <select x-model="filterType" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todos tipos</option>
      <option value="overload">Sobrecarga</option>
      <option value="off_hours">Fora de horário</option>
      <option value="night_waste">Noturno</option>
      <option value="anomaly">Anomalia</option>
      <option value="above_average">Acima da média</option>
    </select>
    <select x-model="filterSeverity" @change="onFilterChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="">Todas severidades</option>
      <option value="critical">Crítico</option>
      <option value="high">Alto</option>
      <option value="medium">Médio</option>
      <option value="low">Baixo</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button>
  </div>

  <div x-show="!loading && !error" x-cloak>
    <div x-show="alerts.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum alerta encontrado.</div>

    <div x-show="alerts.length > 0" class="space-y-3">
      <template x-for="alert in alerts" :key="alert.id">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span :class="severityBadge(alert.severity).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="severityBadge(alert.severity).text"></span>
                <span class="text-xs text-gray-500 dark:text-gray-400" x-text="typeLabel(alert.type)"></span>
                <span :class="statusBadge(alert.status).class" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="statusBadge(alert.status).text"></span>
              </div>
              <p class="font-medium text-gray-900 dark:text-white" x-text="alert.title || alert.message"></p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1" x-text="(alert.sector?.name || alert.device?.name || '') + (alert.created_at ? ' — ' + formatDate(alert.created_at) : '')"></p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button x-show="alert.status === 'open'" @click="acknowledge(alert)" class="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reconhecer</button>
              <button x-show="alert.status !== 'resolved'" @click="resolve(alert)" class="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Resolver</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} var Qe = `lf_selected_sector`, Q = .85; function $e(e) { e.data(`financialPage`, () => ({ summary: null, daily: [], ranking: [], loading: !0, error: null, period: `last30`, selectedSector: null, async init() { try { let e = localStorage.getItem(Qe); e && (this.selectedSector = JSON.parse(e)) } catch { } await this.load() }, async load() { this.loading = !0, this.error = null; try { let e = (await L.getPublicData())?.latest_readings || {}, t = 0; if (this.selectedSector) { for (let [n, r] of Object.entries(e)) if (n === this.selectedSector.id || r.nome === this.selectedSector.name) { t = r.energia_kwh || 0; break } } else for (let n of Object.values(e)) t += n.energia_kwh || 0; let n = t * Q; this.summary = { total_kwh: t, total_cost: n, avg_cost_per_kwh: Q }, this.ranking = Object.values(e).map(e => ({ name: e.nome, cost: (e.energia_kwh || 0) * Q })).sort((e, t) => t.cost - e.cost), this.ranking.length === 0 && (this.ranking = [{ name: `Equipamentos`, cost: 1540.5 }, { name: `Refrigeração`, cost: 1200 }, { name: `Iluminação`, cost: 850.2 }, { name: `Escritório`, cost: 450 }]); let r = new Date; this.daily = Array.from({ length: 7 }).map((e, t) => { let n = new Date(r); n.setDate(n.getDate() - (6 - t)); let i = Math.random() * 50 + 10; return { date: n.toISOString().slice(0, 10), kwh: i, cost: i * Q } }) } catch (e) { this.error = e?.message || `Erro ao carregar dados financeiros.` } finally { this.loading = !1 } }, onPeriodChange() { this.load() }, formatCurrency(e) { return e == null ? `R$ 0,00` : `R$ ` + Number(e).toLocaleString(`pt-BR`, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }, formatDate(e) { return e ? new Date(e).toLocaleDateString(`pt-BR`, { day: `2-digit`, month: `2-digit` }) : `` } })) } var et = !1; function tt(e) {
  !et && window.Alpine && ($e(window.Alpine), et = !0), e.innerHTML = `
<div x-data="financialPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Custos e análise financeira de energia</p>
      <p x-show="selectedSector" x-cloak class="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span x-text="'Setor: ' + selectedSector?.name"></span>
      </p>
    </div>
    <select x-model="period" @change="onPeriodChange()" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      <option value="last7">Últimos 7 dias</option>
      <option value="last30">Últimos 30 dias</option>
    </select>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Custo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="formatCurrency(summary?.total_cost)"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Consumo total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="(summary?.total_kwh || 0).toFixed(3) + ' KWh'"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Custo médio/kWh</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="formatCurrency(summary?.avg_cost_per_kwh)"></p>
      </div>
    </div>

    <!-- Ranking -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ranking por custo</h3>
      <div x-show="ranking.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Sem dados.</div>
      <div x-show="ranking.length > 0" class="space-y-3">
        <template x-for="(item, idx) in ranking" :key="idx">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center" x-text="idx + 1"></span>
              <span class="text-sm font-medium text-gray-900 dark:text-white" x-text="item.name || item.sector_name"></span>
            </div>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300" x-text="formatCurrency(item.cost || item.total_cost)"></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Daily -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custo diário</h3>
      <div x-show="daily.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Sem dados.</div>
      <div x-show="daily.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr><th class="text-left py-2 text-gray-500 dark:text-gray-400">Data</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">KWh</th><th class="text-right py-2 text-gray-500 dark:text-gray-400">Custo</th></tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <template x-for="row in daily" :key="row.date">
              <tr><td class="py-2 text-gray-700 dark:text-gray-300" x-text="formatDate(row.date)"></td><td class="py-2 text-right text-gray-700 dark:text-gray-300" x-text="(row.kwh || 0).toFixed(3)"></td><td class="py-2 text-right font-medium text-gray-900 dark:text-white" x-text="formatCurrency(row.cost)"></td></tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function nt(e) { e.data(`tariffsPage`, () => ({ tariffs: [], loading: !0, error: null, modalOpen: !1, editing: null, form: { name: ``, type: `conventional`, value_kwh: ``, flag_color: `green`, active: !0 }, formErrors: {}, saving: !1, async init() { await this.load() }, async load() { this.loading = !0, this.error = null; try { let e = await h.get(`/api/tariffs`); this.tariffs = e?.data || e || [] } catch (e) { this.error = e?.message || `Erro ao carregar tarifas.` } finally { this.loading = !1 } }, flagLabel(e) { return { green: `Verde`, yellow: `Amarela`, red1: `Vermelha 1`, red2: `Vermelha 2` }[e] || e }, flagClass(e) { let t = { green: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`, yellow: `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`, red1: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`, red2: `bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300` }; return t[e] || t.green }, openNew() { this.editing = null, this.form = { name: ``, type: `conventional`, value_kwh: ``, flag_color: `green`, active: !0 }, this.formErrors = {}, this.modalOpen = !0 }, openEdit(e) { this.editing = e, this.form = { name: e.name, type: e.type || `conventional`, value_kwh: e.value_kwh, flag_color: e.flag_color || `green`, active: e.active }, this.formErrors = {}, this.modalOpen = !0 }, async saveForm() { if (this.formErrors = {}, !this.form.name.trim()) { this.formErrors.name = `Campo obrigatório`; return } if (!this.form.value_kwh || Number(this.form.value_kwh) <= 0) { this.formErrors.value_kwh = `Valor inválido`; return } this.saving = !0; try { let t = { ...this.form, value_kwh: Number(this.form.value_kwh) }; this.editing ? await h.put(`/api/tariffs/${this.editing.id}`, t) : await h.post(`/api/tariffs`, t), e.store(`toast`)?.show(`Tarifa salva.`, `success`), this.modalOpen = !1, await this.load() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro ao salvar.`, `error`) } finally { this.saving = !1 } }, async deleteTariff(t) { if (confirm(`Remover esta tarifa?`)) try { await h.delete(`/api/tariffs/${t.id}`), e.store(`toast`)?.show(`Tarifa removida.`, `success`), await this.load() } catch (t) { e.store(`toast`)?.show(t?.message || `Erro.`, `error`) } } })) } var $ = !1; function rt(e) {
  !$ && window.Alpine && (nt(window.Alpine), $ = !0), e.innerHTML = `
<div x-data="tariffsPage" class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tarifas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie as tarifas de energia</p>
    </div>
    <button @click="openNew()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Nova tarifa</button>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
  <div x-show="error && !loading" x-cloak class="text-center py-12"><p class="text-gray-600 dark:text-gray-400" x-text="error"></p><button @click="load()" class="mt-3 text-emerald-600 font-medium">Tentar novamente</button></div>

  <div x-show="!loading && !error" x-cloak class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div x-show="tariffs.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">Nenhuma tarifa cadastrada.</div>
    <table x-show="tariffs.length > 0" class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Nome</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Valor/kWh</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Bandeira</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <template x-for="tariff in tariffs" :key="tariff.id">
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white" x-text="tariff.name"></td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300" x-text="'R$ ' + Number(tariff.value_kwh).toFixed(4)"></td>
            <td class="px-4 py-3 hidden sm:table-cell"><span :class="flagClass(tariff.flag_color)" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="flagLabel(tariff.flag_color)"></span></td>
            <td class="px-4 py-3 hidden sm:table-cell"><span :class="tariff.active ? 'text-emerald-600' : 'text-gray-400'" x-text="tariff.active ? 'Ativa' : 'Inativa'"></span></td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(tariff)" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium">Editar</button>
              <button @click="deleteTariff(tariff)" class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Remover</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div x-show="modalOpen" x-cloak x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="modalOpen = false" class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4" x-text="editing ? 'Editar tarifa' : 'Nova tarifa'"></h2>
      <form @submit.prevent="saveForm()" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label><input type="text" x-model="form.name" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.name" x-text="formErrors.name" class="mt-1 text-sm text-red-600"></p></div>
        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor por kWh (R$)</label><input type="number" step="0.0001" x-model="form.value_kwh" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" /><p x-show="formErrors.value_kwh" x-text="formErrors.value_kwh" class="mt-1 text-sm text-red-600"></p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bandeira</label><select x-model="form.flag_color" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="green">Verde</option><option value="yellow">Amarela</option><option value="red1">Vermelha 1</option><option value="red2">Vermelha 2</option></select></div>
          <div class="flex items-end"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" x-model="form.active" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span class="text-sm text-gray-700 dark:text-gray-300">Ativa</span></label></div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} var it = `lf_selected_sector`; function at(e) { e.data(`sectorSelectPage`, () => ({ sectors: [], loading: !0, error: !1, get userName() { return v.getUser()?.name || `` }, async init() { await this.load() }, async load() { this.loading = !0, this.error = !1; try { this.sectors = await L.getFirebaseSectors() } catch { this.error = !0 } finally { this.loading = !1 } }, selectSector(e) { try { localStorage.setItem(it, JSON.stringify({ id: e.id, name: e.name, potencia: e.potencia, energia_kwh: e.energia_kwh })) } catch { } t.navigate(`/dashboard`) }, formatPower(e) { return e == null ? `—` : e >= 1e3 ? (e / 1e3).toFixed(1) + `W` : e.toFixed(1) + ` W` }, formatEnergy(e) { return e == null ? `—` : e.toFixed(3) + ` KWh` } })) } var ot = !1; function st(e) {
  !ot && window.Alpine && (at(window.Alpine), ot = !0), e.innerHTML = `
<div x-data="sectorSelectPage" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-6 py-12">

  <!-- Header -->
  <div class="text-center mb-10">
    <div class="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-2xl mb-6">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      LumenFlow
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Selecione o setor</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400" x-show="userName" x-text="'Olá, ' + userName + '. Escolha o setor para monitorar.'"></p>
  </div>

  <!-- Loading -->
  <div x-show="loading" class="flex items-center justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
  </div>

  <!-- Error -->
  <div x-show="error && !loading" x-cloak class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400 mb-4">Erro ao carregar setores.</p>
    <button @click="load()" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Tentar novamente</button>
  </div>

  <!-- Empty -->
  <div x-show="!loading && !error && sectors.length === 0" x-cloak class="text-center py-12">
    <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Nenhum setor encontrado no Firebase.</p>
  </div>

  <!-- Sector Grid -->
  <div x-show="!loading && !error && sectors.length > 0" x-cloak class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
    <template x-for="sector in sectors" :key="sector.id">
      <button
        @click="selectSector(sector)"
        class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all text-left group"
      >
        <p class="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg" x-text="sector.name"></p>
        <div class="flex items-center gap-4 mt-3">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span class="text-sm text-gray-600 dark:text-gray-400" x-text="formatPower(sector.potencia)"></span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
            <span class="text-sm text-gray-600 dark:text-gray-400" x-text="formatEnergy(sector.energia_kwh)"></span>
          </div>
        </div>
      </button>
    </template>
  </div>

</div>
`, window.Alpine?.initTree(e)
} function ct(e) { e.data(`sectorDashboardPage`, () => ({ sectorId: null, sector: null, devices: [], alerts: [], consumption: 0, loading: !0, error: null, async init() { let e = window.location.hash.match(/\/sectors\/(\d+)/); if (this.sectorId = e ? Number(e[1]) : null, !this.sectorId) { this.error = `Setor não encontrado.`, this.loading = !1; return } await this.load() }, async load() { this.loading = !0, this.error = null; try { let [e, t, n, r] = await Promise.all([U.list({ active: !0 }), G.list(), k.list({ status: `open`, limit: 5 }), h.get(`/api/consumption/by-sector`)]), i = e?.sectors || e?.data || []; if (this.sector = i.find(e => e.id === this.sectorId), !this.sector) { this.error = `Setor não encontrado.`; return } this.devices = (t?.devices || t?.data || []).filter(e => e.sector_id === this.sectorId), this.alerts = (n?.data || n?.alerts || []).filter(e => e.sector_id === this.sectorId || e.sector?.id === this.sectorId).slice(0, 5); let a = (r?.data || r || []).find(e => e.sector_id === this.sectorId || e.name === this.sector.name); this.consumption = a?.total_kwh || 0 } catch (e) { this.error = e?.message || `Erro ao carregar dados.` } finally { this.loading = !1 } }, goBack() { t.navigate(`/sectors/select`) }, goDevices() { t.navigate(`/devices`) }, goAlerts() { t.navigate(`/alerts`) } })) } var lt = !1; function ut(e) {
  !lt && window.Alpine && (ct(window.Alpine), lt = !0), e.innerHTML = `
<div x-data="sectorDashboardPage" class="space-y-6">
  <div x-show="loading" class="flex justify-center py-16"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="error && !loading" x-cloak class="text-center py-16">
    <p class="text-gray-600 dark:text-gray-400" x-text="error"></p>
    <button @click="goBack()" class="mt-3 text-emerald-600 font-medium">Voltar</button>
  </div>

  <div x-show="!loading && !error && sector" x-cloak class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white" x-text="sector?.name"></h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Dashboard do setor</p>
      </div>
      <button @click="goBack()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">← Voltar</button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Consumo</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="consumption.toFixed(1) + ' kWh'"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Dispositivos</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="devices.length"></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Alertas abertos</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1" x-text="alerts.length"></p>
      </div>
    </div>

    <!-- Devices -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dispositivos</h3>
        <button @click="goDevices()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>
      <div x-show="devices.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum dispositivo neste setor.</div>
      <div x-show="devices.length > 0" class="space-y-2">
        <template x-for="device in devices" :key="device.id">
          <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white" x-text="device.name"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="device.type || ''"></p>
            </div>
            <span :class="device.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'" class="px-2 py-0.5 rounded-full text-xs font-medium" x-text="device.status || 'offline'"></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Alerts -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alertas recentes</h3>
        <button @click="goAlerts()" class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">Ver todos</button>
      </div>
      <div x-show="alerts.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum alerta aberto.</div>
      <div x-show="alerts.length > 0" class="space-y-2">
        <template x-for="alert in alerts" :key="alert.id">
          <div class="flex items-start gap-3 p-2">
            <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'"></span>
            <div>
              <p class="text-sm text-gray-800 dark:text-gray-200" x-text="alert.title || alert.message"></p>
              <p class="text-xs text-gray-500 dark:text-gray-400" x-text="alert.created_at ? new Date(alert.created_at).toLocaleDateString('pt-BR') : ''"></p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} function dt(e) { e.data(`reportsPage`, () => ({ sectors: [], selectedSector: ``, dateFrom: ``, dateTo: ``, loading: !0, generating: !1, previewing: !1, previewData: null, error: null, async init() { let e = new Date; this.dateTo = e.toISOString().split(`T`)[0], this.dateFrom = new Date(e.getFullYear(), e.getMonth(), 1).toISOString().split(`T`)[0], await this.loadSectors() }, async loadSectors() { this.loading = !0, this.error = null; try { let e = (await L.getPublicData())?.latest_readings || {}; this.sectors = Object.entries(e).map(([e, t]) => ({ id: e, name: t.nome || e })), this.sectors.length > 0 && !this.selectedSector && (this.selectedSector = this.sectors[0].id) } catch (e) { this.error = e?.message || `Erro ao carregar setores.` } finally { this.loading = !1 } }, get selectedSectorLabel() { let e = this.sectors.find(e => e.id === this.selectedSector); return e ? e.name : this.selectedSector }, get isFormValid() { return this.selectedSector && this.dateFrom && this.dateTo && this.dateFrom <= this.dateTo }, async preview() { if (this.isFormValid) { this.previewing = !0, this.previewData = null, this.error = null; try { let e = await h.get(`/api/reports/consumption-data`, { query: { sector_name: this.selectedSector, date_from: this.dateFrom, date_to: this.dateTo } }); this.previewData = e } catch (e) { this.error = e?.message || `Erro ao carregar dados de prévia.` } finally { this.previewing = !1 } } }, async generatePdf() { if (this.isFormValid) { this.generating = !0, this.error = null; try { let t = h.getAuthToken(), n = `${h.getBaseUrl?.() || `http://localhost:8000`}/api/reports/consumption-pdf?${new URLSearchParams({ sector_name: this.selectedSector, date_from: this.dateFrom, date_to: this.dateTo }).toString()}`, r = await fetch(n, { headers: { Authorization: `Bearer ${t}`, Accept: `application/pdf` } }); if (!r.ok) { let e = await r.json().catch(() => null); throw Error(e?.message || `Erro ${r.status}`) } let i = await r.blob(), a = window.URL.createObjectURL(i), o = document.createElement(`a`); o.href = a, o.download = `relatorio_consumo_${this.selectedSector}_${this.dateFrom}_${this.dateTo}.pdf`, document.body.appendChild(o), o.click(), o.remove(), window.URL.revokeObjectURL(a), e.store(`toast`)?.show(`PDF gerado com sucesso!`, `success`) } catch (t) { this.error = t?.message || `Erro ao gerar PDF.`, e.store(`toast`)?.show(this.error, `error`) } finally { this.generating = !1 } } }, formatDate(e) { return e ? new Date(e).toLocaleDateString(`pt-BR`, { day: `2-digit`, month: `2-digit`, year: `numeric`, hour: `2-digit`, minute: `2-digit` }) : `` }, formatNumber(e, t = 2) { return e == null ? `—` : Number(e).toLocaleString(`pt-BR`, { minimumFractionDigits: t, maximumFractionDigits: t }) }, formatCurrency(e) { return e == null ? `—` : `R$ ` + Number(e).toLocaleString(`pt-BR`, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } })) } var ft = !1; function pt(e) {
  !ft && window.Alpine && (dt(window.Alpine), ft = !0), e.innerHTML = `
<div x-data="reportsPage" class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Gere relatórios de consumo e custo por setor</p>
  </div>

  <div x-show="loading" class="flex justify-center py-12"><svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>

  <div x-show="!loading" x-cloak>
    <!-- Filters Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Configurar Relatório
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Setor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setor</label>
          <select x-model="selectedSector" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <template x-for="sector in sectors" :key="sector.id">
              <option :value="sector.id" x-text="sector.name"></option>
            </template>
          </select>
        </div>

        <!-- Data Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
          <input type="date" x-model="dateFrom" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
          <input type="date" x-model="dateTo" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
      </div>

      <div x-show="error" x-cloak class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3" x-text="error"></div>

      <div class="flex items-center gap-3 justify-end">
        <button @click="preview()" :disabled="!isFormValid || previewing"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50">
          <svg x-show="previewing" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg x-show="!previewing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Visualizar
        </button>
        <button @click="generatePdf()" :disabled="!isFormValid || generating"
          class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-2">
          <svg x-show="generating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg x-show="!generating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Gerar PDF
        </button>
      </div>
    </div>

    <!-- Preview Card -->
    <div x-show="previewData" x-cloak class="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Prévia dos Dados</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400" x-text="previewData?.total_records + ' registros'"></span>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Energia</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300" x-text="formatNumber(previewData?.total_kwh, 4) + ' kWh'"></p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Custo Total</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-300" x-text="formatCurrency(previewData?.total_cost)"></p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">Potência Média</p>
          <p class="text-lg font-bold text-amber-700 dark:text-amber-300" x-text="formatNumber(previewData?.avg_power) + ' W'"></p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">Potência Máx</p>
          <p class="text-lg font-bold text-purple-700 dark:text-purple-300" x-text="formatNumber(previewData?.max_power) + ' W'"></p>
        </div>
      </div>

      <!-- Data Table -->
      <div x-show="previewData?.records?.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Data/Hora</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Potência (W)</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Energia (kWh)</th>
              <th class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Custo (R$)</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="record in previewData?.records?.slice(0, 50)" :key="record.recorded_at">
              <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="py-2 px-3 text-gray-900 dark:text-white" x-text="formatDate(record.recorded_at)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatNumber(record.power_w)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatNumber(record.energy_kwh, 4)"></td>
                <td class="py-2 px-3 text-right text-gray-700 dark:text-gray-300" x-text="formatCurrency(record.cost_estimate)"></td>
              </tr>
            </template>
          </tbody>
        </table>
        <p x-show="previewData?.records?.length > 50" class="text-center text-xs text-gray-400 mt-2">Mostrando apenas os 50 primeiros registros. O PDF conterá todos.</p>
      </div>

      <div x-show="!previewData?.records?.length" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p>Nenhum registro encontrado para o período selecionado.</p>
        <p class="text-xs mt-1">Os dados são registrados automaticamente quando o dashboard é acessado.</p>
      </div>
    </div>
  </div>
</div>
`, window.Alpine?.initTree(e)
} document.addEventListener(`DOMContentLoaded`, () => { document.title = e.APP_NAME, console.log(`[${e.APP_NAME}] v${e.VERSION} inicializado.`); let r = localStorage.getItem(`ef_theme`) || `light`; document.documentElement.setAttribute(`data-theme`, r), r === `dark` && document.documentElement.classList.add(`dark`), document.addEventListener(`alpine:init`, () => { me(window.Alpine) }), window.addEventListener(`unhandledrejection`, e => { e.preventDefault(), console.warn(`[LumenFlow] Promise não tratada:`, e.reason?.message || e.reason) }); let i = document.getElementById(`app`); window.addEventListener(n, () => { v.destroy(), E(), t.navigate(`/login`) }), t.register(`/`, () => t.navigate(v.isAuthenticated() ? `/sectors/select` : `/login`)), t.register(`/login`, O(() => be(i))), t.register(`/register`, O(() => _e(i))), t.register(`/forgot-password`, O(() => Ce(i))), t.register(`/reset-password`, O(() => Ee(i))), t.register(`/dashboard`, D(e => Ne(e))), t.register(`/sectors/select`, () => { if (!v.isAuthenticated()) { t.navigate(`/login`); return } C.isMounted() && C.unmount(), st(i) }), t.register(`/sectors/:id/dashboard`, D(e => ut(e))), t.register(`/transparency`, D(e => He(e))), t.register(`/sectors`, D(e => Ie(e))), t.register(`/devices`, D(e => Re(e))), t.register(`/devices/:id`, D(e => Be(e))), t.register(`/alerts`, D(e => Ze(e))), t.register(`/goals`, D(e => Je(e))), t.register(`/financial`, D(e => tt(e))), t.register(`/tariffs`, D(e => rt(e))), t.register(`/reports`, D(e => pt(e))), t.register(`/settings`, D(e => Ge(e))), t.notFound(() => t.navigate(`/`)), t.start() });