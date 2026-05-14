/**
 * LumenFlow — Página de recuperação de senha (US03-F2).
 *
 * Formulário com campo de e-mail. Após submit, sempre exibe a mesma mensagem
 * de sucesso — alinhado com a resposta genérica do backend (US03-B1), que não
 * revela se o e-mail está cadastrado ou não (prevenção de user enumeration).
 */
import { t }              from '../i18n/pt-BR.js';
import { createInput }    from '../components/Input.js';
import { createButton }   from '../components/Button.js';
import { Toast }          from '../components/Toast.js';
import { authService }    from '../services/authService.js';
import { validateEmail }  from '../utils/validators.js';

export function renderForgotPasswordPage(container) {
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
      <h2 class="auth-brand__headline">Recupere o acesso à sua conta</h2>
      <p class="auth-brand__tagline">
        Enviaremos um link seguro para o e-mail cadastrado. O link expira em 1 hora.
      </p>
    </div>
    <p class="auth-brand__footer">© 2026 ${t('app.name')}. Todos os direitos reservados.</p>
  `;

  // ── Formulário ────────────────────────────────────────────────
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
    <h1 class="auth-form-box__title">${t('auth.forgot.title')}</h1>
    <p class="auth-form-box__subtitle">${t('auth.forgot.subtitle')}</p>
  `;

  // Estado de sucesso (substitui o form após envio)
  const successBox = document.createElement('div');
  successBox.className = 'auth-success-box';
  successBox.setAttribute('role', 'status');
  successBox.style.display = 'none';
  successBox.innerHTML = `
    <div class="auth-success-icon" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <p class="auth-success-message"></p>
    <a href="#/login" class="auth-success-back">${t('auth.forgot.back')}</a>
  `;

  const form = document.createElement('form');
  form.noValidate = true;

  const errorBanner = document.createElement('div');
  errorBanner.className = 'auth-form-error';
  errorBanner.setAttribute('role', 'alert');
  form.appendChild(errorBanner);

  const emailField = createInput({
    label: t('auth.forgot.email'),
    type: 'email',
    name: 'email',
    autocomplete: 'email',
    required: true,
  });
  form.appendChild(emailField.el);

  // Validação blur
  let touched = false;
  emailField.input.addEventListener('blur', () => {
    touched = true;
    emailField.setError(validateEmail(emailField.getValue()) || '');
  });
  emailField.input.addEventListener('input', () => {
    if (!touched) return;
    emailField.setError(validateEmail(emailField.getValue()) || '');
  });

  const submitArea = document.createElement('div');
  submitArea.className = 'auth-submit';
  const submitBtn = createButton({
    label: t('auth.forgot.submit'),
    variant: 'primary',
    size: 'lg',
    type: 'submit',
  });
  submitArea.appendChild(submitBtn);
  form.appendChild(submitArea);

  const backLink = document.createElement('p');
  backLink.className = 'auth-alt-link';
  backLink.innerHTML = `<a href="#/login">${t('auth.forgot.back')}</a>`;
  form.appendChild(backLink);

  // ── Submit ─────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    touched = true;
    const err = validateEmail(emailField.getValue());
    emailField.setError(err || '');
    if (err) { emailField.focus(); return; }

    submitBtn.setLoading(true);
    errorBanner.classList.remove('auth-form-error--visible');

    try {
      await authService.forgotPassword({ email: emailField.getValue().trim().toLowerCase() });
    } catch (ex) {
      // Mesmo em caso de erro de rede, exibimos a mensagem genérica de sucesso
      // para não revelar se o e-mail existe. Erros internos (5xx) ficam no Toast.
      if (ex?.code === 'NETWORK_ERROR') {
        submitBtn.setLoading(false);
        Toast.show({ message: t('states.offline'), type: 'error', duration: 8000 });
        return;
      }
      // Para qualquer outro erro, cai no sucesso visual intencionalmente
    }

    // Exibe estado de sucesso (mesmo se o e-mail não existir — prevenção de enumeration)
    form.style.display = 'none';
    const msgEl = successBox.querySelector('.auth-success-message');
    msgEl.textContent = t('auth.forgot.success');
    successBox.style.display = '';
    successBox.querySelector('a').focus();
  });

  formBox.appendChild(form);
  formBox.appendChild(successBox);
  formPanel.appendChild(formBox);
  layout.appendChild(brand);
  layout.appendChild(formPanel);
  container.appendChild(layout);

  emailField.focus();
}
