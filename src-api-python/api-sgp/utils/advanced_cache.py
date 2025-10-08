"""
Sistema de cache avançado para melhor performance
"""
import redis
import json
import pickle
import hashlib
from typing import Any, Optional, Dict, List, Callable
from functools import wraps
import time
import logging
from datetime import datetime, timedelta
import threading
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class CacheConfig:
    """Configuração do cache"""
    ttl: int = 300  # 5 minutos
    max_size: int = 1000
    enable_compression: bool = True
    compression_threshold: int = 1024  # 1KB
    enable_serialization: bool = True

class AdvancedCacheManager:
    """Gerenciador de cache avançado com múltiplas estratégias"""
    
    def __init__(self, redis_url: Optional[str] = None, config: Optional[CacheConfig] = None):
        self.config = config or CacheConfig()
        self.local_cache = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0,
            "compressions": 0
        }
        self.lock = threading.RLock()
        
        # Configurar Redis se disponível
        self.redis_client = None
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=False)
                self.redis_client.ping()
                logger.info("✅ Redis conectado com sucesso")
            except Exception as e:
                logger.warning(f"⚠️ Redis não disponível: {e}")
                self.redis_client = None
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Gera chave de cache baseada nos parâmetros"""
        key_data = {
            "args": args,
            "kwargs": sorted(kwargs.items())
        }
        key_string = f"{prefix}:{json.dumps(key_data, sort_keys=True)}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _serialize_data(self, data: Any) -> bytes:
        """Serializa dados para armazenamento"""
        if self.config.enable_serialization:
            try:
                return pickle.dumps(data)
            except Exception:
                return json.dumps(data).encode('utf-8')
        else:
            return json.dumps(data).encode('utf-8')
    
    def _deserialize_data(self, data: bytes) -> Any:
        """Deserializa dados do armazenamento"""
        if self.config.enable_serialization:
            try:
                return pickle.loads(data)
            except Exception:
                return json.loads(data.decode('utf-8'))
        else:
            return json.loads(data.decode('utf-8'))
    
    def _compress_data(self, data: bytes) -> bytes:
        """Comprime dados se necessário"""
        if self.config.enable_compression and len(data) > self.config.compression_threshold:
            try:
                import gzip
                compressed = gzip.compress(data)
                if len(compressed) < len(data):
                    self.cache_stats["compressions"] += 1
                    return compressed
            except Exception as e:
                logger.warning(f"⚠️ Erro na compressão: {e}")
        return data
    
    def _decompress_data(self, data: bytes) -> bytes:
        """Descomprime dados se necessário"""
        try:
            import gzip
            return gzip.decompress(data)
        except Exception:
            return data
    
    def get(self, key: str) -> Optional[Any]:
        """Obtém dados do cache"""
        with self.lock:
            # Tentar Redis primeiro
            if self.redis_client:
                try:
                    data = self.redis_client.get(f"cache:{key}")
                    if data:
                        data = self._decompress_data(data)
                        data = self._deserialize_data(data)
                        self.cache_stats["hits"] += 1
                        return data
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao obter do Redis: {e}")
            
            # Fallback para cache local
            if key in self.local_cache:
                entry = self.local_cache[key]
                if entry["expires"] > time.time():
                    self.cache_stats["hits"] += 1
                    return entry["data"]
                else:
                    del self.local_cache[key]
            
            self.cache_stats["misses"] += 1
            return None
    
    def set(self, key: str, data: Any, ttl: Optional[int] = None) -> bool:
        """Armazena dados no cache"""
        with self.lock:
            ttl = ttl or self.config.ttl
            serialized_data = self._serialize_data(data)
            compressed_data = self._compress_data(serialized_data)
            
            # Armazenar no Redis se disponível
            if self.redis_client:
                try:
                    self.redis_client.setex(f"cache:{key}", ttl, compressed_data)
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao armazenar no Redis: {e}")
            
            # Armazenar no cache local também
            self.local_cache[key] = {
                "data": data,
                "expires": time.time() + ttl
            }
            
            # Limitar tamanho do cache local
            if len(self.local_cache) > self.config.max_size:
                # Remover entradas expiradas primeiro
                current_time = time.time()
                expired_keys = [
                    k for k, v in self.local_cache.items() 
                    if v["expires"] <= current_time
                ]
                for k in expired_keys:
                    del self.local_cache[k]
                
                # Se ainda estiver muito grande, remover os mais antigos
                if len(self.local_cache) > self.config.max_size:
                    oldest_keys = sorted(
                        self.local_cache.keys(),
                        key=lambda k: self.local_cache[k]["expires"]
                    )[:len(self.local_cache) - self.config.max_size]
                    for k in oldest_keys:
                        del self.local_cache[k]
            
            self.cache_stats["sets"] += 1
            return True
    
    def delete(self, key: str) -> bool:
        """Remove dados do cache"""
        with self.lock:
            # Remover do Redis
            if self.redis_client:
                try:
                    self.redis_client.delete(f"cache:{key}")
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao remover do Redis: {e}")
            
            # Remover do cache local
            if key in self.local_cache:
                del self.local_cache[key]
            
            self.cache_stats["deletes"] += 1
            return True
    
    def clear(self) -> bool:
        """Limpa todo o cache"""
        with self.lock:
            # Limpar Redis
            if self.redis_client:
                try:
                    self.redis_client.flushdb()
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao limpar Redis: {e}")
            
            # Limpar cache local
            self.local_cache.clear()
            
            return True
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do cache"""
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.cache_stats,
            "hit_rate": hit_rate,
            "local_cache_size": len(self.local_cache),
            "redis_available": self.redis_client is not None,
            "config": {
                "ttl": self.config.ttl,
                "max_size": self.config.max_size,
                "enable_compression": self.config.enable_compression,
                "enable_serialization": self.config.enable_serialization
            }
        }

def cached(
    ttl: int = 300,
    key_prefix: str = "default",
    cache_manager: Optional[AdvancedCacheManager] = None
):
    """
    Decorator para cache automático de funções
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Usar cache manager global se não fornecido
            manager = cache_manager or global_cache_manager
            
            # Gerar chave de cache
            cache_key = manager._generate_key(f"{key_prefix}:{func.__name__}", *args, **kwargs)
            
            # Tentar obter do cache
            cached_result = manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"🎯 Cache hit para {func.__name__}")
                return cached_result
            
            # Executar função e armazenar resultado
            logger.debug(f"🔄 Cache miss para {func.__name__}, executando função")
            result = func(*args, **kwargs)
            manager.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator

def cache_invalidate(pattern: str, cache_manager: Optional[AdvancedCacheManager] = None):
    """
    Decorator para invalidar cache após operações de escrita
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidar cache com padrão
            manager = cache_manager or global_cache_manager
            if manager.redis_client:
                try:
                    keys = manager.redis_client.keys(f"cache:{pattern}*")
                    if keys:
                        manager.redis_client.delete(*keys)
                except Exception as e:
                    logger.warning(f"⚠️ Erro ao invalidar cache Redis: {e}")
            
            # Invalidar cache local
            keys_to_delete = [k for k in manager.local_cache.keys() if k.startswith(pattern)]
            for key in keys_to_delete:
                del manager.local_cache[key]
            
            logger.debug(f"🗑️ Cache invalidado para padrão: {pattern}")
            return result
        
        return wrapper
    return decorator

# Instância global do cache manager
global_cache_manager = AdvancedCacheManager()

# Funções de conveniência
def get_cached(key: str) -> Optional[Any]:
    """Obtém dados do cache global"""
    return global_cache_manager.get(key)

def set_cached(key: str, data: Any, ttl: int = 300) -> bool:
    """Armazena dados no cache global"""
    return global_cache_manager.set(key, data, ttl)

def delete_cached(key: str) -> bool:
    """Remove dados do cache global"""
    return global_cache_manager.delete(key)

def get_cache_stats() -> Dict[str, Any]:
    """Retorna estatísticas do cache global"""
    return global_cache_manager.get_stats()

def clear_cache() -> bool:
    """Limpa o cache global"""
    return global_cache_manager.clear()
