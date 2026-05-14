/**
 * EnergyFlow — Mock Handler (Demo Mode).
 *
 * Mapeia endpoints da API para respostas mock.
 * Rotas de dashboard e setores buscam dados reais do Firebase RTDB.
 * Demais rotas retornam dados do mockData.js.
 */

import {
  MOCK_USER, MOCK_TOKEN,
  MOCK_SECTORS, MOCK_DEVICES, MOCK_KPIS,
  MOCK_CONSUMPTION_30D, MOCK_TOP_SECTORS,
  MOCK_ALERTS, MOCK_GOALS,
  MOCK_BUSINESS_HOURS,
  MOCK_FINANCIAL_SUMMARY, MOCK_FINANCIAL_DAILY, MOCK_FINANCIAL_RANKING,
  MOCK_TARIFFS,
  getMockAnomalies, getMockMaintenance, getMockReadings,
} from './mockData.js';
import { firebaseRTDB } from '../services/firebaseRealtimeService.js';

// ── Firebase helpers ─────────────────────────────────────────────────────────

let _lastCostTimestamp = JSON.parse(localStorage.getItem('ef_last_cost_ts') || 'null');
let _accumulatedCost = JSON.parse(localStorage.getItem('ef_accumulated_cost') || '0');
let _accumulatedKwh = JSON.parse(localStorage.getItem('ef_accumulated_kwh') || '0');

function _persistAccumulated() {
  localStorage.setItem('ef_last_cost_ts', JSON.stringify(_lastCostTimestamp));
  localStorage.setItem('ef_accumulated_cost', JSON.stringify(_accumulatedCost));
  localStorage.setItem('ef_accumulated_kwh', JSON.stringify(_accumulatedKwh));
}

async function getFirebaseSectors() {
  const data = await firebaseRTDB.get('sensores');
  if (!data) return null;
  return Object.entries(data).map(([key, val]) => ({
    id: key,
    name: val.nome || key,
    active: true,
    current_consumption: val.potencia || 0,
    energy_kwh: val.energia_kwh || 0,
    corrente: val.corrente || 0,
    tensao: val.tensao || 0,
    fator_pf: val.fator_pf || 0,
    threshold_yellow: null,
    threshold_red: null,
    last_reading_at: new Date().toISOString(),
  }));
}

async function getFirebaseKpis() {
  const live = await firebaseRTDB.get('dashboard/readings/live');
  if (!live) return null;
  const sensores = await firebaseRTDB.get('sensores');
  const activeDevices = sensores ? Object.keys(sensores).length : 0;

  const currentTimestamp = live.timestamp;
  const currentCost = live.estimativaCusto_R || 0;
  const currentKwh = live.totalEnergy_kWh || 0;

  if (_lastCostTimestamp !== null && currentTimestamp !== _lastCostTimestamp) {
    _accumulatedCost += currentCost;
    _accumulatedKwh += currentKwh;
  } else if (_lastCostTimestamp === null) {
    _accumulatedCost = currentCost;
    _accumulatedKwh = currentKwh;
  }
  _lastCostTimestamp = currentTimestamp;
  _persistAccumulated();

  return {
    consumption_kwh: _accumulatedKwh,
    consumption_variation: 0,
    estimated_cost: _accumulatedCost,
    cost_variation: 0,
    total_power_w: live.totalPower_W || 0,
    open_alerts: 0,
    active_devices: activeDevices,
  };
}

async function getFirebaseTopSectors() {
  const data = await firebaseRTDB.get('sensores');
  if (!data) return null;
  const sectors = Object.entries(data)
    .map(([, val]) => ({ name: val.nome, consumption_kwh: val.energia_kwh || 0 }))
    .sort((a, b) => b.consumption_kwh - a.consumption_kwh);
  return { sectors };
}

function generateConsumptionFromLive(totalKwh) {
  const labels = [];
  const values = [];
  const days = 30;
  const dailyAvg = totalKwh / 30;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().split('T')[0]);
    const variation = (Math.random() - 0.5) * dailyAvg * 0.4;
    values.push(Math.round((dailyAvg + variation) * 100) / 100);
  }
  return { labels, values };
}

/**
 * Resolve uma requisição mock baseada no método e endpoint.
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {string} url - URL completa ou path
 * @param {Object} [body] - corpo da requisição (POST/PUT)
 * @returns {Promise<*>} resposta mock ou null se não encontrou rota
 */
export async function handleMockRequest(method, url, body) {
  const path = extractPath(url);

  // ── Auth ────────────────────────────────────────────────────────
  if (method === 'POST' && matches(path, '/auth/login')) {
    return { token: MOCK_TOKEN, user: MOCK_USER };
  }
  if (method === 'POST' && matches(path, '/auth/register')) {
    return { token: MOCK_TOKEN, user: MOCK_USER };
  }
  if (method === 'POST' && matches(path, '/auth/logout')) {
    return { success: true };
  }
  if (method === 'POST' && matches(path, '/auth/forgot-password')) {
    return { success: true, message: 'E-mail enviado.' };
  }
  if (method === 'POST' && matches(path, '/auth/reset-password')) {
    return { success: true };
  }
  if (method === 'GET' && matches(path, '/users/me')) {
    return MOCK_USER;
  }

  // ── Dashboard (Firebase) ────────────────────────────────────────
  if (method === 'GET' && matches(path, '/dashboard/kpis')) {
    try {
      const kpis = await getFirebaseKpis();
      if (kpis) return kpis;
    } catch (_) {}
    return MOCK_KPIS;
  }
  if (method === 'GET' && matches(path, '/dashboard/consumption')) {
    try {
      const live = await firebaseRTDB.get('dashboard/readings/live');
      if (live?.totalEnergy_kWh) return generateConsumptionFromLive(live.totalEnergy_kWh);
    } catch (_) {}
    return MOCK_CONSUMPTION_30D;
  }
  if (method === 'GET' && matches(path, '/dashboard/top-sectors')) {
    try {
      const top = await getFirebaseTopSectors();
      if (top) return top;
    } catch (_) {}
    return MOCK_TOP_SECTORS;
  }

  // ── Setores (Firebase) ──────────────────────────────────────────
  if (method === 'GET' && matches(path, '/sectors')) {
    try {
      const sectors = await getFirebaseSectors();
      if (sectors) return { sectors };
    } catch (_) {}
    return { sectors: MOCK_SECTORS };
  }
  if (method === 'POST' && matches(path, '/sectors')) {
    const newSector = { id: Date.now(), ...body, active: true, current_consumption: 0, last_reading_at: new Date().toISOString() };
    MOCK_SECTORS.push(newSector);
    return newSector;
  }
  if (method === 'PUT' && path.match(/\/sectors\/\d+/)) {
    const id = extractId(path);
    const sector = MOCK_SECTORS.find(s => s.id === id);
    if (sector) Object.assign(sector, body);
    return sector || { id, ...body };
  }
  if (method === 'DELETE' && path.match(/\/sectors\/\d+/)) {
    const id = extractId(path);
    const idx = MOCK_SECTORS.findIndex(s => s.id === id);
    if (idx >= 0) MOCK_SECTORS.splice(idx, 1);
    return { success: true };
  }

  // ── Dispositivos ────────────────────────────────────────────────
  if (method === 'GET' && path.match(/\/devices\/\d+\/readings/)) {
    const id = extractId(path);
    return { readings: getMockReadings(id) };
  }
  if (method === 'GET' && path.match(/\/devices\/\d+\/anomalies/)) {
    const id = extractId(path);
    return { anomalies: getMockAnomalies(id) };
  }
  if (method === 'GET' && path.match(/\/devices\/\d+\/maintenance/)) {
    const id = extractId(path);
    return { maintenance: getMockMaintenance(id) };
  }
  if (method === 'POST' && path.match(/\/devices\/\d+\/maintenance/)) {
    return { id: Date.now(), ...body, date: new Date().toISOString() };
  }
  if (method === 'GET' && path.match(/\/devices\/\d+/)) {
    const id = extractId(path);
    return MOCK_DEVICES.find(d => d.id === id) || MOCK_DEVICES[0];
  }
  if (method === 'GET' && matches(path, '/devices')) {
    return { devices: MOCK_DEVICES };
  }
  if (method === 'POST' && matches(path, '/devices')) {
    const newDevice = { id: Date.now(), ...body, active: true, status: 'online', last_reading_at: new Date().toISOString() };
    MOCK_DEVICES.push(newDevice);
    return newDevice;
  }
  if (method === 'PUT' && path.match(/\/devices\/\d+/)) {
    const id = extractId(path);
    const device = MOCK_DEVICES.find(d => d.id === id);
    if (device) Object.assign(device, body);
    return device || { id, ...body };
  }
  if (method === 'DELETE' && path.match(/\/devices\/\d+/)) {
    const id = extractId(path);
    const idx = MOCK_DEVICES.findIndex(d => d.id === id);
    if (idx >= 0) MOCK_DEVICES.splice(idx, 1);
    return { success: true };
  }

  // ── Alertas ─────────────────────────────────────────────────────
  if (method === 'GET' && matches(path, '/alerts/count')) {
    const open = MOCK_ALERTS.filter(a => a.status === 'open');
    return { count: open.length };
  }
  if (method === 'PUT' && path.match(/\/alerts\/\d+\/acknowledge/)) {
    const id = extractId(path);
    const alert = MOCK_ALERTS.find(a => a.id === id);
    if (alert) alert.status = 'acknowledged';
    return alert || { success: true };
  }
  if (method === 'PUT' && path.match(/\/alerts\/\d+\/resolve/)) {
    const id = extractId(path);
    const alert = MOCK_ALERTS.find(a => a.id === id);
    if (alert) alert.status = 'resolved';
    return alert || { success: true };
  }
  if (method === 'PUT' && path.match(/\/alerts\/bulk\/acknowledge/)) {
    const ids = body?.ids || [];
    ids.forEach(id => { const a = MOCK_ALERTS.find(x => x.id === id); if (a) a.status = 'acknowledged'; });
    return { success: true, updated: ids.length };
  }
  if (method === 'PUT' && path.match(/\/alerts\/bulk\/resolve/)) {
    const ids = body?.ids || [];
    ids.forEach(id => { const a = MOCK_ALERTS.find(x => x.id === id); if (a) a.status = 'resolved'; });
    return { success: true, updated: ids.length };
  }
  if (method === 'GET' && path.match(/\/alerts\/\d+/)) {
    const id = extractId(path);
    return MOCK_ALERTS.find(a => a.id === id) || MOCK_ALERTS[0];
  }
  if (method === 'GET' && matches(path, '/alerts')) {
    // Suporta filtros via query string na URL
    const params = extractQuery(url);
    let filtered = [...MOCK_ALERTS];
    if (params.type) filtered = filtered.filter(a => a.type === params.type);
    if (params.severity) filtered = filtered.filter(a => a.severity === params.severity);
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    if (params.sector_id) filtered = filtered.filter(a => String(a.sector_id) === String(params.sector_id));
    if (params.limit) filtered = filtered.slice(0, parseInt(params.limit));
    return { alerts: filtered, total: filtered.length };
  }
  if (method === 'PUT' && path.match(/\/alerts\/\d+/)) {
    const id = extractId(path);
    const alert = MOCK_ALERTS.find(a => a.id === id);
    if (alert) Object.assign(alert, body);
    return alert || { id, ...body };
  }
  if (method === 'POST' && matches(path, '/alerts/bulk')) {
    return { success: true, updated: body?.ids?.length || 0 };
  }

  // ── Metas ───────────────────────────────────────────────────────
  if (method === 'GET' && path.match(/\/goals\/\d+/)) {
    const id = extractId(path);
    return MOCK_GOALS.find(g => g.id === id) || MOCK_GOALS[0];
  }
  if (method === 'GET' && matches(path, '/goals')) {
    return { goals: MOCK_GOALS };
  }
  if (method === 'POST' && matches(path, '/goals')) {
    const newGoal = { id: Date.now(), ...body, progress: 0, projection: null, current_value: 0, status: 'active', period_label: 'Maio 2026' };
    MOCK_GOALS.push(newGoal);
    return newGoal;
  }
  if (method === 'PUT' && path.match(/\/goals\/\d+/)) {
    const id = extractId(path);
    const goal = MOCK_GOALS.find(g => g.id === id);
    if (goal) Object.assign(goal, body);
    return goal || { id, ...body };
  }
  if (method === 'DELETE' && path.match(/\/goals\/\d+/)) {
    const id = extractId(path);
    const idx = MOCK_GOALS.findIndex(g => g.id === id);
    if (idx >= 0) MOCK_GOALS.splice(idx, 1);
    return { success: true };
  }

  // ── Settings ────────────────────────────────────────────────────
  if (method === 'GET' && matches(path, '/settings/business-hours')) {
    return MOCK_BUSINESS_HOURS;
  }
  if (method === 'PUT' && matches(path, '/settings/business-hours')) {
    Object.assign(MOCK_BUSINESS_HOURS, body);
    return MOCK_BUSINESS_HOURS;
  }

  // ── Financeiro ──────────────────────────────────────────────────
  if (method === 'GET' && matches(path, '/financial/summary')) {
    const daily = MOCK_FINANCIAL_DAILY;
    return {
      accumulated_kwh: MOCK_FINANCIAL_SUMMARY.consumption_kwh,
      accumulated_cost: MOCK_FINANCIAL_SUMMARY.cost_accumulated,
      consumption_variation: MOCK_FINANCIAL_SUMMARY.consumption_variation,
      cost_variation: MOCK_FINANCIAL_SUMMARY.cost_variation,
      projection_cost: MOCK_FINANCIAL_SUMMARY.projection_cost,
      projection_kwh: MOCK_FINANCIAL_SUMMARY.projection_kwh,
      budget_kwh: MOCK_FINANCIAL_SUMMARY.projection_kwh,
      consumption_progress: Math.round((MOCK_FINANCIAL_SUMMARY.consumption_kwh / MOCK_FINANCIAL_SUMMARY.projection_kwh) * 100),
      current_tariff: { rate_kwh: MOCK_FINANCIAL_SUMMARY.tariff_current },
      daily_labels: daily.labels,
      daily_values: daily.values,
      ranking_sectors: MOCK_FINANCIAL_RANKING.sectors.map(s => ({
        name: s.name,
        consumption_kwh: s.kwh,
        cost: s.cost,
        share: s.percent,
      })),
    };
  }
  if (method === 'GET' && matches(path, '/financial/daily')) {
    return MOCK_FINANCIAL_DAILY;
  }
  if (method === 'GET' && matches(path, '/financial/ranking')) {
    return MOCK_FINANCIAL_RANKING;
  }

  // ── Tarifas ─────────────────────────────────────────────────────
  if (method === 'GET' && path.match(/\/tariffs\/\d+/)) {
    const id = extractId(path);
    return MOCK_TARIFFS.find(t => t.id === id) || MOCK_TARIFFS[0];
  }
  if (method === 'GET' && matches(path, '/tariffs')) {
    return { tariffs: MOCK_TARIFFS };
  }
  if (method === 'POST' && matches(path, '/tariffs')) {
    const newTariff = { id: Date.now(), ...body, created_at: new Date().toISOString() };
    MOCK_TARIFFS.push(newTariff);
    return newTariff;
  }
  if (method === 'PUT' && path.match(/\/tariffs\/\d+/)) {
    const id = extractId(path);
    const tariff = MOCK_TARIFFS.find(t => t.id === id);
    if (tariff) Object.assign(tariff, body);
    return tariff || { id, ...body };
  }
  if (method === 'DELETE' && path.match(/\/tariffs\/\d+/)) {
    const id = extractId(path);
    const idx = MOCK_TARIFFS.findIndex(t => t.id === id);
    if (idx >= 0) MOCK_TARIFFS.splice(idx, 1);
    return { success: true };
  }

  // ── Fallback ────────────────────────────────────────────────────
  console.warn(`[Mock] Rota não mapeada: ${method} ${path}`);
  return { success: true };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractPath(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/api/, '');
  } catch {
    // Relative URL or path
    return url.replace(/^.*\/api/, '').split('?')[0];
  }
}

function extractQuery(url) {
  try {
    const u = new URL(url);
    const params = {};
    u.searchParams.forEach((v, k) => { params[k] = v; });
    return params;
  } catch {
    const qIdx = url.indexOf('?');
    if (qIdx < 0) return {};
    const params = {};
    url.slice(qIdx + 1).split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
  }
}

function matches(path, route) {
  const clean = path.replace(/\/$/, '');
  const target = route.replace(/\/$/, '');
  return clean === target || clean === `/api${target}`;
}

function extractId(path) {
  const match = path.match(/\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}
