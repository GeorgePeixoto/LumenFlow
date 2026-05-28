# Scripts e Configurações para Migração

## Arquivos Criados

### 1. `migrate.sh` - Script Principal de Migração
Este script executa toda a reorganização do projeto de forma segura.

**Como usar:**
```bash
bash migrate.sh
```

O script fará:
- Backup do estado atual no Git
- Cria os diretórios `/backend`, `/frontend`, `/iot`
- Move todos os arquivos para os locais corretos
- Limpa arquivos duplicados e logs
- Mostra o status final do Git

### 2. `start-servers.sh` - Script de Inicialização (Atualizado)
Inicia ambos os servidores com as portas corretas:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

**Como usar:**
```bash
bash start-servers.sh
```

### 3. Configurações Atualizadas

#### `frontend/vite.config.js`
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

#### `frontend/package.json`
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

## Passos Pós-Migração

Após executar o `migrate.sh`, siga estes passos:

1. **Instalar dependências**
   ```bash
   cd frontend
   npm install
   
   cd ../backend
   composer install
   ```

2. **Configurar .env do Backend**
   Verifique se o `.env` do backend tem as configurações corretas:
   ```env
   APP_URL=http://localhost:8000
   ```

3. **Gerar chave da aplicação**
   ```bash
   cd backend
   php artisan key:generate
   ```

4. **Testar a aplicação**
   ```bash
   # Iniciar servidores
   bash start-servers.sh
   
   # Ou iniciar individualmente
   cd backend && php artisan serve
   cd frontend && npm run dev
   ```

## Verificação Final

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

Teste:
- Se o frontend carrega corretamente
- Se as chamadas API funcionam
- Se a autenticação com Sanctum funciona
- Se os assets (CSS, JS, imagens) carregam

## Estrutura Final Após Migração

```
LumenFlow/
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   └── composer.lock
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
├── migrate.sh
├── start-servers.sh
└── PLANO_MIGRACAO.md
```