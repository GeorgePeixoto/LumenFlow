import { t } from '../i18n/pt-BR.js';
import { createPageHeader } from '../components/PageHeader.js';
import { createKpiCard } from '../components/KpiCard.js';
import { createSpinner } from '../components/Spinner.js';
import { createEmptyState } from '../components/EmptyState.js';
import { createButton } from '../components/Button.js';
import { Toast } from '../components/Toast.js';
import { sectorService } from '../services/sectorService.js';
import { deviceService } from '../services/deviceService.js';
import { alertService } from '../services/alertService.js';
import { formatKwh } from '../utils/formatters.js';
import Router from '../utils/router.js';

const ICON_BOLT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
const ICON_DEVICE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
const ICON_BELL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
const ICON_TARGET = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;

export function renderSectorDashboardPage(content, { id }) {
  content.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'sector-dashboard';
  content.appendChild(wrapper);

  async function load() {
    wrapper.innerHTML = '';
    const spinner = createSpinner();
    wrapper.appendChild(spinner);

    try {
      const sectorRes = await sectorService.list({ active: true });
      const sectors = sectorRes?.sectors || [];
      const sector = sectors.find(s => s.id === id);

      wrapper.innerHTML = '';

      if (!sector) {
        const empty = createEmptyState({
          title: t('sector_dashboard.not_found'),
          action: { label: t('sector_dashboard.back_to_sectors'), onClick: () => Router.navigate('/sectors/select') },
        });
        wrapper.appendChild(empty);
        return;
      }

      const { el: headerEl } = createPageHeader({
        title: sector.name,
        description: t('sector_dashboard.subtitle'),
        breadcrumb: [
          { label: t('sector_select.title'), href: '#/sectors/select' },
          { label: sector.name },
        ],
      });
      wrapper.appendChild(headerEl);

      const kpiGrid = document.createElement('div');
      kpiGrid.className = 'kpi-grid';
      wrapper.appendChild(kpiGrid);

      const devicesRes = await deviceService.list();
      const devices = (devicesRes?.devices || []).filter(d => d.sector_id === id && d.active);

      const kpis = {
        devices: createKpiCard({ title: t('sector_dashboard.kpi_devices'), icon: ICON_DEVICE, value: devices.length }),
        alerts: createKpiCard({ title: t('sector_dashboard.kpi_alerts'), icon: ICON_BELL, value: '—', loading: false }),
        threshold: createKpiCard({
          title: t('sector_dashboard.kpi_threshold'),
          icon: ICON_TARGET,
          value: sector.threshold_red ? `${sector.threshold_red} kWh` : '—',
        }),
      };

      Object.values(kpis).forEach(k => kpiGrid.appendChild(k.el));

      // Devices list
      const devSection = document.createElement('section');
      devSection.className = 'dashboard-section';
      devSection.innerHTML = `<h3>${t('sector_dashboard.devices_title')}</h3>`;

      if (!devices.length) {
        const p = document.createElement('p');
        p.className = 'text-muted';
        p.textContent = t('sector_dashboard.no_devices');
        devSection.appendChild(p);
      } else {
        const list = document.createElement('ul');
        list.className = 'sector-dashboard__device-list';
        devices.forEach(d => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="#/devices/${d.id}">${d.name}</a>`;
          list.appendChild(li);
        });
        devSection.appendChild(list);
      }

      wrapper.appendChild(devSection);

    } catch (err) {
      wrapper.innerHTML = '';
      Toast.show({ message: t('common.error_generic'), type: 'error' });
      const backBtn = createButton({
        label: t('sector_dashboard.back_to_sectors'),
        variant: 'secondary',
        onClick: () => Router.navigate('/sectors/select'),
      });
      wrapper.appendChild(backBtn);
    }
  }

  load();
}
