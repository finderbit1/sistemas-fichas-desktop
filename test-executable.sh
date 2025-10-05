#!/bin/bash

echo "🔍 Testando executável Tauri..."

EXECUTABLE="./src-tauri/target/release/react_tauri_app"

if [ ! -f "$EXECUTABLE" ]; then
    echo "❌ Executável não encontrado: $EXECUTABLE"
    exit 1
fi

echo "✅ Executável encontrado: $EXECUTABLE"
echo "📊 Tamanho: $(du -h "$EXECUTABLE" | cut -f1)"

echo ""
echo "🔧 Testando diferentes configurações..."

# Teste 1: Executar normalmente
echo "1. Executando normalmente..."
timeout 5s "$EXECUTABLE" 2>&1 || echo "Timeout ou erro"

echo ""
echo "2. Executando com variáveis de ambiente..."
export DISPLAY=:0
export XDG_SESSION_TYPE=x11
timeout 5s "$EXECUTABLE" 2>&1 || echo "Timeout ou erro"

echo ""
echo "3. Verificando dependências..."
ldd "$EXECUTABLE" | grep -E "(gtk|webkit|glib)" | head -5

echo ""
echo "4. Testando com modo headless..."
timeout 5s "$EXECUTABLE" --help 2>&1 || echo "Não suporta --help"

echo ""
echo "✅ Testes concluídos!"







