/**
 * LumenFlow — KPI Card (Alpine component)
 *
 * Card de indicador chave com valor, variação, ícone e loading state.
 * Uso:
 *   <div x-data="kpiCard({
 *     title: 'Consumo Mensal',
 *     value: '1.250,00',
 *     unit: 'kWh',
 *     variation: -0.05,
 *     icon: '<svg .../>',
 *     loading: false,
 *     href: '#/financial'
 *   })">
 *     ...
 *   </div>
 */

export function registerKpiCard(Alpine) {
  Alpine.data('kpiCard', (config = {}) => ({
    title: config.title || '',
    value: config.value || '—',
    unit: config.unit || '',
    variation: config.variation ?? null,
    icon: config.icon || '',
    loading: config.loading ?? false,
    href: config.href || null,
    positiveIsGood: config.positiveIsGood ?? false,

    update(data) {
      if (data.value !== undefined) this.value = data.value;
      if (data.variation !== undefined) this.variation = data.variation;
      if (data.loading !== undefined) this.loading = data.loading;
    },

    get variationText() {
      if (this.variation === null || this.variation === undefined) return '';
      const sign = this.variation > 0 ? '+' : '';
      return `${sign}${(this.variation * 100).toFixed(1)}%`;
    },

    get variationClass() {
      if (this.variation === null || this.variation === 0) return 'text-gray-500';
      const isPositive = this.variation > 0;
      if (this.positiveIsGood) {
        return isPositive ? 'text-green-600' : 'text-red-600';
      }
      return isPositive ? 'text-red-600' : 'text-green-600';
    },

    get variationIcon() {
      if (this.variation === null || this.variation === 0) return '';
      return this.variation > 0
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    },
  }));
}
