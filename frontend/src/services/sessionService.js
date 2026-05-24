/**
 * LumenFlow — Session service (US02-F2).
 *
 * Fachada de alto nível sobre httpClient para verificação e controle
 * de sessão. Código da aplicação (guards, rotas, AppShell) deve importar
 * este módulo — nunca httpClient diretamente — para não vazar detalhes
 * de implementação (onde o token está armazenado, como é lido, etc.).
 *
 * Estratégia de armazenamento:
 *   - rememberMe = false → sessionStorage (token de 1h, perdido ao fechar aba)
 *   - rememberMe = true  → localStorage  (token de 30d, persiste entre sessões)
 *   O httpClient já lê o token armazenado na inicialização do módulo,
 *   restaurando a sessão automaticamente a cada reload de página.
 *
 * Uso:
 *   import { sessionService } from '../services/sessionService.js';
 *   if (sessionService.isAuthenticated()) { ... }
 *   sessionService.clear();
 */
import { httpClient } from './httpClient.js';
import Storage        from '../utils/storage.js';
import Config         from '../config.js';

export const sessionService = {

  /**
   * Retorna true se existe um token de sessão ativo em memória.
   * Não valida expiração — a expiração real é verificada pelo backend (401).
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!httpClient.getAuthToken();
  },

  /**
   * Retorna o token atual ou null.
   * @returns {string|null}
   */
  getToken() {
    return httpClient.getAuthToken();
  },

  /**
   * Persiste o token e configura o httpClient para enviá-lo em requisições.
   * @param {string}  token
   * @param {boolean} [remember=false]  - true: localStorage; false: sessionStorage
   */
  persist(token, { remember = false } = {}) {
    httpClient.setAuthToken(token, { remember });
  },

  /**
   * Remove o token da memória e do storage.
   * Deve ser chamado no logout e quando auth:expired é recebido.
   */
  clear() {
    httpClient.clearAuthToken();
  },

  /**
   * Verifica se a sessão foi criada com "Lembre-se de mim".
   * Útil para mostrar ao usuário qual tipo de sessão está ativa.
   * @returns {boolean}
   */
  isRemembered() {
    return (
      Storage.get(Config.REMEMBER_STORAGE_KEY) === '1' ||
      Storage.session.get(Config.REMEMBER_STORAGE_KEY) === '1'
    );
  },

  /**
   * Armazena dados básicos do usuário após login para acesso rápido
   * (nome, empresa) sem nova requisição ao backend.
   * Não armazena dados sensíveis.
   * @param {{ id: string, name: string, email: string, company_name: string }} user
   */
  setUser(user) {
    const store = this.isRemembered() ? Storage : Storage.session;
    store.set('ef_user', {
      id:           user.id,
      name:         user.name,
      email:        user.email,
      company_name: user.company_name,
    });
  },

  /**
   * Retorna dados do usuário em cache ou null.
   * @returns {{ id: string, name: string, email: string, company_name: string }|null}
   */
  getUser() {
    return (
      Storage.get('ef_user') ||
      Storage.session.get('ef_user') ||
      null
    );
  },

  /**
   * Remove dados do usuário em cache.
   */
  clearUser() {
    Storage.remove('ef_user');
    Storage.session.remove('ef_user');
  },

  /**
   * Encerra completamente a sessão (token + dados do usuário).
   */
  destroy() {
    this.clear();
    this.clearUser();
  },
};
