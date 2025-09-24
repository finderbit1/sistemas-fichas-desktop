"""
Sistema de Cache para API Sistema de Fichas
"""
import json
import redis
import logging
from typing import Any, Optional, Dict, List
from functools import wraps
import hashlib
import time

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """Inicializa o gerenciador de cache"""
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            # Testar conexão
            self.redis_client.ping()
            self.enabled = True
            logger.info("✅ Cache Redis conectado com sucesso")
        except Exception as e:
            logger.warning(f"⚠️ Cache Redis não disponível: {e}")
            self.redis_client = None
            self.enabled = False
    
    def get(self, key: str) -> Optional[Any]:
        """Obtém valor do cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao obter cache {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Define valor no cache com TTL"""
        if not self.enabled:
            return False
        
        try:
            serialized_value = json.dumps(value, ensure_ascii=False)
            self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"❌ Erro ao definir cache {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Remove valor do cache"""
        if not self.enabled:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"❌ Erro ao deletar cache {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Remove valores que correspondem ao padrão"""
        if not self.enabled:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"❌ Erro ao deletar padrão {pattern}: {e}")
            return 0
    
    def generate_key(self, prefix: str, *args) -> str:
        """Gera chave de cache baseada nos argumentos"""
        key_data = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_data.encode()).hexdigest()

# Instância global do cache
cache_manager = CacheManager()

def cached(ttl: int = 300, key_prefix: str = "api"):
    """Decorator para cache de funções"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Gerar chave de cache
            cache_key = cache_manager.generate_key(
                key_prefix, 
                func.__name__, 
                *args, 
                *sorted(kwargs.items())
            )
            
            # Tentar obter do cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"🎯 Cache hit: {cache_key}")
                return cached_result
            
            # Executar função e cachear resultado
            logger.debug(f"🔄 Cache miss: {cache_key}")
            result = await func(*args, **kwargs)
            
            # Cachear apenas se não for None
            if result is not None:
                cache_manager.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator

def invalidate_cache(pattern: str):
    """Decorator para invalidar cache após operações de escrita"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Invalidar cache relacionado
            deleted_count = cache_manager.delete_pattern(pattern)
            if deleted_count > 0:
                logger.info(f"🗑️ Cache invalidado: {deleted_count} chaves removidas ({pattern})")
            
            return result
        
        return wrapper
    return decorator

# Funções utilitárias para cache específico
class ClienteCache:
    """Cache específico para clientes"""
    
    @staticmethod
    def get_all_key() -> str:
        return "clientes:all"
    
    @staticmethod
    def get_by_id_key(cliente_id: int) -> str:
        return f"clientes:id:{cliente_id}"
    
    @staticmethod
    def get_by_name_key(nome: str) -> str:
        return f"clientes:nome:{hashlib.md5(nome.encode()).hexdigest()}"
    
    @staticmethod
    def invalidate_all():
        """Invalida todo cache de clientes"""
        return cache_manager.delete_pattern("clientes:*")

class PedidoCache:
    """Cache específico para pedidos"""
    
    @staticmethod
    def get_all_key() -> str:
        return "pedidos:all"
    
    @staticmethod
    def get_by_id_key(pedido_id: int) -> str:
        return f"pedidos:id:{pedido_id}"
    
    @staticmethod
    def get_by_status_key(status: str) -> str:
        return f"pedidos:status:{status}"
    
    @staticmethod
    def get_proximo_numero_key() -> str:
        return "pedidos:proximo_numero"
    
    @staticmethod
    def invalidate_all():
        """Invalida todo cache de pedidos"""
        return cache_manager.delete_pattern("pedidos:*")

class ProducaoCache:
    """Cache específico para produções"""
    
    @staticmethod
    def get_tipos_key() -> str:
        return "producoes:tipos"
    
    @staticmethod
    def get_by_id_key(tipo_id: int) -> str:
        return f"producoes:tipo:{tipo_id}"
    
    @staticmethod
    def invalidate_all():
        """Invalida todo cache de produções"""
        return cache_manager.delete_pattern("producoes:*")
