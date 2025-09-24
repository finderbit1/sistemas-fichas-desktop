#!/usr/bin/env python3
"""
Teste de Stress para API Sistema de Fichas
Simula uso em 15 PCs simultâneos
"""
import asyncio
import aiohttp
import time
import json
import random
from typing import List, Dict, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import statistics

API_BASE_URL = "http://localhost:8000"

@dataclass
class TestResult:
    endpoint: str
    status_code: int
    response_time: float
    success: bool
    error: str = ""

class StressTestClient:
    def __init__(self, client_id: int):
        self.client_id = client_id
        self.session = None
        self.results = []
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=100)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> TestResult:
        """Faz uma requisição e retorna o resultado"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                async with self.session.get(url) as response:
                    response_time = (time.time() - start_time) * 1000
                    content = await response.text()
                    
                    return TestResult(
                        endpoint=endpoint,
                        status_code=response.status_code,
                        response_time=response_time,
                        success=response.status_code == 200,
                        error="" if response.status_code == 200 else content
                    )
            
            elif method == "POST":
                async with self.session.post(url, json=data) as response:
                    response_time = (time.time() - start_time) * 1000
                    content = await response.text()
                    
                    return TestResult(
                        endpoint=endpoint,
                        status_code=response.status_code,
                        response_time=response_time,
                        success=response.status_code in [200, 201],
                        error="" if response.status_code in [200, 201] else content
                    )
        
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return TestResult(
                endpoint=endpoint,
                status_code=0,
                response_time=response_time,
                success=False,
                error=str(e)
            )
    
    async def simulate_pc_usage(self, duration_seconds: int = 60):
        """Simula o uso de um PC por um período"""
        print(f"🖥️  PC {self.client_id}: Iniciando simulação...")
        
        # Endpoints que serão testados
        endpoints = [
            ("/", "GET"),
            ("/health", "GET"),
            ("/clientes", "GET"),
            ("/pedidos", "GET"),
            ("/producoes/tipos", "GET"),
            ("/pedidos/proximo-numero", "GET"),
        ]
        
        # Dados para testes POST
        sample_cliente = {
            "nome": f"Cliente Teste PC {self.client_id}",
            "cep": "12345-678",
            "cidade": "São Paulo",
            "estado": "SP",
            "telefone": f"1199999{self.client_id:04d}"
        }
        
        start_time = time.time()
        request_count = 0
        
        while time.time() - start_time < duration_seconds:
            # Escolher endpoint aleatório
            endpoint, method = random.choice(endpoints)
            
            # Fazer requisição
            if method == "POST" and endpoint == "/clientes":
                result = await self.make_request(endpoint, "POST", sample_cliente)
            else:
                result = await self.make_request(endpoint, method)
            
            self.results.append(result)
            request_count += 1
            
            # Log de progresso
            if request_count % 10 == 0:
                print(f"🖥️  PC {self.client_id}: {request_count} requisições completadas")
            
            # Pequena pausa entre requisições (simula uso real)
            await asyncio.sleep(random.uniform(0.1, 0.5))
        
        print(f"🖥️  PC {self.client_id}: Finalizado - {request_count} requisições em {duration_seconds}s")
        return request_count

async def run_stress_test(num_pcs: int = 15, duration_seconds: int = 60):
    """Executa teste de stress com múltiplos PCs"""
    print(f"🚀 Iniciando teste de stress com {num_pcs} PCs por {duration_seconds} segundos...")
    print("=" * 60)
    
    # Criar clientes para cada PC
    clients = []
    for i in range(num_pcs):
        client = StressTestClient(i + 1)
        clients.append(client)
    
    # Executar simulação simultânea
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for client in clients:
            async with client:
                task = asyncio.create_task(client.simulate_pc_usage(duration_seconds))
                tasks.append(task)
        
        # Aguardar todas as tarefas
        await asyncio.gather(*tasks)
    
    total_time = time.time() - start_time
    
    # Coletar resultados
    all_results = []
    total_requests = 0
    
    for client in clients:
        all_results.extend(client.results)
        total_requests += len(client.results)
    
    # Analisar resultados
    analyze_results(all_results, total_requests, total_time, num_pcs)

def analyze_results(results: List[TestResult], total_requests: int, total_time: float, num_pcs: int):
    """Analisa os resultados do teste"""
    print("\n" + "=" * 60)
    print("📊 ANÁLISE DOS RESULTADOS")
    print("=" * 60)
    
    # Estatísticas gerais
    successful_requests = sum(1 for r in results if r.success)
    failed_requests = total_requests - successful_requests
    success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
    
    print(f"🖥️  PCs simulados: {num_pcs}")
    print(f"⏱️  Tempo total: {total_time:.2f}s")
    print(f"📈 Total de requisições: {total_requests}")
    print(f"✅ Sucessos: {successful_requests}")
    print(f"❌ Falhas: {failed_requests}")
    print(f"📊 Taxa de sucesso: {success_rate:.2f}%")
    print(f"⚡ Requisições/segundo: {total_requests/total_time:.2f}")
    
    # Análise por endpoint
    print(f"\n📋 ANÁLISE POR ENDPOINT:")
    endpoint_stats = {}
    
    for result in results:
        if result.endpoint not in endpoint_stats:
            endpoint_stats[result.endpoint] = {
                'total': 0, 'success': 0, 'times': []
            }
        
        endpoint_stats[result.endpoint]['total'] += 1
        if result.success:
            endpoint_stats[result.endpoint]['success'] += 1
        endpoint_stats[result.endpoint]['times'].append(result.response_time)
    
    for endpoint, stats in endpoint_stats.items():
        success_rate = (stats['success'] / stats['total']) * 100
        avg_time = statistics.mean(stats['times'])
        min_time = min(stats['times'])
        max_time = max(stats['times'])
        
        print(f"  🔗 {endpoint}:")
        print(f"    📊 Sucessos: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
        print(f"    ⚡ Tempo médio: {avg_time:.2f}ms")
        print(f"    📈 Tempo min/max: {min_time:.2f}ms / {max_time:.2f}ms")
    
    # Análise de performance
    response_times = [r.response_time for r in results if r.success]
    if response_times:
        print(f"\n⚡ ANÁLISE DE PERFORMANCE:")
        print(f"  📊 Tempo médio: {statistics.mean(response_times):.2f}ms")
        print(f"  📈 Mediana: {statistics.median(response_times):.2f}ms")
        print(f"  📉 Percentil 95: {sorted(response_times)[int(len(response_times)*0.95)]:.2f}ms")
        print(f"  📉 Percentil 99: {sorted(response_times)[int(len(response_times)*0.99)]:.2f}ms")
    
    # Recomendações
    print(f"\n💡 RECOMENDAÇÕES:")
    
    if success_rate >= 99:
        print("  ✅ Excelente! Sistema estável para produção")
    elif success_rate >= 95:
        print("  ✅ Bom! Sistema estável com pequenos ajustes")
    elif success_rate >= 90:
        print("  ⚠️  Aceitável! Recomenda-se otimizações")
    else:
        print("  ❌ Crítico! Sistema precisa de melhorias urgentes")
    
    if statistics.mean(response_times) < 100:
        print("  🚀 Performance excelente!")
    elif statistics.mean(response_times) < 500:
        print("  ✅ Performance boa!")
    else:
        print("  ⚠️  Performance pode ser melhorada")
    
    # Verificar se suporta 15 PCs
    requests_per_second = total_requests / total_time
    if requests_per_second >= 50:  # Estimativa para 15 PCs
        print("  🎯 Sistema suporta 15 PCs simultâneos!")
    else:
        print("  ⚠️  Sistema pode ter dificuldades com 15 PCs simultâneos")

def run_quick_test():
    """Teste rápido para verificar se a API está funcionando"""
    print("🔍 Teste rápido da API...")
    
    import requests
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ API está funcionando!")
            return True
        else:
            print(f"❌ API retornou status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao conectar com a API: {e}")
        return False

async def main():
    """Função principal"""
    print("🧪 TESTE DE STRESS - SISTEMA DE FICHAS")
    print("=" * 60)
    
    # Verificar se API está funcionando
    if not run_quick_test():
        print("❌ API não está funcionando. Inicie a API primeiro:")
        print("   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return
    
    print("\n🚀 Iniciando teste de stress...")
    print("Este teste simulará o uso de 15 PCs simultâneos por 60 segundos")
    print("Pressione Ctrl+C para cancelar")
    
    try:
        await run_stress_test(num_pcs=100, duration_seconds=120)
    except KeyboardInterrupt:
        print("\n⏹️  Teste cancelado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")

if __name__ == "__main__":
    asyncio.run(main())
