#!/bin/bash

echo "🚀 Iniciando Sistema de Fichas - Modo Desenvolvimento"
echo ""

# Verificar se há processos rodando
echo "🔍 Verificando processos existentes..."
pkill -f "vite\|node.*dev" 2>/dev/null || echo "   Nenhum processo Vite encontrado"

# Aguardar um pouco para garantir que os processos foram finalizados
sleep 2

echo ""
echo "📦 Instalando dependências..."
pnpm install

echo ""
echo "🌐 Iniciando servidor de desenvolvimento..."
echo "   Frontend será servido em: http://localhost:1420"
echo "   Aguarde a mensagem 'Local: http://localhost:1420/' antes de continuar"
echo ""

# Iniciar o frontend em background

# Aguardar o frontend estar pronto
echo "⏳ Aguardando frontend estar pronto..."
sleep 5

# Verificar se o frontend está rodando
if curl -s http://localhost:1420 > /dev/null; then
    echo "✅ Frontend está rodando!"
    echo ""
    echo "🎯 Iniciando aplicação Tauri..."
    echo "   A janela da aplicação deve aparecer em breve"
    echo ""
    
    # Iniciar o Tauri
    pnpm run tauri dev
    
    # Quando o Tauri terminar, finalizar o frontend
    echo ""
    echo "🛑 Finalizando frontend..."
    kill $FRONTEND_PID 2>/dev/null || echo "   Frontend já foi finalizado"
else
    echo "❌ Frontend não conseguiu iniciar corretamente"
    echo "   Tentando iniciar apenas o Tauri..."
    kill $FRONTEND_PID 2>/dev/null
    pnpm run tauri dev
fi

echo ""
echo "✅ Processo finalizado"



