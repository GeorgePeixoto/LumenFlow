/**
 * LumenFlow — KpiCard (F2-F4).
 *
 * Card de métrica reutilizável para o dashboard e páginas de relatório.
 *
 * Uso:
 *   import { createKpiCard } from './components/KpiCard.js';
 *
 *   const card = createKpiCard({
 *     title:          'Consumo do mês',
 *     value:          '1.234',
 *     unit:           'kWh',
 *     variation:      -5.2,            // % positivo = sobe, negativo = desce
 *     variationLabel: 'vs. mês ant.',
 *     icon:           '<svg>...</svg>', // opcional
 *     href:           '#/financial',    // opcional — exibe "Ver detalhes"
 *     loading:        false,            // skeleton quando true
 *     positiveIsGood: false,           // false = subir é ruim (consumo, custo)
 *   });
 *   container.appendChild(card.el);
 *
 *   // Atualiza sem re-renderizar o DOM inteiro:
 *   card.update({ value: '1.100', variation: -3.1 });
 *   card.setLoading(true);
 *
 * @param {Object}  props
 * @param {string}  props.title
 * @param {string|number} [props.value]
 * @param {string}  [props.unit]
 * @param {number}  [props.variation]        número (pode ser decimal)
 * @param {string}  [props.variationLabel]
 * @param {string}  [props.icon]             SVG string
 * @param {string}  [props.href]             hash URL
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.positiveIsGood=true]
 * @returns {{ el: HTMLElement, update: Function, setLoading: Function }}
 */

// ── Ícones de tendência ──────────────────────────────────────────────────────
const ICON_TREND_UP   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
const ICON_TREND_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determina a classe de cor da variação.
 * @param {number}  variation
 * @param {boolean} positiveIsGood
 * @returns {'up-good'|'up-bad'|'down-good'|'down-bad'|'neutral'}
 */
function variationClass(variation, positiveIsGood) {
  if (variation === 0 || variation == null) return 'neutral';
  const isUp = variation > 0;
  if (isUp) return positiveIsGood ? 'up-good'   : 'up-bad';
  return        positiveIsGood ? 'down-bad'  : 'down-good';
}

function formatVariation(variation) {
  if (variation == null) return '';
  const abs = Math.abs(variation);
  const sign = variation > 0 ? '+' : variation < 0 ? '−' : '';
  return `${sign}${abs.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createKpiCard({
  title          = '',
  value          = '—',
  unit           = '',
  variation      = null,
  variationLabel = '',
  icon           = '',
  href           = '',
  loading        = false,
  positiveIsGood = true,
} = {}) {

  // ── Raiz ─────────────────────────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'kpi-card';
  if (loading) el.classList.add('kpi-card--loading');

  // ── Header: título + ícone ────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'kpi-card__header';

  const titleEl = document.createElement('span');
  titleEl.className = 'kpi-card__title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  if (icon) {
    const iconEl = document.createElement('span');
    iconEl.className = 'kpi-card__icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = icon;
    header.appendChild(iconEl);
  }

  el.appendChild(header);

  // ── Valor principal ───────────────────────────────────────────────
  const valueRow = document.createElement('div');
  valueRow.className = 'kpi-card__value-row';

  const valueEl = document.createElement('span');
  valueEl.className = 'kpi-card__value';
  valueEl.textContent = String(value);
  valueRow.appendChild(valueEl);

  if (unit) {
    const unitEl = document.createElement('span');
    unitEl.className = 'kpi-card__unit';
    unitEl.textContent = unit;
    valueRow.appendChild(unitEl);
  }

  el.appendChild(valueRow);

  // ── Rodapé: variação + link ───────────────────────────────────────
  const footer = document.createElement('div');
  footer.className = 'kpi-card__footer';

  // Variação
  const variationEl = document.createElement('span');
  variationEl.className = 'kpi-card__variation';
  footer.appendChild(variationEl);

  // Label da variação
  const varLabelEl = document.createElement('span');
  varLabelEl.className = 'kpi-card__variation-label';
  varLabelEl.textContent = variationLabel;
  footer.appendChild(varLabelEl);

  // Link "Ver detalhes"
  const linkEl = document.createElement('a');
  linkEl.className = 'kpi-card__link';
  linkEl.textContent = 'Ver detalhes';
  linkEl.hidden = !href;
  if (href) linkEl.href = href;
  footer.appendChild(linkEl);

  el.appendChild(footer);

  // ── Aplica variação inicial ───────────────────────────────────────
  applyVariation(variation, positiveIsGood);

  // ── Helpers internos ─────────────────────────────────────────────

  function applyVariation(v, pig) {
    const cls = variationClass(v, pig);
    variationEl.className = `kpi-card__variation kpi-card__variation--${cls}`;

    if (v == null) {
      variationEl.innerHTML = '';
    } else {
      const arrow = v > 0 ? ICON_TREND_UP : v < 0 ? ICON_TREND_DOWN : '';
      variationEl.innerHTML = `${arrow}<span>${formatVariation(v)}</span>`;
    }
  }

  // ── API pública ───────────────────────────────────────────────────

  /**
   * Atualiza um subconjunto de props sem re-renderizar o card inteiro.
   * @param {Partial<typeof props>} newProps
   */
  function update(newProps = {}) {
    if ('value' in newProps)    valueEl.textContent = String(newProps.value);
    if ('unit'  in newProps && unit !== newProps.unit) {
      // unit só aparece se for não-vazio; simplificamos apenas atualizando texto
      const u = el.querySelector('.kpi-card__unit');
      if (u) u.textContent = newProps.unit;
    }
    if ('variationLabel' in newProps) varLabelEl.textContent = newProps.variationLabel;
    if ('href' in newProps) {
      linkEl.href   = newProps.href || '';
      linkEl.hidden = !newProps.href;
    }

    const newVariation      = 'variation'      in newProps ? newProps.variation      : variation;
    const newPosIsGood      = 'positiveIsGood' in newProps ? newProps.positiveIsGood : positiveIsGood;
    applyVariation(newVariation, newPosIsGood);

    // Persiste para próximas chamadas a update()
    if ('variation'      in newProps) variation      = newProps.variation;
    if ('positiveIsGood' in newProps) positiveIsGood = newProps.positiveIsGood;
  }

  /**
   * Ativa / desativa o estado de loading (skeleton).
   * @param {boolean} on
   */
  function setLoading(on) {
    el.classList.toggle('kpi-card--loading', on);
  }

  return { el, update, setLoading };
}
