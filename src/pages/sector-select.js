import { t } from '../i18n/pt-BR.js';
import { createButton } from '../components/Button.js';
import { createSpinner } from '../components/Spinner.js';
import { createEmptyState } from '../components/EmptyState.js';
import { Toast } from '../components/Toast.js';
import { sessionService } from '../services/sessionService.js';
import { sectorService } from '../services/sectorService.js';
import Router from '../utils/router.js';

export function renderSectorSelectPage(container) {
  container.innerHTML = '';

  const user = sessionService.getUser();

  const page = document.createElement('div');
  page.className = 'sector-select';

  page.innerHTML = `
    <div class="sector-select__header">
      <div class="sector-select__logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>${t('app.name')}</span>
      </div>
      <h1 class="sector-select__title">${t('sector_select.title')}</h1>
      <p class="sector-select__subtitle">${t('sector_select.subtitle', { name: user?.name || '' })}</p>
    </div>
    <div class="sector-select__grid" id="sector-select-grid"></div>
  `;

  container.appendChild(page);

  const grid = page.querySelector('#sector-select-grid');

  async function load() {
    grid.innerHTML = '';
    const spinner = createSpinner();
    grid.appendChild(spinner);

    try {
      const response = await sectorService.list({ active: true });
      const sectors = response?.sectors || [];
      grid.innerHTML = '';

      if (!sectors.length) {
        const empty = createEmptyState({
          title: t('sector_select.empty'),
          action: { label: t('nav.sectors'), onClick: () => Router.navigate('/sectors') },
        });
        grid.appendChild(empty);
        return;
      }

      sectors.forEach((sector) => {
        const card = document.createElement('button');
        card.className = 'sector-select__card';
        card.type = 'button';
        card.innerHTML = `
          <span class="sector-select__card-name">${sector.name}</span>
          ${sector.description ? `<span class="sector-select__card-desc">${sector.description}</span>` : ''}
        `;
        card.addEventListener('click', () => {
          Router.navigate('/dashboard');
        });
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = '';
      Toast.show({ message: t('common.error_generic'), type: 'error' });
    }
  }

  load();
}
