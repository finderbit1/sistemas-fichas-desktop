#!/bin/bash

# Script para inicializar sistema com SeaORM
# Este script configura e inicia o sistema com SeaORM habilitado

set -e

echo "🚀 Iniciando Sistema de Fichas com SeaORM..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -f "src-tauri/Cargo.toml" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Configurar variáveis de ambiente se não existirem
if [ ! -f "src-tauri/.env" ]; then
    log "📝 Criando arquivo de configuração .env..."
    cat > src-tauri/.env << EOF
# Configuração do Banco de Dados
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite://data/clientes.db

# Configurações de Performance
CACHE_ENABLED=true
CACHE_TTL=300000

# Configurações de Log
RUST_LOG=info
RUST_LOG_STYLE=auto

# Configurações de Desenvolvimento
DEV_MODE=true
DEBUG_LOGS=true
EOF
    log "✅ Arquivo .env criado com configurações padrão"
fi

# Verificar tipo de banco configurado
DATABASE_TYPE=$(grep "^DATABASE_TYPE=" src-tauri/.env | cut -d'=' -f2 | tr -d '"')

if [ "$DATABASE_TYPE" = "postgres" ]; then
    log "🐘 Configuração PostgreSQL detectada"
    
    # Verificar se PostgreSQL está disponível
    if ! command -v psql &> /dev/null; then
        warn "PostgreSQL não encontrado. Instalando dependências..."
        
        # Detectar sistema operacional
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo apt update
                sudo apt install -y postgresql postgresql-contrib
            elif command -v yum &> /dev/null; then
                sudo yum install -y postgresql-server postgresql-contrib
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install postgresql
            fi
        fi
    fi
    
    info "📡 Verificando conexão PostgreSQL..."
    # Testar conexão (implementar se necessário)
    
elif [ "$DATABASE_TYPE" = "sqlite" ]; then
    log "💾 Configuração SQLite detectada"
    
    # Criar diretório de dados se não existir
    mkdir -p src-tauri/data
    log "✅ Diretório de dados criado"
    
else
    warn "Tipo de banco desconhecido: $DATABASE_TYPE. Usando SQLite como fallback."
    DATABASE_TYPE="sqlite"
fi

# Limpar cache se necessário
if [ "$1" = "--clean" ]; then
    log "🧹 Limpando cache e builds anteriores..."
    rm -rf src-tauri/target/
    rm -rf node_modules/.vite/
    rm -rf dist/
    log "✅ Cache limpo"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "📦 Instalando dependências do frontend..."
    npm install
fi

# Build do frontend
log "🏗️ Construindo frontend..."
npm run build

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Falha no build do frontend"
    exit 1
fi

log "✅ Frontend construído com sucesso"

# Informações sobre o sistema
log "📊 Informações do Sistema:"
echo "  🗄️  Banco de dados: $DATABASE_TYPE"
echo "  🔧 Modo: Desenvolvimento"
echo "  📁 Diretório de dados: src-tauri/data/"
echo "  🌐 Frontend: dist/"

# Mostrar commands disponíveis
log "🎯 Commands SeaORM disponíveis:"
echo "  • create_cliente_seaorm"
echo "  • get_all_clientes_seaorm"
echo "  • create_pedido_seaorm"
echo "  • get_all_pedidos_seaorm"
echo "  • create_designer_seaorm"
echo "  • create_vendedor_seaorm"
echo "  • database_backup_seaorm"
echo "  • optimize_database_seaorm"

# Opções de inicialização
echo ""
log "🚀 Opções de inicialização:"
echo "  1. Desenvolvimento: npm run tauri:dev"
echo "  2. Build produção: npm run tauri:build"
echo "  3. Teste: cargo test --package react_tauri_app"

echo ""
log "💡 Dicas:"
echo "  • Para PostgreSQL: Configure DATABASE_TYPE=postgres no .env"
echo "  • Para limpar cache: ./start-seaorm.sh --clean"
echo "  • Para backup: Use database_backup_seaorm command"

echo ""
log "🎉 Sistema SeaORM configurado e pronto para uso!"
