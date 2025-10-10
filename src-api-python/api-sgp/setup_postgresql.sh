#!/bin/bash

# 🚀 SCRIPT DE SETUP - PostgreSQL 18
# Configura PostgreSQL para o Sistema de Fichas

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
clear
echo "=================================================="
echo -e "${BLUE}🐘 SETUP POSTGRESQL 18 - Sistema de Fichas${NC}"
echo "=================================================="
echo ""

# Ler configurações do banco.conf
echo -e "${BLUE}📁 Lendo configurações de banco.conf...${NC}"

if [ ! -f "banco.conf" ]; then
    echo -e "${RED}❌ Arquivo banco.conf não encontrado!${NC}"
    echo "Execute este script no diretório src-api-python/api-sgp"
    exit 1
fi

# Parse banco.conf
POSTGRES_DB=$(grep "^POSTGRES_DB=" banco.conf | cut -d'=' -f2)
POSTGRES_USER=$(grep "^POSTGRES_USER=" banco.conf | cut -d'=' -f2)
POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" banco.conf | cut -d'=' -f2)
POSTGRES_HOST=$(grep "^POSTGRES_HOST=" banco.conf | cut -d'=' -f2)
POSTGRES_PORT=$(grep "^POSTGRES_PORT=" banco.conf | cut -d'=' -f2)

echo -e "${GREEN}✅ Configurações carregadas:${NC}"
echo "   Host: $POSTGRES_HOST"
echo "   Port: $POSTGRES_PORT"
echo "   Database: $POSTGRES_DB"
echo "   User: $POSTGRES_USER"
echo ""

# Verificar se PostgreSQL está instalado
echo -e "${BLUE}🔍 Verificando PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL não está instalado!${NC}"
    echo ""
    echo -e "${YELLOW}📦 Para instalar PostgreSQL 18:${NC}"
    echo ""
    echo "# Arch Linux:"
    echo "sudo pacman -S postgresql"
    echo "sudo -u postgres initdb -D /var/lib/postgres/data"
    echo "sudo systemctl start postgresql"
    echo "sudo systemctl enable postgresql"
    echo ""
    echo "# Ubuntu/Debian:"
    echo "sudo apt install postgresql-18 postgresql-contrib-18"
    echo "sudo systemctl start postgresql"
    echo ""
    echo "# Fedora:"
    echo "sudo dnf install postgresql-server postgresql-contrib"
    echo "sudo postgresql-setup --initdb"
    echo "sudo systemctl start postgresql"
    exit 1
fi

PG_VERSION=$(psql --version | awk '{print $3}' | cut -d'.' -f1)
echo -e "${GREEN}✅ PostgreSQL $PG_VERSION instalado${NC}"
echo ""

# Verificar se o serviço está rodando
echo -e "${BLUE}🔍 Verificando serviço PostgreSQL...${NC}"

if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL não está rodando. Iniciando...${NC}"
    sudo systemctl start postgresql
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
echo ""

# Criar banco de dados e usuário
echo -e "${BLUE}🔨 Criando banco de dados e usuário...${NC}"

sudo -u postgres psql <<EOF
-- Criar usuário se não existir
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$POSTGRES_USER') THEN
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        RAISE NOTICE 'Usuário $POSTGRES_USER criado';
    ELSE
        RAISE NOTICE 'Usuário $POSTGRES_USER já existe';
    END IF;
END
\$\$;

-- Criar banco se não existir
SELECT 'CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\gexec

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;

-- Permitir criar tabelas no schema public
\c $POSTGRES_DB
GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $POSTGRES_USER;

\q
EOF

echo -e "${GREEN}✅ Banco e usuário configurados${NC}"
echo ""

# Testar conexão
echo -e "${BLUE}🧪 Testando conexão...${NC}"

if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão bem-sucedida!${NC}"
else
    echo -e "${RED}❌ Falha na conexão${NC}"
    exit 1
fi

echo ""

# Instalar dependências Python
echo -e "${BLUE}📦 Verificando dependências Python...${NC}"

if [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}⚠️  requirements.txt não encontrado${NC}"
else
    # Verificar se psycopg2 está instalado
    if ! pip show psycopg2-binary > /dev/null 2>&1; then
        echo -e "${YELLOW}📦 Instalando psycopg2-binary...${NC}"
        pip install psycopg2-binary
    fi
    echo -e "${GREEN}✅ Dependências OK${NC}"
fi

echo ""

# Criar tabelas
echo -e "${BLUE}🏗️  Criando tabelas...${NC}"

if command -v python3 &> /dev/null; then
    python3 -c "from database.database import create_db_and_tables; create_db_and_tables()" 2>&1 | grep -v "WARNING"
    echo -e "${GREEN}✅ Tabelas criadas${NC}"
else
    echo -e "${YELLOW}⚠️  Python3 não encontrado. Execute manualmente:${NC}"
    echo "   python -c 'from database.database import create_db_and_tables; create_db_and_tables()'"
fi

echo ""

# Resumo final
echo "=================================================="
echo -e "${GREEN}✅ SETUP CONCLUÍDO!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📊 Informações de Conexão:${NC}"
echo "   Host: $POSTGRES_HOST"
echo "   Port: $POSTGRES_PORT"
echo "   Database: $POSTGRES_DB"
echo "   User: $POSTGRES_USER"
echo ""
echo -e "${BLUE}🔗 String de Conexão:${NC}"
echo "   postgresql://$POSTGRES_USER:****@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
echo ""
echo -e "${BLUE}🚀 Próximos Passos:${NC}"
echo "   1. Verifique banco.conf (DATABASE_TYPE=postgresql)"
echo "   2. Execute: ./start.sh"
echo "   3. Para migrar dados do SQLite, execute: python migrate_to_postgresql.py"
echo ""
echo -e "${GREEN}🎉 PostgreSQL está pronto para uso!${NC}"
echo ""



