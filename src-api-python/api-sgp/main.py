from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import sys

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configurar Rate Limiter
limiter = Limiter(key_func=get_remote_address)

from base import create_db_and_tables
from config import settings

# Importar routers principais (sempre disponíveis)
from pedidos.router import router as pedidos_router
from clientes.router import router as clientes_router
from pagamentos.router import router as pagamentos_router
from envios.router import router as envios_router
from admin.router import router as admin_router
from descontos.router import router as descontos_router
from relatorios.router import router as relatorios_router
from producoes.router import router as producoes_router
from tecidos.router import router as tecidos_router
from materiais.router import router as materiais_router

# Importar routers opcionais com tratamento de erro robusto
designers_router = None
vendedores_router = None

try:
    from designers.router import router as designers_router
    logger.info("✅ Router de designers importado com sucesso")
except ImportError as e:
    logger.warning(f"⚠️ Router de designers não disponível: {e}")
except Exception as e:
    logger.error(f"❌ Erro inesperado ao importar designers router: {e}")

try:
    from vendedores.router import router as vendedores_router
    logger.info("✅ Router de vendedores importado com sucesso")
except ImportError as e:
    logger.warning(f"⚠️ Router de vendedores não disponível: {e}")
except Exception as e:
    logger.error(f"❌ Erro inesperado ao importar vendedores router: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    logger.info("🚀 Iniciando API Sistema de Fichas...")
    try:
        create_db_and_tables()
        logger.info("✅ Banco de dados inicializado com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco de dados: {e}")
        raise
    
    logger.info("✅ API iniciada com sucesso")
    yield
    
    logger.info("🛑 Encerrando API...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de compressão Gzip
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,  # Comprimir apenas arquivos maiores que 1KB
)

# Inclusão dos routers principais
try:
    app.include_router(pedidos_router, prefix=settings.API_V1_STR)
    app.include_router(clientes_router, prefix=settings.API_V1_STR)
    app.include_router(pagamentos_router, prefix=settings.API_V1_STR)
    app.include_router(envios_router, prefix=settings.API_V1_STR)
    app.include_router(admin_router, prefix=settings.API_V1_STR)
    app.include_router(descontos_router, prefix=settings.API_V1_STR)
    app.include_router(relatorios_router, prefix=settings.API_V1_STR)
    app.include_router(producoes_router, prefix=settings.API_V1_STR)
    app.include_router(tecidos_router, prefix=settings.API_V1_STR)
    app.include_router(materiais_router, prefix=settings.API_V1_STR)
    logger.info("✅ Routers principais incluídos com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao incluir routers principais: {e}")
    raise

# Incluir routers opcionais se estiverem disponíveis
if designers_router:
    try:
        app.include_router(designers_router, prefix=settings.API_V1_STR)
        logger.info("✅ Router de designers incluído")
    except Exception as e:
        logger.error(f"❌ Erro ao incluir router de designers: {e}")

if vendedores_router:
    try:
        app.include_router(vendedores_router, prefix=settings.API_V1_STR)
        logger.info("✅ Router de vendedores incluído")
    except Exception as e:
        logger.error(f"❌ Erro ao incluir router de vendedores: {e}")

@app.get("/")
@limiter.limit("200/minute")  # 200 requisições por minuto (25 PCs * 8 req/min)
async def root(request: Request):
    """Endpoint raiz da API"""
    return {
        "message": "API Sistema de Fichas",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
@limiter.limit("500/minute")  # 500 requisições por minuto (25 PCs * 20 req/min)
async def health_check(request: Request):
    """Endpoint de verificação de saúde da API"""
    try:
        # Verificar conexão com banco
        from database.database import get_session_context
        from sqlalchemy import text
        with get_session_context() as session:
            session.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "message": "API funcionando corretamente",
            "version": settings.VERSION,
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"❌ Health check falhou: {e}")
        return {
            "status": "unhealthy",
            "message": "Problemas na API",
            "version": settings.VERSION,
            "database": "disconnected",
            "error": str(e)
        }
    
    


