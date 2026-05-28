#!/bin/bash

# LumenFlow - Script de Inicialização de Servidores (Atualizado)
# Script para iniciar os servidores na nova estrutura de monorepo

echo "🚀 Iniciando servidores do LumenFlow..."
echo "=================================="

# Iniciar backend
echo "Iniciando backend na porta 8000..."
cd backend
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Iniciar frontend
echo "Iniciando frontend na porta 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ Serviços iniciados!"
echo "=================================="
echo ""
echo "📊 Backend: http://localhost:8000"
echo "🖥️  Frontend: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "  - Backend: tail -f backend.log"
echo "  - Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para parar os serviços:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Esperar alguns segundos e testar
echo "🔍 Verificando endpoints..."
sleep 3

echo "Testando backend..."
if curl -s http://localhost:8000/api/test > /dev/null; then
    echo "✅ Backend OK"
else
    echo "❌ Backend falhou - aguardando inicialização..."
fi

echo "Testando frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend OK"
else
    echo "❌ Frontend falhou - aguardando inicialização..."
fi

echo ""
echo "🎉 Sistema pronto para uso!"