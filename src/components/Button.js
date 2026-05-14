/**
 * LumenFlow — Button component
 *
 * Uso:
 *   import { createButton } from './components/Button.js';
 *   const btn = createButton({ label: 'Salvar', variant: 'primary', onClick: () => {} });
 *   container.appendChild(btn);
 */

/**
 * @param {Object} props
 * @param {string}   props.label       - Texto do botao
 * @param {string}  [props.variant]    - primary | secondary | ghost | danger (default: primary)
 * @param {string}  [props.size]       - sm | md | lg (default: md)
 * @param {boolean} [props.disabled]   - Desabilitado
 * @param {boolean} [props.loading]    - Estado de loading
 * @param {string}  [props.icon]       - SVG string para icone (inserido antes do label)
 * @param {string}  [props.type]       - Tipo do botao HTML: button | submit | reset (default: button)
 * @param {string}  [props.ariaLabel]  - aria-label customizado
 * @param {Function}[props.onClick]    - Callback de clique
 * @returns {HTMLButtonElement} Elemento com metodos extras: setLoading, setDisabled, setLabel
 */
export function createButton({
  label = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  type = 'button',
  ariaLabel = null,
  onClick = null,
} = {}) {
  const btn = document.createElement('button');
  btn.type = type;
  btn.className = `ef-btn ef-btn--${variant} ef-btn--${size}`;

  if (ariaLabel) {
    btn.setAttribute('aria-label', ariaLabel);
  }

  // --- Render interno ---
  function render() {
    btn.innerHTML = '';

    if (currentLoading) {
      btn.classList.add('ef-btn--loading');
      const spinner = document.createElement('span');
      spinner.className = 'ef-btn__spinner';
      spinner.setAttribute('aria-hidden', 'true');
      btn.appendChild(spinner);
    } else {
      btn.classList.remove('ef-btn--loading');
    }

    if (currentIcon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'ef-btn__icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.innerHTML = currentIcon;
      btn.appendChild(iconEl);
    }

    if (currentLabel) {
      const textEl = document.createElement('span');
      textEl.textContent = currentLabel;
      btn.appendChild(textEl);
    }

    btn.disabled = currentDisabled || currentLoading;

    if (currentLoading) {
      btn.setAttribute('aria-busy', 'true');
    } else {
      btn.removeAttribute('aria-busy');
    }
  }

  // --- Estado interno (closures) ---
  let currentLabel = label;
  let currentLoading = loading;
  let currentDisabled = disabled;
  let currentIcon = icon;

  // --- Event listener ---
  if (onClick) {
    btn.addEventListener('click', (e) => {
      if (!currentDisabled && !currentLoading) {
        onClick(e);
      }
    });
  }

  // --- API publica (metodos no elemento) ---

  /** Ativa/desativa estado de loading. */
  btn.setLoading = (value) => {
    currentLoading = !!value;
    render();
  };

  /** Ativa/desativa disabled. */
  btn.setDisabled = (value) => {
    currentDisabled = !!value;
    render();
  };

  /** Altera o label. */
  btn.setLabel = (value) => {
    currentLabel = value;
    render();
  };

  /** Altera o icone. */
  btn.setIcon = (svgString) => {
    currentIcon = svgString;
    render();
  };

  // Render inicial
  render();

  // Alias para compatibilidade com padrão { el } dos outros componentes
  btn.el = btn;

  return btn;
}
