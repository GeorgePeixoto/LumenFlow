/**
 * LumenFlow — Página de cadastro (US01-F1 + US01-F2).
 *
 * US01-F1: layout, campos, máscara CNPJ, checkbox de termos.
 * US01-F2: validações client-side progressivas (blur) + validação final no submit.
 *          Botão de submit desabilitado enquanto houver erros.
 *
 * Integração com API (US01-F4) e modal de termos (US01-F3) serão adicionados
 * nas tasks seguintes sem re-render — o form stub apenas loga por enquanto.
 */
import { t } from '../i18n/pt-BR.js';
import { createInput }         from '../components/Input.js';
import { createPasswordInput } from '../components/PasswordInput.js';
import { createSelect }        from '../components/Select.js';
import { createCheckbox }      from '../components/Checkbox.js';
import { createButton }        from '../components/Button.js';
import {
  validateRequired,
  validateEmail,
  validateCnpj,
  validatePasswordStrength,
  validatePasswordMatch,
} from '../utils/validators.js';
import { openTermsModal }  from '../utils/termsModal.js';
import { authService }     from '../services/authService.js';
import { Toast }           from '../components/Toast.js';
import { TERMS_VERSION }   from '../utils/termsModal.js';
import Router              from '../utils/router.js';

// ── Constantes ──────────────────────────────────────────────────────────────

const SEGMENT_OPTIONS = [
  { value: 'food_wholesale',        label: 'Alimentos e Bebidas' },
  { value: 'pharma_wholesale',      label: 'Farmacêutico' },
  { value: 'building_wholesale',    label: 'Materiais de Construção' },
  { value: 'electronics_wholesale', label: 'Eletroeletrônicos' },
  { value: 'textile_wholesale',     label: 'Têxtil e Vestuário' },
  { value: 'chemical_wholesale',    label: 'Químico e Petroquímico' },
  { value: 'agro_wholesale',        label: 'Agronegócio' },
  { value: 'logistics',             label: 'Logística e Distribuição' },
  { value: 'other',                 label: 'Outro' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Aplica máscara de CNPJ progressivamente: 00.000.000/0000-00 */
function maskCnpj(value) {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2)  return d;
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

// ── Lógica de validação (US01-F2) ────────────────────────────────────────────

/**
 * Conecta validações progressivas (blur) e validação completa no submit.
 * Retorna `runAll()` para o handler de submit usar.
 *
 * Estratégia:
 * - Erros só aparecem ao sair do campo (blur) — não enquanto digita.
 * - Set `touched` rastreia campos já tocados para re-validar no input
 *   (assim o erro some assim que o usuário corrige, sem esperar novo blur).
 * - `submitBtn` é desabilitado se qualquer campo tiver erro pendente.
 *
 * @param {Object} fields   - { companyName, cnpj, segment, responsibleName, email, password, passwordConfirm }
 * @param {Object} terms    - { termsCheck, termsBox, termsError }
 * @param {HTMLButtonElement} submitBtn
 * @returns {{ runAll: () => boolean }}
 */
function attachValidation(fields, terms, submitBtn) {
  const { companyName, cnpj, segment, responsibleName, email, password, passwordConfirm } = fields;
  const { termsCheck, termsBox, termsError } = terms;

  // Rastreia erros por campo (chave → erro atual ou null)
  const errors = {
    companyName:      null,
    cnpj:             null,
    segment:          null,
    responsibleName:  null,
    email:            null,
    password:         null,
    passwordConfirm:  null,
    terms:            null,
  };

  // Campos já tocados (ao menos um blur)
  const touched = new Set();

  function setFieldError(key, field, msg) {
    errors[key] = msg || null;
    field.setError(msg || '');
    updateSubmit();
  }

  function updateSubmit() {
    const hasError = Object.values(errors).some(e => e !== null);
    submitBtn.setDisabled(hasError);
  }

  function validateField(key, field, validatorFn) {
    const err = validatorFn(field.getValue());
    setFieldError(key, field, err);
    return err;
  }

  // ── Regras de validação por campo ──────────────────────────────

  const rules = {
    companyName:     () => validateRequired(companyName.getValue()),
    cnpj:            () => validateCnpj(cnpj.getValue()),
    segment:         () => validateRequired(segment.getValue()),
    responsibleName: () => validateRequired(responsibleName.getValue()),
    email:           () => validateEmail(email.getValue()),
    password:        () => validatePasswordStrength(password.getValue()),
    passwordConfirm: () => {
      const req = validateRequired(passwordConfirm.getValue());
      if (req) return req;
      return validatePasswordMatch(password.getValue(), passwordConfirm.getValue());
    },
  };

  // ── Helpers de conexão de eventos ─────────────────────────────

  /** Conecta blur + input ao campo de texto/password. */
  function connectInput(key, field) {
    field.input.addEventListener('blur', () => {
      touched.add(key);
      const err = rules[key]();
      setFieldError(key, field, err);
    });

    field.input.addEventListener('input', () => {
      if (!touched.has(key)) return; // não valida antes do primeiro blur
      const err = rules[key]();
      setFieldError(key, field, err);
      // Se a senha mudou, re-valida confirmação também (se já foi tocada)
      if ((key === 'password' || key === 'passwordConfirm') && touched.has('passwordConfirm')) {
        const errConfirm = rules.passwordConfirm();
        setFieldError('passwordConfirm', passwordConfirm, errConfirm);
      }
    });
  }

  /** Conecta blur + change ao select. */
  function connectSelect(key, field) {
    field.select.addEventListener('blur', () => {
      touched.add(key);
      const err = rules[key]();
      setFieldError(key, field, err);
    });
    field.select.addEventListener('change', () => {
      if (!touched.has(key)) { touched.add(key); }
      const err = rules[key]();
      setFieldError(key, field, err);
    });
  }

  // Conectar todos os campos
  connectInput('companyName',     companyName);
  connectInput('responsibleName', responsibleName);
  connectInput('email',           email);
  connectInput('password',        password);
  connectInput('passwordConfirm', passwordConfirm);
  connectSelect('segment',        segment);

  // CNPJ: blur valida; input aplica máscara + re-valida se já tocado
  cnpj.input.addEventListener('blur', () => {
    touched.add('cnpj');
    const err = rules.cnpj();
    setFieldError('cnpj', cnpj, err);
  });
  cnpj.input.addEventListener('input', () => {
    cnpj.input.value = maskCnpj(cnpj.input.value);
    if (!touched.has('cnpj')) return;
    const err = rules.cnpj();
    setFieldError('cnpj', cnpj, err);
  });

  // Termos: valida ao mudar o checkbox
  function validateTerms() {
    const checked = termsCheck.isChecked();
    const msg = checked ? null : t('validation.terms_required');
    errors.terms = msg;
    termsBox.classList.toggle('auth-terms--error', !!msg);
    termsError.textContent = msg || '';
    updateSubmit();
    return msg;
  }
  termsCheck.input.addEventListener('change', validateTerms);

  // ── Validação completa (chamada no submit) ────────────────────

  /**
   * Valida todos os campos e exibe erros.
   * @returns {boolean} true se o formulário é válido
   */
  function runAll() {
    // Marca todos como tocados
    Object.keys(rules).forEach(k => touched.add(k));

    let valid = true;

    // Campos de texto/password
    for (const [key, field] of [
      ['companyName',     companyName],
      ['responsibleName', responsibleName],
      ['email',           email],
      ['password',        password],
      ['passwordConfirm', passwordConfirm],
    ]) {
      const err = rules[key]();
      setFieldError(key, field, err);
      if (err) valid = false;
    }

    // CNPJ
    const cnpjErr = rules.cnpj();
    setFieldError('cnpj', cnpj, cnpjErr);
    if (cnpjErr) valid = false;

    // Segment
    const segErr = rules.segment();
    setFieldError('segment', segment, segErr);
    if (segErr) valid = false;

    // Termos
    const termsErr = validateTerms();
    if (termsErr) valid = false;

    // Foca o primeiro campo com erro
    if (!valid) {
      const firstError = [
        ['companyName', companyName], ['cnpj', cnpj], ['segment', segment],
        ['responsibleName', responsibleName], ['email', email],
        ['password', password], ['passwordConfirm', passwordConfirm],
      ].find(([k]) => errors[k]);
      if (firstError && firstError[1].focus) firstError[1].focus();
    }

    return valid;
  }

  // Estado inicial: submit habilitado até primeiro erro (evitar bloquear form virgem)
  // Só bloqueia depois que o usuário interage com pelo menos um campo.
  // updateSubmit não é chamado na inicialização.

  return { runAll };
}

// ── Tratamento de erros da API (US01-F4) ─────────────────────────────────────

/**
 * Mapeia erros do backend para mensagens nos campos corretos ou Toast genérico.
 *
 * Códigos conhecidos:
 *   COMPANY_CNPJ_TAKEN   → erro no campo cnpj
 *   USER_EMAIL_TAKEN     → erro no campo email
 *   VALIDATION_ERROR     → pode conter details com erros por campo
 *   NETWORK_ERROR        → sem conexão
 *   qualquer outro       → toast de erro genérico
 *
 * @param {import('../services/httpClient.js').ApiError} err
 * @param {Object} fields
 * @param {HTMLElement} errorMsg
 */
function _handleRegisterError(err, fields, errorMsg) {
  const code = err?.code || '';

  // Erros mapeados para campo específico
  if (code === 'COMPANY_CNPJ_TAKEN') {
    fields.cnpj.setError(t('auth.register.error_cnpj_taken'));
    fields.cnpj.focus();
    return;
  }

  if (code === 'USER_EMAIL_TAKEN') {
    fields.email.setError(t('auth.register.error_email_taken'));
    fields.email.focus();
    return;
  }

  // VALIDATION_ERROR: backend pode retornar erros por campo em details.errors
  if (code === 'VALIDATION_ERROR' && err?.details?.errors) {
    const serverErrors = err.details.errors;
    const fieldMap = {
      company_name:     fields.companyName,
      cnpj:             fields.cnpj,
      segment:          fields.segment,
      responsible_name: fields.responsibleName,
      email:            fields.email,
      password:         fields.password,
    };
    let firstFocused = false;
    for (const [serverField, fieldComp] of Object.entries(fieldMap)) {
      if (serverErrors[serverField]) {
        fieldComp.setError(serverErrors[serverField]);
        if (!firstFocused && fieldComp.focus) { fieldComp.focus(); firstFocused = true; }
      }
    }
    if (!firstFocused) {
      // Se nenhum campo foi mapeado, mostra mensagem global
      _showFormError(errorMsg, err.message || t('common.error'));
    }
    return;
  }

  // Sem conexão
  if (code === 'NETWORK_ERROR') {
    Toast.show({ message: t('states.offline'), type: 'error', duration: 8000 });
    return;
  }

  // Erro genérico — mostra no banner do form e também via toast
  const msg = err?.message || t('common.error_generic');
  _showFormError(errorMsg, msg);
  Toast.show({ message: msg, type: 'error' });
}

/** Exibe mensagem de erro no banner inline do formulário. */
function _showFormError(el, message) {
  el.textContent = message;
  el.classList.add('auth-form-error--visible');
}

// ── Renderização da página ───────────────────────────────────────────────────

/**
 * Renderiza a página de cadastro no container fornecido.
 * @param {HTMLElement} container
 * @returns {Object}  refs dos campos (para US01-F3 e US01-F4)
 */
export function renderRegisterPage(container) {
  container.innerHTML = '';

  // ── Layout principal ───────────────────────────────────────────
  const layout = document.createElement('div');
  layout.className = 'auth-layout';

  // ── Painel de branding (esquerdo) ──────────────────────────────
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
      <h2 class="auth-brand__headline">Gestão inteligente de energia para sua empresa</h2>
      <p class="auth-brand__tagline">
        Monitore, analise e reduza o consumo energético com dados em tempo real.
      </p>
      <ul class="auth-brand__features">
        <li>Dashboard de consumo em tempo real</li>
        <li>Alertas automáticos de desperdício</li>
        <li>Relatórios ESG mensais</li>
        <li>Metas e acompanhamento financeiro</li>
      </ul>
    </div>
    <p class="auth-brand__footer">© 2026 ${t('app.name')}. Todos os direitos reservados.</p>
  `;

  // ── Painel do formulário (direito) ─────────────────────────────
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
    <h1 class="auth-form-box__title">${t('auth.register.title')}</h1>
    <p class="auth-form-box__subtitle">${t('auth.register.subtitle')}</p>
  `;

  // ── Formulário ─────────────────────────────────────────────────
  const form = document.createElement('form');
  form.noValidate = true;
  form.setAttribute('aria-label', t('auth.register.title'));

  // Erro global (usado por US01-F4)
  const errorMsg = document.createElement('div');
  errorMsg.className = 'auth-form-error';
  errorMsg.setAttribute('role', 'alert');
  errorMsg.setAttribute('aria-live', 'polite');
  form.appendChild(errorMsg);

  // ── Seção: empresa ─────────────────────────────────────────────
  const secEmpresa = document.createElement('p');
  secEmpresa.className = 'auth-form-section-label';
  secEmpresa.textContent = 'Dados da empresa';
  form.appendChild(secEmpresa);

  const companyName = createInput({
    label: t('auth.register.company_name'),
    name: 'company_name',
    autocomplete: 'organization',
    required: true,
    maxLength: 120,
  });
  form.appendChild(companyName.el);

  const row1 = document.createElement('div');
  row1.className = 'auth-form-row auth-form-row--2col';

  const cnpj = createInput({
    label: t('auth.register.cnpj'),
    name: 'cnpj',
    placeholder: t('auth.register.cnpj_placeholder'),
    required: true,
    maxLength: 18,
  });

  const segment = createSelect({
    label: t('auth.register.segment'),
    name: 'segment',
    placeholder: t('auth.register.segment_placeholder'),
    options: SEGMENT_OPTIONS,
    required: true,
  });

  row1.appendChild(cnpj.el);
  row1.appendChild(segment.el);
  form.appendChild(row1);

  // ── Seção: responsável ─────────────────────────────────────────
  const secResponsavel = document.createElement('p');
  secResponsavel.className = 'auth-form-section-label';
  secResponsavel.textContent = 'Responsável pela conta';
  form.appendChild(secResponsavel);

  const responsibleName = createInput({
    label: t('auth.register.responsible_name'),
    name: 'responsible_name',
    autocomplete: 'name',
    required: true,
    maxLength: 100,
  });
  form.appendChild(responsibleName.el);

  const email = createInput({
    label: t('auth.register.email'),
    type: 'email',
    name: 'email',
    autocomplete: 'email',
    required: true,
  });
  form.appendChild(email.el);

  const row2 = document.createElement('div');
  row2.className = 'auth-form-row auth-form-row--2col';

  const password = createPasswordInput({
    label: t('auth.register.password'),
    name: 'password',
    autocomplete: 'new-password',
    required: true,
    helper: 'Mínimo 8 caracteres com letra, número e símbolo.',
  });

  const passwordConfirm = createPasswordInput({
    label: t('auth.register.password_confirm'),
    name: 'password_confirm',
    autocomplete: 'new-password',
    required: true,
  });

  row2.appendChild(password.el);
  row2.appendChild(passwordConfirm.el);
  form.appendChild(row2);

  // ── Termos de uso ──────────────────────────────────────────────
  const termsWrapper = document.createElement('div');
  termsWrapper.style.marginTop = 'var(--space-5)';

  const termsBox = document.createElement('div');
  termsBox.className = 'auth-terms';

  const termsCheck = createCheckbox({ name: 'terms', value: '1' });

  const termsText = document.createElement('span');
  termsText.className = 'auth-terms__text';

  const termsLinkBtn = document.createElement('button');
  termsLinkBtn.type = 'button';
  termsLinkBtn.className = 'auth-terms__link';
  termsLinkBtn.textContent = t('auth.register.terms_link');
  // US01-F3: substituirá por Modal.openTerms()
  termsLinkBtn.addEventListener('click', () => {
    openTermsModal({
      onAccept: () => {
        termsCheck.setChecked(true);
        // Dispara change para a validação reconhecer o aceite
        termsCheck.input.dispatchEvent(new Event('change'));
      },
    });
  });

  termsText.appendChild(document.createTextNode(`${t('auth.register.terms_accept')} `));
  termsText.appendChild(termsLinkBtn);
  termsText.appendChild(document.createTextNode('.'));

  termsBox.appendChild(termsCheck.el);
  termsBox.appendChild(termsText);

  const termsError = document.createElement('p');
  termsError.className = 'auth-terms__error-msg';
  termsError.setAttribute('role', 'alert');
  termsError.setAttribute('aria-live', 'polite');

  termsWrapper.appendChild(termsBox);
  termsWrapper.appendChild(termsError);
  form.appendChild(termsWrapper);

  // ── Submit ─────────────────────────────────────────────────────
  const submitArea = document.createElement('div');
  submitArea.className = 'auth-submit';

  const submitBtn = createButton({
    label: t('auth.register.submit'),
    variant: 'primary',
    size: 'lg',
    type: 'submit',
  });
  submitArea.appendChild(submitBtn);
  form.appendChild(submitArea);

  // Link "já tenho conta"
  const altLink = document.createElement('p');
  altLink.className = 'auth-alt-link';
  const loginLink = document.createElement('a');
  loginLink.href = '#/login';
  loginLink.textContent = t('auth.login.title');
  altLink.appendChild(document.createTextNode(`${t('auth.register.login_link')}? `));
  altLink.appendChild(loginLink);
  form.appendChild(altLink);

  // ── Conectar validações (US01-F2) ──────────────────────────────
  const fields = { companyName, cnpj, segment, responsibleName, email, password, passwordConfirm };
  const termsRefs = { termsCheck, termsBox, termsError };
  const { runAll } = attachValidation(fields, termsRefs, submitBtn);

  // ── Submit handler (US01-F4) ───────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validação client-side completa
    if (!runAll()) return;

    // 2. Loading
    submitBtn.setLoading(true);
    errorMsg.classList.remove('auth-form-error--visible');

    // 3. Monta payload — CNPJ enviado apenas com dígitos
    const payload = {
      company_name:     fields.companyName.getValue().trim(),
      cnpj:             fields.cnpj.getValue().replace(/\D/g, ''),
      segment:          fields.segment.getValue(),
      responsible_name: fields.responsibleName.getValue().trim(),
      email:            fields.email.getValue().trim().toLowerCase(),
      password:         fields.password.getValue(),
      terms_version:    TERMS_VERSION,
    };

    try {
      await authService.register(payload);

      // 4. Sucesso — navega para login com toast informativo
      Toast.show({ message: t('auth.register.success'), type: 'success', duration: 7000 });
      Router.navigate('/login');

    } catch (err) {
      submitBtn.setLoading(false);
      _handleRegisterError(err, fields, errorMsg);
    }
  });

  // ── Montar DOM ─────────────────────────────────────────────────
  formBox.appendChild(form);
  formPanel.appendChild(formBox);
  layout.appendChild(brand);
  layout.appendChild(formPanel);
  container.appendChild(layout);

  companyName.focus();

  // Retorna refs para US01-F3 e US01-F4
  return { form, fields, termsCheck, termsBox, termsError, submitBtn, errorMsg, runAll };
}
