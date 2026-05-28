# Plano de Migração e Reestruturação de Arquitetura - LumenFlow

## Visão Geral
Este plano detalha a migração do projeto atual caótico para uma estrutura de monorepo organizada com três diretórios principais: `/backend`, `/frontend` e `/iot`.

---

## Fase 1: Análise de Impacto

### 1.1 Pontos Críticos de Risco

#### **Conexões entre Frontend e Backend**
- **Autenticação com Laravel Sanctum**: As requisições do Axios precisam continuar apontando para o mesmo endpoint de autenticação (`/sanctum/csrf-token`). O cookie de sessão deve ser mantido entre domínios (mesmo em localhost:3000 → localhost:8000).
- **Caminhos de API**: Todas as chamadas de API no frontend precisam atualizar URLs de base se houver mudança na estrutura de roteamento.
- **CORS**: O Laravel precisa permitir requisições do novo caminho do frontend (se estiver em porta diferente).

#### **Assets e Build do Vite**
- **Importação de assets**: Caminhos relativos em CSS, imagens e fonts podem quebrar se a estrutura de diretórios mudar.
- **Public path**: O Vite precisa ser configurado para servir assets do diretório correto após a migração.
- **Base URL**: Se o frontend for acessado de um subdiretório, o base URL do Vite precisa ser ajustado.

#### **Configurações do Tailwind CSS**
- **Import de CSS**: O arquivo `tailwind.config.js` precisa apontar para os arquivos de conteúdo corretos após a reorganização.
- **Caminhos de templates**: O scanner do Tailwind precisa encontrar todos os arquivos HTML/PHP que usam classes Tailwind.

#### **Scripts do Concurrently**
- **Caminhos dos scripts**: Os comandos no `package.json` precisam apontar para os novos diretórios dos servidores.
- **Ambientes**: Variáveis de ambiente podem precisar ajustes se os caminhos relativos mudarem.

---

## Fase 2: Script de Execução (Passo a Passo)

### 2.1 Backup e Preparação

```bash
# 1. Criar backup do estado atual
git add .
git commit -m "backup: estado pré-reestruturação"

# 2. Criar os novos diretórios
mkdir -p backend frontend iot

# 3. Mover backend (preservando .git e package.json)
rsync -av --exclude='.git' --exclude='package.json' --exclude='vite.config.js' ./backend/ ./backend/
mv ./backend/.git ./backend/

# 4. Mover arquivos de frontend
rsync -av ./src/ ./frontend/
mv ./index.html ./frontend/
mv ./src/index.html ./frontend/  # mover a cópia também

# 5. Mover configurações do frontend para o local correto
mv ./backend/vite.config.js ./frontend/
mv ./backend/package.json ./frontend/

# 6. Mover arquivos IoT
mv WOKWI_CONFIG.md ./iot/
mv requirements.yaml ./iot/
mv monitor-iot.js ./iot/
mv deploy.sh ./iot/

# 7. Mover scripts de servidor
mv start-servers.sh ./

# 8. Limpar arquivos duplicados e lixo
rm -rf ./src/
rm -f ./index.html  # remover cópia duplicada da raiz
rm -f backend.log frontend.log

# 9. Verificar estado do Git
git status
```

---

## Fase 3: Refatoração de Configurações

### 3.1 Novo `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import { bunny } from 'laravel-vite-plugin/fonts'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
})
```

### 3.2 Novo `frontend/package.json`

```json
{
    "$schema": "https://www.schemastore.org/package.json",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "start-servers": "concurrently \"cd ../backend && php artisan serve --host=0.0.0.0 --port=8000\" \"npm run dev\""
    },
    "devDependencies": {
        "@tailwindcss/vite": "^4.0.0",
        "concurrently": "^9.0.1",
        "laravel-vite-plugin": "^3.1",
        "tailwindcss": "^4.0.0",
        "vite": "^8.0.0"
    }
}
```

### 3.3 Configuração do Backend

Garanta que o `backend/composer.json` tenha as dependências corretas:

```json
{
    "require": {
        "php": "^8.1",
        "guzzlehttp/guzzle": "^7.2",
        "kreait/firebase-php": "^6.0",
        "laravel/sanctum": "^3.3",
        "laravel/tinker": "^2.8"
    }
}
```

### 3.4 Atualizar `.env` do Frontend (se necessário)

Se houver variáveis específicas do frontend, crie um `.env` em `frontend/.env`:

```
VITE_APP_API_URL=http://localhost:8000
VITE_APP_ASSET_URL=http://localhost:3000
```

---

## Fase 4: Checklist de Validação

### 4.1 Validação do Frontend

1. **Instalar dependências**
   ```bash
   cd frontend
   npm install
   ```

2. **Testar build do Vite**
   ```bash
   npm run build
   # Verificar se dist/ foi criado com os assets
   ```

3. **Iniciar servidor de desenvolvimento**
   ```bash
   npm run dev
   # Acessar http://localhost:3000
   ```

### 4.2 Validação do Backend

1. **Instalar dependências**
   ```bash
   cd backend
   composer install
   ```

2. **Iniciar servidor Laravel**
   ```bash
   php artisan serve
   # Acessar http://localhost:8000
   ```

### 4.3 Testes de Integração

1. **Testar autenticação Sanctum**
   - Acessar o frontend
   - Verificar se o cookie CSRF está sendo setado
   - Fazer login e verificar se a sessão é mantida

2. **Testar comunicação API**
   - Fazer chamadas API do frontend para o backend
   - Verificar se as respostas estão chegando corretamente
   - Testar endpoints protegidos

3. **Testar assets**
   - Verificar se CSS, JS e imagens estão carregando
   - Testar Tailwind CSS (botões, formulários, etc.)

### 4.4 Testes com IoT (se aplicável)

1. **Acessar scripts de IoT**
   ```bash
   cd iot
   node monitor-iot.js
   ```

2. **Verificar simulação Wokwi**
   - Abrir o arquivo WOKWI_CONFIG.md
   - Testar se a simulação inicia corretamente

### 4.5 Verificação Final

1. **Testar concurrently**
   ```bash
   npm run start-servers
   # Ambos os servidores devem iniciar
   ```

2. **Testar deploy**
   ```bash
   cd iot
   ./deploy.sh
   # Verificar se o deploy funciona
   ```

---

## Considerações Adicionais

### 5.1 Git Worktree (Opcional)

Para facilitar o desenvolvimento, você pode usar git worktree:

```bash
# Criar worktrees para cada diretório
git worktree add ../backend-branch backend
git worktree add ../frontend-branch frontend
git worktree add ../iot-branch iot
```

### 5.2 Docker (Futuro)

Considere criar um `docker-compose.yml` para orquestrar os serviços:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    depends_on:
      - backend
```

### 5.3 Documentação

Atualize a documentação para refletir a nova estrutura:

- Criar `README.md` na raiz explicando a nova estrutura
- Documentar como iniciar cada serviço individualmente
- Adicionar exemplos de uso do concurrently

---

## Resumo da Estrutura Final

```
LumenFlow/
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/  # Apenas o index.php do Laravel
│   ├── resources/
│   ├── routes/
│   ├── tests/
│   └── composer.json
├── frontend/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── resources/
│   │   ├── css/
│   │   └── js/
│   └── dist/
├── iot/
│   ├── WOKWI_CONFIG.md
│   ├── requirements.yaml
│   ├── monitor-iot.js
│   └── deploy.sh
└── start-servers.sh
```

Este plano garante uma migração segura e organizada, mantendo todas as funcionalidades intactas enquanto estabelece uma estrutura profissional e escalável.