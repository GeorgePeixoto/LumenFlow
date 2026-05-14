/**
 * EnergyFlow — Mock Data (Demo Mode).
 *
 * Dados fictícios realistas para apresentação.
 * Empresa: TechNova Indústria Ltda.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function generateTimeSeries(days = 30, baseValue = 400, variance = 80) {
  const labels = [];
  const values = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().split('T')[0]);
    values.push(Math.round(baseValue + (Math.random() - 0.5) * variance * 2));
  }
  return { labels, values };
}

function generateHourlyReadings(hours = 48, baseValue = 200, variance = 50) {
  const readings = [];
  for (let i = hours; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i);
    readings.push({
      timestamp: d.toISOString(),
      value: Math.round(baseValue + (Math.random() - 0.5) * variance * 2),
    });
  }
  return readings;
}

// ── User ──────────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'usr_001',
  name: 'João Silva',
  email: 'joao@technova.com.br',
  company_name: 'TechNova Indústria',
};

export const MOCK_TOKEN = 'demo_token_technova_2026';

// ── Setores ───────────────────────────────────────────────────────────────────

export const MOCK_SECTORS = [
  { id: 1, name: 'Produção', current_consumption: 4200, threshold_yellow: 5000, threshold_red: 7000, active: true, last_reading_at: hoursAgo(0) },
  { id: 2, name: 'Estoque Refrigerado', current_consumption: 2800, threshold_yellow: 3000, threshold_red: 4000, active: true, last_reading_at: hoursAgo(0) },
  { id: 3, name: 'Escritório', current_consumption: 1200, threshold_yellow: 1500, threshold_red: 2000, active: true, last_reading_at: hoursAgo(0) },
  { id: 4, name: 'Data Center', current_consumption: 3500, threshold_yellow: 4000, threshold_red: 5500, active: true, last_reading_at: hoursAgo(0) },
  { id: 5, name: 'Refeitório', current_consumption: 800, threshold_yellow: 1200, threshold_red: 1800, active: true, last_reading_at: hoursAgo(1) },
  { id: 6, name: 'Estacionamento', current_consumption: 400, threshold_yellow: 600, threshold_red: 900, active: true, last_reading_at: hoursAgo(1) },
];

// ── Dispositivos ──────────────────────────────────────────────────────────────

export const MOCK_DEVICES = [
  { id: 1, name: 'Compressor Principal', type: 'compressor', sector_id: 1, sector_name: 'Produção', power_watts: 2200, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 2, name: 'Esteira Transportadora', type: 'motor', sector_id: 1, sector_name: 'Produção', power_watts: 1500, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 3, name: 'Câmara Fria 01', type: 'refrigerator', sector_id: 2, sector_name: 'Estoque Refrigerado', power_watts: 1800, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 4, name: 'Câmara Fria 02', type: 'refrigerator', sector_id: 2, sector_name: 'Estoque Refrigerado', power_watts: 1000, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 5, name: 'Ar-condicionado Central', type: 'air_conditioning', sector_id: 3, sector_name: 'Escritório', power_watts: 900, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 6, name: 'Iluminação LED Escritório', type: 'lighting', sector_id: 3, sector_name: 'Escritório', power_watts: 300, active: true, status: 'online', last_reading_at: hoursAgo(1) },
  { id: 7, name: 'Rack Servidores A', type: 'other', sector_id: 4, sector_name: 'Data Center', power_watts: 2000, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 8, name: 'Rack Servidores B', type: 'other', sector_id: 4, sector_name: 'Data Center', power_watts: 1500, active: true, status: 'online', last_reading_at: hoursAgo(0) },
  { id: 9, name: 'Forno Industrial', type: 'other', sector_id: 5, sector_name: 'Refeitório', power_watts: 500, active: true, status: 'online', last_reading_at: hoursAgo(2) },
  { id: 10, name: 'Geladeira Refeitório', type: 'refrigerator', sector_id: 5, sector_name: 'Refeitório', power_watts: 300, active: true, status: 'online', last_reading_at: hoursAgo(1) },
  { id: 11, name: 'Iluminação Estacionamento', type: 'lighting', sector_id: 6, sector_name: 'Estacionamento', power_watts: 250, active: true, status: 'online', last_reading_at: hoursAgo(1) },
  { id: 12, name: 'Portão Automático', type: 'motor', sector_id: 6, sector_name: 'Estacionamento', power_watts: 150, active: false, status: 'offline', last_reading_at: daysAgo(3) },
];

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

export const MOCK_KPIS = {
  consumption_kwh: 12450,
  consumption_variation: -3.2,
  estimated_cost: 8715.00,
  cost_variation: 1.8,
  open_alerts: 4,
  active_devices: 11,
};

// ── Consumo 30 dias ───────────────────────────────────────────────────────────

export const MOCK_CONSUMPTION_30D = generateTimeSeries(30, 415, 60);

// ── Top setores ───────────────────────────────────────────────────────────────

export const MOCK_TOP_SECTORS = {
  sectors: [
    { name: 'Produção', consumption_kwh: 4200 },
    { name: 'Data Center', consumption_kwh: 3500 },
    { name: 'Estoque Refrigerado', consumption_kwh: 2800 },
    { name: 'Escritório', consumption_kwh: 1200 },
    { name: 'Refeitório', consumption_kwh: 800 },
  ],
};

// ── Alertas ───────────────────────────────────────────────────────────────────

export const MOCK_ALERTS = [
  { id: 1, title: 'Consumo fora de horário detectado', type: 'off_hours', severity: 'medium', status: 'open', device_name: 'Compressor Principal', sector_name: 'Produção', created_at: hoursAgo(2), message: 'Equipamento operando fora do horário comercial configurado.' },
  { id: 2, title: 'Anomalia de consumo', type: 'anomaly', severity: 'high', status: 'open', device_name: 'Câmara Fria 01', sector_name: 'Estoque Refrigerado', created_at: hoursAgo(5), message: 'Consumo 42% acima da média esperada para este horário.' },
  { id: 3, title: 'Sobrecarga no setor', type: 'overload', severity: 'critical', status: 'open', device_name: 'Rack Servidores A', sector_name: 'Data Center', created_at: hoursAgo(8), message: 'Setor Data Center ultrapassou o limite crítico de consumo.' },
  { id: 4, title: 'Desperdício noturno', type: 'night_waste', severity: 'medium', status: 'open', device_name: 'Iluminação LED Escritório', sector_name: 'Escritório', created_at: hoursAgo(12), message: 'Iluminação ativa entre 23h e 5h sem ocupação registrada.' },
  { id: 5, title: 'Meta de consumo em risco', type: 'goal', severity: 'low', status: 'acknowledged', device_name: null, sector_name: 'Produção', created_at: daysAgo(1), message: 'Meta mensal do setor Produção atingiu 82% do limite.' },
  { id: 6, title: 'Consumo fora de horário', type: 'off_hours', severity: 'low', status: 'resolved', device_name: 'Esteira Transportadora', sector_name: 'Produção', created_at: daysAgo(2), message: 'Equipamento operou no sábado sem agendamento.' },
  { id: 7, title: 'Anomalia de consumo', type: 'anomaly', severity: 'medium', status: 'resolved', device_name: 'Ar-condicionado Central', sector_name: 'Escritório', created_at: daysAgo(3), message: 'Consumo 28% acima do esperado durante o fim de semana.' },
  { id: 8, title: 'Desperdício noturno', type: 'night_waste', severity: 'low', status: 'resolved', device_name: 'Iluminação Estacionamento', sector_name: 'Estacionamento', created_at: daysAgo(5), message: 'Iluminação em potência máxima entre 1h e 5h.' },
];

// ── Metas ─────────────────────────────────────────────────────────────────────

export const MOCK_GOALS = [
  { id: 1, name: 'Meta Mensal Empresa', scope: 'company', unit: 'kwh', value: 15000, current_value: 12450, progress: 83, projection: 14800, milestone_warning: 80, milestone_critical: 100, period_type: 'current_month', period_label: 'Maio 2026', status: 'active' },
  { id: 2, name: 'Meta Produção', scope: 'sector', sector_id: 1, sector_name: 'Produção', unit: 'kwh', value: 5000, current_value: 4200, progress: 84, projection: 5100, milestone_warning: 80, milestone_critical: 100, period_type: 'current_month', period_label: 'Maio 2026', status: 'active' },
  { id: 3, name: 'Custo Máximo', scope: 'company', unit: 'brl', value: 10000, current_value: 8715, progress: 87, projection: 9200, milestone_warning: 80, milestone_critical: 100, period_type: 'current_month', period_label: 'Maio 2026', status: 'active' },
];

// ── Horário comercial ─────────────────────────────────────────────────────────

export const MOCK_BUSINESS_HOURS = {
  timezone: 'America/Sao_Paulo',
  days: {
    monday:    { enabled: true, start: '08:00', end: '18:00' },
    tuesday:   { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday:  { enabled: true, start: '08:00', end: '18:00' },
    friday:    { enabled: true, start: '08:00', end: '17:00' },
    saturday:  { enabled: false, start: '08:00', end: '12:00' },
    sunday:    { enabled: false, start: '08:00', end: '12:00' },
  },
};

// ── Financeiro ────────────────────────────────────────────────────────────────

export const MOCK_FINANCIAL_SUMMARY = {
  consumption_kwh: 12450,
  consumption_variation: -3.2,
  cost_accumulated: 8715.00,
  cost_variation: 1.8,
  projection_cost: 9200.00,
  projection_kwh: 14800,
  previous_month_cost: 8560.00,
  previous_month_kwh: 12800,
  tariff_current: 0.70,
  days_elapsed: 14,
  days_total: 31,
};

export const MOCK_FINANCIAL_DAILY = generateTimeSeries(14, 310, 40);

export const MOCK_FINANCIAL_RANKING = {
  sectors: [
    { name: 'Produção', kwh: 4200, cost: 2940, percent: 33.7 },
    { name: 'Data Center', kwh: 3500, cost: 2450, percent: 28.1 },
    { name: 'Estoque Refrigerado', kwh: 2800, cost: 1960, percent: 22.5 },
    { name: 'Escritório', kwh: 1200, cost: 840, percent: 9.6 },
    { name: 'Refeitório', kwh: 800, cost: 560, percent: 6.4 },
  ],
};

// ── Tarifas ───────────────────────────────────────────────────────────────────

export const MOCK_TARIFFS = [
  { id: 1, name: 'Tarifa Convencional', value_per_kwh: 0.70, start_date: '2026-01-01', end_date: null, active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Tarifa Anterior', value_per_kwh: 0.65, start_date: '2025-06-01', end_date: '2025-12-31', active: false, created_at: '2025-06-01T00:00:00Z' },
  { id: 3, name: 'Tarifa Promocional', value_per_kwh: 0.55, start_date: '2025-01-01', end_date: '2025-05-31', active: false, created_at: '2025-01-01T00:00:00Z' },
];

// ── Anomalias de dispositivo ──────────────────────────────────────────────────

export function getMockAnomalies(deviceId) {
  return [
    { id: 1, device_id: deviceId, timestamp: hoursAgo(5), expected_value: 1800, actual_value: 2560, severity: 'high', reason: 'Consumo 42% acima da média esperada para este horário.' },
    { id: 2, device_id: deviceId, timestamp: daysAgo(2), expected_value: 1800, actual_value: 2300, severity: 'medium', reason: 'Consumo 28% acima da média esperada para este horário.' },
    { id: 3, device_id: deviceId, timestamp: daysAgo(5), expected_value: 1800, actual_value: 2150, severity: 'low', reason: 'Consumo 19% acima da média esperada para este horário.' },
  ];
}

// ── Manutenções ───────────────────────────────────────────────────────────────

export function getMockMaintenance(deviceId) {
  return [
    { id: 1, device_id: deviceId, date: daysAgo(15), type: 'preventive', description: 'Limpeza de filtros e verificação de conexões.', technician: 'Carlos Mendes' },
    { id: 2, device_id: deviceId, date: daysAgo(45), type: 'corrective', description: 'Substituição de capacitor danificado.', technician: 'Ana Oliveira' },
  ];
}

// ── Readings de dispositivo ───────────────────────────────────────────────────

export function getMockReadings(deviceId) {
  const device = MOCK_DEVICES.find(d => d.id === Number(deviceId));
  const base = device?.power_watts || 500;
  return generateHourlyReadings(48, base, base * 0.2);
}
