#!/bin/bash

# Script de inicialização do servidor API
# Configurado para aceitar conexões de outros computadores na rede

echo "======================================================================"
echo "🚀 INICIANDO SERVIDOR API - SISTEMA DE FICHAS"
echo "======================================================================"
echo ""
echo "📡 Configuração:"
echo "   ├─ Host: 0.0.0.0 (todas as interfaces)"
echo "   ├─ Porta: 8000"
echo "   └─ Permitindo conexões externas: SIM"
echo ""

# Descobrir IP local
LOCAL_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -n 1)

if [ -z "$LOCAL_IP" ]; then
    # Fallback para hostname -I
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "🌐 Acesso:"
echo "   ├─ Local: http://localhost:8000"
echo "   └─ Rede:  http://${LOCAL_IP}:8000"
echo ""
echo "💡 Outros computadores devem usar: http://${LOCAL_IP}:8000"
echo ""
echo "📝 Configure os clientes Windows com este IP:"
echo "   Editar config/api-config.json:"
echo "   {"
echo "     \"apiURL\": \"http://${LOCAL_IP}:8000\","
echo "     \"wsURL\": \"ws://${LOCAL_IP}:8000\""
echo "   }"
echo ""
echo "⚠️  IMPORTANTE: Configure o firewall se necessário:"
echo "   sudo ufw allow 8000/tcp"
echo ""
echo "======================================================================"
echo ""

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "🐍 Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Iniciar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

