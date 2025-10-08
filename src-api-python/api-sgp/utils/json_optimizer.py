"""
Otimizações de serialização JSON para melhor performance
"""
import json
import orjson  # Biblioteca mais rápida que json padrão
from typing import List, Dict, Any, Optional
from functools import lru_cache
import logging
from datetime import datetime
from decimal import Decimal

logger = logging.getLogger(__name__)

class OptimizedJSONSerializer:
    """Classe para serialização JSON otimizada"""
    
    @staticmethod
    @lru_cache(maxsize=1000)
    def serialize_item_cached(item_data: tuple) -> str:
        """
        Serialização com cache para items repetidos
        Usa tuple como chave para ser hashable
        """
        try:
            # Converter tuple de volta para dict
            item_dict = dict(item_data)
            
            # Usar orjson para serialização mais rápida
            return orjson.dumps(item_dict, option=orjson.OPT_SERIALIZE_NUMPY)
            
        except Exception as e:
            logger.error(f"❌ Erro na serialização com cache: {e}")
            return "{}"
    
    @staticmethod
    def serialize_items_optimized(items: List[Any]) -> str:
        """
        Serialização otimizada de lista de items
        Usa orjson e otimizações específicas
        """
        if not items:
            return "[]"
        
        try:
            # Converter items para lista de dicts de forma otimizada
            items_data = []
            for item in items:
                if hasattr(item, 'model_dump'):
                    item_dict = item.model_dump()
                elif hasattr(item, 'dict'):
                    item_dict = item.dict()
                else:
                    item_dict = dict(item)
                
                # Otimizar campos específicos
                if 'acabamento' in item_dict and item_dict['acabamento']:
                    if hasattr(item_dict['acabamento'], 'model_dump'):
                        item_dict['acabamento'] = item_dict['acabamento'].model_dump()
                
                items_data.append(item_dict)
            
            # Usar orjson com otimizações
            return orjson.dumps(
                items_data,
                option=orjson.OPT_SERIALIZE_NUMPY | 
                      orjson.OPT_OMIT_MICROSECONDS |
                      orjson.OPT_NON_STR_KEYS
            ).decode('utf-8')
            
        except Exception as e:
            logger.error(f"❌ Erro na serialização otimizada: {e}")
            return "[]"
    
    @staticmethod
    def deserialize_items_optimized(items_json: str) -> List[Any]:
        """
        Deserialização otimizada de JSON para lista de items
        """
        if not items_json or items_json.strip() == "[]":
            return []
        
        try:
            # Usar orjson para deserialização mais rápida
            items_data = orjson.loads(items_json)
            
            if not items_data:
                return []
            
            # Converter para objetos de forma otimizada
            items = []
            for item_data in items_data:
                try:
                    # Criar objeto Acabamento otimizado
                    acabamento_data = item_data.get('acabamento', {})
                    acabamento = {
                        'overloque': acabamento_data.get('overloque', False),
                        'elastico': acabamento_data.get('elastico', False),
                        'ilhos': acabamento_data.get('ilhos', False)
                    }
                    
                    # Criar item otimizado
                    item = {
                        **{k: v for k, v in item_data.items() if k != 'acabamento'},
                        'acabamento': acabamento
                    }
                    
                    items.append(item)
                    
                except Exception as item_error:
                    logger.warning(f"⚠️ Erro ao processar item: {item_error}")
                    continue
            
            return items
            
        except Exception as e:
            logger.error(f"❌ Erro na deserialização: {e}")
            return []
    
    @staticmethod
    def serialize_pedido_response(pedido_data: Dict[str, Any]) -> str:
        """
        Serialização otimizada para resposta de pedido
        """
        try:
            # Otimizar campos de data
            if 'data_criacao' in pedido_data:
                if isinstance(pedido_data['data_criacao'], datetime):
                    pedido_data['data_criacao'] = pedido_data['data_criacao'].isoformat()
            
            if 'ultima_atualizacao' in pedido_data:
                if isinstance(pedido_data['ultima_atualizacao'], datetime):
                    pedido_data['ultima_atualizacao'] = pedido_data['ultima_atualizacao'].isoformat()
            
            # Usar orjson com configurações otimizadas
            return orjson.dumps(
                pedido_data,
                option=orjson.OPT_SERIALIZE_NUMPY | 
                      orjson.OPT_OMIT_MICROSECONDS |
                      orjson.OPT_NON_STR_KEYS
            ).decode('utf-8')
            
        except Exception as e:
            logger.error(f"❌ Erro na serialização de resposta: {e}")
            return "{}"

class JSONPerformanceOptimizer:
    """Otimizador de performance para operações JSON"""
    
    def __init__(self):
        self.cache_hits = 0
        self.cache_misses = 0
        self.serialization_cache = {}
        self.max_cache_size = 1000
    
    def get_cached_serialization(self, key: str, data: Any) -> Optional[str]:
        """Obtém serialização do cache se disponível"""
        if key in self.serialization_cache:
            self.cache_hits += 1
            return self.serialization_cache[key]
        
        self.cache_misses += 1
        return None
    
    def cache_serialization(self, key: str, data: str):
        """Armazena serialização no cache"""
        if len(self.serialization_cache) >= self.max_cache_size:
            # Remover item mais antigo (FIFO simples)
            oldest_key = next(iter(self.serialization_cache))
            del self.serialization_cache[oldest_key]
        
        self.serialization_cache[key] = data
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas de performance"""
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate": hit_rate,
            "cache_size": len(self.serialization_cache),
            "max_cache_size": self.max_cache_size
        }
    
    def clear_cache(self):
        """Limpa o cache de serialização"""
        self.serialization_cache.clear()
        self.cache_hits = 0
        self.cache_misses = 0

# Instância global do otimizador
json_optimizer = JSONPerformanceOptimizer()

# Funções de conveniência otimizadas
def serialize_items_fast(items: List[Any]) -> str:
    """Serialização rápida de items"""
    return OptimizedJSONSerializer.serialize_items_optimized(items)

def deserialize_items_fast(items_json: str) -> List[Any]:
    """Deserialização rápida de items"""
    return OptimizedJSONSerializer.deserialize_items_optimized(items_json)

def serialize_response_fast(data: Dict[str, Any]) -> str:
    """Serialização rápida de resposta"""
    return OptimizedJSONSerializer.serialize_pedido_response(data)
