# LumenFlow - Dashboard Inteligente de Gestão de Energia IoT

<p align="center">
  <img src="https://img.shields.io/badge/Status-Conclu%C3%ADdo-success" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Versão">
  <img src="https://img.shields.io/badge/PHP-8.3-purple" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-11-red" alt="Laravel">
</p>

<p align="center">
  <i>Monitoramento em tempo real de 12 equipamentos em 4 setores com simulação IoT via Wokwi.</i>
</p>

## 🚀 Sobre o Projeto

O **LumenFlow** é um sistema completo de monitoramento energético IoT para varejo, que simula 12 equipamentos em 4 setores diferentes, enviando dados em tempo real para o Firebase e exibindo informações através de uma interface web moderna.

### ✨ Funcionalidades Implementadas

- 📊 **Dashboard em Tempo Real** - Monitoramento de 12 equipamentos simultâneos
- 🔌 **Simulação IoT Completa** - ESP32 via Wokwi Web IDE
- 📈 **Agregação por Setores** - Refrigeracao, Iluminacao, Equipamentos, Escritorio
- 💰 **Cálculo de Custos** - Estimativa de consumo energético
- 🔐 **Sistema de Autenticação** - Registro, login e proteção de endpoints
- 📱 **Interface Responsiva** - Design moderno com Alpine.js + Tailwind CSS

## 🏗️ Arquitetura do Sistema

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

### 📊 Dados em Tempo Real

O sistema simula equipamentos reais com comportamento realista:

| Setor | Equipamentos | Faixa de Corrente | Faixa de PF |
|-------|--------------|-------------------|-------------|
| **Refrigeracao** | Camara Fria 01/02, Freezer | 5.0 - 18.0 A | 0.80 - 0.95 |
| **Iluminacao** | Galpao, Escritorio, Estacionamento | 1.5 - 6.0 A | 0.90 - 0.99 |
| **Equipamentos** | Empilhadeira, Esteira, Compressor | 8.0 - 25.0 A | 0.78 - 0.92 |
| **Escritorio** | Ar-Condicionado, Servidor, Estações | 2.0 - 15.0 A | 0.85 - 0.98 |

## 🛠️ Tecnologias Utilizadas

### Backend
- **[Laravel 11](https://laravel.com/)** - Framework PHP
- **[Lumen](https://lumen.laravel.com/)** - Micro-framework para APIs
- **[SQLite](https://www.sqlite.org/)** - Banco de dados relacional
- **[Sanctum](https://laravel.com/docs/sanctum)** - Autenticação de API
- **[Guzzle](http://guzzlephp.org/)** - HTTP client para Firebase

### Frontend
- **[Alpine.js](https://alpinejs.dev/)** - Framework JavaScript leve
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Vanilla JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)** - Sem dependências pesadas

### IoT & Cloud
- **[Wokwi Web IDE](https://wokwi.com/)** - Simulação de hardware IoT
- **[Firebase RTDB](https://firebase.google.com/docs/database)** - Banco de dados NoSQL
- **[Firebase Auth](https://firebase.google.com/docs/auth)** - Autenticação de usuários

## 📦 Estrutura do Projeto

```
LumenFlow/
├── backend/                    ← API Laravel
│   ├── app/
│   │   ├── Http/Controllers/   ← Controllers da API
│   │   ├── Services/          ← Serviços (Firebase, etc.)
│   │   └── Models/            ← Models do Laravel
│   ├── routes/
│   │   └── api.php            ← Rotas da API
│   ├── config/
│   │   └── firebase.php       ← Configuração Firebase
│   ├── .env                   ← Variáveis de ambiente
│   └── composer.json
├── src/                        ← Frontend SPA
│   ├── components/            ← Componentes Alpine.js
│   ├── pages/                ← Páginas da aplicação
│   ├── services/             ← Serviços de API
│   ├── utils/                ← Utilitários
│   └── config.js             ← Configuração do frontend
├── index.html                 ← Entry point do frontend
├── README.md                  ← Documentação principal
├── PLAN.md                    ← Roadmap e arquitetura
├── WOKWI_CONFIG.md           ← Configuração Wokwi detalhada
├── monitor-iot.js            ← Script de monitoramento
└── package.json              ← Dependências frontend
```

## 🚀 Como Executar

### Pré-requisitos

- **PHP 8.3+** e **Composer**
- **Node.js** (para frontend)
- Acesso à internet (para Wokwi e Firebase)

### Backend (API Laravel)

1. **Instale as dependências:**
   ```bash
   cd backend
   composer install --ignore-platform-reqs
   ```

2. **Configure o ambiente:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure o Firebase no `.env`:**
   ```env
   # Firebase Realtime Database - Dados IoT (Wokwi)
   FIREBASE_RTDB_URL=https://projeto-pi-bf5a6-default-rtdb.firebaseio.com
   
   # Firebase Authentication - Usuários
   FIREBASE_AUTH_DOMAIN=pi-login-b7130.firebaseapp.com
   FIREBASE_API_KEY=BOPPF4U94KPksHZnFTDe2eB-FgokY5h7m0l7B7EyCwGCZNhUNdf2Rs_VKXNXzJPqwnffRgcBZCi4S0KEj8W-Jyk
   FIREBASE_PROJECT_ID=pi-login-b7130
   ```

4. **Inicie o servidor:**
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

A API estará disponível em `http://localhost:8000/api`.

### Frontend (SPA)

1. **Inicie o servidor local:**
   ```bash
   # Opção 1: Python built-in
   cd src
   python -m http.server 5500
   
   # Opção 2: Node.js
   npx http-server src -p 5500
   ```

2. **Acesse a aplicação:**
   ```
   http://localhost:5500
   ```

### Wokwi (Simulação IoT)

1. **Acesse [Wokwi Web IDE](https://wokwi.com/)**
2. **Crie um novo projeto** com ESP32 Dev Module
3. **Cole o código Arduino** disponível em `WOKWI_CONFIG.md`
4. **Configure as credenciais Firebase** no código
5. **Inicie a simulação**

O Wokwi começará a enviar dados para o Firebase a cada 10 segundos.

## 🔗 Endpoints da API

### Públicos (sem autenticação)
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /api/dashboard/public` | ✅ | Dados agregados do dashboard |
| `GET /api/sensors/{device}/readings` | ✅ | Dados de um dispositivo específico |
| `GET /api/sensors/devices` | ✅ | Lista todos os dispositivos |
| `GET /api/wokwi/devices` | ✅ | Dispositivos ativos |
| `GET /api/wokwi/devices/{device}/status` | ✅ | Status de um dispositivo |

### Protegidos (com autenticação)
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /api/auth/login` | 🔐 | Login de usuário |
| `POST /api/auth/register` | 🔐 | Registro de novo usuário |
| `GET /api/auth/me` | 🔐 | Dados do usuário autenticado |
| `POST /api/auth/logout` | 🔐 | Logout do usuário |

### Dashboard (Exemplo de Resposta)
```json
{
  "success": true,
  "data": {
    "total_devices": 4,
    "active_devices": 4,
    "total_readings": 4,
    "latest_readings": {
      "Setor_A": {
        "nome": "Refrigeracao",
        "potencia": 6465.19,
        "energia_kwh": 3.2268,
        "timestamp": 1779921267
      }
    },
    "setor_data": {
      "Refrigeracao": {
        "total_potencia": 6465.19,
        "total_energia_kwh": 3.2268,
        "devices": ["Setor_A"]
      }
    }
  }
}
```

## 🔧 Configuração Firebase

### Banco de Dados 1 - Dados IoT
- **URL:** `https://projeto-pi-bf5a6-default-rtdb.firebaseio.com`
- **API Key:** `AIzaSyB30ywU-Vx6NdemjfNs0Dt-zUnOYpBIZrs`
- **Regras de Segurança:**
  ```javascript
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```

### Banco de Dados 2 - Autenticação
- **URL:** `https://pi-login-b7130-default-rtdb.firebaseio.com`
- **Configurações no Firebase Console:**
  - Habilitar Email/Password
  - Domínios permitidos: `localhost`, `wokwi.com`

## 📊 Monitoramento em Tempo Real

Para monitorar o sistema, use o script `monitor-iot.js`:

```bash
node monitor-iot.js
```

Este script verifica:
- Dados via API Laravel (a cada 5 segundos)
- Dados direto do Firebase (a cada 30 segundos)
- Detecta mudanças nos valores de potência
- Mostra status geral do sistema

## 🧪 Testes

### Testar a API
```bash
# Testar endpoint público
curl http://localhost:8000/api/dashboard/public

# Testar conexão com Firebase
curl "https://projeto-pi-bf5a6-default-rtdb.firebaseio.com/sensores.json?auth=API_KEY"
```

### Testar Frontend
- Acesse `http://localhost:5500`
- Verifique se o dashboard carrega os dados
- Teste o login/registro de usuários

## 📈 Métricas de Desempenho

| Componente | Frequência | Volume |
|------------|------------|---------|
| **Wokwi** | A cada 10 segundos | 12 equipamentos |
| **Firebase** | Escrita imediata | ~50MB/dia |
| **API Laravel** | Sob demanda | <100ms resposta |
| **Frontend** | A cada 2 segundos | Atualização suave |

## 🔒 Segurança

### Dados IoT (Públicos)
- Endpoint `/api/dashboard/public` sem autenticação
- Dados agregados, sem informações sensíveis

### Dados de Usuário (Privados)
- Todos os endpoints de autenticação usam `auth:sanctum`
- Tokens JWT com expiração
- HTTPS em produção

### CORS Configurado
```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5500', 'https://*.github.io', 'https://wokwi.com'],
'allowed_headers' => ['*'],
'exposed_headers' => ['*'],
'max_age' => 3600,
```

## 🚀 Deploy

### Backend (Laravel)
- **Produção:** Laravel Vapor ou similar
- **Pré-requisitos:** Configurar variáveis de ambiente
- **HTTPS:** Obrigatório para produção

### Frontend
- **Hospedagem:** GitHub Pages
- **Configuração:** Atualizar `API_BASE_URL` no `config.js`

### Firebase
- **Produção:** Configurar regras de segurança restritivas
- **Backup:** Habilitar backup automático

## 📚 Documentação

- **[PLAN.md](PLAN.md)** - Roadmap completo e arquitetura do sistema
- **[WOKWI_CONFIG.md](WOKWI_CONFIG.md)** - Configuração detalhada do Wokwi
- **[backend/README.md](backend/README.md)** - Documentação da API Laravel
- **[src/README.md](src/README.md)** - Documentação do frontend

## 🎯 Público-Alvo

O LumenFlow foi projetado especificamente para:
- 🔧 **Engenheiros de Manutenção** - Monitoramento de equipamentos
- 💼 **Gestores de Operações** - Análise de consumo energético
- 📊 **Administradores** - Tomada de decisão baseada em dados
- 🏢 **Executivos** - Visão geral do consumo da empresa

**Nota:** Este é um sistema administrativo por natureza - não é necessário criar um "painel administrativo" adicional, pois toda a interface já é voltada para usuários com altos níveis de acesso e responsabilidade.

## 🤝 Contribuição

### Como Contribuir
1. Fork do projeto
2. Crie uma branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Regras de Commits
- Use mensagens claras e descritivas
- Siga o formato: `tipo: descrição`
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Atualização de documentação
  - `test:` Adição de testes

## 📄 Licença

Este projeto está sob licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Laravel](https://laravel.com/) - Framework PHP
- [Alpine.js](https://alpinejs.dev/) - Framework JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Firebase](https://firebase.google.com/) - Backend como Serviço
- [Wokwi](https://wokwi.com/) - Simulação de Hardware IoT

---

**Desenvolvido com ❤️ para monitoramento energético eficiente**

*Última atualização: 27/05/2026*  
*Versão: 1.0.0*  
*Status: ✅ Concluído*