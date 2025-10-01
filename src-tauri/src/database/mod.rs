use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        println!("📂 Criando conexão com banco...");
        let conn = Connection::open(db_path)?;
        println!("✅ Conexão com banco criada");
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn get_connection(&self) -> Result<std::sync::MutexGuard<'_, Connection>> {
        self.conn.lock().map_err(|_| {
            rusqlite::Error::InvalidParameterName("Database lock failed".to_string())
        })
    }

    pub fn init_tables(&self) -> Result<()> {
        println!("🛠 Inicializando tabelas...");
        {
            let conn = self.get_connection()?;

            conn.execute(
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
                [],
            )?;
            println!("   ▶ Tabela 'clientes' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS pedidos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cliente_id INTEGER,
                    forma_envio TEXT,
                    forma_pagamento TEXT,
                    frete REAL,
                    FOREIGN KEY(cliente_id) REFERENCES clientes(id)
                )",
                [],
            )?;
            println!("   ▶ Tabela 'pedidos' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS produtos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pedido_id INTEGER,
                    tipo TEXT,
                    descricao TEXT,
                    quantidade INTEGER,
                    preco REAL,
                    FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
                )",
                [],
            )?;
            println!("   ▶ Tabela 'produtos' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS pagamentos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'pagamentos' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS formas_envio (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'formas_envio' pronta");

            // Tabelas adicionais necessárias
            conn.execute(
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
                [],
            )?;
            println!("   ▶ Tabela 'designers' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS vendedores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT,
                    telefone TEXT,
                    comissao REAL DEFAULT 0.0,
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'vendedores' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS descontos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tipo TEXT,
                    valor_minimo REAL,
                    percentual REAL,
                    criado_em TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'descontos' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS tipos_producao (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT UNIQUE,
                    criado_em TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'tipos_producao' pronta");

            conn.execute(
                "CREATE TABLE IF NOT EXISTS tecidos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    tipo TEXT,
                    cor TEXT,
                    preco_metro REAL DEFAULT 0.0,
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'tecidos' pronta");
        } // <- Aqui o lock é liberado

        // Agora podemos inserir os dados padrão sem travar
        self.insert_default_data()?;

        println!("✅ Tabelas inicializadas com sucesso!");
        Ok(())
    }

    fn insert_default_data(&self) -> Result<()> {
        println!("   ▶ Inserindo dados padrão...");
        let conn = self.get_connection()?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT OR IGNORE INTO pagamentos (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Dinheiro", "Pagamento em dinheiro", true, now, now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO pagamentos (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Cartão", "Pagamento com cartão de crédito/débito", true, now, now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO pagamentos (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Pix", "Pagamento instantâneo via PIX", true, now, now],
        )?;
        println!("      ✔ Métodos de pagamento adicionados");

        conn.execute(
            "INSERT OR IGNORE INTO formas_envio (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Correios", "Envio via Correios", true, now, now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO formas_envio (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Transportadora", "Envio via transportadora", true, now, now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO formas_envio (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Retirada na Loja", "Cliente retira na loja", true, now, now],
        )?;
        println!("      ✔ Formas de envio adicionadas");

        Ok(())
    }
}
