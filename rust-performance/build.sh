#!/bin/bash

# Script de Build para Rust Performance Engine
# Compila Rust para WebAssembly e integra com React

set -e

echo "🚀 Iniciando build do Rust Performance Engine..."

# Verificar se wasm-pack está instalado
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack não encontrado. Instalando..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Verificar se Rust está instalado
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust não encontrado. Instale em: https://rustup.rs/"
    exit 1
fi

# Navegar para o diretório do projeto Rust
cd "$(dirname "$0")"

echo "📦 Compilando Rust para WebAssembly..."

# Compilar com wasm-pack
wasm-pack build --target web --out-dir pkg --dev

echo "✅ Compilação concluída!"

# Verificar se os arquivos foram gerados
if [ ! -f "pkg/sgp_performance.js" ]; then
    echo "❌ Erro: arquivo pkg/sgp_performance.js não foi gerado"
    exit 1
fi

if [ ! -f "pkg/sgp_performance_bg.wasm" ]; then
    echo "❌ Erro: arquivo pkg/sgp_performance_bg.wasm não foi gerado"
    exit 1
fi

echo "📋 Arquivos gerados:"
ls -la pkg/

echo ""
echo "🎉 Build concluído com sucesso!"
echo "📁 Arquivos WASM disponíveis em: rust-performance/pkg/"
echo ""
echo "📝 Próximos passos:"
echo "1. Copie os arquivos da pasta pkg/ para o projeto React"
echo "2. Importe o módulo em seus componentes"
echo "3. Execute o sistema e veja a performance melhorada!"
echo ""
echo "🔧 Para usar em desenvolvimento:"
echo "   wasm-pack build --target web --out-dir pkg --dev"
echo ""
echo "🚀 Para produção:"
echo "   wasm-pack build --target web --out-dir pkg --release"
