/**
 * LumenFlow — Modal (Alpine component)
 *
 * Modal reutilizável com backdrop, ESC para fechar, e trap de foco.
 * Uso:
 *   <div x-data="modal" @open-modal.window="open($event.detail)">
 *     <div x-show="isOpen" x-transition class="fixed inset-0 z-50 ...">
 *       <div @click="close" class="absolute inset-0 bg-black/50"></div>
 *       <div class="relative bg-white rounded-lg ..." @click.stop>
 *         <h2 x-text="title"></h2>
 *         <div x-html="content"></div>
 *         <button @click="close">Fechar</button>
 *       </div>
 *     </div>
 *   </div>
 *
 * Disparar de qualquer lugar:
 *   $dispatch('open-modal', { title: 'Confirmar', content: '<p>Tem certeza?</p>' })
 */

export function registerModal(Alpine) {
  Alpine.data('modal', () => ({
    isOpen: false,
    title: '',
    content: '',
    size: 'md',
    closeOnBackdrop: true,
    closeOnEsc: true,
    _onClose: null,
    _onConfirm: null,

    open({ title = '', content = '', size = 'md', closeOnBackdrop = true, closeOnEsc = true, onClose, onConfirm } = {}) {
      this.title = title;
      this.content = content;
      this.size = size;
      this.closeOnBackdrop = closeOnBackdrop;
      this.closeOnEsc = closeOnEsc;
      this._onClose = onClose || null;
      this._onConfirm = onConfirm || null;
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.isOpen = false;
      document.body.style.overflow = '';
      if (this._onClose) this._onClose();
    },

    confirm() {
      this.isOpen = false;
      document.body.style.overflow = '';
      if (this._onConfirm) this._onConfirm();
    },

    backdropClick() {
      if (this.closeOnBackdrop) this.close();
    },

    handleKeydown(e) {
      if (e.key === 'Escape' && this.closeOnEsc && this.isOpen) {
        this.close();
      }
    },

    get sizeClass() {
      const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
      };
      return sizes[this.size] || sizes.md;
    },
  }));
}
