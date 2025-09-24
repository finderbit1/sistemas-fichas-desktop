"""
Sistema de Resiliência para API Sistema de Fichas
"""
import logging
import time
from tenacity import (
    retry, stop_after_attempt, wait_exponential, 
    retry_if_exception_type, before_sleep_log
)
from functools import wraps
import asyncio
from typing import Callable, Any

logger = logging.getLogger(__name__)

# Configurações de retry
RETRY_CONFIG = {
    "stop": stop_after_attempt(3),
    "wait": wait_exponential(multiplier=1, min=1, max=10),
    "retry": retry_if_exception_type((ConnectionError, TimeoutError, Exception)),
    "before_sleep": before_sleep_log(logger, logging.WARNING)
}

def resilient_database_operation(func: Callable) -> Callable:
    """Decorator para operações de banco com retry e timeout"""
    
    @retry(**RETRY_CONFIG)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.warning(f"🔄 Tentativa falhou para {func.__name__}: {e}")
            raise
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return sync_wrapper(*args, **kwargs)
        except Exception as e:
            logger.error(f"❌ Todas as tentativas falharam para {func.__name__}: {e}")
            raise
    
    return wrapper

def resilient_cache_operation(func: Callable) -> Callable:
    """Decorator para operações de cache com retry"""
    
    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=2),
        retry=retry_if_exception_type((ConnectionError, TimeoutError))
    )
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.warning(f"🔄 Cache retry para {func.__name__}: {e}")
            raise
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return sync_wrapper(*args, **kwargs)
        except Exception as e:
            logger.warning(f"⚠️ Cache indisponível para {func.__name__}: {e}")
            return None  # Fallback silencioso para cache
    
    return wrapper

def timeout_protection(timeout_seconds: int = 30):
    """Decorator para timeout de operações"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                # Para operações síncronas, usar threading
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(func, *args, **kwargs)
                    return future.result(timeout=timeout_seconds)
            except concurrent.futures.TimeoutError:
                logger.error(f"⏰ Timeout de {timeout_seconds}s excedido para {func.__name__}")
                raise TimeoutError(f"Operação {func.__name__} excedeu timeout de {timeout_seconds}s")
            except Exception as e:
                logger.error(f"❌ Erro em {func.__name__}: {e}")
                raise
        
        return wrapper
    return decorator

class ResilienceMonitor:
    """Monitor para métricas de resiliência"""
    
    def __init__(self):
        self.metrics = {
            "database_retries": 0,
            "cache_retries": 0,
            "timeouts": 0,
            "circuit_breaker_trips": 0,
            "total_requests": 0,
            "failed_requests": 0
        }
    
    def record_retry(self, operation: str):
        """Registra uma tentativa de retry"""
        if operation == "database":
            self.metrics["database_retries"] += 1
        elif operation == "cache":
            self.metrics["cache_retries"] += 1
    
    def record_timeout(self):
        """Registra um timeout"""
        self.metrics["timeouts"] += 1
    
    def record_circuit_breaker_trip(self):
        """Registra ativação do circuit breaker"""
        self.metrics["circuit_breaker_trips"] += 1
    
    def record_request(self, success: bool = True):
        """Registra uma requisição"""
        self.metrics["total_requests"] += 1
        if not success:
            self.metrics["failed_requests"] += 1
    
    def get_metrics(self) -> dict:
        """Retorna métricas de resiliência"""
        success_rate = (
            (self.metrics["total_requests"] - self.metrics["failed_requests"]) / 
            self.metrics["total_requests"] * 100
            if self.metrics["total_requests"] > 0 else 100
        )
        
        return {
            **self.metrics,
            "success_rate": success_rate,
            "timestamp": time.time()
        }
    
    def log_metrics(self):
        """Log das métricas de resiliência"""
        metrics = self.get_metrics()
        logger.info("📊 Métricas de Resiliência:")
        logger.info(f"  📈 Total de requisições: {metrics['total_requests']}")
        logger.info(f"  ✅ Taxa de sucesso: {metrics['success_rate']:.2f}%")
        logger.info(f"  🔄 Retries de banco: {metrics['database_retries']}")
        logger.info(f"  🎯 Retries de cache: {metrics['cache_retries']}")
        logger.info(f"  ⏰ Timeouts: {metrics['timeouts']}")
        logger.info(f"  🔒 Circuit breaker trips: {metrics['circuit_breaker_trips']}")

# Instância global do monitor
resilience_monitor = ResilienceMonitor()
