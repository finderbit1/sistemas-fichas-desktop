from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from base import create_db_and_tables
from config import settings

# Routers
from pedidos.router import router as pedidos_router
from clientes.router import router as clientes_router
from pagamentos.router import router as pagamentos_router
from envios.router import router as envios_router
from admin.router import router as admin_router

# Importar routers dinamicamente para evitar problemas de import circular
try:
    from designers.router import router as designers_router
except ImportError as e:
    print(f"Warning: Could not import designers router: {e}")
    designers_router = None

try:
    from vendedores.router import router as vendedores_router
except ImportError as e:
    print(f"Warning: Could not import vendedores router: {e}")
    vendedores_router = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield create_db_and_tables()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos routers
app.include_router(pedidos_router, prefix=settings.API_V1_STR)
app.include_router(clientes_router, prefix=settings.API_V1_STR)
app.include_router(pagamentos_router, prefix=settings.API_V1_STR)
app.include_router(envios_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

# Incluir routers opcionais se estiverem disponíveis
if designers_router:
    app.include_router(designers_router, prefix=settings.API_V1_STR)
    print("✅ Designers router incluído")

if vendedores_router:
    app.include_router(vendedores_router, prefix=settings.API_V1_STR)
    print("✅ Vendedores router incluído")

@app.get("/")
async def root():
    return {
        "message": "API Sistema de Fichas",
        "version": settings.VERSION,
        "docs": "/docs"
    }
    
    


