#!/bin/bash

echo "🔍 Diagnosticando problema com Tauri..."

echo "1. Verificando ambiente gráfico..."
echo "DISPLAY: $DISPLAY"
echo "XDG_SESSION_TYPE: $XDG_SESSION_TYPE"

echo "2. Verificando dependências..."
which x11-utils > /dev/null && echo "✅ x11-utils instalado" || echo "❌ x11-utils não instalado"

echo "3. Verificando se há janelas abertas..."
xwininfo -root -tree | grep -i "tauri\|react" || echo "Nenhuma janela Tauri encontrada"

echo "4. Testando se o frontend está acessível..."
curl -s http://localhost:1420 > /dev/null && echo "✅ Frontend acessível" || echo "❌ Frontend não acessível"

echo "5. Verificando processos..."
ps aux | grep -E "(tauri|vite)" | grep -v grep || echo "Nenhum processo Tauri/Vite encontrado"

echo "6. Verificando se há erros no log..."
echo "Tentando executar Tauri em modo verbose..."


