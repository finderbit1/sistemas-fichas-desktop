"""
Sistema de Circuit Breaker para proteção da API
"""
import logging
from pybreaker import CircuitBreaker, CircuitBreakerError
from functools import wraps
import time

logger = logging.getLogger(__name__)

# Circuit breakers para diferentes operações
database_breaker = CircuitBreaker(
    fail_max=5,  # Máximo 5 falhas
    reset_timeout=30,  # Reset após 30 segundos
    name="database"
)

cache_breaker = CircuitBreaker(
    fail_max=3,  # Máximo 3 falhas
    reset_timeout=15,  # Reset após 15 segundos
    name="cache"
)

def circuit_breaker_protection(breaker: CircuitBreaker):
    """Decorator para proteger funções com circuit breaker"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return breaker.call(func, *args, **kwargs)
            except CircuitBreakerError as e:
                logger.warning(f"🔒 Circuit breaker ativado para {breaker.name}: {e}")
                # Retornar resposta padrão ou erro específico
                if breaker.name == "database":
                    return {"error": "Serviço temporariamente indisponível", "status": "circuit_open"}
                elif breaker.name == "cache":
                    # Fallback para banco de dados
                    logger.info("🔄 Fallback para banco de dados (cache indisponível)")
                    return None
                else:
                    return {"error": "Serviço indisponível", "status": "circuit_open"}
            except Exception as e:
                logger.error(f"❌ Erro em {breaker.name}: {e}")
                raise
        return wrapper
    return decorator

# Decorators específicos
def database_protection(func):
    """Protege operações de banco de dados"""
    return circuit_breaker_protection(database_breaker)(func)

def cache_protection(func):
    """Protege operações de cache"""
    return circuit_breaker_protection(cache_breaker)(func)

class CircuitBreakerMonitor:
    """Monitor para circuit breakers"""
    
    @staticmethod
    def get_status():
        """Retorna status de todos os circuit breakers"""
        return {
            "database": {
                "state": database_breaker.current_state,
                "fail_counter": database_breaker.fail_counter,
                "last_failure": database_breaker.last_failure_time,
                "next_attempt": database_breaker.next_attempt
            },
            "cache": {
                "state": cache_breaker.current_state,
                "fail_counter": cache_breaker.fail_counter,
                "last_failure": cache_breaker.last_failure_time,
                "next_attempt": cache_breaker.next_attempt
            }
        }
    
    @staticmethod
    def reset_all():
        """Reseta todos os circuit breakers"""
        database_breaker.reset()
        cache_breaker.reset()
        logger.info("🔄 Todos os circuit breakers foram resetados")
    
    @staticmethod
    def log_status():
        """Log do status dos circuit breakers"""
        status = CircuitBreakerMonitor.get_status()
        logger.info(f"🔒 Status dos Circuit Breakers:")
        for name, info in status.items():
            logger.info(f"  {name}: {info['state']} (falhas: {info['fail_counter']})")
