/**
 * EnergyFlow — Página de redefinição de senha (US03-F3).
 *
 * Recebe ?token=... via query string do hash (#/reset-password?token=abc).
 * Estratégia de validação do token: não há endpoint separado de validação
 * no backend. O token é enviado junto com a nova senha no submit. Se inválido
 * ou expirado, o backend retorna AUTH_TOKEN_INVALID / AUTH_TOKEN_EXPIRED.
 * Para melhor UX, detectamos ausência do token na URL e exibimos ErrorState
 * imediatamente, sem requisição.
 */
import { t }                   from '../i18n/pt-BR.js';
import { createPasswordInput } from '../components/PasswordInput.js';
import { createButton }        from '../components/Button.js';
import { Toast }               from '../components/Toast.js';
import { authService }         from '../services/authService.js';
import { validatePasswordStrength,
         validatePasswordMatch } from '../utils/validators.js';
import Router                  from '../utils/router.js';

export function renderResetPasswordPage(container) {
  container.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'auth-layout';

  // ── Branding ──────────────────────────────────────────────────
  const brand = document.createElement('div');
  brand.className = 'auth-brand';
  brand.setAttribute('aria-hidden', 'true');
  brand.innerHTML = `
    <div class="auth-brand__logo">
      <div class="auth-brand__logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      ${t('app.name')}
    </div>
    <div class="auth-brand__content">
      <h2 class="auth-brand__headline">Crie uma nova senha segura</h2>
      <p class="auth-brand__tagline">
        Use ao menos 8 caracteres combinando letras, números e símbolos.
      </p>
    </div>
    <p class="auth-brand__footer">© 2026 ${t('app.name')}. Todos os direitos reservados.</p>
  `;

  // ── Painel direito ────────────────────────────────────────────
  const formPanel = document.createElement('div');
  formPanel.className = 'auth-form-panel';

  const formBox = document.createElement('div');
  formBox.className = 'auth-form-box';
  formBox.innerHTML = `
    <div class="auth-form-box__logo-mobile" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      ${t('app.name')}
    </div>
    <h1 class="auth-form-box__title">${t('auth.reset.title')}</h1>
    <p class="auth-form-box__subtitle">${t('auth.reset.subtitle')}</p>
  `;

  // Lê o token da query string do hash
  const { token } = Router.currentQuery();

  // ── Token ausente: ErrorState imediato ────────────────────────
  if (!token) {
    const errBox = document.createElement('div');
    errBox.className = 'reset-error-box';
    errBox.innerHTML = `
      <p class="reset-error-msg">${t('auth.reset.error_expired')}</p>
      <a href="#/forgot-password" class="reset-request-link">${t('auth.reset.request_new')}</a>
    `;
    formBox.appendChild(errBox);
    formPanel.appendChild(formBox);
    layout.appendChild(brand);
    layout.appendChild(formPanel);
    container.appendChild(layout);
    return;
  }

  // ── Formulário de nova senha ──────────────────────────────────
  const form = document.createElement('form');
  form.noValidate = true;

  const errorBanner = document.createElement('div');
  errorBanner.className = 'auth-form-error';
  errorBanner.setAttribute('role', 'alert');
  form.appendChild(errorBanner);

  const password = createPasswordInput({
    label: t('auth.reset.new_password'),
    name: 'password',
    autocomplete: 'new-password',
    required: true,
    helper: 'Mínimo 8 caracteres com letra, número e símbolo.',
  });

  const passwordConfirm = createPasswordInput({
    label: t('auth.reset.confirm_password'),
    name: 'password_confirm',
    autocomplete: 'new-password',
    required: true,
  });

  form.appendChild(password.el);
  form.appendChild(passwordConfirm.el);

  // Validação blur
  const touched = new Set();

  function validateFields() {
    const e1 = validatePasswordStrength(password.getValue());
    const e2 = (() => {
      const req = !passwordConfirm.getValue() ? 'Campo obrigatório.' : null;
      return req || validatePasswordMatch(password.getValue(), passwordConfirm.getValue());
    })();
    if (touched.has('password'))        password.setError(e1 || '');
    if (touched.has('passwordConfirm')) passwordConfirm.setError(e2 || '');
    return { e1, e2 };
  }

  password.input.addEventListener('blur', () => {
    touched.add('password');
    validateFields();
  });
  password.input.addEventListener('input', () => {
    if (!touched.has('password')) return;
    validateFields();
    if (touched.has('passwordConfirm')) validateFields();
  });
  passwordConfirm.input.addEventListener('blur', () => {
    touched.add('passwordConfirm');
    validateFields();
  });
  passwordConfirm.input.addEventListener('input', () => {
    if (!touched.has('passwordConfirm')) return;
    validateFields();
  });

  const submitArea = document.createElement('div');
  submitArea.className = 'auth-submit';
  const submitBtn = createButton({
    label: t('auth.reset.submit'),
    variant: 'primary',
    size: 'lg',
    type: 'submit',
  });
  submitArea.appendChild(submitBtn);
  form.appendChild(submitArea);

  // ── Submit ────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    touched.add('password'); touched.add('passwordConfirm');
    const { e1, e2 } = validateFields();
    if (e1) { password.focus(); return; }
    if (e2) { passwordConfirm.focus(); return; }

    submitBtn.setLoading(true);
    errorBanner.classList.remove('auth-form-error--visible');

    try {
      await authService.resetPassword({ token, password: password.getValue() });

      Toast.show({ message: t('auth.reset.success'), type: 'success', duration: 7000 });
      Router.navigate('/login');

    } catch (err) {
      submitBtn.setLoading(false);
      const code = err?.code || '';

      if (code === 'AUTH_TOKEN_INVALID' || code === 'AUTH_TOKEN_EXPIRED') {
        // Substitui o form por ErrorState com link para solicitar novo link
        form.innerHTML = '';
        const errBox = document.createElement('div');
        errBox.className = 'reset-error-box';
        errBox.innerHTML = `
          <p class="reset-error-msg">${t('auth.reset.error_expired')}</p>
          <a href="#/forgot-password" class="reset-request-link">${t('auth.reset.request_new')}</a>
        `;
        form.appendChild(errBox);
        return;
      }

      if (code === 'NETWORK_ERROR') {
        Toast.show({ message: t('states.offline'), type: 'error', duration: 8000 });
        return;
      }

      const msg = err?.message || t('common.error_generic');
      errorBanner.textContent = msg;
      errorBanner.classList.add('auth-form-error--visible');
    }
  });

  formBox.appendChild(form);
  formPanel.appendChild(formBox);
  layout.appendChild(brand);
  layout.appendChild(formPanel);
  container.appendChild(layout);

  password.focus();
}
