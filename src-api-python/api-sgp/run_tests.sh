#!/bin/bash

# 🧪 Script para executar testes
# Usa uv para gerenciar dependências

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "🧪 EXECUTANDO TESTES - Sistema de Fichas"
echo "=========================================="
echo ""

# Ativar ambiente virtual
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Criando ambiente virtual...${NC}"
    uv venv
fi

source .venv/bin/activate

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
uv pip install -r requirements.txt -q

echo ""
echo "=========================================="
echo "🧪 EXECUTANDO TESTES"
echo "=========================================="
echo ""

# Executar testes com pytest
if [ "$1" == "diagnose" ]; then
    echo -e "${BLUE}🔬 Executando diagnóstico completo...${NC}"
    python -m pytest tests/test_clientes.py::test_diagnose_cliente_creation -v -s
elif [ "$1" == "verbose" ]; then
    echo -e "${BLUE}📊 Executando todos os testes (modo verbose)...${NC}"
    python -m pytest tests/test_clientes.py -vv -s
elif [ "$1" == "quick" ]; then
    echo -e "${BLUE}⚡ Executando testes básicos...${NC}"
    python -m pytest tests/test_clientes.py -k "test_database_connection or test_create_cliente_direct_database or test_create_cliente_api" -v -s
else
    echo -e "${BLUE}📊 Executando todos os testes...${NC}"
    python -m pytest tests/test_clientes.py -v -s
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ TESTES CONCLUÍDOS${NC}"
echo "=========================================="


