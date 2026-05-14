/**
 * EnergyFlow — Wrapper seguro sobre localStorage/sessionStorage.
 *
 * Motivação: acesso direto ao storage pode lançar exceções (modo privado em
 * alguns browsers, storage cheio, políticas de segurança). Este wrapper
 * captura esses erros e retorna valores padrão silenciosamente.
 *
 * IMPORTANTE: não armazenar dados sensíveis de autenticação aqui se o
 * backend usar cookies httpOnly. O projeto usa JWT stateless com token
 * gerenciado pelo httpClient — uso de localStorage é apenas para
 * preferências não-sensíveis (ex: tema, período selecionado).
 *
 * Uso:
 *   import Storage from './storage.js';
 *   Storage.set('theme', 'dark');
 *   Storage.get('theme', 'light')  => 'dark'
 *   Storage.remove('theme');
 *   Storage.session.set('draft', { id: 1 });
 */

function createStorage(store) {
  return {
    /**
     * Persiste um valor serializado em JSON.
     * @param {string} key
     * @param {*} value
     * @returns {boolean}  true se gravou com sucesso
     */
    set(key, value) {
      try {
        store.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        console.warn(`[Storage] Falha ao salvar "${key}"`);
        return false;
      }
    },

    /**
     * Recupera e desserializa um valor.
     * @param {string} key
     * @param {*} [defaultValue=null]
     * @returns {*}
     */
    get(key, defaultValue = null) {
      try {
        const raw = store.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
      } catch {
        return defaultValue;
      }
    },

    /**
     * Remove uma chave.
     * @param {string} key
     */
    remove(key) {
      try {
        store.removeItem(key);
      } catch {
        // ignora
      }
    },

    /**
     * Remove todas as chaves que começam com o prefixo fornecido.
     * @param {string} prefix
     */
    removeByPrefix(prefix) {
      try {
        Object.keys(store)
          .filter(k => k.startsWith(prefix))
          .forEach(k => store.removeItem(k));
      } catch {
        // ignora
      }
    },

    /**
     * Limpa todo o storage (use com cautela).
     */
    clear() {
      try {
        store.clear();
      } catch {
        // ignora
      }
    },

    /**
     * Verifica se uma chave existe.
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
      try {
        return store.getItem(key) !== null;
      } catch {
        return false;
      }
    },
  };
}

const Storage = {
  /** Wrapper sobre localStorage (persiste entre sessões). */
  ...createStorage(localStorage),

  /** Wrapper sobre sessionStorage (limpo ao fechar a aba). */
  session: createStorage(sessionStorage),
};

export default Storage;
