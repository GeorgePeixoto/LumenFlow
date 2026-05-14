/**
 * LumenFlow — Modal component
 *
 * Modal acessivel com focus trap, fecha com ESC, backdrop opcional.
 *
 * Uso:
 *   import { createModal } from './components/Modal.js';
 *   const modal = createModal({
 *     title: 'Novo setor',
 *     content: formElement,
 *     footer: [btnCancel, btnSave],
 *     size: 'md',
 *   });
 *   modal.open();
 *   modal.close();
 */

const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {Object} props
 * @param {string}        props.title           - Titulo do modal
 * @param {HTMLElement|string} [props.content]   - Conteudo (HTMLElement ou string HTML)
 * @param {HTMLElement[]} [props.footer]         - Array de elementos para o footer (botoes)
 * @param {string}        [props.size]           - sm | md | lg (default: md)
 * @param {boolean}       [props.closeOnBackdrop] - Fechar ao clicar no backdrop (default: true)
 * @param {boolean}       [props.closeOnEsc]     - Fechar ao apertar ESC (default: true)
 * @param {Function}      [props.onClose]        - Callback ao fechar
 * @returns {{ el: HTMLElement, open: Function, close: Function, setContent: Function, setTitle: Function }}
 */
export function createModal({
  title = '',
  content = null,
  footer = [],
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  onClose = null,
} = {}) {
  let previouslyFocused = null;

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'ef-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', title);
  backdrop.style.display = 'none';

  // Modal container
  const modal = document.createElement('div');
  modal.className = `ef-modal ef-modal--${size}`;
  backdrop.appendChild(modal);

  // Header
  const header = document.createElement('div');
  header.className = 'ef-modal__header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'ef-modal__title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ef-modal__close';
  closeBtn.setAttribute('aria-label', 'Fechar');
  closeBtn.innerHTML = CLOSE_ICON;
  closeBtn.addEventListener('click', close);
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'ef-modal__body';
  setContent(content);
  modal.appendChild(body);

  // Footer
  const footerEl = document.createElement('div');
  footerEl.className = 'ef-modal__footer';
  if (footer.length > 0) {
    footer.forEach(el => footerEl.appendChild(el));
  } else {
    footerEl.style.display = 'none';
  }
  modal.appendChild(footerEl);

  // --- Backdrop click ---
  backdrop.addEventListener('click', (e) => {
    if (closeOnBackdrop && e.target === backdrop) close();
  });

  // --- ESC handler ---
  function onKeyDown(e) {
    if (e.key === 'Escape' && closeOnEsc) {
      close();
      return;
    }
    // Focus trap
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll(FOCUSABLE);
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function open() {
    previouslyFocused = document.activeElement;
    backdrop.style.display = '';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    // Focus first focusable element inside modal
    requestAnimationFrame(() => {
      const first = modal.querySelector(FOCUSABLE);
      if (first) first.focus();
    });
  }

  function close() {
    backdrop.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);

    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }

    if (onClose) onClose();
  }

  function setContent(c) {
    body.innerHTML = '';
    if (!c) return;
    if (typeof c === 'string') {
      body.innerHTML = c;
    } else {
      body.appendChild(c);
    }
  }

  function setTitle(t) {
    titleEl.textContent = t;
    backdrop.setAttribute('aria-label', t);
  }

  function setFooter(elements) {
    footerEl.innerHTML = '';
    if (elements.length > 0) {
      elements.forEach(el => footerEl.appendChild(el));
      footerEl.style.display = '';
    } else {
      footerEl.style.display = 'none';
    }
  }

  return { el: backdrop, open, close, setContent, setTitle, setFooter };
}
