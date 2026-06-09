/**
 * LumenFlow — Entry point da aplicacao.
 *
 * Inicializa config, router, Alpine.js pages, e monta a pagina adequada.
 */
import Config from './config.js';
import Router from './utils/router.js';
import {
  requireAuth,
  requireGuest,
  invalidateSessionCache
} from './utils/authGuard.js';
import { AppShell } from './components/AppShell.js';
import { sessionService } from './services/sessionService.js';
import { AUTH_EXPIRED_EVENT } from './services/httpClient.js';
import { bootstrapAlpine } from './bootstrap.js';

import { renderRegisterPageAlpine } from './pages/register-alpine-template.js';
import { renderLoginPageAlpine } from './pages/login-alpine-template.js';
import { renderForgotPasswordPageAlpine } from './pages/forgot-password-alpine.js';
import { renderResetPasswordPageAlpine } from './pages/reset-password-alpine.js';
import { renderDashboardPageAlpine } from './pages/dashboard-alpine-template.js';
import { renderSectorsPageAlpine } from './pages/sectors-alpine.js';
import { renderDevicesPageAlpine } from './pages/devices-alpine.js';
import { renderDeviceDetailPageAlpine } from './pages/device-detail-alpine.js';
import { renderTransparencyPageAlpine } from './pages/transparency-alpine.js';
import { renderSettingsPageAlpine } from './pages/settings-alpine.js';
import { renderGoalsPageAlpine } from './pages/goals-alpine.js';
import { renderAlertsPageAlpine } from './pages/alerts-alpine.js';
import { renderFinancialPageAlpine } from './pages/financial-alpine.js';
import { renderTariffsPageAlpine } from './pages/tariffs-alpine.js';
import { renderSectorSelectPageAlpine } from './pages/sector-select-alpine.js';
import { renderSectorDashboardPageAlpine } from './pages/sector-dashboard-alpine.js';
import { renderReportsPageAlpine } from './pages/reports-alpine.js';

// Registrar stores e componentes Alpine globais antes do Alpine inicializar
document.addEventListener('alpine:init', () => {
  bootstrapAlpine(window.Alpine);
});

document.addEventListener('DOMContentLoaded', () => {
  document.title = Config.APP_NAME;
  console.log(`[${Config.APP_NAME}] v${Config.VERSION} inicializado.`);

  // Aplicar tema salvo imediatamente
  const savedTheme = localStorage.getItem('ef_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') document.documentElement.classList.add('dark');

  // Captura global de promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
    console.warn('[LumenFlow] Promise não tratada:', e.reason?.message || e.reason);
  });

  const app = document.getElementById('app');

  // ── Sessão expirada: limpa estado e redireciona ────────
  window.addEventListener(AUTH_EXPIRED_EVENT, () => {
    sessionService.destroy();
    invalidateSessionCache();
    Router.navigate('/login');
  });

  // ── Rotas ─────────────────────────────────────────────────────

  Router.register('/', () =>
    Router.navigate(sessionService.isAuthenticated() ? '/sectors/select' : '/login')
  );

  // Rotas públicas
  Router.register('/login', requireGuest(() => renderLoginPageAlpine(app)));
  Router.register('/register', requireGuest(() => renderRegisterPageAlpine(app)));
  Router.register('/forgot-password', requireGuest(() => renderForgotPasswordPageAlpine(app)));
  Router.register('/reset-password', requireGuest(() => renderResetPasswordPageAlpine(app)));

  // Rotas privadas
  Router.register('/dashboard', requireAuth((content) => renderDashboardPageAlpine(content)));
  Router.register('/sectors/select', () => {
    if (!sessionService.isAuthenticated()) { Router.navigate('/login'); return; }
    if (AppShell.isMounted()) AppShell.unmount();
    renderSectorSelectPageAlpine(app);
  });
  Router.register('/sectors/:id/dashboard', requireAuth((content) => renderSectorDashboardPageAlpine(content)));
  Router.register('/transparency', requireAuth((content) => renderTransparencyPageAlpine(content)));
  Router.register('/sectors', requireAuth((content) => renderSectorsPageAlpine(content)));
  Router.register('/devices', requireAuth((content) => renderDevicesPageAlpine(content)));
  Router.register('/devices/:id', requireAuth((content) => renderDeviceDetailPageAlpine(content)));
  Router.register('/alerts', requireAuth((content) => renderAlertsPageAlpine(content)));
  Router.register('/goals', requireAuth((content) => renderGoalsPageAlpine(content)));
  Router.register('/financial', requireAuth((content) => renderFinancialPageAlpine(content)));
  Router.register('/tariffs', requireAuth((content) => renderTariffsPageAlpine(content)));
  Router.register('/reports', requireAuth((content) => renderReportsPageAlpine(content)));
  Router.register('/settings', requireAuth((content) => renderSettingsPageAlpine(content)));

  Router.notFound(() => Router.navigate('/'));

  Router.start();
});
