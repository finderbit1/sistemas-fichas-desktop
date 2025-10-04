#!/bin/bash

echo "🔧 Corrigindo estrutura da tabela pedidos..."

# Verificar se o arquivo do banco existe
if [ ! -f "src-tauri/data/clientes.db" ]; then
    echo "❌ Arquivo do banco de dados não encontrado: src-tauri/data/clientes.db"
    echo "💡 Execute primeiro: npm run dev ou yarn dev"
    exit 1
fi

# Fazer backup do banco atual
echo "📦 Fazendo backup do banco atual..."
cp src-tauri/data/clientes.db src-tauri/data/clientes_backup_$(date +%Y%m%d_%H%M%S).db

echo "🗑️  Removendo tabela pedidos antiga..."
sqlite3 src-tauri/data/clientes.db "DROP TABLE IF EXISTS pedidos;"

echo "🏗️  Criando nova tabela pedidos com estrutura correta..."
sqlite3 src-tauri/data/clientes.db "
CREATE TABLE pedidos (
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
);"

echo "✅ Tabela pedidos recriada com sucesso!"

# Verificar se a tabela foi criada corretamente
echo "🔍 Verificando estrutura da tabela..."
sqlite3 src-tauri/data/clientes.db ".schema pedidos"

echo ""
echo "🎉 Problema resolvido!"
echo "💡 Agora você pode criar pedidos sem erro de 'no such column: numero'"
echo "📊 Status atual do banco:"
sqlite3 src-tauri/data/clientes.db "SELECT 'pedidos' as tabela, COUNT(*) as registros FROM pedidos;"
