/**
 * LumenFlow — Empty State (Alpine component)
 *
 * Exibe mensagem quando não há dados para mostrar.
 * Uso:
 *   <div x-data="emptyState({
 *     icon: '<svg .../>',
 *     title: 'Nenhum dispositivo',
 *     description: 'Cadastre seu primeiro dispositivo.',
 *     actionLabel: 'Adicionar',
 *     actionHref: '#/devices'
 *   })" x-html="render()"></div>
 */

export function registerEmptyState(Alpine) {
  Alpine.data('emptyState', (config = {}) => ({
    icon: config.icon || '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    title: config.title || 'Nenhum dado encontrado',
    description: config.description || '',
    actionLabel: config.actionLabel || '',
    actionHref: config.actionHref || '',

    get hasAction() {
      return !!this.actionLabel;
    },
  }));
}
