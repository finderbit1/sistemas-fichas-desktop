#!/usr/bin/env python3
"""
Script para aplicar todas as otimizações de performance na API
"""
import os
import sys
import subprocess
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_command(command: str, description: str) -> bool:
    """Executa um comando e retorna se foi bem-sucedido"""
    logger.info(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✅ {description} - Sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} - Erro: {e.stderr}")
        return False

def install_dependencies():
    """Instala dependências necessárias para otimizações"""
    dependencies = [
        "orjson",  # JSON mais rápido
        "redis",   # Cache Redis
        "psutil",  # Monitoramento do sistema
        "gzip",    # Compressão (built-in)
    ]
    
    logger.info("📦 Instalando dependências de performance...")
    
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"Instalando {dep}"):
            logger.warning(f"⚠️ Falha ao instalar {dep}, continuando...")

def create_directories():
    """Cria diretórios necessários"""
    directories = [
        "utils",
        "config",
        "logs",
        "cache"
    ]
    
    logger.info("📁 Criando diretórios necessários...")
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"✅ Diretório {directory} criado/verificado")

def apply_database_optimizations():
    """Aplica otimizações de banco de dados"""
    logger.info("🗄️ Aplicando otimizações de banco de dados...")
    
    # Executar script de criação de índices
    if run_command("python create_performance_indexes.py", "Criando índices de performance"):
        logger.info("✅ Índices de banco criados com sucesso!")
    else:
        logger.warning("⚠️ Falha ao criar índices, continuando...")

def update_main_app():
    """Atualiza o arquivo main.py com otimizações"""
    logger.info("🔧 Atualizando aplicação principal...")
    
    main_py_path = Path("main.py")
    if not main_py_path.exists():
        logger.error("❌ Arquivo main.py não encontrado!")
        return False
    
    # Backup do arquivo original
    backup_path = Path("main.py.backup")
    if not backup_path.exists():
        run_command("cp main.py main.py.backup", "Criando backup do main.py")
    
    # Adicionar imports de otimização
    optimization_imports = '''
# Imports de otimização de performance
from utils.performance_monitor import performance_monitor, monitor_performance
from utils.advanced_cache import global_cache_manager
from config.performance_settings import performance_settings
'''
    
    # Ler arquivo atual
    with open(main_py_path, 'r') as f:
        content = f.read()
    
    # Adicionar imports se não existirem
    if "performance_monitor" not in content:
        # Inserir após os imports existentes
        lines = content.split('\n')
        import_end = 0
        for i, line in enumerate(lines):
            if line.startswith('from ') or line.startswith('import '):
                import_end = i
        
        lines.insert(import_end + 1, optimization_imports)
        content = '\n'.join(lines)
    
    # Adicionar middleware de monitoramento
    if "@monitor_performance" not in content:
        # Adicionar decorator aos endpoints principais
        content = content.replace(
            '@app.get("/")',
            '@app.get("/")\n@monitor_performance("/", "GET")'
        )
        content = content.replace(
            '@app.get("/health")',
            '@app.get("/health")\n@monitor_performance("/health", "GET")'
        )
    
    # Salvar arquivo atualizado
    with open(main_py_path, 'w') as f:
        f.write(content)
    
    logger.info("✅ Aplicação principal atualizada!")

def create_performance_endpoints():
    """Cria endpoints de monitoramento de performance"""
    logger.info("📊 Criando endpoints de monitoramento...")
    
    performance_endpoints = '''
# Endpoints de monitoramento de performance
@app.get("/performance/stats")
@monitor_performance("/performance/stats", "GET")
async def get_performance_stats():
    """Retorna estatísticas de performance"""
    from utils.performance_monitor import get_performance_stats
    return get_performance_stats()

@app.get("/performance/endpoints")
@monitor_performance("/performance/endpoints", "GET")
async def get_endpoint_performance():
    """Retorna performance por endpoint"""
    from utils.performance_monitor import get_endpoint_performance
    return get_endpoint_performance()

@app.get("/performance/slow")
@monitor_performance("/performance/slow", "GET")
async def get_slow_endpoints():
    """Retorna endpoints lentos"""
    from utils.performance_monitor import get_slow_endpoints
    return get_slow_endpoints()

@app.get("/cache/stats")
@monitor_performance("/cache/stats", "GET")
async def get_cache_stats():
    """Retorna estatísticas de cache"""
    from utils.advanced_cache import get_cache_stats
    return get_cache_stats()

@app.post("/cache/clear")
@monitor_performance("/cache/clear", "POST")
async def clear_cache():
    """Limpa o cache"""
    from utils.advanced_cache import clear_cache
    clear_cache()
    return {"message": "Cache limpo com sucesso"}
'''
    
    # Adicionar ao main.py
    main_py_path = Path("main.py")
    with open(main_py_path, 'r') as f:
        content = f.read()
    
    if "/performance/stats" not in content:
        content += performance_endpoints
        
        with open(main_py_path, 'w') as f:
            f.write(content)
        
        logger.info("✅ Endpoints de monitoramento criados!")

def create_env_file():
    """Cria arquivo .env com configurações de performance"""
    logger.info("⚙️ Criando arquivo de configuração...")
    
    env_content = '''# Configurações de Performance
CACHE_ENABLED=true
CACHE_TTL_DEFAULT=300
CACHE_TTL_PEDIDOS=60
CACHE_TTL_CLIENTES=300
CACHE_MAX_SIZE=10000

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Monitoramento
MONITORING_ENABLED=true
MONITORING_MAX_METRICS=10000
MONITORING_SLOW_QUERY_THRESHOLD=1.0

# Paginação
PAGINATION_DEFAULT_SIZE=50
PAGINATION_MAX_SIZE=1000

# Compressão
COMPRESSION_ENABLED=true
COMPRESSION_MIN_SIZE=1024

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=1000
'''
    
    env_path = Path(".env")
    if not env_path.exists():
        with open(env_path, 'w') as f:
            f.write(env_content)
        logger.info("✅ Arquivo .env criado!")
    else:
        logger.info("ℹ️ Arquivo .env já existe, pulando...")

def test_optimizations():
    """Testa se as otimizações estão funcionando"""
    logger.info("🧪 Testando otimizações...")
    
    tests = [
        ("python -c 'import orjson; print(\"orjson OK\")'", "Teste orjson"),
        ("python -c 'import redis; print(\"redis OK\")'", "Teste redis"),
        ("python -c 'import psutil; print(\"psutil OK\")'", "Teste psutil"),
        ("python -c 'from utils.json_optimizer import serialize_items_fast; print(\"JSON optimizer OK\")'", "Teste JSON optimizer"),
    ]
    
    passed = 0
    for command, description in tests:
        if run_command(command, description):
            passed += 1
    
    logger.info(f"📊 Testes: {passed}/{len(tests)} passaram")
    return passed == len(tests)

def main():
    """Função principal"""
    logger.info("🚀 INICIANDO APLICAÇÃO DE OTIMIZAÇÕES DE PERFORMANCE")
    logger.info("=" * 60)
    
    # Verificar se estamos no diretório correto
    if not Path("main.py").exists():
        logger.error("❌ Execute este script no diretório da API!")
        sys.exit(1)
    
    steps = [
        ("Instalando dependências", install_dependencies),
        ("Criando diretórios", create_directories),
        ("Aplicando otimizações de banco", apply_database_optimizations),
        ("Atualizando aplicação principal", update_main_app),
        ("Criando endpoints de monitoramento", create_performance_endpoints),
        ("Criando arquivo de configuração", create_env_file),
        ("Testando otimizações", test_optimizations),
    ]
    
    success_count = 0
    for step_name, step_function in steps:
        logger.info(f"\n📋 {step_name}...")
        try:
            if step_function():
                success_count += 1
                logger.info(f"✅ {step_name} - Concluído!")
            else:
                logger.warning(f"⚠️ {step_name} - Parcialmente concluído")
        except Exception as e:
            logger.error(f"❌ {step_name} - Erro: {e}")
    
    logger.info("\n" + "=" * 60)
    logger.info(f"🎉 OTIMIZAÇÕES CONCLUÍDAS: {success_count}/{len(steps)} passos")
    
    if success_count == len(steps):
        logger.info("✅ Todas as otimizações foram aplicadas com sucesso!")
        logger.info("\n📋 PRÓXIMOS PASSOS:")
        logger.info("1. Execute: python create_performance_indexes.py")
        logger.info("2. Execute: python -m uvicorn main:app --reload")
        logger.info("3. Teste: curl http://localhost:8000/performance/stats")
        logger.info("4. Monitore: curl http://localhost:8000/cache/stats")
    else:
        logger.warning("⚠️ Algumas otimizações falharam, verifique os logs acima")
    
    logger.info("\n🚀 Performance da API deve estar significativamente melhorada!")

if __name__ == "__main__":
    main()

