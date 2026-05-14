/**
 * LumenFlow — GoalProgress component (US12-F3).
 *
 * Barra de progresso grande mostrando consumo atual vs meta,
 * com marcadores de milestone e projeção.
 *
 * Uso:
 *   import { createGoalProgress } from '../components/GoalProgress.js';
 *
 *   const progress = createGoalProgress({
 *     label: 'Consumo do mês',
 *     current: 1200,
 *     target: 2000,
 *     unit: 'kWh',
 *     projection: 1800,
 *     milestoneWarning: 80,
 *     milestoneCritical: 100,
 *   });
 *   container.appendChild(progress.el);
 *   progress.update({ current: 1400, projection: 1900 });
 */

import { t } from '../i18n/pt-BR.js';

function getProgressColor(percent, milestoneWarning, milestoneCritical) {
  if (percent >= milestoneCritical) return 'danger';
  if (percent >= milestoneWarning) return 'warning';
  return 'success';
}

export function createGoalProgress({
  label = '',
  current = 0,
  target = 1,
  unit = 'kWh',
  projection = null,
  milestoneWarning = 80,
  milestoneCritical = 100,
} = {}) {
  const el = document.createElement('div');
  el.className = 'goal-progress-card';

  // Header
  const header = document.createElement('div');
  header.className = 'goal-progress-card__header';
  const labelEl = document.createElement('span');
  labelEl.className = 'goal-progress-card__label';
  labelEl.textContent = label;
  header.appendChild(labelEl);
  const valueEl = document.createElement('span');
  valueEl.className = 'goal-progress-card__value';
  header.appendChild(valueEl);
  el.appendChild(header);

  // Bar container
  const barContainer = document.createElement('div');
  barContainer.className = 'goal-progress-card__bar-container';

  const bar = document.createElement('div');
  bar.className = 'goal-progress-card__bar';
  const fill = document.createElement('div');
  fill.className = 'goal-progress-card__fill';
  bar.appendChild(fill);

  // Milestone markers
  const warningMarker = document.createElement('div');
  warningMarker.className = 'goal-progress-card__marker goal-progress-card__marker--warning';
  warningMarker.style.left = `${Math.min(milestoneWarning, 100)}%`;
  warningMarker.title = `${t('goals.milestone_warning')}: ${milestoneWarning}%`;
  bar.appendChild(warningMarker);

  const criticalMarker = document.createElement('div');
  criticalMarker.className = 'goal-progress-card__marker goal-progress-card__marker--critical';
  criticalMarker.style.left = `${Math.min(milestoneCritical, 100)}%`;
  criticalMarker.title = `${t('goals.milestone_critical')}: ${milestoneCritical}%`;
  bar.appendChild(criticalMarker);

  // Projection marker
  const projMarker = document.createElement('div');
  projMarker.className = 'goal-progress-card__projection';
  bar.appendChild(projMarker);

  barContainer.appendChild(bar);
  el.appendChild(barContainer);

  // Footer: meta info
  const footer = document.createElement('div');
  footer.className = 'goal-progress-card__footer';
  const metaEl = document.createElement('span');
  metaEl.className = 'goal-progress-card__meta';
  footer.appendChild(metaEl);
  const projLabel = document.createElement('span');
  projLabel.className = 'goal-progress-card__proj-label';
  footer.appendChild(projLabel);
  el.appendChild(footer);

  function render(data) {
    const c = data.current ?? current;
    const tgt = data.target ?? target;
    const u = data.unit ?? unit;
    const proj = data.projection ?? projection;

    const percent = tgt > 0 ? (c / tgt) * 100 : 0;
    const clampedPercent = Math.min(percent, 110);
    const color = getProgressColor(percent, milestoneWarning, milestoneCritical);

    valueEl.textContent = `${c.toLocaleString('pt-BR')} / ${tgt.toLocaleString('pt-BR')} ${u}`;

    fill.style.width = `${Math.min(clampedPercent, 100)}%`;
    fill.className = `goal-progress-card__fill goal-progress-card__fill--${color}`;

    metaEl.textContent = `${Math.round(percent)}% ${t('goals.progress').toLowerCase()}`;

    if (proj != null && tgt > 0) {
      const projPercent = (proj / tgt) * 100;
      projMarker.style.left = `${Math.min(projPercent, 100)}%`;
      projMarker.style.display = 'block';
      projLabel.textContent = t('goals.projection_label', { value: `${proj.toLocaleString('pt-BR')} ${u}` });
    } else {
      projMarker.style.display = 'none';
      projLabel.textContent = '';
    }
  }

  render({ current, target, unit, projection });

  function update(data) {
    if ('current' in data) current = data.current;
    if ('target' in data) target = data.target;
    if ('unit' in data) unit = data.unit;
    if ('projection' in data) projection = data.projection;
    render(data);
  }

  return { el, update };
}
