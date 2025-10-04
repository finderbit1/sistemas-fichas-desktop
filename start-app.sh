#!/bin/bash

echo "🚀 Iniciando aplicação Tauri..."

echo "1. Iniciando frontend..."
pnpm run dev &
FRONTEND_PID=$!

echo "2. Aguardando frontend inicializar..."
sleep 8

echo "3. Verificando se frontend está rodando..."
if curl -s http://localhost:1420 > /dev/null; then
    echo "✅ Frontend rodando"
    
    echo "4. Iniciando Tauri..."
    pnpm run tauri dev &
    TAURI_PID=$!
    
    echo "5. Aguardando Tauri inicializar..."
    sleep 15
    
    echo "6. Verificando processos..."
    ps aux | grep -E "(tauri|react_tauri_app)" | grep -v grep
    
    echo "7. Verificando janelas..."
    xwininfo -root -tree | grep -i "s.g.p\|tauri\|react" || echo "Nenhuma janela encontrada"
    
    echo "8. Aplicação deve estar rodando agora!"
    echo "Pressione Ctrl+C para parar"
    
    # Manter script rodando
    wait $TAURI_PID
else
    echo "❌ Frontend não está rodando"
    kill $FRONTEND_PID 2>/dev/null
fi






