/**
 * LumenFlow — Strings de UI centralizadas em português brasileiro.
 *
 * REGRA: nenhuma string visível ao usuário deve aparecer diretamente em
 * templates HTML ou código JS. Sempre use t('chave.aninhada').
 *
 * Organização: por contexto de tela/épico, seguindo a estrutura do backlog.
 *
 * Uso:
 *   import { t } from '../i18n/pt-BR.js';
 *   t('auth.login.title')               => 'Entrar'
 *   t('common.loading')                 => 'Carregando...'
 *   t('devices.status.active')          => 'Ativo'
 *   t('sectors.confirm_deactivate', { name: 'Estoque' })
 *     => 'Desativar o setor "Estoque"? Os dados históricos serão preservados.'
 */

const strings = {

  // ─── App ──────────────────────────────────────────────────────────────────
  app: {
    name: 'LumenFlow',
    tagline: 'Gestão inteligente de energia',
  },

  // ─── Autenticação (Épico F1) ───────────────────────────────────────────────
  auth: {
    login: {
      title: 'Entrar',
      subtitle: 'Bem-vindo de volta',
      email: 'E-mail',
      password: 'Senha',
      remember: 'Lembre-se de mim',
      submit: 'Entrar',
      forgot: 'Esqueci a senha',
      register_link: 'Criar conta',
      no_account: 'Não tem conta?',
      error_invalid: 'E-mail ou senha incorretos.',
      error_blocked: 'Muitas tentativas. Tente novamente em alguns minutos.',
    },
    register: {
      title: 'Criar conta',
      subtitle: 'Cadastre sua empresa',
      company_name: 'Nome da empresa',
      cnpj: 'CNPJ',
      cnpj_placeholder: '00.000.000/0000-00',
      segment: 'Segmento',
      segment_placeholder: 'Selecione o segmento',
      responsible_name: 'Nome completo do responsável',
      email: 'E-mail corporativo',
      password: 'Senha',
      password_confirm: 'Confirmar senha',
      terms_accept: 'Li e aceito os',
      terms_link: 'termos de uso',
      submit: 'Cadastrar',
      login_link: 'Já tenho conta',
      success: 'Cadastro realizado. Faça login para continuar.',
      error_cnpj_taken: 'Este CNPJ já está cadastrado.',
      error_email_taken: 'Este e-mail já está em uso.',
    },
    forgot: {
      title: 'Recuperar senha',
      subtitle: 'Informe seu e-mail para receber o link',
      email: 'E-mail cadastrado',
      submit: 'Enviar link',
      success: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.',
      back: 'Voltar ao login',
    },
    reset: {
      title: 'Redefinir senha',
      subtitle: 'Escolha uma nova senha segura',
      new_password: 'Nova senha',
      confirm_password: 'Confirmar nova senha',
      submit: 'Redefinir',
      success: 'Senha redefinida com sucesso. Faça login.',
      error_expired: 'Link expirado ou inválido. Solicite um novo.',
      request_new: 'Solicitar novo link',
    },
    logout: {
      success: 'Sessão encerrada.',
      confirm_title: 'Encerrar sessão',
      confirm_message: 'Deseja realmente sair?',
    },
    session_expired: 'Sessão expirada. Faça login novamente.',
  },

  // ─── Navegação (Épico F2) ─────────────────────────────────────────────────
  nav: {
    dashboard: 'Dashboard',
    transparency: 'Painel da Transparência',
    sectors: 'Setores',
    devices: 'Equipamentos',
    alerts: 'Alertas',
    goals: 'Metas',
    reports: 'Relatórios',
    financial: 'Financeiro',
    settings: 'Configurações',
    open_menu: 'Abrir menu',
    close_menu: 'Fechar menu',
    profile: 'Meu perfil',
    logout: 'Sair',
  },

  // ─── Comum / global ────────────────────────────────────────────────────────
  common: {
    loading: 'Carregando...',
    error: 'Ocorreu um erro. Tente novamente.',
    error_generic: 'Algo deu errado. Entre em contato com o suporte se o problema persistir.',
    retry: 'Tentar novamente',
    save: 'Salvar',
    saving: 'Salvando...',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    deactivate: 'Desativar',
    activate: 'Ativar',
    edit: 'Editar',
    create: 'Novo',
    search: 'Buscar',
    filter: 'Filtrar',
    clear_filters: 'Limpar filtros',
    no_results: 'Nenhum resultado encontrado.',
    no_results_filtered: 'Nenhum resultado para os filtros aplicados.',
    actions: 'Ações',
    yes: 'Sim',
    no: 'Não',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    see_all: 'Ver todos',
    see_details: 'Ver detalhes',
    download: 'Baixar',
    print: 'Imprimir',
    export: 'Exportar',
    required_fields: '* Campos obrigatórios',
    page_of: 'Página {page} de {total}',
    showing: 'Exibindo {from}–{to} de {total} registros',
    in_construction: 'Em construção',
    in_construction_desc: 'Esta seção será disponibilizada em breve.',
    unknown_error: 'Erro desconhecido.',
    or: 'ou',
    and: 'e',
  },

  // ─── Validação ─────────────────────────────────────────────────────────────
  validation: {
    required: 'Campo obrigatório.',
    email_invalid: 'E-mail inválido.',
    cnpj_invalid: 'CNPJ inválido.',
    password_min: 'Mínimo 8 caracteres.',
    password_strength: 'Use letras, números e caracteres especiais.',
    password_mismatch: 'Senhas não conferem.',
    number_invalid: 'Valor numérico inválido.',
    number_min: 'Valor mínimo: {min}.',
    number_max: 'Valor máximo: {max}.',
    date_invalid: 'Data inválida.',
    date_range_invalid: 'A data final deve ser após a data inicial.',
    field_too_long: 'Máximo {max} caracteres.',
    terms_required: 'Você deve aceitar os termos de uso.',
    phone_invalid: 'Número de telefone inválido.',
  },

  // ─── Período / PeriodPicker (F2-F7, US22) ─────────────────────────────────
  period: {
    label: 'Período',
    today: 'Hoje',
    last_7: 'Últimos 7 dias',
    last_30: 'Últimos 30 dias',
    current_month: 'Mês atual',
    previous_month: 'Mês anterior',
    custom: 'Personalizado',
    from: 'De',
    to: 'Até',
    apply: 'Aplicar',
    granularity: 'Granularidade',
    granularity_hour: 'Por hora',
    granularity_day: 'Por dia',
    granularity_week: 'Por semana',
    granularity_month: 'Por mês',
  },

  // ─── Dashboard (F4-F2, US10, US11, US12) ──────────────────────────────────
  dashboard: {
    title: 'Dashboard',
    welcome: 'Bem-vindo, {name}',
    kpi_consumption: 'Consumo do mês',
    kpi_cost: 'Custo estimado',
    kpi_alerts: 'Alertas abertos',
    kpi_devices: 'Equipamentos ativos',
    kpi_goals: 'Metas ativas',
    chart_consumption_title: 'Consumo nos últimos 30 dias',
    chart_sectors_title: 'Top 5 setores por consumo',
    recent_alerts: 'Alertas recentes',
    quick_actions: 'Ações rápidas',
    no_alerts: 'Nenhum alerta aberto.',
    no_data: 'Sem dados de consumo para o período.',
    off_hours_title: 'Consumo fora de horário',
    off_hours_count: '{count} alerta(s) no período',
    off_hours_empty: 'Nenhum alerta de consumo fora de horário.',
    off_hours_view_all: 'Ver todos',
    night_waste_title: 'Desperdício noturno',
    night_waste_count: '{count} alerta(s) no período',
    night_waste_empty: 'Nenhum alerta de desperdício noturno.',
    night_waste_view_all: 'Ver todos',
  },

  // ─── Painel da Transparência (US06) ────────────────────────────────────────
  transparency: {
    title: 'Painel da Transparência',
    subtitle: 'Consumo em tempo real por setor',
    status_normal: 'Normal',
    status_warning: 'Atenção',
    status_critical: 'Crítico',
    last_update: 'Atualizado {time}',
    consumption_current: 'Consumo atual',
    threshold_warning: 'Atenção acima de {value}',
    threshold_critical: 'Crítico acima de {value}',
    no_sectors: 'Nenhum setor cadastrado.',
    legend_title: 'Legenda',
    legend_normal: 'Abaixo do limite de atenção',
    legend_warning: 'Entre o limite de atenção e o crítico',
    legend_critical: 'Acima do limite crítico',
    legend_calc: 'Baseado na média dos últimos 60 segundos.',
    tv_mode: 'Modo TV',
    exit_tv_mode: 'Sair do modo TV',
    alert_critical: 'Setor "{name}" entrou em estado crítico!',
    fullscreen_enter: 'Tela cheia',
    fullscreen_exit: 'Sair da tela cheia',
  },

  // ─── Setores (US23) ────────────────────────────────────────────────────────
  sectors: {
    title: 'Setores',
    subtitle: 'Organize equipamentos por áreas operacionais e configure limites de consumo.',
    new: 'Novo setor',
    edit: 'Editar setor',
    name: 'Nome do setor',
    description: 'Descrição',
    description_placeholder: 'Opcional',
    devices: 'Equipamentos',
    thresholds: 'Limites',
    devices_count: '{count} equipamento(s)',
    threshold_warning: 'Limite de atenção (kW)',
    threshold_critical: 'Limite crítico (kW)',
    threshold_warning_helper: 'Valor usado pelo semáforo do Painel da Transparência.',
    threshold_critical_helper: 'Deve ser maior que o limite de atenção.',
    threshold_order_invalid: 'O limite crítico deve ser maior que o de atenção.',
    status: 'Status',
    status_active: 'Ativo',
    status_inactive: 'Inativo',
    show_inactive: 'Mostrar inativos',
    no_sectors: 'Nenhum setor cadastrado. Crie o primeiro setor.',
    confirm_deactivate_title: 'Desativar setor',
    confirm_deactivate_message: 'Desativar o setor "{name}"? Os dados históricos serão preservados.',
    confirm_activate_title: 'Ativar setor',
    confirm_activate_message: 'Reativar o setor "{name}"?',
    error_name_taken: 'Já existe um setor com este nome.',
    error_has_devices: 'Não é possível desativar um setor com equipamentos ativos.',
    save_success: 'Setor salvo com sucesso.',
    deactivate_success: 'Setor desativado.',
    activate_success: 'Setor reativado.',
  },

  // ─── Dispositivos / Equipamentos (US23) ────────────────────────────────────
  devices: {
    title: 'Equipamentos',
    subtitle: 'Cadastre os equipamentos monitorados e vincule cada um a um setor.',
    new: 'Novo equipamento',
    edit: 'Editar equipamento',
    name: 'Nome do equipamento',
    type: 'Tipo',
    sector: 'Setor',
    device_id: 'ID do dispositivo',
    device_id_helper: 'Identificador único do hardware (ex: ID do Wokwi ou módulo físico).',
    install_date: 'Data de instalação',
    overload_threshold: 'Limite de sobrecarga (W)',
    overload_threshold_helper: 'Consumo acima deste valor gera alerta de sobrecarga.',
    is_critical: 'Equipamento crítico',
    is_critical_helper: 'Equipamentos críticos geram alertas prioritários.',
    last_reading: 'Último consumo',
    never_read: 'Sem leituras',
    status: 'Status',
    status_active: 'Ativo',
    status_inactive: 'Inativo',
    filter_sector: 'Filtrar por setor',
    filter_type: 'Filtrar por tipo',
    filter_status: 'Filtrar por status',
    all_sectors: 'Todos os setores',
    all_types: 'Todos os tipos',
    all_statuses: 'Todos os status',
    search_placeholder: 'Buscar por nome ou ID',
    no_devices: 'Nenhum equipamento cadastrado.',
    confirm_deactivate_title: 'Desativar equipamento',
    confirm_deactivate_message: 'Desativar "{name}"? Os dados históricos serão preservados.',
    error_device_id_exists: 'Já existe um equipamento com este ID.',
    error_sector_inactive: 'Selecione um setor ativo.',
    error_name_taken: 'Já existe um equipamento com este nome neste setor.',
    save_success: 'Equipamento salvo com sucesso.',
    deactivate_success: 'Equipamento desativado.',
    types: {
      compressor: 'Compressor',
      motor: 'Motor',
      lighting: 'Iluminação',
      air_conditioning: 'Ar-condicionado',
      refrigerator: 'Refrigerador',
      other: 'Outro',
    },
  },

  // ─── Alertas (US17, US07, US14, US16) ─────────────────────────────────────
  alerts: {
    title: 'Central de Alertas',
    badge_label: 'alertas abertos',
    new_critical: 'Novo alerta crítico em "{device}"',
    see_details: 'Ver detalhes',
    filter_type: 'Tipo',
    filter_severity: 'Severidade',
    filter_status: 'Status',
    filter_sector: 'Setor',
    filter_device: 'Equipamento',
    no_alerts: 'Nenhum alerta encontrado.',
    acknowledge: 'Reconhecer',
    resolve: 'Resolver',
    acknowledge_bulk: 'Reconhecer selecionados',
    resolve_bulk: 'Resolver selecionados',
    comment_placeholder: 'Comentário opcional...',
    acknowledge_success: 'Alerta reconhecido.',
    resolve_success: 'Alerta resolvido.',
    bulk_success: '{count} alerta(s) atualizados.',
    detail_title: 'Detalhes do alerta',
    detail_device: 'Equipamento',
    detail_sector: 'Setor',
    detail_type: 'Tipo',
    detail_severity: 'Severidade',
    detail_status: 'Status',
    detail_triggered_at: 'Disparado em',
    detail_value: 'Valor registrado',
    detail_expected: 'Valor esperado',
    types: {
      off_hours: 'Fora de horário',
      anomaly: 'Anomalia',
      overload: 'Sobrecarga',
      goal: 'Meta',
      night_waste: 'Desperdício noturno',
    },
    severities: {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica',
    },
    statuses: {
      open: 'Aberto',
      acknowledged: 'Reconhecido',
      resolved: 'Resolvido',
    },
  },

  // ─── Metas (US12) ─────────────────────────────────────────────────────────
  goals: {
    title: 'Metas',
    new: 'Nova meta',
    edit: 'Editar meta',
    scope: 'Escopo',
    scope_company: 'Empresa',
    scope_sector: 'Setor',
    scope_device: 'Equipamento',
    unit: 'Unidade',
    unit_kwh: 'kWh',
    unit_brl: 'R$',
    value: 'Valor da meta',
    period: 'Período',
    period_current_month: 'Mês corrente',
    period_specific_month: 'Mês específico',
    period_custom: 'Personalizado',
    milestone_warning: 'Marco de atenção (%)',
    milestone_critical: 'Marco crítico (%)',
    progress: 'Progresso',
    projection: 'Projeção fim do mês',
    projection_label: 'Projetado: {value}',
    status_on_track: 'No prazo',
    status_at_risk: 'Em risco',
    status_exceeded: 'Excedida',
    milestone_toast: 'Meta "{name}" atingiu {percent}% do limite!',
    no_goals: 'Nenhuma meta cadastrada.',
    confirm_delete_title: 'Excluir meta',
    confirm_delete_message: 'Excluir a meta "{name}"? Esta ação não pode ser desfeita.',
    error_overlap: 'Já existe uma meta para este escopo no período selecionado.',
    save_success: 'Meta salva com sucesso.',
    delete_success: 'Meta excluída.',
  },

  // ─── Financeiro (US10, US11) ───────────────────────────────────────────────
  financial: {
    title: 'Financeiro',
    kpi_accumulated: 'Consumo acumulado',
    kpi_cost_accumulated: 'Custo acumulado',
    kpi_projection: 'Projeção fim do mês',
    kpi_vs_last_month: 'vs. mês anterior',
    chart_daily_title: 'Consumo diário do mês',
    chart_daily_avg: 'Média diária',
    chart_daily_projection: 'Projeção',
    ranking_title: 'Ranking de consumo',
    ranking_by_sector: 'Por setor',
    ranking_by_device: 'Por equipamento',
    ranking_kwh: 'kWh',
    ranking_cost: 'R$',
    ranking_share: '% do total',
    tariff_current: 'Tarifa vigente',
    tariff_manage: 'Gerenciar tarifas',
    no_tariff: 'Nenhuma tarifa configurada. Configure uma tarifa para ver estimativas.',
    no_data: 'Sem dados para o período selecionado.',
  },

  // ─── Tarifas (US10) ────────────────────────────────────────────────────────
  tariffs: {
    title: 'Tarifas',
    new: 'Nova tarifa',
    edit: 'Editar tarifa',
    modality: 'Modalidade',
    flag: 'Bandeira tarifária',
    rate_kwh: 'Tarifa (R$/kWh)',
    valid_from: 'Vigência a partir de',
    valid_until: 'Vigência até',
    valid_until_placeholder: 'Sem data de encerramento',
    current: 'Vigente',
    no_tariffs: 'Nenhuma tarifa cadastrada.',
    error_overlap: 'Já existe uma tarifa vigente para este período.',
    save_success: 'Tarifa salva com sucesso.',
    modalities: {
      conventional: 'Convencional',
      time_of_use: 'Branca (horário)',
    },
    flags: {
      green: 'Verde',
      yellow: 'Amarela',
      red_1: 'Vermelha P1',
      red_2: 'Vermelha P2',
    },
  },

  // ─── Relatórios ESG (US05, US15) ──────────────────────────────────────────
  reports: {
    title: 'Relatórios ESG',
    subtitle: 'Relatórios mensais de consumo e sustentabilidade',
    filter_year: 'Ano',
    month: 'Mês',
    status_available: 'Disponível',
    status_generating: 'Gerando...',
    view: 'Visualizar',
    download_pdf: 'Baixar PDF',
    download_csv: 'Baixar CSV',
    no_reports: 'Nenhum relatório disponível para os filtros selecionados.',
    view_title: 'Relatório ESG — {month}',
    section_consumption: 'Consumo',
    section_cost: 'Custo',
    section_breakdown: 'Detalhamento por setor',
    section_goals: 'Metas',
    section_sustainability: 'Sustentabilidade',
    section_economy: 'Economia gerada',
    economy_kwh: 'Você economizou {kwh} kWh este mês',
    economy_brl: 'equivalente a {brl}',
    economy_no_baseline: 'Sem dados de baseline suficientes para calcular economia.',
    ods_reference: 'Alinhado ao ODS 12 — Consumo e Produção Responsáveis',
    print: 'Imprimir relatório',
    generating_pdf: 'Gerando PDF...',
  },

  // ─── Notificações (US25) ──────────────────────────────────────────────────
  notifications: {
    title: 'Notificações',
    subtitle: 'Configure como deseja receber alertas',
    channel_email: 'E-mail',
    channel_whatsapp: 'WhatsApp',
    channel_push: 'Push (navegador)',
    contact_email: 'E-mail para notificações',
    contact_whatsapp: 'Número de WhatsApp',
    contact_whatsapp_placeholder: '+55 11 99999-9999',
    save: 'Salvar preferências',
    save_success: 'Preferências salvas.',
    save_success_whatsapp: 'Preferências salvas. Verifique o WhatsApp — uma mensagem de confirmação foi enviada.',
    alert_types_title: 'Tipos de alerta',
  },

  // ─── Configurações de horário comercial (US07) ────────────────────────────
  business_hours: {
    title: 'Horário comercial',
    subtitle: 'Consumo fora deste horário gera alertas de desperdício.',
    days: {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo',
    },
    start: 'Início',
    end: 'Término',
    closed: 'Fechado',
    timezone: 'Fuso horário',
    save_success: 'Horário comercial salvo.',
  },

  // ─── Detalhes do dispositivo (US16, US21) ────────────────────────────────
  device_detail: {
    title: 'Detalhes do equipamento',
    tab_readings: 'Leituras',
    tab_anomalies: 'Anomalias',
    tab_maintenance: 'Manutenções',
    anomaly_expected: 'Esperado: {value}',
    anomaly_actual: 'Registrado: {value}',
    anomaly_reason: '{percent}% acima da média esperada para este horário.',
    no_anomalies: 'Nenhuma anomalia detectada no período.',
    maintenance_new: 'Registrar manutenção',
    maintenance_date: 'Data',
    maintenance_type: 'Tipo',
    maintenance_notes: 'Observações',
    maintenance_no_records: 'Nenhuma manutenção registrada.',
    maintenance_save_success: 'Manutenção registrada.',
  },

  // ─── Saúde do equipamento (US24) ──────────────────────────────────────────
  health: {
    title: 'Saúde dos equipamentos',
    score_label: 'Score de saúde',
    score_good: 'Bom',
    score_attention: 'Atenção',
    score_critical: 'Crítico',
    fleet_report: 'Relatório da frota',
    export: 'Exportar relatório',
    no_data: 'Sem dados suficientes para calcular score.',
  },

  // ─── Seleção de setor (pós-login) ──────────────────────────────────────────
  sector_select: {
    title: 'Selecione um setor',
    subtitle: 'Olá, {name}! Escolha o setor que deseja monitorar.',
    empty: 'Nenhum setor ativo encontrado. Cadastre setores para começar.',
  },

  // ─── Dashboard do setor ───────────────────────────────────────────────────
  sector_dashboard: {
    subtitle: 'Visão geral do setor',
    not_found: 'Setor não encontrado.',
    back_to_sectors: 'Voltar aos setores',
    kpi_consumption: 'Consumo atual',
    kpi_devices: 'Equipamentos ativos',
    kpi_alerts: 'Alertas abertos',
    kpi_threshold: 'Limite crítico',
    devices_title: 'Equipamentos',
    no_devices: 'Nenhum equipamento neste setor.',
    alerts_title: 'Alertas recentes',
    no_alerts: 'Nenhum alerta aberto neste setor.',
  },

  // ─── Estados de UI (loading, erro, vazio) ─────────────────────────────────
  states: {
    loading: 'Carregando...',
    error_title: 'Não foi possível carregar os dados',
    error_action: 'Tentar novamente',
    empty_title: 'Nenhum dado encontrado',
    empty_action: 'Adicionar primeiro registro',
    offline: 'Sem conexão com o servidor. Verifique sua rede.',
    unauthorized: 'Você não tem permissão para acessar este recurso.',
    not_found: 'Página não encontrada.',
  },

};

// ─── Helper de acesso ─────────────────────────────────────────────────────────

/**
 * Acessa uma string por chave aninhada com ponto-notação.
 * Suporta interpolação de variáveis com {chave}.
 *
 * @param {string} key  - ex: 'auth.login.title', 'sectors.devices_count'
 * @param {Object} [vars] - variáveis para interpolação
 * @returns {string}
 *
 * @example
 * t('common.page_of', { page: 2, total: 10 }) => 'Página 2 de 10'
 * t('sectors.devices_count', { count: 3 })    => '3 equipamento(s)'
 */
export function t(key, vars) {
  const parts = key.split('.');
  let value = strings;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') return key;
    value = value[part];
  }
  if (value === undefined || value === null) return key;
  let result = String(value);
  if (vars) {
    result = result.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{${k}}`
    );
  }
  return result;
}

export default strings;
