/**
 * LumenFlow - EmptyState component
 *
 * Estado vazio reutilizavel para listas, tabelas e paineis sem dados.
 *
 * Uso:
 *   import { createEmptyState } from './components/EmptyState.js';
 *   container.appendChild(createEmptyState({ title: 'Nenhum setor', description: 'Crie seu primeiro setor.' }));
 */

const DEFAULT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6"/><path d="M9 13h3"/></svg>';

/**
 * @param {Object} props
 * @param {string} [props.icon]        - SVG string opcional
 * @param {string} props.title         - Titulo do estado vazio
 * @param {string} [props.description] - Descricao curta
 * @param {HTMLElement} [props.action] - Acao opcional (ex: botao)
 * @returns {HTMLElement}
 */
export function createEmptyState({
  icon = DEFAULT_ICON,
  title = 'Nenhum dado encontrado',
  description = '',
  action = null,
} = {}) {
  const root = document.createElement('div');
  root.className = 'ef-empty-state';

  const iconEl = document.createElement('div');
  iconEl.className = 'ef-empty-state__icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.innerHTML = icon;
  root.appendChild(iconEl);

  const titleEl = document.createElement('h3');
  titleEl.className = 'ef-empty-state__title';
  titleEl.textContent = title;
  root.appendChild(titleEl);

  if (description) {
    const descriptionEl = document.createElement('p');
    descriptionEl.className = 'ef-empty-state__description';
    descriptionEl.textContent = description;
    root.appendChild(descriptionEl);
  }

  if (action) {
    const actionEl = document.createElement('div');
    actionEl.className = 'ef-empty-state__action';
    actionEl.appendChild(action);
    root.appendChild(actionEl);
  }

  root.el = root;
  return root;
}
