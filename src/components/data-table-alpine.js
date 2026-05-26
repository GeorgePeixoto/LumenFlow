/**
 * LumenFlow — DataTable (Alpine component)
 *
 * Tabela reutilizável com sort, filtros e paginação.
 * Uso:
 *   <div x-data="dataTable({ perPage: 10 })">
 *     <input x-model="search" placeholder="Buscar..." />
 *     <table>
 *       <thead>
 *         <tr>
 *           <th @click="sort('name')" class="cursor-pointer">
 *             Nome <span x-html="sortIcon('name')"></span>
 *           </th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         <template x-for="item in paginated" :key="item.id">
 *           <tr><td x-text="item.name"></td></tr>
 *         </template>
 *       </tbody>
 *     </table>
 *     <div>
 *       <button @click="prevPage" :disabled="page === 1">Anterior</button>
 *       <span x-text="page + ' / ' + totalPages"></span>
 *       <button @click="nextPage" :disabled="page === totalPages">Próxima</button>
 *     </div>
 *   </div>
 */

export function registerDataTable(Alpine) {
  Alpine.data('dataTable', (config = {}) => ({
    items: config.items || [],
    sortBy: config.sortBy || null,
    sortDir: config.sortDir || 'asc',
    page: 1,
    perPage: config.perPage || 10,
    search: '',
    filters: {},

    setItems(items) {
      this.items = items;
      this.page = 1;
    },

    setFilter(key, value) {
      if (value === '' || value === null || value === undefined) {
        delete this.filters[key];
      } else {
        this.filters[key] = value;
      }
      this.page = 1;
    },

    sort(column) {
      if (this.sortBy === column) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = column;
        this.sortDir = 'asc';
      }
      this.page = 1;
    },

    sortIcon(column) {
      if (this.sortBy !== column) return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-30"><polyline points="6 9 12 4 18 9"/><polyline points="6 15 12 20 18 15"/></svg>';
      return this.sortDir === 'asc'
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 15 12 9 18 15"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    },

    get filtered() {
      let result = [...this.items];

      if (this.search.trim()) {
        const term = this.search.toLowerCase().trim();
        result = result.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(term)
          )
        );
      }

      for (const [key, value] of Object.entries(this.filters)) {
        result = result.filter((item) => String(item[key]) === String(value));
      }

      return result;
    },

    get sorted() {
      if (!this.sortBy) return this.filtered;

      return [...this.filtered].sort((a, b) => {
        const aVal = a[this.sortBy] ?? '';
        const bVal = b[this.sortBy] ?? '';

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return this.sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    },

    get paginated() {
      const start = (this.page - 1) * this.perPage;
      return this.sorted.slice(start, start + this.perPage);
    },

    get totalPages() {
      return Math.max(1, Math.ceil(this.sorted.length / this.perPage));
    },

    get totalItems() {
      return this.sorted.length;
    },

    get showingFrom() {
      if (this.totalItems === 0) return 0;
      return (this.page - 1) * this.perPage + 1;
    },

    get showingTo() {
      return Math.min(this.page * this.perPage, this.totalItems);
    },

    goToPage(n) {
      this.page = Math.max(1, Math.min(n, this.totalPages));
    },

    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },

    prevPage() {
      if (this.page > 1) this.page--;
    },

    get isEmpty() {
      return this.items.length === 0;
    },

    get isFiltered() {
      return this.search.trim() !== '' || Object.keys(this.filters).length > 0;
    },

    get noResults() {
      return this.isFiltered && this.sorted.length === 0;
    },
  }));
}
