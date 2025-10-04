use rusqlite::{Connection, Result};
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
                    FOREIGN KEY(cliente_id) REFERENCES clientes(id),
                    FOREIGN KEY(vendedor_id) REFERENCES vendedores(id),
                    FOREIGN KEY(designer_id) REFERENCES designers(id),
                    FOREIGN KEY(forma_pagamento_id) REFERENCES formas_pagamento(id),
                    FOREIGN KEY(forma_envio_id) REFERENCES formas_envio(id),
                    FOREIGN KEY(desconto_id) REFERENCES descontos(id)
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

            conn.execute(
                "CREATE TABLE IF NOT EXISTS formas_pagamento (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN NOT NULL DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'formas_pagamento' pronta");

            // Migração: adicionar coluna valor se não existir
            let _ = conn.execute(
                "ALTER TABLE formas_envio ADD COLUMN valor REAL DEFAULT 0.0",
                [],
            );
            println!("   ▶ Migração: coluna 'valor' adicionada à tabela 'formas_envio'");

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
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'vendedores' pronta");

            // Migração: adicionar coluna comissao_percentual se não existir
            let _ = conn.execute(
                "ALTER TABLE vendedores ADD COLUMN comissao_percentual REAL DEFAULT 0.0",
                [],
            );
            println!("   ▶ Migração: coluna 'comissao_percentual' adicionada à tabela 'vendedores'");

            conn.execute(
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
                [],
            )?;
            println!("   ▶ Tabela 'descontos' pronta");

            // Migração: adicionar colunas se não existirem
            let _ = conn.execute(
                "ALTER TABLE descontos ADD COLUMN nome TEXT",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE descontos ADD COLUMN valor REAL",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE descontos ADD COLUMN ativo BOOLEAN DEFAULT 1",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE descontos ADD COLUMN created_at TEXT",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE descontos ADD COLUMN updated_at TEXT",
                [],
            );
            println!("   ▶ Migração: colunas adicionadas à tabela 'descontos'");

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
                    descricao TEXT,
                    cor TEXT,
                    material TEXT,
                    largura REAL,
                    valor_metro REAL,
                    ativo BOOLEAN DEFAULT 1,
                    created_at TEXT,
                    updated_at TEXT
                )",
                [],
            )?;
            println!("   ▶ Tabela 'tecidos' pronta");

            // Migração: adicionar colunas se não existirem
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN descricao TEXT",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN material TEXT",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN largura REAL",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN valor_metro REAL",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN ativo BOOLEAN DEFAULT 1",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN created_at TEXT",
                [],
            );
            let _ = conn.execute(
                "ALTER TABLE tecidos ADD COLUMN updated_at TEXT",
                [],
            );
            println!("   ▶ Migração: colunas adicionadas à tabela 'tecidos'");

            // Criar índices para otimizar performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON pedidos(data_pedido)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)", [])?;
            conn.execute("CREATE INDEX IF NOT EXISTS idx_produtos_pedido_id ON produtos(pedido_id)", [])?;
            println!("   ▶ Índices de performance criados");

            // Configurar pragmas do SQLite para otimização
            conn.execute("PRAGMA journal_mode = WAL", [])?;
            conn.execute("PRAGMA synchronous = NORMAL", [])?;
            conn.execute("PRAGMA cache_size = -64000", [])?; // 64MB cache
            conn.execute("PRAGMA temp_store = MEMORY", [])?;
            conn.execute("PRAGMA mmap_size = 268435456", [])?; // 256MB mmap
            println!("   ▶ Configurações de performance aplicadas");
        } // <- Aqui o lock é liberado

        // Dados padrão não são inseridos automaticamente
        // Use o comando 'limpar_banco_dados' se precisar inserir dados padrão
        // self.insert_default_data()?;

        println!("✅ Tabelas inicializadas com sucesso!");
        Ok(())
    }

    // Função comentada - dados padrão não são inseridos automaticamente
    // Use o comando 'limpar_banco_dados' se precisar inserir dados padrão
    /*
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
    */
}
