"""
Sistema de monitoramento de performance para a API
"""
import time
import psutil
import logging
from typing import Dict, Any, List, Optional
from functools import wraps
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict, deque
import threading
import json

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """Métricas de performance"""
    endpoint: str
    method: str
    response_time: float
    status_code: int
    timestamp: datetime
    memory_usage: float
    cpu_usage: float
    cache_hit: bool = False
    error_message: Optional[str] = None

@dataclass
class SystemMetrics:
    """Métricas do sistema"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_available: float
    disk_usage: float
    active_connections: int
    requests_per_second: float

class PerformanceMonitor:
    """Monitor de performance da API"""
    
    def __init__(self, max_metrics: int = 10000):
        self.metrics: deque = deque(maxlen=max_metrics)
        self.endpoint_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "total_requests": 0,
            "total_time": 0.0,
            "avg_time": 0.0,
            "min_time": float('inf'),
            "max_time": 0.0,
            "error_count": 0,
            "cache_hits": 0,
            "cache_misses": 0
        })
        self.system_metrics: deque = deque(maxlen=1000)
        self.lock = threading.Lock()
        self.start_time = datetime.now()
        
        # Iniciar monitoramento do sistema
        self._start_system_monitoring()
    
    def _start_system_monitoring(self):
        """Inicia monitoramento do sistema em background"""
        def monitor_system():
            while True:
                try:
                    metrics = SystemMetrics(
                        timestamp=datetime.now(),
                        cpu_percent=psutil.cpu_percent(),
                        memory_percent=psutil.virtual_memory().percent,
                        memory_available=psutil.virtual_memory().available / (1024**3),  # GB
                        disk_usage=psutil.disk_usage('/').percent,
                        active_connections=len(psutil.net_connections()),
                        requests_per_second=self._calculate_rps()
                    )
                    
                    with self.lock:
                        self.system_metrics.append(metrics)
                    
                    time.sleep(10)  # Monitorar a cada 10 segundos
                    
                except Exception as e:
                    logger.error(f"❌ Erro no monitoramento do sistema: {e}")
                    time.sleep(30)
        
        thread = threading.Thread(target=monitor_system, daemon=True)
        thread.start()
    
    def _calculate_rps(self) -> float:
        """Calcula requests por segundo"""
        with self.lock:
            if len(self.metrics) < 2:
                return 0.0
            
            # Calcular RPS dos últimos 60 segundos
            now = datetime.now()
            recent_metrics = [
                m for m in self.metrics 
                if (now - m.timestamp).total_seconds() <= 60
            ]
            
            if len(recent_metrics) < 2:
                return 0.0
            
            time_span = (recent_metrics[-1].timestamp - recent_metrics[0].timestamp).total_seconds()
            if time_span == 0:
                return 0.0
            
            return len(recent_metrics) / time_span
    
    def record_request(self, metrics: PerformanceMetrics):
        """Registra métricas de uma requisição"""
        with self.lock:
            # Adicionar às métricas gerais
            self.metrics.append(metrics)
            
            # Atualizar estatísticas por endpoint
            endpoint_key = f"{metrics.method} {metrics.endpoint}"
            stats = self.endpoint_stats[endpoint_key]
            
            stats["total_requests"] += 1
            stats["total_time"] += metrics.response_time
            stats["avg_time"] = stats["total_time"] / stats["total_requests"]
            stats["min_time"] = min(stats["min_time"], metrics.response_time)
            stats["max_time"] = max(stats["max_time"], metrics.response_time)
            
            if metrics.status_code >= 400:
                stats["error_count"] += 1
            
            if metrics.cache_hit:
                stats["cache_hits"] += 1
            else:
                stats["cache_misses"] += 1
    
    def get_endpoint_stats(self, endpoint: Optional[str] = None) -> Dict[str, Any]:
        """Retorna estatísticas de endpoints"""
        with self.lock:
            if endpoint:
                return dict(self.endpoint_stats.get(endpoint, {}))
            else:
                return dict(self.endpoint_stats)
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do sistema"""
        with self.lock:
            if not self.system_metrics:
                return {}
            
            latest = self.system_metrics[-1]
            return {
                "timestamp": latest.timestamp.isoformat(),
                "cpu_percent": latest.cpu_percent,
                "memory_percent": latest.memory_percent,
                "memory_available_gb": latest.memory_available,
                "disk_usage_percent": latest.disk_usage,
                "active_connections": latest.active_connections,
                "requests_per_second": latest.requests_per_second,
                "uptime_seconds": (datetime.now() - self.start_time).total_seconds()
            }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Retorna resumo de performance"""
        with self.lock:
            if not self.metrics:
                return {"message": "Nenhuma métrica disponível"}
            
            # Calcular estatísticas gerais
            total_requests = len(self.metrics)
            total_time = sum(m.response_time for m in self.metrics)
            avg_time = total_time / total_requests if total_requests > 0 else 0
            
            # Tempos de resposta por percentil
            response_times = sorted([m.response_time for m in self.metrics])
            p50 = response_times[int(len(response_times) * 0.5)] if response_times else 0
            p95 = response_times[int(len(response_times) * 0.95)] if response_times else 0
            p99 = response_times[int(len(response_times) * 0.99)] if response_times else 0
            
            # Contar erros
            error_count = sum(1 for m in self.metrics if m.status_code >= 400)
            error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
            
            # Cache hit rate
            cache_hits = sum(1 for m in self.metrics if m.cache_hit)
            cache_hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "total_requests": total_requests,
                "avg_response_time_ms": round(avg_time * 1000, 2),
                "p50_response_time_ms": round(p50 * 1000, 2),
                "p95_response_time_ms": round(p95 * 1000, 2),
                "p99_response_time_ms": round(p99 * 1000, 2),
                "error_rate_percent": round(error_rate, 2),
                "cache_hit_rate_percent": round(cache_hit_rate, 2),
                "requests_per_second": round(self._calculate_rps(), 2),
                "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
                "system_stats": self.get_system_stats()
            }
    
    def get_slow_queries(self, threshold: float = 1.0) -> List[Dict[str, Any]]:
        """Retorna queries lentas acima do threshold"""
        with self.lock:
            slow_queries = [
                {
                    "endpoint": f"{m.method} {m.endpoint}",
                    "response_time_ms": round(m.response_time * 1000, 2),
                    "timestamp": m.timestamp.isoformat(),
                    "status_code": m.status_code,
                    "cache_hit": m.cache_hit
                }
                for m in self.metrics
                if m.response_time > threshold
            ]
            
            return sorted(slow_queries, key=lambda x: x["response_time_ms"], reverse=True)
    
    def clear_metrics(self):
        """Limpa todas as métricas"""
        with self.lock:
            self.metrics.clear()
            self.endpoint_stats.clear()
            self.system_metrics.clear()

# Instância global do monitor
performance_monitor = PerformanceMonitor()

def monitor_performance(endpoint: str, method: str = "GET"):
    """
    Decorator para monitorar performance de endpoints
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            start_cpu = psutil.cpu_percent()
            
            try:
                result = func(*args, **kwargs)
                status_code = 200
                error_message = None
            except Exception as e:
                status_code = 500
                error_message = str(e)
                raise
            finally:
                end_time = time.time()
                end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
                end_cpu = psutil.cpu_percent()
                
                metrics = PerformanceMetrics(
                    endpoint=endpoint,
                    method=method,
                    response_time=end_time - start_time,
                    status_code=status_code,
                    timestamp=datetime.now(),
                    memory_usage=end_memory - start_memory,
                    cpu_usage=end_cpu - start_cpu,
                    error_message=error_message
                )
                
                performance_monitor.record_request(metrics)
            
            return result
        
        return wrapper
    return decorator

def get_performance_stats() -> Dict[str, Any]:
    """Retorna estatísticas de performance"""
    return performance_monitor.get_performance_summary()

def get_endpoint_performance(endpoint: Optional[str] = None) -> Dict[str, Any]:
    """Retorna performance por endpoint"""
    return performance_monitor.get_endpoint_stats(endpoint)

def get_system_performance() -> Dict[str, Any]:
    """Retorna performance do sistema"""
    return performance_monitor.get_system_stats()

def get_slow_endpoints(threshold: float = 1.0) -> List[Dict[str, Any]]:
    """Retorna endpoints lentos"""
    return performance_monitor.get_slow_queries(threshold)
