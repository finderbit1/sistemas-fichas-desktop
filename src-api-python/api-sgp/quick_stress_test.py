#!/usr/bin/env python3
"""
Teste de Stress Rápido para API Sistema de Fichas
"""
import requests
import threading
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

API_BASE_URL = "http://localhost:8000"

class PCSimulator:
    def __init__(self, pc_id: int):
        self.pc_id = pc_id
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 10
    
    def make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> Dict[str, Any]:
        """Faz uma requisição e retorna o resultado"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = self.session.get(url)
            elif method == "POST":
                response = self.session.post(url, json=data)
            else:
                raise ValueError(f"Método {method} não suportado")
            
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'pc_id': self.pc_id,
                'endpoint': endpoint,
                'method': method,
                'status_code': response.status_code,
                'response_time': response_time,
                'success': response.status_code in [200, 201],
                'timestamp': time.time()
            }
            
            self.results.append(result)
            return result
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            result = {
                'pc_id': self.pc_id,
                'endpoint': endpoint,
                'method': method,
                'status_code': 0,
                'response_time': response_time,
                'success': False,
                'error': str(e),
                'timestamp': time.time()
            }
            
            self.results.append(result)
            return result
    
    def simulate_pc_usage(self, duration_seconds: int = 30) -> int:
        """Simula o uso de um PC por um período"""
        print(f"🖥️  PC {self.pc_id}: Iniciando simulação...")
        
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
            "nome": f"Cliente Teste PC {self.pc_id}",
            "cep": "12345-678",
            "cidade": "São Paulo",
            "estado": "SP",
            "telefone": f"1199999{self.pc_id:04d}"
        }
        
        start_time = time.time()
        request_count = 0
        
        while time.time() - start_time < duration_seconds:
            # Escolher endpoint aleatório
            import random
            endpoint, method = random.choice(endpoints)
            
            # Fazer requisição
            if method == "POST" and endpoint == "/clientes":
                self.make_request(endpoint, "POST", sample_cliente)
            else:
                self.make_request(endpoint, method)
            
            request_count += 1
            
            # Log de progresso
            if request_count % 5 == 0:
                print(f"🖥️  PC {self.pc_id}: {request_count} requisições completadas")
            
            # Pequena pausa entre requisições (simula uso real)
            time.sleep(random.uniform(0.1, 0.3))
        
        print(f"🖥️  PC {self.pc_id}: Finalizado - {request_count} requisições em {duration_seconds}s")
        return request_count

def run_stress_test(num_pcs: int = 15, duration_seconds: int = 30):
    """Executa teste de stress com múltiplos PCs"""
    print(f"🚀 Iniciando teste de stress com {num_pcs} PCs por {duration_seconds} segundos...")
    print("=" * 60)
    
    # Criar simuladores para cada PC
    simulators = [PCSimulator(i + 1) for i in range(num_pcs)]
    
    # Executar simulação simultânea usando ThreadPoolExecutor
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=num_pcs) as executor:
        # Submeter todas as tarefas
        future_to_simulator = {
            executor.submit(simulator.simulate_pc_usage, duration_seconds): simulator 
            for simulator in simulators
        }
        
        # Aguardar todas as tarefas
        for future in as_completed(future_to_simulator):
            simulator = future_to_simulator[future]
            try:
                request_count = future.result()
                print(f"✅ PC {simulator.pc_id} completou {request_count} requisições")
            except Exception as e:
                print(f"❌ PC {simulator.pc_id} falhou: {e}")
    
    total_time = time.time() - start_time
    
    # Coletar resultados
    all_results = []
    total_requests = 0
    
    for simulator in simulators:
        all_results.extend(simulator.results)
        total_requests += len(simulator.results)
    
    # Analisar resultados
    analyze_results(all_results, total_requests, total_time, num_pcs)

def analyze_results(results: List[Dict], total_requests: int, total_time: float, num_pcs: int):
    """Analisa os resultados do teste"""
    print("\n" + "=" * 60)
    print("📊 ANÁLISE DOS RESULTADOS")
    print("=" * 60)
    
    # Estatísticas gerais
    successful_requests = sum(1 for r in results if r['success'])
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
        endpoint = result['endpoint']
        if endpoint not in endpoint_stats:
            endpoint_stats[endpoint] = {
                'total': 0, 'success': 0, 'times': []
            }
        
        endpoint_stats[endpoint]['total'] += 1
        if result['success']:
            endpoint_stats[endpoint]['success'] += 1
        endpoint_stats[endpoint]['times'].append(result['response_time'])
    
    for endpoint, stats in endpoint_stats.items():
        success_rate = (stats['success'] / stats['total']) * 100
        avg_time = sum(stats['times']) / len(stats['times'])
        min_time = min(stats['times'])
        max_time = max(stats['times'])
        
        print(f"  🔗 {endpoint}:")
        print(f"    📊 Sucessos: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
        print(f"    ⚡ Tempo médio: {avg_time:.2f}ms")
        print(f"    📈 Tempo min/max: {min_time:.2f}ms / {max_time:.2f}ms")
    
    # Análise de performance
    response_times = [r['response_time'] for r in results if r['success']]
    if response_times:
        print(f"\n⚡ ANÁLISE DE PERFORMANCE:")
        avg_time = sum(response_times) / len(response_times)
        sorted_times = sorted(response_times)
        median_time = sorted_times[len(sorted_times) // 2]
        p95_time = sorted_times[int(len(sorted_times) * 0.95)]
        p99_time = sorted_times[int(len(sorted_times) * 0.99)]
        
        print(f"  📊 Tempo médio: {avg_time:.2f}ms")
        print(f"  📈 Mediana: {median_time:.2f}ms")
        print(f"  📉 Percentil 95: {p95_time:.2f}ms")
        print(f"  📉 Percentil 99: {p99_time:.2f}ms")
    
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
    
    if avg_time < 100:
        print("  🚀 Performance excelente!")
    elif avg_time < 500:
        print("  ✅ Performance boa!")
    else:
        print("  ⚠️  Performance pode ser melhorada")
    
    # Verificar se suporta 15 PCs
    requests_per_second = total_requests / total_time
    if requests_per_second >= 30:  # Estimativa para 15 PCs
        print("  🎯 Sistema suporta 15 PCs simultâneos!")
    else:
        print("  ⚠️  Sistema pode ter dificuldades com 15 PCs simultâneos")

def run_quick_test():
    """Teste rápido para verificar se a API está funcionando"""
    print("🔍 Teste rápido da API...")
    
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

def main():
    """Função principal"""
    print("🧪 TESTE DE STRESS RÁPIDO - SISTEMA DE FICHAS")
    print("=" * 60)
    
    # Verificar se API está funcionando
    if not run_quick_test():
        print("❌ API não está funcionando. Inicie a API primeiro:")
        print("   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return
    
    print("\n🚀 Iniciando teste de stress...")
    print("Este teste simulará o uso de 15 PCs simultâneos por 30 segundos")
    print("Pressione Ctrl+C para cancelar")
    
    try:
        run_stress_test(num_pcs=15, duration_seconds=30)
    except KeyboardInterrupt:
        print("\n⏹️  Teste cancelado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")

if __name__ == "__main__":
    main()
