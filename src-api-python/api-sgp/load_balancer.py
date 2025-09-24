#!/usr/bin/env python3
"""
Load Balancer Simples para API Sistema de Fichas
Distribui requisições entre múltiplas instâncias da API
"""
import asyncio
import aiohttp
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import time
import random
from typing import List, Dict, Any
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoadBalancer:
    def __init__(self, upstream_servers: List[Dict[str, Any]]):
        self.upstream_servers = upstream_servers
        self.current_index = 0
        self.server_stats = {i: {"requests": 0, "errors": 0, "last_check": 0} for i in range(len(upstream_servers))}
        self.healthy_servers = set(range(len(upstream_servers)))
        self.lock = threading.Lock()
        
        # Iniciar health check em background
        self.start_health_check()
    
    def get_next_server(self) -> Dict[str, Any]:
        """Retorna próximo servidor usando round-robin"""
        with self.lock:
            if not self.healthy_servers:
                raise HTTPException(status_code=503, detail="Nenhum servidor disponível")
            
            # Converter para lista ordenada para round-robin consistente
            healthy_list = sorted(list(self.healthy_servers))
            server_index = healthy_list[self.current_index % len(healthy_list)]
            self.current_index += 1
            
            return self.upstream_servers[server_index]
    
    async def health_check_server(self, server_index: int) -> bool:
        """Verifica saúde de um servidor específico"""
        server = self.upstream_servers[server_index]
        url = f"http://{server['host']}:{server['port']}/health"
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get(url) as response:
                    is_healthy = response.status == 200
                    self.server_stats[server_index]["last_check"] = time.time()
                    return is_healthy
        except Exception as e:
            logger.warning(f"⚠️ Servidor {server_index} ({server['host']}:{server['port']}) não saudável: {e}")
            return False
    
    def start_health_check(self):
        """Inicia health check em background"""
        def health_check_loop():
            while True:
                try:
                    for i in range(len(self.upstream_servers)):
                        is_healthy = asyncio.run(self.health_check_server(i))
                        
                        with self.lock:
                            if is_healthy:
                                self.healthy_servers.add(i)
                            else:
                                self.healthy_servers.discard(i)
                    
                    time.sleep(10)  # Verificar a cada 10 segundos
                except Exception as e:
                    logger.error(f"❌ Erro no health check: {e}")
                    time.sleep(30)
        
        health_thread = threading.Thread(target=health_check_loop, daemon=True)
        health_thread.start()
        logger.info("🔍 Health check iniciado")
    
    async def proxy_request(self, request: Request, path: str) -> JSONResponse:
        """Proxy uma requisição para um servidor upstream"""
        server = self.get_next_server()
        server_index = self.upstream_servers.index(server)
        
        # Construir URL completa
        url = f"http://{server['host']}:{server['port']}{path}"
        
        # Preparar headers (remover host para evitar conflito)
        headers = dict(request.headers)
        headers.pop('host', None)
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
                # Preparar dados da requisição
                if request.method == "GET":
                    async with session.get(url, headers=headers) as response:
                        content = await response.read()
                        return JSONResponse(
                            content=content.decode(),
                            status_code=response.status,
                            headers=dict(response.headers)
                        )
                elif request.method == "POST":
                    body = await request.body()
                    async with session.post(url, headers=headers, data=body) as response:
                        content = await response.read()
                        return JSONResponse(
                            content=content.decode(),
                            status_code=response.status,
                            headers=dict(response.headers)
                        )
                elif request.method == "PUT":
                    body = await request.body()
                    async with session.put(url, headers=headers, data=body) as response:
                        content = await response.read()
                        return JSONResponse(
                            content=content.decode(),
                            status_code=response.status,
                            headers=dict(response.headers)
                        )
                elif request.method == "DELETE":
                    async with session.delete(url, headers=headers) as response:
                        content = await response.read()
                        return JSONResponse(
                            content=content.decode(),
                            status_code=response.status,
                            headers=dict(response.headers)
                        )
                else:
                    raise HTTPException(status_code=405, detail="Método não suportado")
        
        except Exception as e:
            logger.error(f"❌ Erro ao fazer proxy para {server['host']}:{server['port']}: {e}")
            
            # Marcar servidor como não saudável temporariamente
            with self.lock:
                self.healthy_servers.discard(server_index)
                self.server_stats[server_index]["errors"] += 1
            
            raise HTTPException(status_code=502, detail="Erro no servidor upstream")
        
        finally:
            # Atualizar estatísticas
            with self.lock:
                self.server_stats[server_index]["requests"] += 1

# Configuração dos servidores upstream
UPSTREAM_SERVERS = [
    {"host": "localhost", "port": 8000, "weight": 1},
    {"host": "localhost", "port": 8001, "weight": 1},
    {"host": "localhost", "port": 8002, "weight": 1}
]

# Criar load balancer
load_balancer = LoadBalancer(UPSTREAM_SERVERS)

# Criar aplicação FastAPI para o load balancer
app = FastAPI(
    title="Load Balancer - Sistema de Fichas",
    version="1.0.0",
    description="Load balancer para distribuir carga entre múltiplas instâncias da API"
)

@app.get("/")
async def root():
    """Endpoint raiz do load balancer"""
    return {
        "message": "Load Balancer - Sistema de Fichas",
        "version": "1.0.0",
        "upstream_servers": len(UPSTREAM_SERVERS),
        "healthy_servers": len(load_balancer.healthy_servers)
    }

@app.get("/health")
async def health():
    """Health check do load balancer"""
    return {
        "status": "healthy",
        "load_balancer": "online",
        "upstream_servers": len(UPSTREAM_SERVERS),
        "healthy_servers": len(load_balancer.healthy_servers),
        "server_stats": load_balancer.server_stats
    }

@app.get("/stats")
async def stats():
    """Estatísticas do load balancer"""
    return {
        "upstream_servers": UPSTREAM_SERVERS,
        "healthy_servers": list(load_balancer.healthy_servers),
        "server_stats": load_balancer.server_stats,
        "current_index": load_balancer.current_index
    }

# Catch-all route para proxy de todas as outras requisições
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_request(request: Request, path: str):
    """Proxy todas as requisições para servidores upstream"""
    return await load_balancer.proxy_request(request, f"/{path}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando Load Balancer na porta 8000...")
    print("📋 Servidores upstream:")
    for i, server in enumerate(UPSTREAM_SERVERS):
        print(f"  {i+1}. {server['host']}:{server['port']}")
    print("\n🌐 Load Balancer: http://localhost:8000")
    print("🔍 Health Check: http://localhost:8000/health")
    print("📊 Stats: http://localhost:8000/stats")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
