/**
 * LumenFlow — Toast (Alpine component)
 *
 * Sistema de notificações toast reativo com Alpine.js.
 * Uso:
 *   <div x-data="toastContainer" class="fixed top-4 right-4 z-50 flex flex-col gap-2">
 *     <template x-for="toast in toasts" :key="toast.id">
 *       <div x-show="toast.visible" x-transition ...>
 *         <span x-text="toast.message"></span>
 *       </div>
 *     </template>
 *   </div>
 *
 * Disparar de qualquer lugar:
 *   Alpine.store('toast').show({ message: 'Salvo!', type: 'success' })
 */
import Config from '../config.js';

let _toastId = 0;

export function registerToastStore(Alpine) {
  Alpine.store('toast', {
    toasts: [],

    show(message, type = 'info', duration = Config.TOAST_DURATION_MS) {
      const id = ++_toastId;
      const toast = { id, message, type, visible: true };
      this.toasts.push(toast);

      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }
    },

    dismiss(id) {
      const toast = this.toasts.find((t) => t.id === id);
      if (toast) toast.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 300);
    },

    success(message, duration) {
      this.show(message, 'success', duration);
    },

    error(message, duration) {
      this.show(message, 'error', duration);
    },

    warning(message, duration) {
      this.show(message, 'warning', duration);
    },

    info(message, duration) {
      this.show(message, 'info', duration);
    },
  });

  Alpine.data('toastContainer', () => ({
    get toasts() {
      return Alpine.store('toast').toasts;
    },

    dismiss(id) {
      Alpine.store('toast').dismiss(id);
    },

    typeClasses(type) {
      const map = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-500 text-gray-900',
        info: 'bg-gray-700 text-white',
      };
      return map[type] || map.info;
    },

    typeIcon(type) {
      const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      };
      return icons[type] || icons.info;
    },
  }));
}
