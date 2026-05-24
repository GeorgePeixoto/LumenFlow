/**
 * LumenFlow — ConfirmDialog component
 *
 * Variante de Modal para confirmacoes destrutivas.
 * Retorna Promise<boolean>.
 *
 * Uso:
 *   import { confirm } from './components/ConfirmDialog.js';
 *   const ok = await confirm({
 *     title: 'Desativar setor',
 *     message: 'Dados historicos serao preservados. Deseja continuar?',
 *   });
 *   if (ok) { ... }
 */

import { createModal } from './Modal.js';
import { createButton } from './Button.js';

/**
 * @param {Object} options
 * @param {string}  options.title        - Titulo do dialog
 * @param {string}  options.message      - Mensagem explicativa
 * @param {string} [options.confirmText] - Texto do botao de confirmar (default: 'Confirmar')
 * @param {string} [options.cancelText]  - Texto do botao de cancelar (default: 'Cancelar')
 * @param {string} [options.variant]     - Variante do botao de confirmar: danger | primary (default: danger)
 * @returns {Promise<boolean>}
 */
export function confirm({
  title = 'Confirmar',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
} = {}) {
  return new Promise((resolve) => {
    const msgEl = document.createElement('p');
    msgEl.textContent = message;

    const cancelBtn = createButton({
      label: cancelText,
      variant: 'ghost',
      onClick: () => { modal.close(); cleanup(false); },
    });

    const confirmBtn = createButton({
      label: confirmText,
      variant,
      onClick: () => { modal.close(); cleanup(true); },
    });

    const modal = createModal({
      title,
      content: msgEl,
      footer: [cancelBtn, confirmBtn],
      size: 'sm',
      closeOnBackdrop: false,
      onClose: () => cleanup(false),
    });

    let resolved = false;
    function cleanup(value) {
      if (resolved) return;
      resolved = true;
      modal.el.remove();
      resolve(value);
    }

    document.body.appendChild(modal.el);
    modal.open();
  });
}
