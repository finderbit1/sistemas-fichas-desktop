
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from sqlalchemy import text
from config import settings

# Importar todos os modelos para que sejam registrados
from pedidos.schema import Pedido
from clientes.schema import Cliente
from pagamentos.schema import Payments
from envios.schema import Envio
from designers.schema import Designer
from vendedores.schema import Vendedor
from descontos.schema import Desconto
from producoes.schema import ProducaoTipo
from tecidos.schema import Tecido

def create_database_engine():
    """Cria o engine do banco de dados baseado na configuração"""
    database_url = settings.DATABASE_URL
    
    if settings.DATABASE_TYPE == "sqlite":
        return create_engine(
            database_url,
            connect_args={
                "check_same_thread": False,
                "timeout": 30
            },
            poolclass=StaticPool,
            pool_pre_ping=True
        )
    else:  # PostgreSQL
        return create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300
        )

# Criar o engine
engine = create_database_engine()

def create_db_and_tables():
    """Cria as tabelas no banco de dados"""
    SQLModel.metadata.create_all(engine)
    
    # Configurar SQLite para WAL mode se for SQLite
    if settings.DATABASE_TYPE == "sqlite":
        with Session(engine) as session:
            session.execute(text("PRAGMA journal_mode=WAL;"))
            session.execute(text("PRAGMA synchronous=NORMAL;"))
            session.execute(text("PRAGMA cache_size=1000;"))
            session.execute(text("PRAGMA temp_store=memory;"))
            session.commit()

def get_session():
    """Dependência para injetar sessão nas rotas"""
    with Session(engine) as session:
        yield session