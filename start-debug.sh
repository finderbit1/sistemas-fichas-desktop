#!/bin/bash

echo "🚀 Iniciando Sistema de Fichas - Debug Mode"
echo ""

# Limpar processos existentes
echo "🧹 Limpando processos existentes..."
pkill -f "tauri\|vite\|node.*dev\|pnpm" 2>/dev/null || echo "   Nenhum processo encontrado"
sleep 3

# Verificar se as portas estão livres
echo "🔍 Verificando portas..."
if lsof -i :1420 >/dev/null 2>&1; then
    echo "   ⚠️  Porta 1420 em uso, finalizando..."
    lsof -ti :1420 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Verificar dependências
echo "📦 Verificando dependências..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado!"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ cargo não encontrado!"
    exit 1
fi

# Instalar dependências se necessário
echo "📦 Instalando dependências..."
pnpm install

# Verificar se há erros de compilação Rust
echo "🔧 Verificando compilação Rust..."
cd src-tauri
if ! cargo check --quiet; then
    echo "❌ Erro de compilação Rust encontrado!"
    echo "🔍 Executando cargo check com detalhes..."
    cargo check
    exit 1
fi
cd ..

echo ""
echo "🌐 Iniciando frontend..."
echo "   Aguarde a mensagem 'Local: http://localhost:1420/'"
echo ""

# Iniciar frontend em background
pnpm run dev &
FRONTEND_PID=$!

# Aguardar frontend estar pronto
echo "⏳ Aguardando frontend estar pronto..."
for i in {1..30}; do
    if curl -s http://localhost:1420 > /dev/null 2>&1; then
        echo "✅ Frontend está rodando!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend não conseguiu iniciar em 30 segundos"
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎯 Iniciando aplicação Tauri..."
echo "   A janela deve aparecer em breve"
echo ""

# Iniciar Tauri com debug
RUST_BACKTRACE=1 pnpm run tauri dev &
TAURI_PID=$!

# Aguardar Tauri
sleep 5

# Verificar se Tauri ainda está rodando
if ! kill -0 $TAURI_PID 2>/dev/null; then
    echo "❌ Tauri falhou ao iniciar!"
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Aplicação iniciada com sucesso!"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Tauri PID: $TAURI_PID"
echo ""
echo "💡 Para finalizar: Ctrl+C"

# Aguardar sinal de interrupção
trap 'echo ""; echo "🛑 Finalizando aplicação..."; kill $FRONTEND_PID $TAURI_PID 2>/dev/null; echo "✅ Finalizado"; exit 0' INT

# Manter script rodando
wait





