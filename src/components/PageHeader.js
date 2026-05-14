/**
 * EnergyFlow — PageHeader (F2-F5).
 *
 * Cabeçalho padrão de toda página interna: breadcrumb, título,
 * descrição e área de ações (botões à direita).
 *
 * O CSS vem de `styles/components/page-header.css` (criado em F2-F3).
 *
 * Uso:
 *   import { createPageHeader } from './components/PageHeader.js';
 *
 *   const header = createPageHeader({
 *     title:       'Setores',
 *     description: 'Gerencie os setores da empresa.',  // opcional
 *     breadcrumb: [
 *       { label: 'Dashboard', href: '#/dashboard' },
 *       { label: 'Setores' },   // último item: sem href = página atual
 *     ],
 *     actions: [btnNovoSetor],  // HTMLElements opcionais à direita do título
 *   });
 *
 *   content.appendChild(header.el);
 *
 *   // Troca o título em runtime (ex: modo edição):
 *   header.setTitle('Editar setor');
 *
 *   // Substitui os botões de ação:
 *   header.setActions([btnSalvar, btnCancelar]);
 *
 * @param {Object}        props
 * @param {string}        props.title
 * @param {string}        [props.description]
 * @param {Array<{label:string, href?:string}>} [props.breadcrumb]
 * @param {HTMLElement[]} [props.actions]
 * @returns {{ el: HTMLElement, setTitle: Function, setActions: Function }}
 */
export function createPageHeader({
  title       = '',
  description = '',
  breadcrumb  = [],
  actions     = [],
} = {}) {

  // ── Raiz ─────────────────────────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'page-header';

  // ── Breadcrumb ────────────────────────────────────────────────────
  if (breadcrumb.length > 0) {
    const nav = document.createElement('nav');
    nav.className = 'page-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');

    breadcrumb.forEach((item, i) => {
      const span = document.createElement('span');
      span.className = 'page-breadcrumb__item';

      if (item.href) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        span.appendChild(a);
      } else {
        // Último item — página atual
        span.textContent = item.label;
        if (i === breadcrumb.length - 1) {
          span.setAttribute('aria-current', 'page');
        }
      }

      nav.appendChild(span);
    });

    el.appendChild(nav);
  }

  // ── Linha de título + ações ───────────────────────────────────────
  const titleRow = document.createElement('div');
  titleRow.className = 'page-header__title-row';

  const titleEl = document.createElement('h1');
  titleEl.className = 'page-header__title';
  titleEl.textContent = title;
  titleRow.appendChild(titleEl);

  const actionsEl = document.createElement('div');
  actionsEl.className = 'page-header__actions';
  actions.forEach(a => actionsEl.appendChild(a));
  titleRow.appendChild(actionsEl);

  el.appendChild(titleRow);

  // ── Descrição ─────────────────────────────────────────────────────
  let descEl = null;
  if (description) {
    descEl = document.createElement('p');
    descEl.className = 'page-header__desc';
    descEl.textContent = description;
    el.appendChild(descEl);
  }

  // ── API pública ───────────────────────────────────────────────────

  /** Atualiza o título. */
  function setTitle(newTitle) {
    titleEl.textContent = newTitle;
  }

  /**
   * Substitui os elementos na área de ações.
   * @param {HTMLElement[]} newActions
   */
  function setActions(newActions = []) {
    actionsEl.innerHTML = '';
    newActions.forEach(a => actionsEl.appendChild(a));
  }

  return { el, setTitle, setActions };
}
