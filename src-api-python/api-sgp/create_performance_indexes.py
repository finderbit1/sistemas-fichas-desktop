"""
Script para criar índices de banco de dados otimizados
"""
from sqlmodel import Session, text
from database.database import engine
import logging

logger = logging.getLogger(__name__)

def create_performance_indexes():
    """Cria índices otimizados para melhorar performance das consultas"""
    
    indexes = [
        # Índices para tabela pedidos
        "CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_data_criacao ON pedidos(data_criacao)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_prioridade ON pedidos(prioridade)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_data_entrega ON pedidos(data_entrega)",
        
        # Índices compostos para consultas complexas
        "CREATE INDEX IF NOT EXISTS idx_pedidos_status_data ON pedidos(status, data_criacao)",
        "CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_data ON pedidos(cliente, data_criacao)",
        
        # Índices para tabela clientes
        "CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)",
        "CREATE INDEX IF NOT EXISTS idx_clientes_cidade ON clientes(cidade)",
        
        # Índices para tabela producoes
        "CREATE INDEX IF NOT EXISTS idx_producoes_tipo ON producoes(tipo)",
        "CREATE INDEX IF NOT EXISTS idx_producoes_nome ON producoes(nome)",
        
        # Índices para tabela tecidos
        "CREATE INDEX IF NOT EXISTS idx_tecidos_nome ON tecidos(nome)",
        "CREATE INDEX IF NOT EXISTS idx_tecidos_cor ON tecidos(cor)",
        
        # Índices para tabela vendedores
        "CREATE INDEX IF NOT EXISTS idx_vendedores_nome ON vendedores(nome)",
        
        # Índices para tabela designers
        "CREATE INDEX IF NOT EXISTS idx_designers_nome ON designers(nome)",
    ]
    
    try:
        with Session(engine) as session:
            for index_sql in indexes:
                try:
                    session.execute(text(index_sql))
                    logger.info(f"✅ Índice criado: {index_sql}")
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao criar índice {index_sql}: {e}")
            
            session.commit()
            logger.info("🎉 Todos os índices de performance criados com sucesso!")
            
    except Exception as e:
        logger.error(f"❌ Erro ao criar índices: {e}")
        raise

def analyze_query_performance():
    """Analisa performance das consultas usando EXPLAIN QUERY PLAN"""
    
    queries_to_analyze = [
        "SELECT * FROM pedidos WHERE status = 'pendente' ORDER BY data_criacao DESC",
        "SELECT * FROM pedidos WHERE cliente LIKE '%João%'",
        "SELECT * FROM pedidos WHERE data_criacao BETWEEN '2024-01-01' AND '2024-12-31'",
        "SELECT status, COUNT(*) FROM pedidos GROUP BY status",
    ]
    
    try:
        with Session(engine) as session:
            for query in queries_to_analyze:
                logger.info(f"🔍 Analisando query: {query}")
                
                # Usar EXPLAIN QUERY PLAN para SQLite
                explain_query = f"EXPLAIN QUERY PLAN {query}"
                result = session.execute(text(explain_query)).fetchall()
                
                logger.info("📊 Plano de execução:")
                for row in result:
                    logger.info(f"  {row}")
                logger.info("---")
                
    except Exception as e:
        logger.error(f"❌ Erro na análise de performance: {e}")

def optimize_database_settings():
    """Aplica configurações otimizadas do SQLite"""
    
    optimizations = [
        "PRAGMA journal_mode=WAL",
        "PRAGMA synchronous=NORMAL", 
        "PRAGMA cache_size=100000",  # 100MB cache
        "PRAGMA temp_store=memory",
        "PRAGMA mmap_size=1073741824",  # 1GB mmap
        "PRAGMA busy_timeout=30000",
        "PRAGMA wal_autocheckpoint=1000",
        "PRAGMA optimize",
        "PRAGMA analysis_limit=1000",
        "PRAGMA optimize(0x02)",  # Otimização agressiva
    ]
    
    try:
        with Session(engine) as session:
            for pragma in optimizations:
                try:
                    session.execute(text(pragma))
                    logger.info(f"✅ Configuração aplicada: {pragma}")
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao aplicar {pragma}: {e}")
            
            session.commit()
            logger.info("🎉 Configurações de otimização aplicadas!")
            
    except Exception as e:
        logger.error(f"❌ Erro ao aplicar otimizações: {e}")

if __name__ == "__main__":
    print("🚀 Criando índices de performance...")
    create_performance_indexes()
    
    print("🔧 Aplicando otimizações do banco...")
    optimize_database_settings()
    
    print("📊 Analisando performance das consultas...")
    analyze_query_performance()
    
    print("✅ Otimizações de banco concluídas!")
