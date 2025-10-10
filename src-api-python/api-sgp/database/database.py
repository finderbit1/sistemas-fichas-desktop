
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from sqlalchemy import text, event
from sqlalchemy.engine import Engine
from config import settings
from config_loader import load_database_config, get_database_url
import logging
from contextlib import contextmanager
from typing import Generator

# Configurar logging
logger = logging.getLogger(__name__)

# Importar todos os modelos para que sejam registrados
try:
    from pedidos.schema import Pedido
    from clientes.schema import Cliente
    from pagamentos.schema import Payments
    from envios.schema import Envio
    from designers.schema import Designer
    from vendedores.schema import Vendedor
    from descontos.schema import Desconto
    from producoes.schema import ProducaoTipo
    from tecidos.schema import Tecido
    from materiais.schema import Material
    logger.info("✅ Todos os modelos importados com sucesso")
except ImportError as e:
    logger.error(f"❌ Erro ao importar modelos: {e}")

def create_database_engine():
    """Cria o engine do banco de dados baseado na configuração do arquivo banco.conf"""
    
    try:
        # Carregar configuração do arquivo banco.conf
        db_config = load_database_config()
        database_url = get_database_url()
        database_type = db_config['type']
        pool_config = db_config['pool']
        
        logger.info(f"🔧 Configurando banco: {database_type}")
        logger.info(f"📁 Fonte: {db_config['source']}")
        
        if database_type == "sqlite":
            engine = create_engine(
                database_url,
                connect_args={
                    "check_same_thread": False,
                    "timeout": 60,  # Aumentar timeout
                    "isolation_level": None  # Autocommit mode
                },
                poolclass=StaticPool,
                pool_pre_ping=True,
                echo=False
            )
            
            # Configurar eventos SQLite para melhor performance e concorrência
            @event.listens_for(engine, "connect")
            def set_sqlite_pragma(dbapi_connection, connection_record):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.execute("PRAGMA cache_size=50000")  # Aumentar cache
                cursor.execute("PRAGMA temp_store=memory")
                cursor.execute("PRAGMA mmap_size=536870912")  # 512MB
                cursor.execute("PRAGMA busy_timeout=30000")  # 30 segundos timeout
                cursor.execute("PRAGMA wal_autocheckpoint=1000")  # Checkpoint automático
                cursor.execute("PRAGMA optimize")
                cursor.close()
                
        else:  # PostgreSQL
            engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=pool_config['max_size'],  # Configurável via banco.conf
                max_overflow=pool_config['max_size'] * 2,  # 2x o pool_size
                pool_timeout=pool_config['timeout'],
                echo=False
            )
        
        logger.info(f"✅ Engine de banco criado: {database_type}")
        if database_type == "postgresql":
            pg = db_config['postgres']
            logger.info(f"📊 PostgreSQL: {pg['user']}@{pg['host']}:{pg['port']}/{pg['database']}")
            logger.info(f"🏊 Pool: min={pool_config['min_size']}, max={pool_config['max_size']}")
        
        return engine
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar engine de banco: {e}")
        # Fallback para configuração antiga (settings)
        logger.warning("⚠️ Usando configuração fallback (settings.py)")
        database_url = settings.DATABASE_URL
        
        if settings.DATABASE_TYPE == "sqlite":
            return create_engine(
                database_url,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
                pool_pre_ping=True
            )
        else:
            return create_engine(
                database_url,
                pool_pre_ping=True,
                pool_size=20,
                max_overflow=50
            )

# Criar o engine
engine = create_database_engine()

def create_db_and_tables():
    """Cria as tabelas no banco de dados"""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Tabelas criadas/verificadas com sucesso")
        
        # Configurações adicionais para SQLite
        if settings.DATABASE_TYPE == "sqlite":
            with Session(engine) as session:
                try:
                    session.execute(text("PRAGMA optimize"))
                    session.commit()
                    logger.info("✅ Otimizações SQLite aplicadas")
                except Exception as e:
                    logger.warning(f"⚠️ Aviso ao aplicar otimizações SQLite: {e}")
                    
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise

@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """Context manager para sessões de banco com tratamento de erro e timeout"""
    session = None
    try:
        # Tentar obter sessão com timeout
        session = Session(engine)
        
        # Configurar timeout para operações
        session.execute(text("PRAGMA busy_timeout=30000"))
        
        yield session
        session.commit()
        
    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"❌ Erro na sessão de banco: {e}")
        
        # Verificar se é erro de timeout/conexão
        if "timeout" in str(e).lower() or "busy" in str(e).lower():
            logger.warning("⏰ Timeout de conexão detectado")
            raise TimeoutError("Timeout de conexão com banco de dados")
        
        raise
    finally:
        if session:
            try:
                session.close()
            except Exception as e:
                logger.warning(f"⚠️ Erro ao fechar sessão: {e}")

def get_session():
    """Dependência para injetar sessão nas rotas"""
    with get_session_context() as session:
        yield session