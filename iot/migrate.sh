#!/bin/bash

# LumenFlow - Script de Migração e Reestruturação
# Este script organiza o projeto em um monorepo limpo

echo "🚀 Iniciando migração do LumenFlow..."
echo "===================================="

# 1. Criar backup do estado atual
echo "1. Criando backup..."
git add .
git commit -m "backup: estado pré-reestruturação"

# 2. Criar os novos diretórios
echo "2. Criando diretórios..."
mkdir -p backend frontend iot

# 3. Mover backend (preservando .git e configurações)
echo "3. Movendo backend..."
rsync -av --exclude='.git' --exclude='package.json' --exclude='vite.config.js' ./backend/ ./backend/
if [ -d "./backend/.git" ]; then
    mv ./backend/.git ./backend/
fi

# 4. Mover arquivos de frontend
echo "4. Movendo frontend..."
rsync -av ./src/ ./frontend/
mv ./index.html ./frontend/
if [ -f "./src/index.html" ]; then
    mv ./src/index.html ./frontend/
fi

# 5. Mover configurações do frontend
echo "5. Movendo configurações..."
mv ./backend/vite.config.js ./frontend/
mv ./backend/package.json ./frontend/

# 6. Mover arquivos IoT
echo "6. Movendo arquivos IoT..."
mv WOKWI_CONFIG.md ./iot/
mv requirements.yaml ./iot/
mv monitor-iot.js ./iot/
mv deploy.sh ./iot/

# 7. Mover scripts de servidor
echo "7. Movendo scripts..."
mv start-servers.sh ./

# 8. Limpar arquivos duplicados e lixo
echo "8. Limpando..."
rm -rf ./src/
rm -f ./index.html
rm -f backend.log frontend.log

# 9. Verificar estado do Git
echo "9. Verificando estado do Git..."
git status

echo ""
echo "✅ Migração concluída!"
echo "===================================="
echo ""
echo "📁 Nova estrutura do projeto:"
echo "  ├── backend/     # Ecossistema Laravel"
echo "  ├── frontend/    # Frontend com Vite/Alpine"
echo "  ├── iot/         # Scripts e simulações"
echo "  └── start-servers.sh"
echo ""
echo "🔧 Próximos passos:"
echo "  1. cd frontend && npm install"
echo "  2. cd backend && composer install"
echo "  3. npm run start-servers"
echo ""