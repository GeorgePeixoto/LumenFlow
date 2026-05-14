/**
 * EnergyFlow - Spinner component
 *
 * Indicador de loading reutilizavel para telas, tabelas e acoes inline.
 *
 * Uso:
 *   import { createSpinner } from './components/Spinner.js';
 *   container.appendChild(createSpinner({ size: 'md', label: 'Carregando dados' }));
 */

/**
 * @param {Object} props
 * @param {string} [props.size]  - sm | md | lg (default: md)
 * @param {string} [props.label] - Texto acessivel para leitores de tela
 * @returns {HTMLElement}
 */
export function createSpinner({ size = 'md', label = 'Carregando' } = {}) {
  const spinner = document.createElement('span');
  spinner.className = `ef-spinner ef-spinner--${size}`;
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', label);

  // Alias para compatibilidade com padrão { el }
  spinner.el = spinner;

  return spinner;
}
