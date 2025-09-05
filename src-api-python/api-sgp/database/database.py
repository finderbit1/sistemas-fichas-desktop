
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from config import settings

# Importar todos os modelos para que sejam registrados
from pedidos.schema import Pedido
from clientes.schema import Cliente
from pagamentos.schema import Payments
from envios.schema import Envio
from designers.schema import Designer
from vendedores.schema import Vendedor
from descontos.schema import Desconto

def create_database_engine():
    """Cria o engine do banco de dados baseado na configuração"""
    database_url = settings.DATABASE_URL
    
    if settings.DATABASE_TYPE == "sqlite":
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
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

def get_session():
    """Dependência para injetar sessão nas rotas"""
    with Session(engine) as session:
        yield session