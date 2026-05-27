# LumenFlow - Planejamento

## Arquitetura 100% Firebase

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Wokwi ESP32   │────▶│ Firebase RTDB    │◀────│  Frontend SPA   │
│  (simulação)    │     │  (dados IoT)     │     │  (GitHub Pages) │
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

### 2 Instâncias Firebase

| Instância | Propósito | Estrutura de Dados |
|-----------|-----------|-------------------|
| **Firebase RTDB (IoT)** | Dados brutos da simulação Wokwi | `sensors/{deviceId}/readings/{timestamp}` |
| **Firebase Auth** | Autenticação de usuários | Usuários criados via Firebase Console |

## Fases de Desenvolvimento

### FASE 1: Configuração e Limpeza ✅ CONCLUÍDO
- [x] Remover todos documentos desnecessários (DATABASE_SCHEMA.md, REFACTORING_PLAN.md, TASKS.md, TASKS_LOG.md)
- [x] Remover completamente referências ao MySQL dos arquivos de configuração
- [x] Atualizar README.md com arquitetura puramente Firebase
- [x] Criar novo plano de desenvolvimento (PLAN.md)

### FASE 2: Backend API (Amanhã até 15:30)
- [ ] Instalar dependências Laravel (resolver OpenSSL)
- [ ] Configurar Firebase Auth
- [ ] Configurar Firebase RTDB (instância IoT)
- [ ] Criar controllers para CRUD de usuários
- [ ] Criar endpoints para ler dados do Firebase RTDB
- [ ] Criar endpoints para sincronizar dados Wokwi
- [ ] Configurar CORS para frontend
- [ ] Testar integração Firebase → Laravel → Frontend

### FASE 3: Simulação Wokwi (Se tempo sobrar)
- [ ] Criar firmware ESP32 básico
- [ ] Configurar conexão com Firebase RTDB
- [ ] Testar envio de dados simulados

## Stack Definitiva

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vanilla JS (ES6 Modules) + Alpine.js + Tailwind CSS |
| Backend | Laravel 13 + PHP 8.3 |
| Real-time | Firebase Realtime Database (2 instâncias) |
| Auth | Firebase Authentication |

## Próximos Passos Imediatos

1. **Resolver erro de OpenSSL** no composer install
2. **Instalar dependências** do Laravel
3. **Configurar Firebase** nos dois projetos (IoT + Auth)
4. **Testar conexão** básica entre frontend e backend
