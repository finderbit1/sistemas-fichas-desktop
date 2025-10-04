# 🐘 Configuração PostgreSQL para Produção

Este guia explica como configurar o sistema para usar PostgreSQL em produção, mantendo SQLite para desenvolvimento.

## 🏗️ **Arquitetura Implementada**

### **Desenvolvimento (SQLite)**
- Banco local `data/clientes.db`
- Sem dependências externas
- Ideal para desenvolvimento e testes

### **Produção (PostgreSQL)**
- Banco PostgreSQL robusto
- Suporte a conexões simultâneas
- Backup e replicação nativos
- Performance superior para grandes volumes

## 📦 **Dependências Adicionadas**

```toml
# SeaORM - ORM moderno e performático
sea-orm = { version = "0.13", features = [
    "sqlx-postgres", 
    "sqlx-sqlite", 
    "runtime-tokio-rustls", 
    "macros",
    "with-chrono",
    "with-uuid",
    "with-json"
] }

# SQLx - Driver assíncrono
sqlx = { version = "0.8", features = [
    "runtime-tokio-rustls",
    "postgres",
    "sqlite", 
    "chrono",
    "uuid",
    "json"
] }
```

## 🔧 **Configuração**

### **1. Variáveis de Ambiente**

Copie o arquivo de exemplo:
```bash
cp src-tauri/env.example src-tauri/.env
```

Configure para **desenvolvimento** (SQLite):
```env
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite://data/clientes.db
```

Configure para **produção** (PostgreSQL):
```env
DATABASE_TYPE=postgres
DATABASE_HOST=seu-servidor-postgres.com
DATABASE_PORT=5432
DATABASE_NAME=sistemas_fichas
DATABASE_USER=usuario
DATABASE_PASSWORD=senha_segura
```

### **2. Setup do PostgreSQL**

#### **Instalação do PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# macOS
brew install postgresql
```

#### **Configuração Inicial:**
```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE sistemas_fichas;
CREATE USER usuario WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE sistemas_fichas TO usuario;
\q
```

#### **Configuração de Segurança:**
```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Adicionar linha para autenticação por senha
local   all             usuario                                  md5
host    all             usuario          0.0.0.0/0               md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## 🚀 **Uso no Sistema**

### **Desenvolvimento:**
```bash
# Usar SQLite (padrão)
npm run tauri:dev
```

### **Produção:**
```bash
# Configurar variáveis de ambiente
export DATABASE_TYPE=postgres
export DATABASE_HOST=seu-servidor.com
export DATABASE_PORT=5432
export DATABASE_NAME=sistemas_fichas
export DATABASE_USER=usuario
export DATABASE_PASSWORD=senha

# Build para produção
npm run tauri:build
```

## 📊 **Entidades Implementadas**

### **Estrutura Completa:**
- ✅ **Clientes** - Dados dos clientes
- ✅ **Pedidos** - Pedidos com relacionamentos
- ✅ **Produtos** - Itens dos pedidos
- ✅ **Designers** - Equipe de design
- ✅ **Vendedores** - Equipe de vendas
- ✅ **Formas de Pagamento** - Métodos de pagamento
- ✅ **Formas de Envio** - Opções de entrega
- ✅ **Descontos** - Sistema de descontos
- ✅ **Tipos de Produção** - Categorias de produtos
- ✅ **Tecidos** - Catálogo de materiais

### **Relacionamentos:**
```rust
// Exemplo de relacionamentos implementados
Cliente -> Pedidos (1:N)
Pedido -> Produtos (1:N)
Pedido -> Designer (N:1)
Pedido -> Vendedor (N:1)
```

## 🔄 **Migrations Automáticas**

### **SQLite (Desenvolvimento):**
- Criação automática de tabelas
- Índices de performance
- Configurações PRAGMA otimizadas

### **PostgreSQL (Produção):**
- Migrations via SeaORM
- Suporte a transações
- Backup automático

## 🎯 **Vantagens do SeaORM**

### **Performance:**
- Queries otimizadas
- Connection pooling nativo
- Prepared statements automáticos

### **Type Safety:**
- Compile-time checking
- Zero-cost abstractions
- Auto-generated models

### **Flexibilidade:**
- Suporte a múltiplos bancos
- Raw SQL quando necessário
- Transações complexas

## 🛠️ **Comandos Úteis**

### **Desenvolvimento:**
```bash
# Limpar banco SQLite
rm data/clientes.db

# Backup do banco
cargo run --bin backup-db

# Otimizar banco
cargo run --bin optimize-db
```

### **Produção:**
```bash
# Backup PostgreSQL
pg_dump -h localhost -U usuario sistemas_fichas > backup.sql

# Restore PostgreSQL
psql -h localhost -U usuario sistemas_fichas < backup.sql

# Monitorar conexões
SELECT * FROM pg_stat_activity;
```

## 📈 **Performance Esperada**

### **SQLite vs PostgreSQL:**

| Métrica | SQLite | PostgreSQL |
|---------|--------|------------|
| **Conexões simultâneas** | 1 | 1000+ |
| **Tamanho máximo** | 281 TB | Ilimitado |
| **Performance escrita** | Boa | Excelente |
| **Performance leitura** | Excelente | Excelente |
| **Backup** | Manual | Automático |
| **Replicação** | Não | Sim |

## 🔒 **Segurança**

### **Configurações Recomendadas:**
```sql
-- Configurações de segurança PostgreSQL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_statement = 'mod';
SELECT pg_reload_conf();
```

### **Firewall:**
```bash
# Permitir apenas IPs confiáveis
sudo ufw allow from 192.168.1.0/24 to any port 5432
sudo ufw deny 5432
```

## 🚨 **Troubleshooting**

### **Problemas Comuns:**

1. **Erro de conexão:**
   ```bash
   # Verificar se PostgreSQL está rodando
   sudo systemctl status postgresql
   
   # Testar conexão
   psql -h localhost -U usuario -d sistemas_fichas
   ```

2. **Erro de permissão:**
   ```sql
   -- Conceder permissões
   GRANT ALL PRIVILEGES ON DATABASE sistemas_fichas TO usuario;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usuario;
   ```

3. **Erro de SSL:**
   ```bash
   # Desabilitar SSL para desenvolvimento
   export PGSSLMODE=disable
   ```

## 📚 **Recursos Adicionais**

- [SeaORM Documentation](https://www.sea-ql.org/SeaORM/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLx Documentation](https://docs.rs/sqlx/latest/sqlx/)

---

**Resultado:** Sistema preparado para escalar de desenvolvimento local (SQLite) até produção enterprise (PostgreSQL) com zero mudanças de código! 🚀
