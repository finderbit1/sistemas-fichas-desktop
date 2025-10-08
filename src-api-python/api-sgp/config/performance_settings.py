"""
Configurações avançadas de performance para a API
"""
import os
from typing import Dict, Any, Optional
from pydantic import BaseSettings

class PerformanceSettings(BaseSettings):
    """Configurações de performance da API"""
    
    # Configurações de Cache
    CACHE_ENABLED: bool = True
    CACHE_TTL_DEFAULT: int = 300  # 5 minutos
    CACHE_TTL_PEDIDOS: int = 60   # 1 minuto
    CACHE_TTL_CLIENTES: int = 300 # 5 minutos
    CACHE_TTL_STATS: int = 300    # 5 minutos
    CACHE_MAX_SIZE: int = 10000
    CACHE_COMPRESSION_THRESHOLD: int = 1024  # 1KB
    
    # Configurações de Redis
    REDIS_URL: Optional[str] = None
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # Configurações de Paginação
    PAGINATION_DEFAULT_SIZE: int = 50
    PAGINATION_MAX_SIZE: int = 1000
    PAGINATION_MIN_SIZE: int = 1
    
    # Configurações de Banco de Dados
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 50
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 300
    
    # Configurações de SQLite
    SQLITE_CACHE_SIZE: int = 100000  # 100MB
    SQLITE_MMAP_SIZE: int = 1073741824  # 1GB
    SQLITE_BUSY_TIMEOUT: int = 30000  # 30 segundos
    SQLITE_JOURNAL_MODE: str = "WAL"
    SQLITE_SYNCHRONOUS: str = "NORMAL"
    
    # Configurações de Serialização JSON
    JSON_USE_ORJSON: bool = True
    JSON_COMPRESS_RESPONSES: bool = True
    JSON_COMPRESSION_LEVEL: int = 6
    JSON_MIN_COMPRESS_SIZE: int = 1024
    
    # Configurações de Monitoramento
    MONITORING_ENABLED: bool = True
    MONITORING_MAX_METRICS: int = 10000
    MONITORING_SYSTEM_INTERVAL: int = 10  # segundos
    MONITORING_SLOW_QUERY_THRESHOLD: float = 1.0  # segundos
    
    # Configurações de Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 1000
    RATE_LIMIT_BURST_SIZE: int = 100
    
    # Configurações de Compressão
    COMPRESSION_ENABLED: bool = True
    COMPRESSION_MIN_SIZE: int = 1024
    COMPRESSION_LEVEL: int = 6
    
    # Configurações de Timeout
    REQUEST_TIMEOUT: int = 30
    DATABASE_TIMEOUT: int = 10
    EXTERNAL_API_TIMEOUT: int = 15
    
    # Configurações de Logging
    LOG_PERFORMANCE_METRICS: bool = True
    LOG_SLOW_QUERIES: bool = True
    LOG_CACHE_STATS: bool = True
    
    # Configurações de Otimização
    ENABLE_QUERY_OPTIMIZATION: bool = True
    ENABLE_INDEX_OPTIMIZATION: bool = True
    ENABLE_CONNECTION_POOLING: bool = True
    ENABLE_BULK_OPERATIONS: bool = True
    
    # Configurações de Background Tasks
    BACKGROUND_TASKS_ENABLED: bool = True
    BACKGROUND_CLEANUP_INTERVAL: int = 300  # 5 minutos
    BACKGROUND_CACHE_CLEANUP: bool = True
    BACKGROUND_METRICS_CLEANUP: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instância global das configurações
performance_settings = PerformanceSettings()

# Configurações específicas por ambiente
ENVIRONMENT_CONFIGS = {
    "development": {
        "CACHE_TTL_DEFAULT": 60,
        "PAGINATION_DEFAULT_SIZE": 20,
        "MONITORING_MAX_METRICS": 1000,
        "LOG_PERFORMANCE_METRICS": True
    },
    "testing": {
        "CACHE_ENABLED": False,
        "MONITORING_ENABLED": False,
        "LOG_PERFORMANCE_METRICS": False
    },
    "production": {
        "CACHE_TTL_DEFAULT": 300,
        "PAGINATION_DEFAULT_SIZE": 50,
        "MONITORING_MAX_METRICS": 50000,
        "LOG_PERFORMANCE_METRICS": True,
        "ENABLE_QUERY_OPTIMIZATION": True,
        "ENABLE_INDEX_OPTIMIZATION": True
    }
}

def get_performance_config(environment: str = "development") -> Dict[str, Any]:
    """Retorna configurações de performance para o ambiente especificado"""
    base_config = performance_settings.dict()
    env_config = ENVIRONMENT_CONFIGS.get(environment, {})
    
    # Mesclar configurações
    config = {**base_config, **env_config}
    
    return config

def is_performance_feature_enabled(feature: str) -> bool:
    """Verifica se uma funcionalidade de performance está habilitada"""
    feature_map = {
        "cache": performance_settings.CACHE_ENABLED,
        "monitoring": performance_settings.MONITORING_ENABLED,
        "compression": performance_settings.COMPRESSION_ENABLED,
        "rate_limiting": performance_settings.RATE_LIMIT_ENABLED,
        "query_optimization": performance_settings.ENABLE_QUERY_OPTIMIZATION,
        "index_optimization": performance_settings.ENABLE_INDEX_OPTIMIZATION,
        "connection_pooling": performance_settings.ENABLE_CONNECTION_POOLING,
        "bulk_operations": performance_settings.ENABLE_BULK_OPERATIONS,
        "background_tasks": performance_settings.BACKGROUND_TASKS_ENABLED
    }
    
    return feature_map.get(feature, False)

def get_cache_config() -> Dict[str, Any]:
    """Retorna configurações específicas de cache"""
    return {
        "enabled": performance_settings.CACHE_ENABLED,
        "ttl_default": performance_settings.CACHE_TTL_DEFAULT,
        "ttl_pedidos": performance_settings.CACHE_TTL_PEDIDOS,
        "ttl_clientes": performance_settings.CACHE_TTL_CLIENTES,
        "ttl_stats": performance_settings.CACHE_TTL_STATS,
        "max_size": performance_settings.CACHE_MAX_SIZE,
        "compression_threshold": performance_settings.CACHE_COMPRESSION_THRESHOLD,
        "redis_url": performance_settings.REDIS_URL,
        "redis_host": performance_settings.REDIS_HOST,
        "redis_port": performance_settings.REDIS_PORT,
        "redis_db": performance_settings.REDIS_DB,
        "redis_password": performance_settings.REDIS_PASSWORD
    }

def get_database_config() -> Dict[str, Any]:
    """Retorna configurações específicas de banco de dados"""
    return {
        "pool_size": performance_settings.DB_POOL_SIZE,
        "max_overflow": performance_settings.DB_MAX_OVERFLOW,
        "pool_timeout": performance_settings.DB_POOL_TIMEOUT,
        "pool_recycle": performance_settings.DB_POOL_RECYCLE,
        "sqlite_cache_size": performance_settings.SQLITE_CACHE_SIZE,
        "sqlite_mmap_size": performance_settings.SQLITE_MMAP_SIZE,
        "sqlite_busy_timeout": performance_settings.SQLITE_BUSY_TIMEOUT,
        "sqlite_journal_mode": performance_settings.SQLITE_JOURNAL_MODE,
        "sqlite_synchronous": performance_settings.SQLITE_SYNCHRONOUS
    }

def get_monitoring_config() -> Dict[str, Any]:
    """Retorna configurações específicas de monitoramento"""
    return {
        "enabled": performance_settings.MONITORING_ENABLED,
        "max_metrics": performance_settings.MONITORING_MAX_METRICS,
        "system_interval": performance_settings.MONITORING_SYSTEM_INTERVAL,
        "slow_query_threshold": performance_settings.MONITORING_SLOW_QUERY_THRESHOLD,
        "log_performance_metrics": performance_settings.LOG_PERFORMANCE_METRICS,
        "log_slow_queries": performance_settings.LOG_SLOW_QUERIES,
        "log_cache_stats": performance_settings.LOG_CACHE_STATS
    }

def get_pagination_config() -> Dict[str, Any]:
    """Retorna configurações específicas de paginação"""
    return {
        "default_size": performance_settings.PAGINATION_DEFAULT_SIZE,
        "max_size": performance_settings.PAGINATION_MAX_SIZE,
        "min_size": performance_settings.PAGINATION_MIN_SIZE
    }

# Configurações de otimização por endpoint
ENDPOINT_OPTIMIZATIONS = {
    "/pedidos": {
        "cache_ttl": performance_settings.CACHE_TTL_PEDIDOS,
        "pagination_default": 50,
        "enable_bulk_operations": True,
        "enable_query_optimization": True
    },
    "/clientes": {
        "cache_ttl": performance_settings.CACHE_TTL_CLIENTES,
        "pagination_default": 100,
        "enable_bulk_operations": False,
        "enable_query_optimization": True
    },
    "/stats": {
        "cache_ttl": performance_settings.CACHE_TTL_STATS,
        "pagination_default": 20,
        "enable_bulk_operations": False,
        "enable_query_optimization": True
    }
}

def get_endpoint_optimization(endpoint: str) -> Dict[str, Any]:
    """Retorna configurações de otimização para um endpoint específico"""
    return ENDPOINT_OPTIMIZATIONS.get(endpoint, {
        "cache_ttl": performance_settings.CACHE_TTL_DEFAULT,
        "pagination_default": performance_settings.PAGINATION_DEFAULT_SIZE,
        "enable_bulk_operations": False,
        "enable_query_optimization": True
    })
