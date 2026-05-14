/**
 * LumenFlow — Página de login (US02-F1).
 *
 * Layout consistente com register.js (mesma estrutura auth-layout).
 * Campos: e-mail, senha (PasswordInput — entrega US04), "Lembre-se de mim",
 * link "Esqueci a senha", link "Criar conta".
 *
 * Persistência de sessão → US02-F2.
 * Guard de rotas         → US02-F3.
 * Logout                 → US02-F4.
 * Bloqueio por tentativas→ US02-F5.
 */
import { t }                  from '../i18n/pt-BR.js';
import { createInput }        from '../components/Input.js';
import { createPasswordInput }from '../components/PasswordInput.js';
import { createCheckbox }     from '../components/Checkbox.js';
import { createButton }       from '../components/Button.js';
import { Toast }              from '../components/Toast.js';
import { authService }        from '../services/authService.js';
import { sessionService }     from '../services/sessionService.js';
import { validateEmail,
         validateRequired }   from '../utils/validators.js';
import Router                 from '../utils/router.js';
import Config                 from '../config.js';

// ── Validação ────────────────────────────────────────────────────────────────

/**
 * Conecta validações progressivas (blur) ao formulário de login.
 * Estratégia idêntica ao register: erros apenas após blur, some ao corrigir.
 */
function attachLoginValidation(fields, submitBtn) {
  const { email, password } = fields;
  const errors = { email: null, password: null };
  const touched = new Set();

  function applyError(key, field, msg) {
    errors[key] = msg || null;
    field.setError(msg || '');
    submitBtn.setDisabled(Object.values(errors).some(Boolean));
  }

  function check(key, field, fn) {
    const err = fn(field.getValue());
    applyError(key, field, err);
    return err;
  }

  function connectField(key, field, fn) {
    field.input.addEventListener('blur', () => {
      touched.add(key);
      check(key, field, fn);
    });
    field.input.addEventListener('input', () => {
      if (!touched.has(key)) return;
      check(key, field, fn);
    });
  }

  connectField('email',    email,    validateEmail);
  connectField('password', password, validateRequired);

  function runAll() {
    touched.add('email'); touched.add('password');
    const e1 = check('email',    email,    validateEmail);
    const e2 = check('password', password, validateRequired);
    if (e1) { email.focus();    return false; }
    if (e2) { password.focus(); return false; }
    return true;
  }

  return { runAll };
}

// ── Tratamento de erros da API ────────────────────────────────────────────────

function _handleLoginError(err, errorBanner) {
  const code = err?.code || '';

  // Credenciais inválidas
  if (code === 'INVALID_CREDENTIALS' || err?.status === 401) {
    _showBanner(errorBanner, t('auth.login.error_invalid'));
    return;
  }

  // Bloqueio por excesso de tentativas (US02-F5)
  if (code === 'TOO_MANY_ATTEMPTS' || err?.status === 429) {
    _showBanner(errorBanner, t('auth.login.error_blocked'));
    return;
  }

  // Sem conexão
  if (code === 'NETWORK_ERROR') {
    Toast.show({ message: t('states.offline'), type: 'error', duration: 8000 });
    return;
  }

  // Genérico
  const msg = err?.message || t('common.error_generic');
  _showBanner(errorBanner, msg);
  Toast.show({ message: msg, type: 'error' });
}

function _showBanner(el, message) {
  el.textContent = message;
  el.classList.add('auth-form-error--visible');
}

// ── Renderização ──────────────────────────────────────────────────────────────

/**
 * Renderiza a página de login no container fornecido.
 * @param {HTMLElement} container
 */
export function renderLoginPage(container) {
  container.innerHTML = '';

  // ── Layout ────────────────────────────────────────────────────
  const layout = document.createElement('div');
  layout.className = 'auth-layout';

  // ── Branding (esquerdo) ───────────────────────────────────────
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
      <h2 class="auth-brand__headline">Bem-vindo de volta ao LumenFlow</h2>
      <p class="auth-brand__tagline">
        Continue monitorando o consumo energético da sua empresa com inteligência e precisão.
      </p>
      <ul class="auth-brand__features">
        <li>Dashboard atualizado em tempo real</li>
        <li>Alertas automáticos de anomalias</li>
        <li>Relatórios ESG prontos para download</li>
        <li>Metas e controle financeiro integrados</li>
      </ul>
    </div>
    <p class="auth-brand__footer">© 2026 ${t('app.name')}. Todos os direitos reservados.</p>
  `;

  // ── Painel do formulário ──────────────────────────────────────
  const formPanel = document.createElement('div');
  formPanel.className = 'auth-form-panel';

  const formBox = document.createElement('div');
  formBox.className = 'auth-form-box';

  // Logo mobile
  formBox.innerHTML = `
    <div class="auth-form-box__logo-mobile" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      ${t('app.name')}
    </div>
    <h1 class="auth-form-box__title">${t('auth.login.title')}</h1>
    <p class="auth-form-box__subtitle">${t('auth.login.subtitle')}</p>
  `;

  // ── Formulário ────────────────────────────────────────────────
  const form = document.createElement('form');
  form.noValidate = true;
  form.setAttribute('aria-label', t('auth.login.title'));

  // Banner de erro global
  const errorBanner = document.createElement('div');
  errorBanner.className = 'auth-form-error';
  errorBanner.setAttribute('role', 'alert');
  errorBanner.setAttribute('aria-live', 'assertive');
  form.appendChild(errorBanner);

  // E-mail
  const email = createInput({
    label: t('auth.login.email'),
    type: 'email',
    name: 'email',
    autocomplete: 'email',
    required: true,
  });
  form.appendChild(email.el);

  // Senha (PasswordInput — entrega US04)
  const password = createPasswordInput({
    label: t('auth.login.password'),
    name: 'password',
    autocomplete: 'current-password',
    required: true,
  });
  form.appendChild(password.el);

  // Lembre-se de mim + link esqueci a senha (linha flex)
  const rememberRow = document.createElement('div');
  rememberRow.className = 'login-remember-row';

  const remember = createCheckbox({
    label: t('auth.login.remember'),
    name: 'remember',
  });

  const forgotLink = document.createElement('a');
  forgotLink.href = '#/forgot-password';
  forgotLink.className = 'login-forgot-link';
  forgotLink.textContent = t('auth.login.forgot');

  rememberRow.appendChild(remember.el);
  rememberRow.appendChild(forgotLink);
  form.appendChild(rememberRow);

  // Botão de submit
  const submitArea = document.createElement('div');
  submitArea.className = 'auth-submit';

  const submitBtn = createButton({
    label: t('auth.login.submit'),
    variant: 'primary',
    size: 'lg',
    type: 'submit',
  });
  submitArea.appendChild(submitBtn);
  form.appendChild(submitArea);

  // Link "Criar conta"
  const altLink = document.createElement('p');
  altLink.className = 'auth-alt-link';
  const registerLink = document.createElement('a');
  registerLink.href = '#/register';
  registerLink.textContent = t('auth.register.title');
  altLink.appendChild(document.createTextNode(`${t('auth.login.no_account')} `));
  altLink.appendChild(registerLink);
  form.appendChild(altLink);

  // ── Validação ─────────────────────────────────────────────────
  const fields = { email, password };
  const { runAll } = attachLoginValidation(fields, submitBtn);

  // ── Submit handler (US02-F2 adicionará persistência) ──────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!runAll()) return;

    submitBtn.setLoading(true);
    errorBanner.classList.remove('auth-form-error--visible');

    try {
      const response = await authService.login({
        email:      email.getValue().trim().toLowerCase(),
        password:   password.getValue(),
        rememberMe: remember.isChecked(),
      });

      // Armazena dados básicos do usuário em cache (US02-F2)
      if (response?.user) {
        sessionService.setUser(response.user);
      }

      // Sucesso — navega para seleção de setor
      Router.navigate('/sectors/select');

    } catch (err) {
      submitBtn.setLoading(false);
      _handleLoginError(err, errorBanner);
    }
  });

  // ── Botão Demo (apresentação) ──────────────────────────────
  if (Config.DEMO_MODE) {
    const demoDivider = document.createElement('div');
    demoDivider.className = 'auth-demo-divider';
    demoDivider.innerHTML = '<span>ou</span>';
    form.appendChild(demoDivider);

    const demoBtn = createButton({
      label: '⚡ Entrar como Demo',
      variant: 'secondary',
      size: 'lg',
      type: 'button',
    });
    demoBtn.classList.add('auth-demo-btn');
    demoBtn.addEventListener('click', async () => {
      demoBtn.setLoading(true);
      try {
        const response = await authService.login({
          email: 'joao@technova.com.br',
          password: 'demo',
          rememberMe: true,
        });
        if (response?.user) sessionService.setUser(response.user);
        Router.navigate('/sectors/select');
      } catch (err) {
        demoBtn.setLoading(false);
        Toast.show({ message: 'Erro ao entrar no modo demo.', type: 'error' });
      }
    });
    form.appendChild(demoBtn);
  }

  // ── Montar DOM ────────────────────────────────────────────────
  formBox.appendChild(form);
  formPanel.appendChild(formBox);
  layout.appendChild(brand);
  layout.appendChild(formPanel);
  container.appendChild(layout);

  email.focus();
}
