#!/usr/bin/env python3
"""
Teste Rápido para 25 PCs - Sistema de Fichas
Teste otimizado de 60 segundos para verificar estabilidade
"""
import requests
import threading
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import random

# Configuração do teste
API_BASE_URL = "http://localhost:8000"  # API direta (mais simples)

class QuickPCSimulator:
    def __init__(self, pc_id: int):
        self.pc_id = pc_id
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 10
        
        # Configurar headers
        self.session.headers.update({
            'User-Agent': f'PC-Quick-{pc_id}',
            'Accept': 'application/json'
        })
    
    def make_request(self, endpoint: str) -> Dict[str, Any]:
        """Faz uma requisição simples"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        try:
            response = self.session.get(url)
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'pc_id': self.pc_id,
                'endpoint': endpoint,
                'status_code': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'timestamp': time.time()
            }
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            result = {
                'pc_id': self.pc_id,
                'endpoint': endpoint,
                'status_code': 0,
                'response_time': response_time,
                'success': False,
                'error': str(e),
                'timestamp': time.time()
            }
        
        self.results.append(result)
        return result
    
    def simulate_pc_usage(self, duration_seconds: int = 60) -> int:
        """Simula o uso de um PC com carga leve"""
        print(f"🖥️  PC {self.pc_id}: Iniciando teste rápido...")
        
        # Endpoints simples
        endpoints = ["/health", "/clientes", "/pedidos", "/producoes/tipos"]
        
        start_time = time.time()
        request_count = 0
        
        while time.time() - start_time < duration_seconds:
            # Escolher endpoint aleatório
            endpoint = random.choice(endpoints)
            
            # Fazer requisição
            result = self.make_request(endpoint)
            request_count += 1
            
            # Log de progresso a cada 5 requisições
            if request_count % 5 == 0:
                success_rate = sum(1 for r in self.results[-5:] if r['success']) / 5 * 100
                print(f"🖥️  PC {self.pc_id}: {request_count} requisições (sucesso: {success_rate:.1f}%)")
            
            # Pausa entre requisições
            time.sleep(random.uniform(0.5, 1.5))
        
        print(f"🖥️  PC {self.pc_id}: Finalizado - {request_count} requisições")
        return request_count

def run_quick_25_pcs_test(duration_seconds: int = 60):
    """Executa teste rápido para 25 PCs"""
    print(f"⚡ TESTE RÁPIDO PARA 25 PCs - {duration_seconds} segundos")
    print("=" * 50)
    
    # Verificar se API está funcionando
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ API não está funcionando")
            return
    except Exception as e:
        print(f"❌ Erro ao conectar com a API: {e}")
        return
    
    print("✅ API está funcionando!")
    
    # Criar simuladores para 25 PCs
    simulators = []
    for i in range(25):
        simulator = QuickPCSimulator(i + 1)
        simulators.append(simulator)
    
    # Executar simulação
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=25) as executor:
        # Submeter todas as tarefas
        future_to_simulator = {
            executor.submit(simulator.simulate_pc_usage, duration_seconds): simulator 
            for simulator in simulators
        }
        
        # Aguardar todas as tarefas
        completed = 0
        for future in as_completed(future_to_simulator):
            simulator = future_to_simulator[future]
            try:
                request_count = future.result()
                completed += 1
                print(f"✅ PC {simulator.pc_id} completou {request_count} requisições ({completed}/25)")
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
    analyze_quick_results(all_results, total_requests, total_time, 25)

def analyze_quick_results(results: List[Dict], total_requests: int, total_time: float, num_pcs: int):
    """Analisa os resultados do teste rápido"""
    print("\n" + "=" * 50)
    print("📊 RESULTADOS DO TESTE RÁPIDO")
    print("=" * 50)
    
    # Estatísticas gerais
    successful_requests = sum(1 for r in results if r['success'])
    failed_requests = total_requests - successful_requests
    success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
    
    print(f"🖥️  PCs: {num_pcs}")
    print(f"⏱️  Tempo: {total_time:.2f}s")
    print(f"📈 Total: {total_requests} requisições")
    print(f"✅ Sucessos: {successful_requests}")
    print(f"❌ Falhas: {failed_requests}")
    print(f"📊 Taxa: {success_rate:.2f}%")
    print(f"⚡ RPS: {total_requests/total_time:.2f}")
    
    # Análise por endpoint
    endpoint_stats = {}
    for result in results:
        endpoint = result['endpoint']
        if endpoint not in endpoint_stats:
            endpoint_stats[endpoint] = {'total': 0, 'success': 0, 'times': []}
        
        endpoint_stats[endpoint]['total'] += 1
        if result['success']:
            endpoint_stats[endpoint]['success'] += 1
        endpoint_stats[endpoint]['times'].append(result['response_time'])
    
    print(f"\n📋 POR ENDPOINT:")
    for endpoint, stats in endpoint_stats.items():
        success_rate = (stats['success'] / stats['total']) * 100
        avg_time = sum(stats['times']) / len(stats['times'])
        print(f"  {endpoint}: {stats['success']}/{stats['total']} ({success_rate:.1f}%) - {avg_time:.1f}ms")
    
    # Conclusão
    print(f"\n💡 CONCLUSÃO:")
    if success_rate >= 95:
        print("  🎯 EXCELENTE! Sistema estável para 25 PCs")
    elif success_rate >= 90:
        print("  ✅ BOM! Sistema estável com pequenos ajustes")
    else:
        print("  ⚠️ Sistema precisa de melhorias")

def main():
    """Função principal"""
    print("⚡ TESTE RÁPIDO - 25 PCs - SISTEMA DE FICHAS")
    print("=" * 50)
    
    try:
        run_quick_25_pcs_test(60)  # 60 segundos
    except KeyboardInterrupt:
        print("\n⏹️  Teste cancelado")
    except Exception as e:
        print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    main()
