#!/usr/bin/env python3
"""
Script para adicionar índices de performance no banco de dados
"""
import logging
from sqlalchemy import text
from database.database import engine, get_session_context

logger = logging.getLogger(__name__)

def add_database_indexes():
    """Adiciona índices para melhorar performance"""
    
    indexes = [
        # Índices para tabela clientes
        {
            "name": "idx_clientes_nome",
            "table": "clientes",
            "columns": "nome",
            "description": "Índice para busca por nome de cliente"
        },
        {
            "name": "idx_clientes_telefone",
            "table": "clientes", 
            "columns": "telefone",
            "description": "Índice para busca por telefone"
        },
        {
            "name": "idx_clientes_cidade",
            "table": "clientes",
            "columns": "cidade",
            "description": "Índice para busca por cidade"
        },
        
        # Índices para tabela pedidos
        {
            "name": "idx_pedidos_numero",
            "table": "pedidos",
            "columns": "numero",
            "description": "Índice para busca por número do pedido"
        },
        {
            "name": "idx_pedidos_status",
            "table": "pedidos",
            "columns": "status",
            "description": "Índice para busca por status"
        },
        {
            "name": "idx_pedidos_cliente",
            "table": "pedidos",
            "columns": "cliente",
            "description": "Índice para busca por cliente"
        },
        {
            "name": "idx_pedidos_data_criacao",
            "table": "pedidos",
            "columns": "data_criacao",
            "description": "Índice para ordenação por data de criação"
        },
        {
            "name": "idx_pedidos_data_entrega",
            "table": "pedidos",
            "columns": "data_entrega",
            "description": "Índice para busca por data de entrega"
        },
        
        # Índices para tabela producoes
        {
            "name": "idx_producoes_name",
            "table": "producaotipo",
            "columns": "name",
            "description": "Índice para busca por nome do tipo de produção"
        },
        
        # Índices para tabela designers
        {
            "name": "idx_designers_name",
            "table": "designer",
            "columns": "name",
            "description": "Índice para busca por nome do designer"
        },
        
        # Índices para tabela vendedores
        {
            "name": "idx_vendedores_name",
            "table": "vendedor",
            "columns": "name",
            "description": "Índice para busca por nome do vendedor"
        }
    ]
    
    logger.info("🔧 Iniciando criação de índices de performance...")
    
    with get_session_context() as session:
        for index in indexes:
            try:
                # Verificar se o índice já existe
                check_sql = f"""
                SELECT name FROM sqlite_master 
                WHERE type='index' AND name='{index['name']}'
                """
                
                existing = session.execute(text(check_sql)).fetchone()
                
                if existing:
                    logger.info(f"⏭️  Índice {index['name']} já existe, pulando...")
                    continue
                
                # Criar o índice
                create_sql = f"""
                CREATE INDEX {index['name']} 
                ON {index['table']} ({index['columns']})
                """
                
                session.execute(text(create_sql))
                logger.info(f"✅ Índice criado: {index['name']} - {index['description']}")
                
            except Exception as e:
                logger.error(f"❌ Erro ao criar índice {index['name']}: {e}")
                continue
        
        # Executar ANALYZE para otimizar estatísticas
        try:
            session.execute(text("ANALYZE"))
            logger.info("📊 Estatísticas do banco atualizadas")
        except Exception as e:
            logger.warning(f"⚠️ Aviso ao executar ANALYZE: {e}")
        
        logger.info("🎉 Criação de índices concluída!")

def show_database_stats():
    """Mostra estatísticas do banco de dados"""
    logger.info("📊 Estatísticas do banco de dados:")
    
    with get_session_context() as session:
        # Contar registros por tabela
        tables = [
            "clientes", "pedidos", "producaotipo", 
            "designer", "vendedor", "desconto", "tecido"
        ]
        
        for table in tables:
            try:
                count_sql = f"SELECT COUNT(*) FROM {table}"
                count = session.execute(text(count_sql)).fetchone()[0]
                logger.info(f"  📋 {table}: {count} registros")
            except Exception as e:
                logger.warning(f"  ⚠️ Tabela {table} não encontrada: {e}")
        
        # Mostrar índices existentes
        indexes_sql = """
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
        ORDER BY tbl_name, name
        """
        
        indexes = session.execute(text(indexes_sql)).fetchall()
        logger.info(f"  🔍 Total de índices: {len(indexes)}")
        
        for index in indexes:
            logger.info(f"    📌 {index[0]} em {index[1]}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("🔧 ADICIONANDO ÍNDICES DE PERFORMANCE")
    print("=" * 50)
    
    try:
        add_database_indexes()
        print("\n📊 ESTATÍSTICAS DO BANCO")
        print("=" * 50)
        show_database_stats()
        
    except Exception as e:
        logger.error(f"❌ Erro geral: {e}")
        exit(1)
