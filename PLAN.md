# LumenFlow - Planejamento

## Arquitetura Completa com Wokwi Simulado

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

### Fluxo de Dados Completo

1. **Wokwi Web IDE**: Simula o ESP32 enviando dados de sensores para o Firebase RTDB
2. **Firebase RTDB**: Armazena dados brutos da simulação em tempo real
3. **Laravel API**: Lê dados do Firebase, processa e expõe via REST API
4. **Frontend SPA**: Consome API e exibe dashboard atualizado em tempo real

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

### FASE 2: Backend API (Em andamento - 70% concluído)
- [x] Instalar dependências Laravel (resolvido OpenSSL)
- [x] Configurar Firebase Auth
  - Criar FirebaseAuthService
  - Atualizar AuthController para usar Firebase
- [x] Configurar Firebase RTDB (instância IoT)
  - Criar FirebaseRtdbService
  - Implementar métodos para leitura e escrita
- [x] Criar controllers para CRUD de usuários
  - AuthController atualizado
  - Novos endpoints de autenticação
- [x] Criar endpoints para ler dados do Firebase RTDB
  - SensorDataController com endpoints:
    - GET /api/sensors/{device}/readings
    - GET /api/sensors/{device}/latest
    - GET /api/sensors/devices
    - GET /api/dashboard
- [x] Criar endpoints para sincronizar dados Wokwi
  - WokwiSyncController com endpoints:
    - POST /api/wokwi/sync (receber dados do Wokwi)
    - GET /api/wokwi/devices
    - GET /api/wokwi/devices/{device}/status
- [ ] Configurar CORS para frontend
  - Adicionar Wokwi.com e GitHub Pages
- [ ] Testar integração Firebase → Laravel → Frontend

### FASE 3: Integração Wokwi → Firebase (Atualizada)
- [ ] Criar conta no Wokwi Cloud (se necessário)
- [ ] Configurar projeto Wokwi para simular ESP32 com:
  - Sensores de temperatura, umidade e energia
  - Conexão direta com Firebase RTDB
  - Envio de dados em tempo real (a cada 5 segundos)
- [ ] Testar fluxo completo: Wokwi → Firebase → Laravel → Frontend
- [ ] Validar que os dados aparecem no dashboard em tempo real
- [ ] Documentar configuração do Wokwi para futuras simulações

## Stack Definitiva

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vanilla JS (ES6 Modules) + Alpine.js + Tailwind CSS |
| Backend | Laravel 13 + PHP 8.3 |
| Real-time | Firebase Realtime Database (2 instâncias) |
| Auth | Firebase Authentication |

## Próximos Passos Imediatos

1. ✅ **Resolver erro de OpenSSL** no composer install
2. ✅ **Instalar dependências** do Laravel
3. **Configurar Firebase** nos dois projetos (IoT + Auth)
4. **Configurar CORS** para permitir:
   - Wokwi Cloud (https://wokwi.com)
   - Frontend no GitHub Pages
5. **Testar conexão** básica entre frontend e backend
6. **Implementar endpoints** para leitura de dados Firebase

## Resumo para Commit

### Arquivos Criados:
1. `app/Services/FirebaseAuthService.php` - Serviço de autenticação Firebase
2. `app/Services/FirebaseRtdbService.php` - Serviço do Firebase RTDB
3. `app/Http/Controllers/Api/SensorDataController.php` - Controller para dados de sensores
4. `app/Http/Controllers/Api/WokwiSyncController.php` - Controller para integração Wokwi

### Arquivos Atualizados:
1. `app/Http/Controllers/Api/AuthController.php` - Migrado para Firebase Auth
2. `routes/api.php` - Adicionadas novas rotas Firebase e Wokwi
3. `.env.example` - Configurações atualizadas para Firebase e CORS
4. `PLAN.md` e `README.md` - Documentação atualizada

### Funcionalidades Implementadas:
- Autenticação de usuários via Firebase
- Leitura de dados do Firebase RTDB
- Endpoint para receber dados do Wokwi
- Dashboard com dados agregados
- Sistema de sincronização em tempo real

O sistema está pronto para receber dados do Wokwi e processá-los através do Firebase RTDB!
