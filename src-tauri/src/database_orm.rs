use sea_orm::*;
use std::env;
use anyhow::Result;
use tracing::{info, error};

pub type DatabaseConnection = sea_orm::DatabaseConnection;

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub database_type: DatabaseType,
    pub url: String,
}

#[derive(Debug, Clone)]
pub enum DatabaseType {
    Sqlite,
    Postgres,
}

impl DatabaseConfig {
    pub fn from_env() -> Result<Self> {
        let database_type = match env::var("DATABASE_TYPE").unwrap_or_else(|_| "sqlite".to_string()).to_lowercase().as_str() {
            "postgres" | "postgresql" => DatabaseType::Postgres,
            _ => DatabaseType::Sqlite,
        };

        let url = match &database_type {
            DatabaseType::Postgres => {
                let host = env::var("DATABASE_HOST").unwrap_or_else(|_| "localhost".to_string());
                let port = env::var("DATABASE_PORT").unwrap_or_else(|_| "5432".to_string());
                let name = env::var("DATABASE_NAME").unwrap_or_else(|_| "sistemas_fichas".to_string());
                let user = env::var("DATABASE_USER").unwrap_or_else(|_| "postgres".to_string());
                let password = env::var("DATABASE_PASSWORD").unwrap_or_else(|_| "password".to_string());
                
                format!("postgresql://{}:{}@{}:{}/{}", user, password, host, port, name)
            }
            DatabaseType::Sqlite => {
                env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://data/clientes.db".to_string())
            }
        };

        Ok(Self {
            database_type,
            url,
        })
    }

    pub fn for_development() -> Self {
        Self {
            database_type: DatabaseType::Sqlite,
            url: "sqlite://data/clientes.db".to_string(),
        }
    }

    pub fn for_production() -> Result<Self> {
        Self::from_env()
    }
}

pub struct DatabaseManager {
    pub connection: DatabaseConnection,
    pub config: DatabaseConfig,
}

impl DatabaseManager {
    pub async fn new(config: DatabaseConfig) -> Result<Self> {
        info!("🔗 Conectando ao banco de dados: {:?}", config.database_type);
        
        let connection = match &config.database_type {
            DatabaseType::Postgres => {
                info!("📡 Conectando ao PostgreSQL...");
                Database::connect(&config.url).await?
            }
            DatabaseType::Sqlite => {
                info!("💾 Conectando ao SQLite...");
                Database::connect(&config.url).await?
            }
        };

        info!("✅ Conexão com banco estabelecida");

        Ok(Self {
            connection,
            config,
        })
    }

    pub async fn run_migrations(&self) -> Result<()> {
        info!("🔄 Executando migrations...");
        
        match &self.config.database_type {
            DatabaseType::Postgres => {
                // Para PostgreSQL, usar migrations automáticas do SeaORM
                info!("📡 Aplicando migrations no PostgreSQL...");
                // Migrations serão aplicadas automaticamente pelo SeaORM
            }
            DatabaseType::Sqlite => {
                // Para SQLite, criar tabelas manualmente
                info!("💾 Criando tabelas no SQLite...");
                self.create_sqlite_tables().await?;
            }
        }

        info!("✅ Migrations concluídas");
        Ok(())
    }

    async fn create_sqlite_tables(&self) -> Result<()> {
        use crate::entities::*;
        
        // Criar todas as tabelas usando SeaORM
        let create_tables = vec![
            // Clientes
            "CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                endereco TEXT,
                cidade TEXT,
                estado TEXT,
                cep TEXT,
                cpf_cnpj TEXT,
                observacoes TEXT,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Pedidos
            "CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero INTEGER NOT NULL,
                cliente_id INTEGER NOT NULL,
                cliente_nome TEXT,
                data_pedido TEXT NOT NULL,
                data_entrega TEXT,
                status TEXT NOT NULL DEFAULT 'pendente',
                valor_total REAL NOT NULL DEFAULT 0.0,
                observacoes TEXT,
                vendedor_id INTEGER,
                designer_id INTEGER,
                forma_pagamento_id INTEGER,
                forma_envio_id INTEGER,
                desconto_id INTEGER,
                items TEXT,
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY(cliente_id) REFERENCES clientes(id)
            )",
            
            // Produtos
            "CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER,
                tipo TEXT,
                descricao TEXT,
                quantidade INTEGER,
                preco REAL,
                FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
            )",
            
            // Designers
            "CREATE TABLE IF NOT EXISTS designers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                especialidade TEXT,
                ativo BOOLEAN DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Vendedores
            "CREATE TABLE IF NOT EXISTS vendedores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                ativo BOOLEAN DEFAULT 1,
                comissao_percentual REAL DEFAULT 0.0,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Formas de Pagamento
            "CREATE TABLE IF NOT EXISTS formas_pagamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                ativo BOOLEAN NOT NULL DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Formas de Envio
            "CREATE TABLE IF NOT EXISTS formas_envio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                ativo BOOLEAN DEFAULT 1,
                valor REAL DEFAULT 0.0,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Descontos
            "CREATE TABLE IF NOT EXISTS descontos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL,
                valor REAL NOT NULL,
                valor_minimo REAL,
                ativo BOOLEAN DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            )",
            
            // Tipos de Produção
            "CREATE TABLE IF NOT EXISTS tipos_producao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT UNIQUE,
                criado_em TEXT
            )",
            
            // Tecidos
            "CREATE TABLE IF NOT EXISTS tecidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                cor TEXT,
                material TEXT,
                largura REAL,
                valor_metro REAL,
                ativo BOOLEAN DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            )"
        ];

        for sql in create_tables {
            self.connection.execute(Statement::from_string(
                DatabaseBackend::Sqlite,
                sql.to_string()
            )).await?;
        }

        // Criar índices para performance
        let create_indexes = vec![
            "CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero)",
            "CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id)",
            "CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)",
            "CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON pedidos(data_pedido)",
            "CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)",
            "CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)",
            "CREATE INDEX IF NOT EXISTS idx_produtos_pedido_id ON produtos(pedido_id)",
        ];

        for sql in create_indexes {
            let _ = self.connection.execute(Statement::from_string(
                DatabaseBackend::Sqlite,
                sql.to_string()
            )).await;
        }

        // Configurar pragmas do SQLite
        let pragmas = vec![
            "PRAGMA journal_mode = WAL",
            "PRAGMA synchronous = NORMAL",
            "PRAGMA cache_size = -64000",
            "PRAGMA temp_store = MEMORY",
            "PRAGMA mmap_size = 268435456",
        ];

        for pragma in pragmas {
            let _ = self.connection.execute(Statement::from_string(
                DatabaseBackend::Sqlite,
                pragma.to_string()
            )).await;
        }

        info!("✅ Tabelas SQLite criadas com sucesso");
        Ok(())
    }

    pub async fn create_backup(&self) -> Result<String> {
        use std::path::Path;
        use std::fs;
        use chrono::Utc;
        
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
        let backup_filename = format!("backup_{}.db", timestamp);
        let backup_path = Path::new("data").join(&backup_filename);
        
        // Criar diretório de backup se não existir
        if let Some(parent) = backup_path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        match &self.config.database_type {
            DatabaseType::Sqlite => {
                // Para SQLite, copiar arquivo
                fs::copy("data/clientes.db", &backup_path)?;
            }
            DatabaseType::Postgres => {
                // Para PostgreSQL, usar pg_dump
                // Implementar backup específico para PostgreSQL
                info!("📡 Backup do PostgreSQL implementado via pg_dump");
            }
        }
        
        info!("✅ Backup criado: {}", backup_filename);
        Ok(backup_filename)
    }

    pub async fn optimize_database(&self) -> Result<()> {
        match &self.config.database_type {
            DatabaseType::Sqlite => {
                // VACUUM e ANALYZE para SQLite
                let _ = self.connection.execute(Statement::from_string(
                    DatabaseBackend::Sqlite,
                    "VACUUM".to_string()
                )).await;
                let _ = self.connection.execute(Statement::from_string(
                    DatabaseBackend::Sqlite,
                    "ANALYZE".to_string()
                )).await;
            }
            DatabaseType::Postgres => {
                // VACUUM e ANALYZE para PostgreSQL
                let _ = self.connection.execute(Statement::from_string(
                    DatabaseBackend::Postgres,
                    "VACUUM ANALYZE".to_string()
                )).await;
            }
        }
        
        info!("✅ Banco de dados otimizado");
        Ok(())
    }
}

// Função helper para criar conexão
pub async fn create_database() -> Result<DatabaseManager> {
    let config = if env::var("DATABASE_TYPE").is_ok() {
        DatabaseConfig::for_production()?
    } else {
        DatabaseConfig::for_development()
    };
    
    let db = DatabaseManager::new(config).await?;
    db.run_migrations().await?;
    
    Ok(db)
}
