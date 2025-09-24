"""
Configurações de performance para a API Sistema de Fichas
"""
from typing import Dict, Any

# Configurações de cache
CACHE_CONFIG: Dict[str, Any] = {
    "max_size": 1000,
    "ttl": 300,  # 5 minutos
    "cleanup_interval": 60  # 1 minuto
}

# Configurações de banco de dados
DATABASE_CONFIG: Dict[str, Any] = {
    "sqlite": {
        "timeout": 30,
        "cache_size": 10000,
        "mmap_size": 268435456,  # 256MB
        "journal_mode": "WAL",
        "synchronous": "NORMAL",
        "temp_store": "memory"
    },
    "postgresql": {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 300,
        "pool_pre_ping": True
    }
}

# Configurações de paginação
PAGINATION_CONFIG: Dict[str, Any] = {
    "default_page_size": 50,
    "max_page_size": 1000,
    "min_page_size": 1
}

# Configurações de rate limiting
RATE_LIMIT_CONFIG: Dict[str, Any] = {
    "requests_per_minute": 100,
    "burst_size": 20
}

# Configurações de compressão
COMPRESSION_CONFIG: Dict[str, Any] = {
    "enabled": True,
    "min_size": 1024,  # 1KB
    "level": 6
}

# Configurações de timeout
TIMEOUT_CONFIG: Dict[str, Any] = {
    "request_timeout": 30,
    "database_timeout": 10,
    "external_api_timeout": 15
}
