/**
 * EnergyFlow — Toast component
 *
 * Notificacoes temporarias empilhaveis.
 *
 * Uso:
 *   import { Toast } from './components/Toast.js';
 *   Toast.show({ message: 'Salvo com sucesso', type: 'success' });
 *   Toast.show({ message: 'Erro ao salvar', type: 'error', duration: 8000 });
 */

import Config from '../config.js';

const ICONS = {
  success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

/** @type {Map<string, HTMLElement>} containers por posicao */
const containers = new Map();

function getContainer(position) {
  if (containers.has(position)) return containers.get(position);

  const el = document.createElement('div');
  el.className = `ef-toast-container ef-toast-container--${position}`;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-relevant', 'additions');
  document.body.appendChild(el);
  containers.set(position, el);
  return el;
}

function removeToast(toastEl, container) {
  toastEl.classList.add('ef-toast--exiting');
  toastEl.addEventListener('transitionend', () => {
    toastEl.remove();
    if (container.children.length === 0) {
      container.remove();
      // Find and remove from map
      for (const [key, val] of containers) {
        if (val === container) { containers.delete(key); break; }
      }
    }
  }, { once: true });
}

export const Toast = {
  /**
   * @param {Object} options
   * @param {string}  options.message   - Texto da notificacao
   * @param {string} [options.type]     - success | error | warning | info (default: info)
   * @param {number} [options.duration] - Duracao em ms (default: Config.TOAST_DURATION_MS). 0 = permanente.
   * @param {string} [options.position] - top-right | top-left | bottom-right | bottom-left (default: top-right)
   */
  show({ message, type = 'info', duration = Config.TOAST_DURATION_MS, position = 'top-right' } = {}) {
    const container = getContainer(position);

    const toast = document.createElement('div');
    toast.className = `ef-toast ef-toast--${type}`;
    toast.setAttribute('role', 'status');

    // Icon
    const iconEl = document.createElement('span');
    iconEl.className = 'ef-toast__icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = ICONS[type] || ICONS.info;
    toast.appendChild(iconEl);

    // Content
    const contentEl = document.createElement('span');
    contentEl.className = 'ef-toast__content';
    contentEl.textContent = message;
    toast.appendChild(contentEl);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ef-toast__close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = CLOSE_ICON;
    closeBtn.addEventListener('click', () => removeToast(toast, container));
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) removeToast(toast, container);
      }, duration);
    }

    return toast;
  },

  /** Remove all toasts. */
  clear() {
    for (const [, container] of containers) {
      container.remove();
    }
    containers.clear();
  },
};
