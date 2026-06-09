/**
 * LumenFlow — Register Page (Alpine.js component)
 *
 * Lógica reativa do cadastro: validação progressiva, máscara CNPJ,
 * termos de uso, integração com authService.
 */

import { authService } from '../services/authService.js';
import { sessionService } from '../services/sessionService.js';
import Router from '../utils/router.js';

const SEGMENT_OPTIONS = [
  { value: 'food_wholesale', label: 'Alimentos e Bebidas' },
  { value: 'pharma_wholesale', label: 'Farmacêutico' },
  { value: 'building_wholesale', label: 'Materiais de Construção' },
  { value: 'electronics_wholesale', label: 'Eletroeletrônicos' },
  { value: 'textile_wholesale', label: 'Têxtil e Vestuário' },
  { value: 'chemical_wholesale', label: 'Químico e Petroquímico' },
  { value: 'agro_wholesale', label: 'Agronegócio' },
  { value: 'logistics', label: 'Logística e Distribuição' },
  { value: 'other', label: 'Outro' },
];

export function registerRegisterPage(Alpine) {
  Alpine.data('registerPage', () => ({
    companyName: '',
    cnpj: '',
    segment: '',
    responsibleName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    termsAccepted: false,
    loading: false,
    showPassword: false,
    showPasswordConfirm: false,
    globalError: '',
    cnpjLoading: false,
    lastLookedUpCnpj: '',

    segments: SEGMENT_OPTIONS,

    errors: {
      companyName: '', cnpj: '', segment: '',
      responsibleName: '', email: '',
      password: '', passwordConfirm: '', terms: '',
    },
    touched: {
      companyName: false, cnpj: false, segment: false,
      responsibleName: false, email: false,
      password: false, passwordConfirm: false,
    },

    // ── CNPJ Mask & Lookup ───────────────────────────────────

    onCnpjInput() {
      const d = this.cnpj.replace(/\D/g, '').slice(0, 14);
      if (d.length <= 2) this.cnpj = d;
      else if (d.length <= 5) this.cnpj = `${d.slice(0,2)}.${d.slice(2)}`;
      else if (d.length <= 8) this.cnpj = `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
      else if (d.length <= 12) this.cnpj = `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
      else this.cnpj = `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;

      if (this.touched.cnpj) this.errors.cnpj = this._validateCnpj();

      if (d.length === 14) {
        this.lookupCnpj(d);
      }
    },

    async lookupCnpj(cleanCnpj) {
      if (this.cnpjLoading || this.lastLookedUpCnpj === cleanCnpj) return;
      this.lastLookedUpCnpj = cleanCnpj;
      this.cnpjLoading = true;
      this.errors.cnpj = '';

      try {
        const res = await fetch(`https://open.cnpja.com/office/${cleanCnpj}`);
        if (!res.ok) {
          throw new Error('CNPJ não encontrado');
        }
        const data = await res.json();
        
        const statusText = data?.status?.text;
        if (statusText && statusText.toLowerCase() !== 'ativa') {
          this.errors.cnpj = `CNPJ inativo (Status: ${statusText})`;
          return;
        }

        const officialName = data?.company?.name;
        const alias = data?.alias;
        this.companyName = alias || officialName || this.companyName;
        this.errors.companyName = '';
        this.touched.companyName = true;

        if (data?.mainActivity?.text) {
          const text = data.mainActivity.text.toLowerCase();
          let matchedSegment = '';
          if (text.includes('alimento') || text.includes('bebida') || text.includes('restaurante') || text.includes('supermercado')) matchedSegment = 'food_wholesale';
          else if (text.includes('farma') || text.includes('medicamento') || text.includes('saude') || text.includes('hospital')) matchedSegment = 'pharma_wholesale';
          else if (text.includes('constru') || text.includes('tijolo') || text.includes('cimento') || text.includes('ferrag')) matchedSegment = 'building_wholesale';
          else if (text.includes('eletr') || text.includes('comput') || text.includes('celular') || text.includes('tecnol')) matchedSegment = 'electronics_wholesale';
          else if (text.includes('textil') || text.includes('vestu') || text.includes('roupa') || text.includes('calca')) matchedSegment = 'textile_wholesale';
          else if (text.includes('quimic') || text.includes('petro') || text.includes('plastico')) matchedSegment = 'chemical_wholesale';
          else if (text.includes('agro') || text.includes('fazenda') || text.includes('cultiv') || text.includes('semen') || text.includes('fertil')) matchedSegment = 'agro_wholesale';
          else if (text.includes('logist') || text.includes('transp') || text.includes('distrib') || text.includes('carga')) matchedSegment = 'logistics';
          
          if (matchedSegment) {
            this.segment = matchedSegment;
            this.touched.segment = true;
            this.errors.segment = '';
          }
        }

        this.errors.cnpj = '';
      } catch (err) {
        this.errors.cnpj = 'CNPJ inválido ou não encontrado na Receita Federal.';
      } finally {
        this.cnpjLoading = false;
      }
    },

    // ── Validators ──────────────────────────────────────────

    _required(val) { return val.trim() ? '' : 'Campo obrigatório'; },

    _validateEmail() {
      if (!this.email.trim()) return 'Campo obrigatório';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ? '' : 'E-mail inválido';
    },

    _validateCnpj() {
      const digits = this.cnpj.replace(/\D/g, '');
      if (!digits) return 'Campo obrigatório';
      if (digits.length !== 14) return 'CNPJ deve ter 14 dígitos';
      return '';
    },

    _validatePassword() {
      if (!this.password) return 'Campo obrigatório';
      if (this.password.length < 8) return 'Mínimo 8 caracteres';
      if (!/[a-zA-Z]/.test(this.password)) return 'Deve conter ao menos uma letra';
      if (!/[0-9]/.test(this.password)) return 'Deve conter ao menos um número';
      return '';
    },

    _validatePasswordConfirm() {
      if (!this.passwordConfirm) return 'Campo obrigatório';
      if (this.password !== this.passwordConfirm) return 'Senhas não conferem';
      return '';
    },

    // ── Blur/Input handlers ─────────────────────────────────

    onBlur(field) {
      this.touched[field] = true;
      this._validateField(field);
      if (field === 'cnpj') {
        const clean = this.cnpj.replace(/\D/g, '');
        if (clean.length === 14) {
          this.lookupCnpj(clean);
        }
      }
    },

    onInput(field) {
      if (!this.touched[field]) return;
      this._validateField(field);
      if (field === 'password' && this.touched.passwordConfirm) {
        this.errors.passwordConfirm = this._validatePasswordConfirm();
      }
    },

    _validateField(field) {
      const validators = {
        companyName: () => this._required(this.companyName),
        cnpj: () => this._validateCnpj(),
        segment: () => this.segment ? '' : 'Campo obrigatório',
        responsibleName: () => this._required(this.responsibleName),
        email: () => this._validateEmail(),
        password: () => this._validatePassword(),
        passwordConfirm: () => this._validatePasswordConfirm(),
      };
      this.errors[field] = validators[field]();
    },

    // ── Full validation ─────────────────────────────────────

    runAllValidations() {
      Object.keys(this.touched).forEach(k => { this.touched[k] = true; });
      Object.keys(this.errors).forEach(k => {
        if (k === 'terms') {
          this.errors.terms = this.termsAccepted ? '' : 'Aceite os termos de uso';
        } else {
          this._validateField(k);
        }
      });
      return !Object.values(this.errors).some(Boolean);
    },

    get hasErrors() {
      return Object.values(this.errors).some(Boolean);
    },

    // ── Submit ──────────────────────────────────────────────

    async submit() {
      if (!this.runAllValidations()) return;

      this.loading = true;
      this.globalError = '';

      const payload = {
        company_name: this.companyName.trim(),
        cnpj: this.cnpj.replace(/\D/g, ''),
        segment: this.segment,
        responsible_name: this.responsibleName.trim(),
        email: this.email.trim().toLowerCase(),
        password: this.password,
        password_confirmation: this.passwordConfirm,
      };

      try {
        const response = await authService.register(payload);

        if (response?.user) {
          sessionService.setUser(response.user);
        }

        Alpine.store('toast')?.show('Cadastro realizado com sucesso.', 'success', 7000);
        Router.navigate('/sectors/select');
      } catch (err) {
        this.loading = false;
        this._handleError(err);
      }
    },

    // ── Error handling ──────────────────────────────────────

    _handleError(err) {
      const code = err?.code || '';

      if (code === 'COMPANY_CNPJ_TAKEN') {
        this.errors.cnpj = 'Este CNPJ já está cadastrado.';
        return;
      }
      if (code === 'USER_EMAIL_TAKEN') {
        this.errors.email = 'Este e-mail já está em uso.';
        return;
      }
      if (code === 'VALIDATION_ERROR' && err?.details?.errors) {
        const map = { company_name: 'companyName', cnpj: 'cnpj', segment: 'segment', responsible_name: 'responsibleName', email: 'email', password: 'password' };
        for (const [server, local] of Object.entries(map)) {
          if (err.details.errors[server]) this.errors[local] = err.details.errors[server];
        }
        return;
      }
      if (code === 'NETWORK_ERROR') {
        Alpine.store('toast')?.show('Sem conexão com o servidor.', 'error', 8000);
        return;
      }
      this.globalError = err?.message || 'Ocorreu um erro. Tente novamente.';
    },

    // ── Theme ───────────────────────────────────────────────
    darkMode: localStorage.getItem('ef_theme') === 'dark',
    toggleTheme() {
      this.darkMode = !this.darkMode;
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', this.darkMode);
      localStorage.setItem('ef_theme', theme);
    },
  }));
}
