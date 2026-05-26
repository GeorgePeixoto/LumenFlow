/**
 * LumenFlow — Error State (Alpine component)
 *
 * Exibe mensagem de erro com botão de retry.
 * Uso:
 *   <div x-data="errorState({
 *     message: 'Falha ao carregar dados.',
 *     onRetry: () => loadData()
 *   })">
 *     <div x-show="visible" class="text-center p-8">
 *       <div x-html="icon"></div>
 *       <p x-text="message" class="text-gray-600 mt-2"></p>
 *       <button x-show="hasRetry" @click="retry" class="mt-4 ...">Tentar novamente</button>
 *     </div>
 *   </div>
 */

export function registerErrorState(Alpine) {
  Alpine.data('errorState', (config = {}) => ({
    message: config.message || 'Ocorreu um erro ao carregar os dados.',
    icon: config.icon || '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-red-400 mx-auto"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    visible: true,
    retrying: false,
    onRetry: config.onRetry || null,

    get hasRetry() {
      return typeof this.onRetry === 'function';
    },

    async retry() {
      if (!this.onRetry || this.retrying) return;
      this.retrying = true;
      try {
        await this.onRetry();
        this.visible = false;
      } catch (_) {
        // Mantém visível se retry falhar
      } finally {
        this.retrying = false;
      }
    },

    show(message) {
      if (message) this.message = message;
      this.visible = true;
    },

    hide() {
      this.visible = false;
    },
  }));
}
