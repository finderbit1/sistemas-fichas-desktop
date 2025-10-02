-- Script para limpar o banco de dados
-- Remove todos os dados das tabelas principais, mantendo a estrutura

-- Desabilitar verificações de chave estrangeira temporariamente
PRAGMA foreign_keys = OFF;

-- Limpar dados das tabelas principais
DELETE FROM clientes;
DELETE FROM pedidos;
DELETE FROM produtos;
DELETE FROM pagamentos;
DELETE FROM formas_envio;
DELETE FROM designers;
DELETE FROM vendedores;
DELETE FROM descontos;
DELETE FROM tipos_producao;
DELETE FROM tecidos;

-- Resetar contadores de ID (AUTOINCREMENT)
DELETE FROM sqlite_sequence WHERE name IN (
    'clientes', 'pedidos', 'produtos', 'pagamentos', 
    'formas_envio', 'designers', 'vendedores', 
    'descontos', 'tipos_producao', 'tecidos'
);

-- Reabilitar verificações de chave estrangeira
PRAGMA foreign_keys = ON;

-- Verificar se as tabelas estão vazias
SELECT 'clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL
SELECT 'pagamentos', COUNT(*) FROM pagamentos
UNION ALL
SELECT 'formas_envio', COUNT(*) FROM formas_envio
UNION ALL
SELECT 'designers', COUNT(*) FROM designers
UNION ALL
SELECT 'vendedores', COUNT(*) FROM vendedores
UNION ALL
SELECT 'descontos', COUNT(*) FROM descontos
UNION ALL
SELECT 'tipos_producao', COUNT(*) FROM tipos_producao
UNION ALL
SELECT 'tecidos', COUNT(*) FROM tecidos;
