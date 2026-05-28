# LumenFlow - Plano de Projeto e Roadmap

## Visão Geral do Projeto

O LumenFlow é um sistema completo de monitoramento energético IoT para varejo, que simula 12 equipamentos em 4 setores diferentes, enviando dados em tempo real para o Firebase e exibindo informações através de uma interface web moderna.

## Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Wokwi Web IDE  │────▶│ Firebase RTDB    │◀────│  Frontend SPA   │
│   (simulação)   │     │  (dados IoT)     │     │  (GitHub Pages) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          │ REST API
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Laravel API     │
                                                 │  (backend/)      │
                                                 │    +            │
                                                 │ Firebase Auth    │
                                                 │  (usuários)     │
                                                 └─────────────────┘
```

## Componentes Principais

### 1. Simulação Wokwi (Hardware Virtual)
- **Microcontrolador:** ESP32 Dev Module
- **Rede:** Wi-Fi Wokwi-GUEST
- **Dados:** 12 equipamentos em 4 setores
- **Atualização:** A cada 10 segundos
- **Energia:** Acumulada de forma realista

### 2. Firebase (Backend de Dados)
- **Banco 1:** RTDB para dados IoT (`projeto-pi-bf5a6-default-rtdb.firebaseio.com`)
- **Banco 2:** RTDB para autenticação (`pi-login-b7130-default-rtdb.firebaseio.com`)
- **Estrutura:** Dados hierárquicos por equipamentos, setores e dashboard

### 3. API Laravel (Backend)
- **Framework:** Laravel 11 com Lumen
- **Autenticação:** Sanctum para APIs
- **Endpoints:** RESTful para dados IoT e usuários

### 4. Frontend (SPA)
- **Framework:** Alpine.js + Tailwind CSS
- **Gerenciamento:** Roteamento interno
- **Atualização:** Em tempo real via polling
- **Design:** Interface responsiva e moderna

## Estrutura de Dados

### Equipamentos Simulados
```javascript
const devices = [
  // Refrigeracao (3 equipamentos)
  { id: "refrig-camara-01", name: "Camara Fria 01", sector: "Refrigeracao", minCurrent: 12.0, maxCurrent: 18.0 },
  { id: "refrig-camara-02", name: "Camara Fria 02", sector: "Refrigeracao", minCurrent: 10.0, maxCurrent: 16.0 },
  { id: "refrig-freezer-01", name: "Freezer Expositor", sector: "Refrigeracao", minCurrent: 5.0, maxCurrent: 9.0 },
  
  // Iluminacao (3 equipamentos)
  { id: "ilum-galpao-01", name: "Iluminacao Galpao", sector: "Iluminacao", minCurrent: 3.0, maxCurrent: 6.0 },
  { id: "ilum-escritorio-01", name: "Iluminacao Escritorio", sector: "Iluminacao", minCurrent: 1.5, maxCurrent: 3.0 },
  { id: "ilum-estacionamento-01", name: "Iluminacao Estacionamento", sector: "Iluminacao", minCurrent: 2.0, maxCurrent: 4.0 },
  
  // Equipamentos (3 equipamentos)
  { id: "equip-empilhadeira-01", name: "Empilhadeira Eletrica", sector: "Equipamentos", minCurrent: 15.0, maxCurrent: 25.0 },
  { id: "equip-esteira-01", name: "Esteira Transportadora", sector: "Equipamentos", minCurrent: 8.0, maxCurrent: 14.0 },
  { id: "equip-compressor-01", name: "Compressor de Ar", sector: "Equipamentos", minCurrent: 10.0, maxCurrent: 20.0 },
  
  // Escritorio (3 equipamentos)
  { id: "escrit-ar-01", name: "Central Ar-Condicionado", sector: "Escritorio", minCurrent: 8.0, maxCurrent: 15.0 },
  { id: "escrit-servidor-01", name: "Servidor TI", sector: "Escritorio", minCurrent: 3.0, maxCurrent: 5.0 },
  { id: "escrit-estacoes-01", name: "Estacoes de Trabalho", sector: "Escritorio", minCurrent: 2.0, maxCurrent: 4.0 }
];
```

### Fluxo de Dados
1. **Wokwi** gera dados simulados a cada 10 segundos
2. **Firebase** recebe e armazena os dados em 3 níveis:
   - `/equipamentos/` - Detalhado por equipamento
   - `/sensores/` - Agregado por setor
   - `/dashboard/` - Resumo geral do sistema
3. **API Laravel** consulta o Firebase e expõe endpoints REST
4. **Frontend** consome os dados e atualiza a interface em tempo real

## Tecnologias Utilizadas

### Backend
- **Laravel 11** - Framework PHP
- **Lumen** - Micro-framework para APIs
- **SQLite** - Banco de dados relacional
- **Sanctum** - Autenticação de API
- **Guzzle** - HTTP client para Firebase
- **Firebase Admin SDK** - Conexão com Firebase

### Frontend
- **Alpine.js** - Framework JavaScript leve
- **Tailwind CSS** - Framework CSS utilitário
- **Vanilla JavaScript** - Sem dependências pesadas
- **Custom Router** - Sistema de roteamento interno

### Simulação
- **Wokwi Web IDE** - Simulação de hardware IoT
- **ESP32** - Microcontrolador virtual
- **Firebase ESP32 Client** - Conexão com Firebase

### Infraestrutura
- **Firebase RTDB** - Banco de dados NoSQL
- **GitHub Pages** - Hospedagem do frontend
- **Laravel Vapor** - Hospedagem da API (planejado)

## Fases de Desenvolvimento

### ✅ Fase 1: Configuração Básica (Concluída)
- [x] Configuração do projeto Laravel
- [x] Configuração do Firebase
- [x] Configuração do Wokwi
- [x] Conexão inicial entre componentes

### ✅ Fase 2: Integração de Dados (Concluída)
- [x] Simulação dos 12 equipamentos
- [x] Envio de dados para o Firebase
- [x] Criação da API Laravel
- [x] Configuração de CORS
- [x] Endpoint público para dashboard

### ✅ Fase 3: Frontend (Concluída)
- [x] Interface do dashboard
- [x] Consumo de dados via API
- [x] Atualização em tempo real
- [x] Design responsivo

### ✅ Fase 4: Monitoramento e Documentação (Concluída)
- [x] Script de monitoramento
- [x] Documentação completa
- [x] Testes de integração
- [x] Validação de fluxo completo

## Funcionalidades Implementadas

### Dashboard em Tempo Real
- Monitoramento de 12 equipamentos
- Agregação por 4 setores
- Cálculo de consumo energético
- Estimativa de custo
- Status de dispositivos ativos

### Sistema de Autenticação
- Registro de usuários
- Login/logout
- Proteção de endpoints sensíveis
- Tokens Sanctum

### Gestão de Dados
- Leitura de dados do Firebase
- Processamento e agregação
- Cache de desempenho
- Tratamento de erros

## Métricas de Desempenho

### Atualização de Dados
- **Wokwi:** A cada 10 segundos
- **Firebase:** Escrita imediata
- **API Laravel:** Consulta sob demanda
- **Frontend:** Atualização a cada 2 segundos

### Capacidade do Sistema
- **Equipamentos:** 12 simultâneos
- **Setores:** 4 categorias
- **Atualizações:** 864 por dia (por equipamento)
- **Volume de dados:** ~50MB/dia

## Segurança

### Dados IoT (Públicos)
- Endpoint: `/api/dashboard/public`
- Sem autenticação necessária
- Dados agregados apenas

### Dados de Usuário (Privados)
- Endpoints protegidos por `auth:sanctum`
- Tokens JWT para autenticação
- HTTPS em produção

### Firebase Security
- Regras abertas para desenvolvimento
- Configuração de produção planejada
- Chaves de API gerenciadas

## Próximos Passos (Roadmap)

### 🚀 Fase 5: Aprimoramentos (Planejado)
- [ ] Implementar WebSocket para atualizações em tempo real
- [ ] Adicionar gráficos históricos com Chart.js
- [ ] Implementar sistema de alertas inteligentes
- [ ] Otimizar performance do dashboard existente
- [ ] Adicionar exportação de dados (PDF, CSV)
- [ ] Implementar filtros avançados por período e equipamento

### 🚀 Fase 6: Escala (Planejado)
- [ ] Migrar para Firebase Firestore
- [ ] Implementar cache Redis
- [ ] Otimizar banco de dados
- [ ] Load balancing

### 🚀 Fase 7: Funcionalidades Avançadas (Planejado)
- [ ] Machine learning para previsão de consumo
- [ ] Integração com medidores reais
- [ ] Mobile app (React Native)
- [ ] API para terceiros

## Monitoramento e Manutenção

### Scripts Disponíveis
- `monitor-iot.js` - Monitoramento em tempo real
- `test-api.js` - Testes de endpoints
- `deploy.sh` - Script de deploy (planejado)

### Métricas Chave
- Latência da API
- Taxa de atualização
- Consumo de memória
- Disponibilidade do sistema

## Documentação

### Documentação Criada
- `WOKWI_CONFIG.md` - Configuração completa do Wokwi
- `PLAN.md` - Roadmap e arquitetura
- `README.md` - Iniciação rápida
- `backend/.env.example` - Configuração de ambiente

### Guias Técnicos
- Setup do ambiente de desenvolvimento
- Integração Wokwi ↔ Firebase
- Deploy da aplicação
- Manutenção do sistema

## Contribuição

### Formas de Contribuir
- Reportar bugs
- Sugerir melhorias
- Adicionar documentação
- Desenvolver novas funcionalidades

### Processo de Contribuição
1. Fork do projeto
2. Criar branch de feature
3. Commit com mensagens claras
4. Pull request com descrição detalhada

---

*Última atualização: 27/05/2026*
*Versão: 1.0.0*