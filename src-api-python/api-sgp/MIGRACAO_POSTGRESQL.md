# 🐘 Migração para PostgreSQL 18

## 📋 Visão Geral

Sistema agora suporta **PostgreSQL 18** usando arquivo de configuração `banco.conf`!

### ✨ Vantagens do PostgreSQL:
- ✅ **Performance**: Muito mais rápido para múltiplos usuários
- ✅ **Escalabilidade**: Suporta milhares de conexões simultâneas
- ✅ **Transações**: ACID completo
- ✅ **Concorrência**: Sem lock de banco inteiro
- ✅ **Produção**: Padrão da indústria
- ✅ **Backup**: Ferramentas profissionais

---

## 🚀 Guia Rápido (3 Passos)

### 1. Instalar PostgreSQL 18

```bash
# Arch Linux
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Ubuntu/Debian
sudo apt install postgresql-18 postgresql-contrib-18
sudo systemctl start postgresql

# Fedora
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
```

### 2. Executar Setup

```bash
cd src-api-python/api-sgp
chmod +x setup_postgresql.sh
./setup_postgresql.sh
```

### 3. Migrar Dados (Opcional)

```bash
python migrate_to_postgresql.py
```

✅ **Pronto!** PostgreSQL configurado!

---

## 📁 Arquivo `banco.conf`

### Localização:
```
src-api-python/api-sgp/banco.conf
```

### Conteúdo:

```conf
# ⚙️ CONFIGURAÇÃO DE BANCO DE DADOS

# Tipo de banco (sqlite | postgresql)
DATABASE_TYPE=postgresql

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sgp_fichas
POSTGRES_USER=sgp_user
POSTGRES_PASSWORD=sgp_password_123

# SQLite (fallback)
SQLITE_PATH=db/banco.db

# Pool de conexões
POOL_MIN_SIZE=5
POOL_MAX_SIZE=20
CONNECTION_TIMEOUT=10
```

---

## 🔧 Setup Detalhado

### Passo 1: Verificar Instalação

```bash
psql --version
# Deve mostrar: psql (PostgreSQL) 18.x
```

### Passo 2: Editar `banco.conf`

Edite as configurações conforme necessário:

```conf
POSTGRES_HOST=localhost          # Altere se for remoto
POSTGRES_PORT=5432
POSTGRES_DB=sgp_fichas          # Nome do banco
POSTGRES_USER=sgp_user          # Usuário
POSTGRES_PASSWORD=sua_senha_aqui # ALTERE A SENHA!
```

### Passo 3: Executar Setup

O script `setup_postgresql.sh` irá:

1. ✅ Ler configurações de `banco.conf`
2. ✅ Verificar PostgreSQL
3. ✅ Criar banco de dados
4. ✅ Criar usuário
5. ✅ Configurar permissões
6. ✅ Testar conexão
7. ✅ Criar tabelas

```bash
./setup_postgresql.sh
```

**Saída esperada:**

```
==================================================
🐘 SETUP POSTGRESQL 18 - Sistema de Fichas
==================================================

📁 Lendo configurações de banco.conf...
✅ Configurações carregadas:
   Host: localhost
   Port: 5432
   Database: sgp_fichas
   User: sgp_user

✅ PostgreSQL 18 instalado
✅ PostgreSQL está rodando
✅ Banco e usuário configurados
✅ Conexão bem-sucedida!
✅ Tabelas criadas

==================================================
✅ SETUP CONCLUÍDO!
==================================================
```

---

## 🔄 Migração de Dados

### Quando Migrar?

- ✅ Já tem dados no SQLite
- ✅ Quer preservar pedidos/clientes existentes
- ✅ Transição sem perda de dados

### Como Migrar?

```bash
python migrate_to_postgresql.py
```

O script irá:

1. ✅ Ler dados do SQLite
2. ✅ Criar tabelas no PostgreSQL
3. ✅ Migrar todos os registros
4. ✅ Preservar IDs e relacionamentos
5. ✅ Gerar relatório

**Saída esperada:**

```
==================================================
🔄 MIGRAÇÃO: SQLite → PostgreSQL
==================================================

📂 SQLite: db/banco.db
🐘 PostgreSQL: sgp_user@localhost:5432/sgp_fichas

🚀 Iniciando migração...

📊 Migrando tabela: designers
   Encontrados 5 registros
✅ designers: 5 migrados, 0 falharam

📊 Migrando tabela: vendedores
   Encontrados 3 registros
✅ vendedores: 3 migrados, 0 falharam

... (continua para todas as tabelas)

==================================================
✅ MIGRAÇÃO CONCLUÍDA!
==================================================

📊 Total de registros migrados: 150
```

---

## 🔍 Verificar Migração

### Via psql:

```bash
# Conectar ao banco
psql -h localhost -p 5432 -U sgp_user -d sgp_fichas

# Listar tabelas
\dt

# Contar registros
SELECT COUNT(*) FROM pedidos;
SELECT COUNT(*) FROM clientes;

# Sair
\q
```

### Via Python:

```python
from database.database import get_session

with get_session() as session:
    from pedidos.schema import Pedido
    pedidos = session.query(Pedido).all()
    print(f"Total de pedidos: {len(pedidos)}")
```

---

## 🎯 Iniciar API

### Com PostgreSQL:

```bash
# Certifique-se que banco.conf tem:
# DATABASE_TYPE=postgresql

./start.sh
```

### Voltar para SQLite (se necessário):

```bash
# Edite banco.conf:
# DATABASE_TYPE=sqlite

./start.sh
```

---

## 📊 Configurações de Performance

### Pool de Conexões

Ajuste em `banco.conf`:

```conf
# Desenvolvimento (poucos usuários)
POOL_MIN_SIZE=5
POOL_MAX_SIZE=10

# Produção (25 usuários simultâneos)
POOL_MIN_SIZE=10
POOL_MAX_SIZE=30

# Alta demanda (50+ usuários)
POOL_MIN_SIZE=20
POOL_MAX_SIZE=50
```

### PostgreSQL (postgresql.conf)

Configurações recomendadas:

```conf
# /var/lib/postgres/data/postgresql.conf

max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

---

## 🛡️ Segurança

### Alterar Senha Padrão

```bash
# 1. Edite banco.conf
nano banco.conf
# POSTGRES_PASSWORD=sua_senha_forte_aqui

# 2. Altere no PostgreSQL
sudo -u postgres psql
ALTER USER sgp_user WITH PASSWORD 'sua_senha_forte_aqui';
\q
```

### Backup

```bash
# Backup completo
pg_dump -h localhost -U sgp_user -d sgp_fichas > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U sgp_user -d sgp_fichas < backup_20250108.sql
```

### Backup Automático (Cron)

```bash
# Adicione ao crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * pg_dump -h localhost -U sgp_user -d sgp_fichas > /backups/sgp_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Problema: "psql: error: connection refused"

**Solução:**

```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Iniciar
sudo systemctl start postgresql
```

### Problema: "permission denied for schema public"

**Solução:**

```bash
sudo -u postgres psql -d sgp_fichas

GRANT ALL ON SCHEMA public TO sgp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sgp_user;
\q
```

### Problema: "password authentication failed"

**Solução:**

1. Verifique `banco.conf` (senha correta?)
2. Recrie o usuário:

```bash
sudo -u postgres psql

DROP USER IF EXISTS sgp_user;
CREATE USER sgp_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE sgp_fichas TO sgp_user;
\q
```

### Problema: Migração lenta

**Solução:**

Desative fsync temporariamente:

```bash
sudo -u postgres psql

ALTER SYSTEM SET fsync = off;
SELECT pg_reload_conf();

# Rode a migração

ALTER SYSTEM SET fsync = on;
SELECT pg_reload_conf();
\q
```

---

## 📈 Comparação: SQLite vs PostgreSQL

| Recurso | SQLite | PostgreSQL |
|---------|--------|------------|
| **Usuários simultâneos** | ~10 | 1000+ |
| **Performance (escrita)** | Boa | Excelente |
| **Performance (leitura)** | Excelente | Excelente |
| **Transações** | Básico | Avançado |
| **Locks** | Banco inteiro | Por registro |
| **Backup** | Copiar arquivo | Ferramentas profissionais |
| **Replicação** | ❌ | ✅ |
| **Clustering** | ❌ | ✅ |
| **Setup** | Zero | Médio |

---

## 🔗 Conexão Remota

Para conectar de outros computadores:

### 1. Editar `postgresql.conf`:

```bash
sudo nano /var/lib/postgres/data/postgresql.conf

# Altere:
listen_addresses = '*'  # Era 'localhost'
```

### 2. Editar `pg_hba.conf`:

```bash
sudo nano /var/lib/postgres/data/pg_hba.conf

# Adicione:
host    sgp_fichas    sgp_user    192.168.15.0/24    md5
```

### 3. Reiniciar PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 4. Firewall:

```bash
sudo ufw allow 5432
```

### 5. Atualizar `banco.conf` nos clientes:

```conf
POSTGRES_HOST=192.168.15.6  # IP do servidor
```

---

## 📚 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `banco.conf` | ⭐ Configuração do banco |
| `config_loader.py` | Leitor de configuração |
| `setup_postgresql.sh` | Script de setup automático |
| `migrate_to_postgresql.py` | Script de migração |
| `MIGRACAO_POSTGRESQL.md` | Esta documentação |

---

## ✅ Checklist de Migração

- [ ] PostgreSQL 18 instalado
- [ ] Serviço PostgreSQL rodando
- [ ] `banco.conf` editado
- [ ] `setup_postgresql.sh` executado
- [ ] Banco e usuário criados
- [ ] Tabelas criadas
- [ ] Dados migrados (se necessário)
- [ ] Conexão testada
- [ ] API funcionando
- [ ] Backup configurado

---

## 🎯 Próximos Passos

1. ✅ Execute `./setup_postgresql.sh`
2. ✅ Se tiver dados, execute `python migrate_to_postgresql.py`
3. ✅ Inicie a API: `./start.sh`
4. ✅ Teste no frontend
5. ✅ Configure backups automáticos

---

**Data**: 08/10/2025  
**Versão**: 5.0.0 - PostgreSQL Support  
**Status**: ✅ Implementado e Documentado



