#!/bin/bash

echo "🧹 Limpando banco de dados..."

# Verificar se o arquivo do banco existe
if [ ! -f "data/clientes.db" ]; then
    echo "❌ Arquivo do banco de dados não encontrado: data/clientes.db"
    exit 1
fi

# Fazer backup do banco atual
echo "📦 Fazendo backup do banco atual..."
cp data/clientes.db data/clientes_backup_$(date +%Y%m%d_%H%M%S).db

# Executar script SQL de limpeza
echo "🗑️  Executando limpeza..."
sqlite3 data/clientes.db < limpar-banco.sql

# Verificar resultado
echo "✅ Limpeza concluída!"
echo "📊 Status atual do banco:"
sqlite3 data/clientes.db "SELECT 'clientes' as tabela, COUNT(*) as registros FROM clientes UNION ALL SELECT 'pedidos', COUNT(*) FROM pedidos UNION ALL SELECT 'produtos', COUNT(*) FROM produtos UNION ALL SELECT 'pagamentos', COUNT(*) FROM pagamentos UNION ALL SELECT 'formas_envio', COUNT(*) FROM formas_envio UNION ALL SELECT 'designers', COUNT(*) FROM designers UNION ALL SELECT 'vendedores', COUNT(*) FROM vendedores UNION ALL SELECT 'descontos', COUNT(*) FROM descontos UNION ALL SELECT 'tipos_producao', COUNT(*) FROM tipos_producao UNION ALL SELECT 'tecidos', COUNT(*) FROM tecidos;"

echo ""
echo "🎉 Banco de dados limpo e pronto para uso!"
echo "💡 Dados padrão (pagamentos e envios) foram inseridos automaticamente."
