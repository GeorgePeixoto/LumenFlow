/**
 * LumenFlow — Confirm Dialog (Alpine component)
 *
 * Diálogo de confirmação reutilizável (usa modal internamente).
 * Uso:
 *   <div x-data="confirmDialog">
 *     <button @click="ask({
 *       title: 'Desativar setor?',
 *       message: 'Os dados históricos serão preservados.',
 *       confirmLabel: 'Desativar',
 *       variant: 'danger',
 *       onConfirm: () => deactivateSector(id)
 *     })">Desativar</button>
 *
 *     <!-- Template do dialog -->
 *     <div x-show="isOpen" x-transition class="fixed inset-0 z-50 flex items-center justify-center">
 *       <div @click="cancel" class="absolute inset-0 bg-black/50"></div>
 *       <div class="relative bg-white rounded-lg p-6 max-w-sm w-full" @click.stop>
 *         <h3 x-text="title" class="text-lg font-semibold"></h3>
 *         <p x-text="message" class="text-gray-600 mt-2"></p>
 *         <div class="flex justify-end gap-3 mt-6">
 *           <button @click="cancel">Cancelar</button>
 *           <button @click="confirm" :class="confirmClass" x-text="confirmLabel"></button>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Ou via evento global:
 *   $dispatch('confirm-dialog', { title: '...', onConfirm: () => {} })
 */

export function registerConfirmDialog(Alpine) {
  Alpine.data('confirmDialog', () => ({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
    processing: false,
    _onConfirm: null,
    _onCancel: null,

    ask({ title, message = '', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm, onCancel } = {}) {
      this.title = title;
      this.message = message;
      this.confirmLabel = confirmLabel;
      this.cancelLabel = cancelLabel;
      this.variant = variant;
      this._onConfirm = onConfirm || null;
      this._onCancel = onCancel || null;
      this.processing = false;
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    },

    async confirm() {
      if (this.processing) return;
      this.processing = true;
      try {
        if (this._onConfirm) await this._onConfirm();
      } finally {
        this.processing = false;
        this._close();
      }
    },

    cancel() {
      if (this._onCancel) this._onCancel();
      this._close();
    },

    _close() {
      this.isOpen = false;
      document.body.style.overflow = '';
    },

    handleKeydown(e) {
      if (e.key === 'Escape' && this.isOpen) this.cancel();
    },

    get confirmClass() {
      const variants = {
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
        primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      };
      return variants[this.variant] || variants.danger;
    },
  }));
}
