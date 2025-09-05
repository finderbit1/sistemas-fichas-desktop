# 🗄️ Configuração de Banco de Dados

Este sistema suporta tanto **SQLite** (desenvolvimento) quanto **PostgreSQL** (produção) com facilidade para alternar entre eles.

## 🚀 Configuração Rápida

### 1. SQLite (Desenvolvimento)
```bash
# Usar SQLite (padrão)
python switch_database.py sqlite

# Instalar dependências
uv sync

# Criar tabelas
uv run python recreate_tables.py

# Iniciar API
uv run uvicorn main:app --reload
```

### 2. PostgreSQL (Produção)
```bash
# Alternar para PostgreSQL
python switch_database.py postgresql

# Configurar variáveis no arquivo .env
# Editar: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

# Instalar dependências
uv sync

# Configurar banco PostgreSQL
uv run python setup_postgres.py

# Criar tabelas
uv run python recreate_tables.py

# Iniciar API
uv run uvicorn main:app --reload
```

## ⚙️ Configuração Manual

### Arquivo .env
```env
# Tipo de banco: sqlite ou postgresql
DATABASE_TYPE=postgresql

# SQLite (quando DATABASE_TYPE=sqlite)
SQLITE_DATABASE_URL=sqlite:///db/banco.db

# PostgreSQL (quando DATABASE_TYPE=postgresql)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=sistema_fichas
```

## 🔧 Scripts Disponíveis

### `switch_database.py`
Alterna entre SQLite e PostgreSQL:
```bash
python switch_database.py sqlite      # Para SQLite
python switch_database.py postgresql  # Para PostgreSQL
```

### `setup_postgres.py`
Configura automaticamente o banco PostgreSQL:
```bash
uv run python setup_postgres.py
```

## 📋 Requisitos

### SQLite
- Nenhuma configuração adicional necessária
- Arquivo de banco criado automaticamente

### PostgreSQL
- PostgreSQL instalado e rodando
- Usuário com permissão para criar bancos
- Driver `psycopg2-binary` (já incluído no requirements.txt)

## 🐳 Docker (Opcional)

### PostgreSQL com Docker
```bash
# Iniciar PostgreSQL
docker run --name postgres-sistema-fichas \
  -e POSTGRES_DB=sistema_fichas \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Configurar API
python switch_database.py postgresql
# Editar .env com as credenciais do Docker
uv run python setup_postgres.py
```

## 🔍 Verificação

### Verificar configuração atual
```bash
python switch_database.py
```

### Testar conexão
```bash
# SQLite
uv run python -c "from database.database import engine; print('✅ SQLite OK')"

# PostgreSQL
uv run python -c "from database.database import engine; print('✅ PostgreSQL OK')"
```

## 🚨 Troubleshooting

### Erro de conexão PostgreSQL
1. Verificar se PostgreSQL está rodando
2. Verificar credenciais no .env
3. Verificar se o banco existe
4. Executar `setup_postgres.py`

### Erro de permissão
```sql
-- No PostgreSQL, dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE sistema_fichas TO postgres;
```

### Migração de dados
Para migrar dados do SQLite para PostgreSQL:
1. Exportar dados do SQLite
2. Alternar para PostgreSQL
3. Importar dados no PostgreSQL

## 📊 Vantagens

### SQLite
- ✅ Simples e rápido para desenvolvimento
- ✅ Sem configuração adicional
- ✅ Arquivo único
- ❌ Não recomendado para produção

### PostgreSQL
- ✅ Robusto para produção
- ✅ Suporte a concorrência
- ✅ Recursos avançados
- ✅ Escalabilidade
- ❌ Requer configuração inicial
