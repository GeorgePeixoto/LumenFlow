#!/bin/bash

# LumenFlow - Script de Deploy
# Script para automatizar o deploy do sistema completo

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LumenFlow - Script de Deploy${NC}"
echo "=================================="

# Verificar pré-requisitos
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP não encontrado!${NC}"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    echo -e "${RED}❌ Composer não encontrado!${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos OK!${NC}"

# Backend Deploy
echo -e "${YELLOW}🔧 Deploy do Backend (Laravel)...${NC}"

cd backend

# Instalar dependências
echo "Instalando dependências do Composer..."
composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# Gerar chave da aplicação
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    php artisan key:generate
fi

# Rodar migrações
echo "Rodando migrações..."
php artisan migrate --force

# Limpar cache
echo "Limpando cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo -e "${GREEN}✅ Backend deployado com sucesso!${NC}"

# Frontend Build
echo -e "${YELLOW}🎨 Deploy do Frontend...${NC}"

cd ..

# Instalar dependências frontend
echo "Instalando dependências frontend..."
npm install

# Construir frontend (se necessário)
echo "Construindo frontend..."
npm run build

echo -e "${GREEN}✅ Frontend deployado com sucesso!${NC}"

# Configuração Firebase
echo -e "${YELLOW}⚙️ Configuração Firebase...${NC}"

if [ ! -f backend/.env ]; then
    echo "⚠️  Atualize o arquivo .env com suas credenciais Firebase:"
    echo ""
    echo "FIREBASE_RTDB_URL=https://seu-projeto.firebaseio.com"
    echo "FIREBASE_API_KEY=sua-api-key"
    echo "FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com"
    echo "FIREBASE_PROJECT_ID=seu-projeto-id"
    echo ""
fi

echo -e "${GREEN}✅ Configuração Firebase pronta!${NC}"

# Iniciar serviços
echo -e "${YELLOW}🚀 Iniciando serviços...${NC}"

# Iniciar backend em background
echo "Iniciando backend na porta 8000..."
cd backend
nohup php artisan serve --host=0.0.0.0 --port=8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Iniciar frontend
echo "Iniciando frontend na porta 5500..."
cd ..
nohup python3 -m http.server 5500 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo -e "${GREEN}✅ Serviços iniciados!${NC}"

# Status
echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo "=================================="
echo ""
echo "📊 Backend: http://localhost:8000"
echo "🖥️  Frontend: http://localhost:5500"
echo ""
echo "📝 Logs:"
echo "  - Backend: tail -f backend.log"
echo "  - Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para parar os serviços:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}🔍 Verificando endpoints...${NC}"

# Testar endpoints
sleep 3

echo "Testando backend..."
if curl -s http://localhost:8000/api/test > /dev/null; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${RED}❌ Backend falhou${NC}"
fi

echo "Testando frontend..."
if curl -s http://localhost:5500 > /dev/null; then
    echo -e "${GREEN}✅ Frontend OK${NC}"
else
    echo -e "${RED}❌ Frontend falhou${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Sistema pronto para uso!${NC}"