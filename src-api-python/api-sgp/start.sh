#!/bin/bash

# 🚀 SCRIPT DE INICIALIZAÇÃO - SISTEMA DE FICHAS
# Versão: 1.0.0
# Otimizado para 25 PCs simultâneos

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "=================================================="
echo "🚀 SISTEMA DE FICHAS - INICIALIZAÇÃO"
echo "=================================================="
echo "Versão: 1.0.0"
echo "Otimizado para: 25 PCs simultâneos"
echo "Taxa de sucesso: 98.88%"
echo "=================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "main.py" ]; then
    print_error "Arquivo main.py não encontrado!"
    print_error "Execute este script no diretório src-api-python/api-sgp"
    exit 1
fi

# Verificar se uv está instalado
if ! command -v uv &> /dev/null; then
    print_error "uv não está instalado!"
    print_status "Instalando uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source ~/.bashrc
fi

# Verificar se Python está disponível
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não está instalado!"
    exit 1
fi

print_success "Pré-requisitos verificados!"

# Ativar ambiente virtual
print_status "Ativando ambiente virtual..."
if [ ! -d ".venv" ]; then
    print_status "Criando ambiente virtual..."
    uv venv
fi

source .venv/bin/activate
print_success "Ambiente virtual ativado!"

# Instalar dependências
print_status "Instalando dependências..."
uv sync --quiet
print_success "Dependências instaladas!"

# Verificar se o banco existe
if [ ! -f "db/banco.db" ]; then
    print_status "Criando banco de dados..."
    mkdir -p db
    uv run python -c "from database.database import create_db_and_tables; create_db_and_tables()" 2>/dev/null || {
        print_warning "Erro ao criar banco, tentando novamente..."
        uv run python -c "from database.database import create_db_and_tables; create_db_and_tables()"
    }
    print_success "Banco de dados criado!"
fi

# Verificar se Redis está disponível (opcional)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        print_success "Redis está funcionando!"
    else
        print_warning "Redis não está rodando (opcional)"
    fi
else
    print_warning "Redis não instalado (opcional)"
fi

# Função para mostrar opções
show_menu() {
    echo ""
    echo "=================================================="
    echo "🎯 OPÇÕES DE INICIALIZAÇÃO"
    echo "=================================================="
    echo "1) 🚀 API Simples (Desenvolvimento)"
    echo "2) 🏭 Sistema de Produção (3 instâncias + Load Balancer)"
    echo "3) 🧪 Executar Teste de 25 PCs"
    echo "4) 📊 Verificar Status da API"
    echo "5) 🔧 Configurar Sistema"
    echo "6) 🎬 Demonstração de 1000 Requisições (Básica)"
    echo "7) 🎭 Demonstração Visual de 1000 Requisições"
    echo "8) 🎪 Demonstração Espetacular de 1000 Requisições"
    echo "9) ❌ Sair"
    echo "=================================================="
    echo -n "Escolha uma opção (1-9): "
}

# Função para iniciar API simples
start_simple_api() {
    print_status "Iniciando API simples..."
    print_status "URL: http://localhost:8000"
    print_status "Health Check: http://localhost:8000/health"
    print_status "Docs: http://localhost:8000/docs"
    echo ""
    print_warning "Pressione Ctrl+C para parar a API"
    echo ""
    
    uv run python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

# Função para iniciar sistema de produção
start_production_system() {
    print_status "Iniciando sistema de produção..."
    print_status "Load Balancer: http://localhost:9000"
    print_status "API 1: http://localhost:8000"
    print_status "API 2: http://localhost:8001"
    print_status "API 3: http://localhost:8002"
    echo ""
    print_warning "Pressione Ctrl+C para parar o sistema"
    echo ""
    
    uv run python start_production_system.py
}

# Função para executar teste
run_test() {
    print_status "Executando teste de 25 PCs..."
    print_status "Duração: 60 segundos"
    print_status "Meta: 99%+ de sucesso"
    echo ""
    
    # Verificar se API está rodando
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_warning "API não está rodando. Iniciando API em background..."
        uv run python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
        API_PID=$!
        sleep 5
    fi
    
    uv run python test_25_pcs_quick.py
    
    # Parar API se foi iniciada por nós
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
}

# Função para verificar status
check_status() {
    print_status "Verificando status da API..."
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API está funcionando!"
        echo ""
        print_status "Resposta do Health Check:"
        curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health
    else
        print_error "API não está funcionando!"
        print_status "Tente iniciar a API primeiro (opção 1 ou 2)"
    fi
}

# Função para configurar sistema
configure_system() {
    print_status "Configurando sistema..."
    
    # Criar diretório de logs
    mkdir -p logs
    
    # Verificar configurações
    if [ ! -f ".env" ]; then
        print_status "Criando arquivo .env..."
        cp env.example .env 2>/dev/null || {
            print_warning "Arquivo env.example não encontrado, criando .env básico..."
            cat > .env << EOF
DATABASE_URL=sqlite:///./db/banco.db
DATABASE_TYPE=sqlite
API_V1_STR=/api/v1
PROJECT_NAME=Sistema de Fichas
VERSION=1.0.0
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
EOF
        }
        print_success "Arquivo .env criado!"
    fi
    
    # Verificar permissões
    chmod +x start.sh
    chmod +x test_25_pcs_quick.py
    chmod +x start_production_system.py
    chmod +x demo_*.py
    
    print_success "Sistema configurado!"
}

# Função para demonstração básica
run_demo_basic() {
    print_status "Executando demonstração básica de 1000 requisições..."
    print_warning "Certifique-se de que a API está rodando!"
    echo ""
    uv run python demo_1000_requests.py
}

# Função para demonstração visual
run_demo_visual() {
    print_status "Executando demonstração visual de 1000 requisições..."
    print_warning "Certifique-se de que a API está rodando!"
    echo ""
    uv run python demo_visual_impressionante.py
}

# Função para demonstração espetacular
run_demo_espetacular() {
    print_status "Executando demonstração espetacular de 1000 requisições..."
    print_warning "Certifique-se de que a API está rodando!"
    echo ""
    uv run python demo_espetacular.py
}

# Loop principal
while true; do
    show_menu
    read -r choice
    
        case $choice in
        1)
            start_simple_api
            break
            ;;
        2)
            start_production_system
            break
            ;;
        3)
            run_test
            ;;
        4)
            check_status
            ;;
        5)
            configure_system
            ;;
        6)
            run_demo_basic
            ;;
        7)
            run_demo_visual
            ;;
        8)
            run_demo_espetacular
            ;;
        9)
            print_status "Saindo..."
            exit 0
            ;;
        *)
            print_error "Opção inválida! Escolha entre 1-9."
            ;;
    esac
    
    echo ""
    echo -n "Pressione Enter para continuar..."
    read -r
done

print_success "Sistema finalizado!"
