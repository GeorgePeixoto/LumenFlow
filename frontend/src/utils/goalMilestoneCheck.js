/**
 * LumenFlow — Goal Milestone Check (US12-F4)
 *
 * On dashboard load, checks active goals for milestone crossings
 * and shows toast notifications. Uses sessionStorage to avoid
 * repeating toasts in the same session.
 */
import { goalService } from '../services/goalService.js';
import { Toast } from '../components/Toast.js';
import { t } from '../i18n/pt-BR.js';

const SESSION_KEY = 'ef_milestone_toasts_shown';

function getShownToasts() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function markToastShown(id) {
  const shown = getShownToasts();
  if (!shown.includes(id)) {
    shown.push(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(shown));
  }
}

function getGoalLabel(goal) {
  if (goal.name) return goal.name;
  if (goal.scope === 'sector') return goal.sector_name || t('goals.scope_sector');
  if (goal.scope === 'device') return goal.device_name || t('goals.scope_device');
  return t('goals.scope_company');
}

/**
 * Checks active goals for milestone crossings and shows toasts.
 * Should be called once on dashboard load.
 */
export async function checkGoalMilestones() {
  try {
    const response = await goalService.list({ status: 'active' });
    const goals = response?.goals || response?.data || response || [];
    const shown = getShownToasts();

    for (const goal of goals) {
      const progress = goal.progress ?? ((goal.current_value ?? 0) / (goal.value || 1)) * 100;
      const warningThreshold = goal.milestone_warning ?? 80;
      const criticalThreshold = goal.milestone_critical ?? 100;
      const label = getGoalLabel(goal);

      // Check critical milestone first (higher priority)
      const criticalKey = `goal_${goal.id}_critical`;
      if (progress >= criticalThreshold && !shown.includes(criticalKey)) {
        Toast.show({
          message: t('goals.milestone_toast', { name: label, percent: Math.round(progress) }),
          type: 'error',
          duration: 8000,
        });
        markToastShown(criticalKey);
        continue;
      }

      // Check warning milestone
      const warningKey = `goal_${goal.id}_warning`;
      if (progress >= warningThreshold && progress < criticalThreshold && !shown.includes(warningKey)) {
        Toast.show({
          message: t('goals.milestone_toast', { name: label, percent: Math.round(progress) }),
          type: 'warning',
          duration: 6000,
        });
        markToastShown(warningKey);
      }
    }
  } catch (_) {
    // Silently fail — milestone check is non-critical
  }
}
