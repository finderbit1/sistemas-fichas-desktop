#!/bin/bash

echo "🚀 Testando Migração Python → Rust"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

echo "📦 Verificando dependências..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado"
    exit 1
fi

# Verificar Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust não encontrado"
    exit 1
fi

# Verificar Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI não encontrado"
    exit 1
fi

echo "✅ Dependências OK"

echo ""
echo "🔧 Compilando projeto Rust..."

# Compilar o projeto Rust
cd src-tauri
if cargo check; then
    echo "✅ Compilação Rust OK"
else
    echo "❌ Erro na compilação Rust"
    exit 1
fi

cd ..

echo ""
echo "📦 Instalando dependências Node.js..."

if npm install; then
    echo "✅ Dependências Node.js instaladas"
else
    echo "❌ Erro ao instalar dependências Node.js"
    exit 1
fi

echo ""
echo "🧪 Testando build do frontend..."

if npm run build; then
    echo "✅ Build do frontend OK"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi

echo ""
echo "🎯 Testando aplicação Tauri..."

# Testar se a aplicação inicia (timeout de 30 segundos)
timeout 30s npm run tauri dev &
TAURI_PID=$!

sleep 10

# Verificar se o processo ainda está rodando
if kill -0 $TAURI_PID 2>/dev/null; then
    echo "✅ Aplicação Tauri iniciou com sucesso"
    kill $TAURI_PID
else
    echo "❌ Aplicação Tauri falhou ao iniciar"
    exit 1
fi

echo ""
echo "📊 Resumo dos Testes:"
echo "===================="
echo "✅ Rust compilado"
echo "✅ Dependências instaladas"
echo "✅ Frontend buildado"
echo "✅ Tauri iniciado"

echo ""
echo "🎉 Migração concluída com sucesso!"
echo ""
echo "Para usar a aplicação:"
echo "  npm run tauri dev    # Modo desenvolvimento"
echo "  npm run tauri build  # Build para produção"
echo ""
echo "Para voltar ao Python:"
echo "  npm run dev          # Modo desenvolvimento web"
echo ""







