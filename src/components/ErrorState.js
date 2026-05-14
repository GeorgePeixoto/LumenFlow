/**
 * EnergyFlow - ErrorState component
 *
 * Estado de erro reutilizavel para carregamentos com retry.
 *
 * Uso:
 *   import { createErrorState } from './components/ErrorState.js';
 *   container.appendChild(createErrorState({ message: 'Nao foi possivel carregar.', action: retryButton }));
 */

const DEFAULT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';

/**
 * @param {Object} props
 * @param {string} [props.icon]    - SVG string opcional
 * @param {string} props.message   - Mensagem de erro
 * @param {HTMLElement} [props.action] - Acao opcional (ex: botao retry)
 * @returns {HTMLElement}
 */
export function createErrorState({
  icon = DEFAULT_ICON,
  message = 'Nao foi possivel carregar os dados.',
  action = null,
} = {}) {
  const root = document.createElement('div');
  root.className = 'ef-error-state';
  root.setAttribute('role', 'alert');

  const iconEl = document.createElement('div');
  iconEl.className = 'ef-error-state__icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.innerHTML = icon;
  root.appendChild(iconEl);

  const messageEl = document.createElement('p');
  messageEl.className = 'ef-error-state__message';
  messageEl.textContent = message;
  root.appendChild(messageEl);

  if (action) {
    const actionEl = document.createElement('div');
    actionEl.className = 'ef-error-state__action';
    actionEl.appendChild(action);
    root.appendChild(actionEl);
  }

  root.el = root;
  return root;
}
