/**
 * LumenFlow — Entry point da aplicacao.
 *
 * Inicializa config, router, e monta a pagina adequada.
 */
import Config                  from './config.js';
import { installMocks }        from './mocks/install.js';
import Router                  from './utils/router.js';
import { requireAuth,
         requireGuest,
         invalidateSessionCache } from './utils/authGuard.js';
import { AppShell }              from './components/AppShell.js';
import { Toast }               from './components/Toast.js';
import { sessionService }      from './services/sessionService.js';
import { AUTH_EXPIRED_EVENT }  from './services/httpClient.js';
import { t }                   from './i18n/pt-BR.js';
import { renderRegisterPage }       from './pages/register.js';
import { renderLoginPage }          from './pages/login.js';
import { renderForgotPasswordPage } from './pages/forgot-password.js';
import { renderResetPasswordPage }  from './pages/reset-password.js';
import { renderDashboardPage }      from './pages/dashboard.js';
import { renderSectorsPage }        from './pages/sectors.js';
import { renderDevicesPage }        from './pages/devices.js';
import { renderDeviceDetailPage }   from './pages/device-detail.js';
import { renderTransparencyPage }   from './pages/transparency.js';
import { renderSettingsPage }       from './pages/settings.js';
import { renderGoalsPage }          from './pages/goals.js';
import { renderAlertsPage }         from './pages/alerts.js';
import { renderFinancialPage }      from './pages/financial.js';
import { renderTariffsPage }        from './pages/tariffs.js';
import { renderSectorSelectPage }   from './pages/sector-select.js';
import { renderSectorDashboardPage }from './pages/sector-dashboard.js';
import { registerOffHoursPlugin }   from './utils/offHoursPlugin.js';
import { alertPolling }             from './utils/alertPolling.js';
import { initAlertDetailModal }     from './components/AlertDetailModal.js';

document.addEventListener('DOMContentLoaded', () => {
  document.title = Config.APP_NAME;
  console.log(`[${Config.APP_NAME}] v${Config.VERSION} inicializado.`);

  // Aplicar tema salvo imediatamente
  const savedTheme = localStorage.getItem('ef_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (Config.DEMO_MODE) installMocks();
  registerOffHoursPlugin();
  initAlertDetailModal();
  alertPolling.start();

  // Captura global de promises rejeitadas não tratadas (Bug 8)
  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
    console.warn('[LumenFlow] Promise não tratada:', e.reason?.message || e.reason);
  });

  const app = document.getElementById('app');

  // ── Sessão expirada: limpa estado e redireciona (US02-F2) ────────
  window.addEventListener(AUTH_EXPIRED_EVENT, () => {
    sessionService.destroy();
    invalidateSessionCache();
    Toast.show({ message: t('auth.session_expired'), type: 'warning', duration: 7000 });
    Router.navigate('/login');
  });

  // ── Rotas ─────────────────────────────────────────────────────

  // Raiz: autenticado → seleção de setor, anônimo → login
  Router.register('/', () =>
    Router.navigate(sessionService.isAuthenticated() ? '/sectors/select' : '/login')
  );

  // Rotas públicas — requireGuest redireciona para /dashboard se já logado
  Router.register('/login',           requireGuest(() => renderLoginPage(app)));
  Router.register('/register',        requireGuest(() => renderRegisterPage(app)));
  Router.register('/forgot-password', requireGuest(() => renderForgotPasswordPage(app)));
  Router.register('/reset-password',  requireGuest(() => renderResetPasswordPage(app)));

  // ── Rotas privadas ─────────────────────────────────────────────
  // Handlers recebem (content, params) — content é o app-main do AppShell.
  function placeholder(title) {
    return (content) => {
      content.innerHTML = `
        <h1 style="margin-bottom:.5rem">${title}</h1>
        <p style="color:var(--text-muted)">Em construção.</p>`;
    };
  }

  Router.register('/dashboard',    requireAuth((content) => renderDashboardPage(content)));
  Router.register('/sectors/select', () => {
    if (!sessionService.isAuthenticated()) { Router.navigate('/login'); return; }
    if (AppShell.isMounted()) AppShell.unmount();
    renderSectorSelectPage(app);
  });
  Router.register('/sectors/:id/dashboard', requireAuth((content, { id }) => renderSectorDashboardPage(content, { id })));
  Router.register('/transparency', requireAuth((content) => renderTransparencyPage(content)));
  Router.register('/sectors',      requireAuth((content) => renderSectorsPage(content)));
  Router.register('/devices',      requireAuth((content) => renderDevicesPage(content)));
  Router.register('/devices/:id',  requireAuth((content, { id }) => renderDeviceDetailPage(content, { id })));
  Router.register('/alerts',       requireAuth((content) => renderAlertsPage(content)));
  Router.register('/goals',        requireAuth((content) => renderGoalsPage(content)));
  Router.register('/financial',    requireAuth((content) => renderFinancialPage(content)));
  Router.register('/tariffs',      requireAuth((content) => renderTariffsPage(content)));
  Router.register('/reports',      requireAuth(placeholder('Relatórios')));
  Router.register('/settings',     requireAuth((content) => renderSettingsPage(content)));

  Router.notFound(() => Router.navigate('/'));

  Router.start();
});
