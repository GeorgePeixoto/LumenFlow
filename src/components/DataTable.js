/**
 * EnergyFlow — DataTable (F2-F6).
 *
 * Tabela genérica com colunas configuráveis, estados de loading/erro/vazio,
 * paginação controlada externamente, ações por linha e colapso mobile para cards.
 *
 * Uso:
 *   import { createDataTable } from './components/DataTable.js';
 *
 *   const table = createDataTable({
 *     columns: [
 *       { key: 'name',    header: 'Nome',   accessor: r => r.name, sortable: true },
 *       { key: 'status',  header: 'Status', render:   r => badgeEl(r.status) },
 *       { key: '_actions',header: '',       render:   r => actionsEl(r), align: 'right' },
 *     ],
 *     rows:     dados,
 *     total:    100,
 *     page:     1,
 *     pageSize: 20,
 *     onPageChange: (p) => loadPage(p),
 *     onSort:       ({ key, dir }) => loadSorted(key, dir),
 *   });
 *   container.appendChild(table.el);
 *
 *   table.setRows(novaLista);
 *   table.setLoading(true);
 *   table.setError('Erro ao carregar dados.', () => reload());
 *   table.setPage(2, novoTotal);
 *
 * Definição de coluna:
 *   key           {string}   — identificador único (usado para sort)
 *   header        {string}   — texto do cabeçalho
 *   accessor      {Function} — (row) => string|number  (alternativa a render)
 *   render        {Function} — (row) => HTMLElement|string  (prioridade sobre accessor)
 *   align         {'left'|'center'|'right'}  default 'left'
 *   sortable      {boolean}  default false
 *   width         {string}   — CSS value opcional (ex: '120px')
 *   hideOnMobile  {boolean}  — oculta o campo no card mobile (default false)
 *
 * @param {Object} props
 * @returns {{ el, setRows, setLoading, setError, setPage }}
 */
import { createEmptyState } from './EmptyState.js';
import { createErrorState } from './ErrorState.js';
import { t }               from '../i18n/pt-BR.js';

// ── Ícones ───────────────────────────────────────────────────────────────────
const ICON_SORT     = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></svg>`;
const ICON_SORT_ASC = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9l5-5 5 5"/></svg>`;
const ICON_SORT_DSC = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15l5 5 5-5"/></svg>`;
const ICON_PREV     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_NEXT     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function cellContent(col, row) {
  if (typeof col.render === 'function') {
    const result = col.render(row);
    if (result instanceof HTMLElement) return result;
    const span = document.createElement('span');
    span.innerHTML = String(result ?? '');
    return span;
  }
  if (typeof col.accessor === 'function') {
    const span = document.createElement('span');
    span.textContent = String(col.accessor(row) ?? '');
    return span;
  }
  return document.createTextNode('');
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createDataTable({
  columns      = [],
  rows         = [],
  loading      = false,
  error        = null,
  empty        = {},
  page         = 1,
  pageSize     = 20,
  total        = 0,
  onPageChange = null,
  onSort       = null,
  skeletonRows = 5,
} = {}) {

  // Estado interno
  let _rows    = rows;
  let _loading = loading;
  let _error   = error;
  let _page    = page;
  let _total   = total;
  let _sortKey = null;
  let _sortDir = 'asc'; // 'asc' | 'desc'
  let _onPageChange = onPageChange;
  let _onSort       = onSort;

  // ── Raiz ─────────────────────────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'dt-wrapper';

  // ── Área de scroll (tabela desktop) ──────────────────────────────
  const scrollEl = document.createElement('div');
  scrollEl.className = 'dt-scroll';

  const tableEl = document.createElement('table');
  tableEl.className = 'dt';
  tableEl.setAttribute('role', 'table');

  // ── Cabeçalho ─────────────────────────────────────────────────────
  const thead = document.createElement('thead');
  thead.className = 'dt__head';
  const headerRow = document.createElement('tr');

  const thEls = columns.map(col => {
    const th = document.createElement('th');
    th.className = 'dt__th';
    th.setAttribute('scope', 'col');
    if (col.align && col.align !== 'left') th.classList.add(`dt__th--${col.align}`);
    if (col.width) th.style.width = col.width;

    if (col.sortable) {
      th.classList.add('dt__th--sortable');
      const btn = document.createElement('button');
      btn.className = 'dt__sort-btn';
      btn.innerHTML = `<span>${col.header}</span>${ICON_SORT}`;
      btn.addEventListener('click', () => handleSort(col.key, th, btn));
      th.appendChild(btn);
    } else {
      th.textContent = col.header;
    }

    headerRow.appendChild(th);
    return { th, col };
  });

  thead.appendChild(headerRow);
  tableEl.appendChild(thead);

  // ── Corpo ─────────────────────────────────────────────────────────
  const tbody = document.createElement('tbody');
  tbody.className = 'dt__body';
  tableEl.appendChild(tbody);

  scrollEl.appendChild(tableEl);
  el.appendChild(scrollEl);

  // ── Cards mobile ──────────────────────────────────────────────────
  const cardsEl = document.createElement('div');
  cardsEl.className = 'dt-cards';
  el.appendChild(cardsEl);

  // ── Paginação ─────────────────────────────────────────────────────
  const paginationEl = document.createElement('div');
  paginationEl.className = 'dt-pagination';

  const paginationInfo = document.createElement('span');
  paginationInfo.className = 'dt-pagination__info';

  const paginationControls = document.createElement('div');
  paginationControls.className = 'dt-pagination__controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'dt-pagination__btn';
  prevBtn.setAttribute('aria-label', t('common.previous'));
  prevBtn.innerHTML = ICON_PREV;
  prevBtn.addEventListener('click', () => {
    if (_page > 1) _onPageChange?.(_page - 1);
  });

  const pageLabel = document.createElement('span');
  pageLabel.className = 'dt-pagination__page';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'dt-pagination__btn';
  nextBtn.setAttribute('aria-label', t('common.next'));
  nextBtn.innerHTML = ICON_NEXT;
  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(_total / pageSize);
    if (_page < totalPages) _onPageChange?.(_page + 1);
  });

  paginationControls.appendChild(prevBtn);
  paginationControls.appendChild(pageLabel);
  paginationControls.appendChild(nextBtn);
  paginationEl.appendChild(paginationInfo);
  paginationEl.appendChild(paginationControls);
  el.appendChild(paginationEl);

  // ── Render helpers ────────────────────────────────────────────────

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(_total / pageSize));
    const from = _total === 0 ? 0 : (_page - 1) * pageSize + 1;
    const to   = Math.min(_page * pageSize, _total);

    paginationInfo.textContent = _total > 0
      ? t('common.showing', { from, to, total: _total })
      : '';

    pageLabel.textContent = t('common.page_of', { page: _page, total: totalPages });
    prevBtn.disabled = _page <= 1;
    nextBtn.disabled = _page >= totalPages;

    paginationEl.hidden = _total <= pageSize && !_loading;
  }

  function skeletonRow() {
    const tr = document.createElement('tr');
    tr.className = 'dt__row dt__row--skeleton';
    columns.forEach(() => {
      const td = document.createElement('td');
      td.className = 'dt__td';
      const skel = document.createElement('span');
      skel.className = 'dt__skeleton';
      td.appendChild(skel);
      tr.appendChild(td);
    });
    return tr;
  }

  function renderBody() {
    tbody.innerHTML = '';
    cardsEl.innerHTML = '';

    // ── Loading ───────────────────────────────────────────────────
    if (_loading) {
      for (let i = 0; i < skeletonRows; i++) tbody.appendChild(skeletonRow());
      // Mobile skeleton cards
      for (let i = 0; i < skeletonRows; i++) {
        const card = document.createElement('div');
        card.className = 'dt-card dt-card--skeleton';
        for (let j = 0; j < Math.min(3, columns.length); j++) {
          const row = document.createElement('div');
          row.className = 'dt-card__row';
          row.innerHTML = `<span class="dt__skeleton dt__skeleton--label"></span><span class="dt__skeleton dt__skeleton--value"></span>`;
          card.appendChild(row);
        }
        cardsEl.appendChild(card);
      }
      return;
    }

    // ── Erro ──────────────────────────────────────────────────────
    if (_error) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columns.length;
      td.className = 'dt__td dt__td--state';
      td.appendChild(createErrorState({ message: _error }));
      tr.appendChild(td);
      tbody.appendChild(tr);

      cardsEl.appendChild(createErrorState({ message: _error }));
      return;
    }

    // ── Vazio ─────────────────────────────────────────────────────
    if (_rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columns.length;
      td.className = 'dt__td dt__td--state';
      td.appendChild(createEmptyState(empty));
      tr.appendChild(td);
      tbody.appendChild(tr);

      cardsEl.appendChild(createEmptyState(empty));
      return;
    }

    // ── Dados ─────────────────────────────────────────────────────
    _rows.forEach(row => {
      // Linha de tabela (desktop)
      const tr = document.createElement('tr');
      tr.className = 'dt__row';

      columns.forEach(col => {
        const td = document.createElement('td');
        td.className = 'dt__td';
        if (col.align && col.align !== 'left') td.classList.add(`dt__td--${col.align}`);
        td.appendChild(cellContent(col, row));
        tr.appendChild(td);
      });

      tbody.appendChild(tr);

      // Card mobile
      const card = document.createElement('div');
      card.className = 'dt-card';

      columns.forEach(col => {
        if (col.hideOnMobile || !col.header) return;
        const cardRow = document.createElement('div');
        cardRow.className = 'dt-card__row';

        const label = document.createElement('span');
        label.className = 'dt-card__label';
        label.textContent = col.header;

        const value = document.createElement('span');
        value.className = 'dt-card__value';
        value.appendChild(cellContent(col, row));

        cardRow.appendChild(label);
        cardRow.appendChild(value);
        card.appendChild(cardRow);
      });

      cardsEl.appendChild(card);
    });
  }

  // ── Sort ──────────────────────────────────────────────────────────

  function handleSort(key, th, btn) {
    // Alterna direção se já estiver ordenado por esta coluna
    if (_sortKey === key) {
      _sortDir = _sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      _sortKey = key;
      _sortDir = 'asc';
    }

    // Atualiza ícones nos headers
    thEls.forEach(({ th: thEl, col }) => {
      thEl.classList.remove('dt__th--sorted-asc', 'dt__th--sorted-desc');
      const b = thEl.querySelector('.dt__sort-btn');
      if (b) b.innerHTML = `<span>${col.header}</span>${ICON_SORT}`;
    });

    th.classList.add(`dt__th--sorted-${_sortDir}`);
    btn.innerHTML = `<span>${columns.find(c => c.key === key)?.header ?? ''}</span>${_sortDir === 'asc' ? ICON_SORT_ASC : ICON_SORT_DSC}`;

    _onSort?.({ key: _sortKey, dir: _sortDir });
  }

  // ── Render inicial ────────────────────────────────────────────────
  renderBody();
  renderPagination();

  // ── API pública ───────────────────────────────────────────────────

  function setRows(newRows) {
    _rows    = newRows ?? [];
    _loading = false;
    _error   = null;
    renderBody();
    renderPagination();
  }

  function setLoading(on) {
    _loading = on;
    if (on) { _error = null; }
    renderBody();
  }

  function setError(msg, onRetry) {
    _error   = msg;
    _loading = false;
    _rows    = [];

    // Substitui o createErrorState com botão de retry
    tbody.innerHTML = '';
    cardsEl.innerHTML = '';

    const errEl = createErrorState({
      message: msg,
      action: (() => {
        if (!onRetry) return null;
        const btn = document.createElement('button');
        btn.className = 'ef-btn ef-btn--secondary ef-btn--sm';
        btn.textContent = t('common.retry');
        btn.addEventListener('click', onRetry);
        return btn;
      })(),
    });

    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.className = 'dt__td dt__td--state';
    td.appendChild(errEl);
    tr.appendChild(td);
    tbody.appendChild(tr);

    cardsEl.appendChild(createErrorState({ message: msg }));
    renderPagination();
  }

  function setPage(newPage, newTotal) {
    _page  = newPage;
    if (newTotal != null) _total = newTotal;
    renderPagination();
  }

  return { el, setRows, setLoading, setError, setPage };
}
