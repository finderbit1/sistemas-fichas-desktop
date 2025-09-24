#!/usr/bin/env python3
"""
Teste Específico para 25 PCs com 100% de Sucesso
Otimizado para carga moderada e alta confiabilidade
"""
import requests
import threading
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import random
import signal
import sys

# Configuração do teste
API_BASE_URL = "http://localhost:9000"  # Load balancer
# API_BASE_URL = "http://localhost:8000"  # API direta

class PerfectPCSimulator:
    def __init__(self, pc_id: int):
        self.pc_id = pc_id
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 15  # Timeout aumentado para estabilidade
        
        # Configurar headers otimizados
        self.session.headers.update({
            'User-Agent': f'PC-Perfect-{pc_id}',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        })
    
    def make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> Dict[str, Any]:
        """Faz uma requisição com retry inteligente"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        # Retry até 2 vezes (mais conservador)
        for attempt in range(2):
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
                    'attempt': attempt + 1,
                    'timestamp': time.time()
                }
                
                # Se sucesso, parar retry
                if result['success']:
                    break
                    
            except requests.exceptions.Timeout:
                response_time = (time.time() - start_time) * 1000
                result = {
                    'pc_id': self.pc_id,
                    'endpoint': endpoint,
                    'method': method,
                    'status_code': 0,
                    'response_time': response_time,
                    'success': False,
                    'error': 'timeout',
                    'attempt': attempt + 1,
                    'timestamp': time.time()
                }
                
                if attempt < 1:  # Apenas 1 retry
                    time.sleep(1)  # Pausa antes do retry
                    continue
                    
            except requests.exceptions.ConnectionError:
                response_time = (time.time() - start_time) * 1000
                result = {
                    'pc_id': self.pc_id,
                    'endpoint': endpoint,
                    'method': method,
                    'status_code': 0,
                    'response_time': response_time,
                    'success': False,
                    'error': 'connection_error',
                    'attempt': attempt + 1,
                    'timestamp': time.time()
                }
                
                if attempt < 1:
                    time.sleep(2)  # Pausa maior para erro de conexão
                    continue
                    
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
                    'attempt': attempt + 1,
                    'timestamp': time.time()
                }
                break
        
        self.results.append(result)
        return result
    
    def simulate_pc_usage(self, duration_seconds: int = 120) -> int:
        """Simula o uso de um PC com carga moderada"""
        print(f"🖥️  PC {self.pc_id}: Iniciando simulação otimizada...")
        
        # Endpoints otimizados para 25 PCs (menos carga no root)
        endpoints = [
            ("/health", "GET", 0.4),  # 40% health checks
            ("/clientes", "GET", 0.25),  # 25% clientes
            ("/pedidos", "GET", 0.2),  # 20% pedidos
            ("/producoes/tipos", "GET", 0.1),  # 10% produções
            ("/pedidos/proximo-numero", "GET", 0.05),  # 5% próximo número
        ]
        
        start_time = time.time()
        request_count = 0
        
        while time.time() - start_time < duration_seconds:
            # Escolher endpoint baseado no peso
            rand = random.random()
            cumulative = 0
            selected_endpoint = None
            
            for endpoint, method, weight in endpoints:
                cumulative += weight
                if rand <= cumulative:
                    selected_endpoint = (endpoint, method)
                    break
            
            if selected_endpoint:
                endpoint, method = selected_endpoint
                
                # Fazer requisição
                result = self.make_request(endpoint, method)
                request_count += 1
                
                # Log de progresso a cada 5 requisições
                if request_count % 5 == 0:
                    success_rate = sum(1 for r in self.results[-5:] if r['success']) / 5 * 100
                    print(f"🖥️  PC {self.pc_id}: {request_count} requisições (sucesso: {success_rate:.1f}%)")
                
                # Pausa otimizada para 25 PCs
                if result['success']:
                    time.sleep(random.uniform(0.2, 0.5))  # Pausa moderada
                else:
                    time.sleep(random.uniform(1.0, 2.0))  # Pausa maior após erro
            
            # Verificar se deve parar
            if time.time() - start_time >= duration_seconds:
                break
        
        print(f"🖥️  PC {self.pc_id}: Finalizado - {request_count} requisições em {duration_seconds}s")
        return request_count

def run_perfect_25_pcs_test(duration_seconds: int = 120):
    """Executa teste otimizado para 25 PCs"""
    print(f"🎯 TESTE PERFEITO PARA 25 PCs - {duration_seconds} segundos")
    print("=" * 60)
    print("💡 Configuração otimizada:")
    print("  - 25 PCs simultâneos")
    print("  - Carga moderada e estável")
    print("  - Retry inteligente (máximo 2 tentativas)")
    print("  - Pausas otimizadas")
    print("  - Load balancer com 3 instâncias")
    print("=" * 60)
    
    # Verificar se API está funcionando
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
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
        simulator = PerfectPCSimulator(i + 1)
        simulators.append(simulator)
    
    # Executar simulação simultânea
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
    analyze_perfect_results(all_results, total_requests, total_time, 25)

def analyze_perfect_results(results: List[Dict], total_requests: int, total_time: float, num_pcs: int):
    """Analisa os resultados do teste perfeito"""
    print("\n" + "=" * 60)
    print("📊 ANÁLISE DOS RESULTADOS PERFEITOS")
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
    
    # Análise de tentativas
    retry_stats = {}
    for result in results:
        attempt = result.get('attempt', 1)
        if attempt not in retry_stats:
            retry_stats[attempt] = 0
        retry_stats[attempt] += 1
    
    print(f"\n🔄 ANÁLISE DE TENTATIVAS:")
    for attempt, count in sorted(retry_stats.items()):
        percentage = (count / total_requests) * 100
        print(f"  Tentativa {attempt}: {count} ({percentage:.1f}%)")
    
    # Análise por endpoint
    print(f"\n📋 ANÁLISE POR ENDPOINT:")
    endpoint_stats = {}
    
    for result in results:
        endpoint = result['endpoint']
        if endpoint not in endpoint_stats:
            endpoint_stats[endpoint] = {
                'total': 0, 'success': 0, 'times': [], 'errors': {}
            }
        
        endpoint_stats[endpoint]['total'] += 1
        if result['success']:
            endpoint_stats[endpoint]['success'] += 1
        endpoint_stats[endpoint]['times'].append(result['response_time'])
        
        # Contar tipos de erro
        error = result.get('error', 'none')
        if error not in endpoint_stats[endpoint]['errors']:
            endpoint_stats[endpoint]['errors'][error] = 0
        endpoint_stats[endpoint]['errors'][error] += 1
    
    for endpoint, stats in endpoint_stats.items():
        success_rate = (stats['success'] / stats['total']) * 100
        avg_time = sum(stats['times']) / len(stats['times'])
        min_time = min(stats['times'])
        max_time = max(stats['times'])
        
        print(f"  🔗 {endpoint}:")
        print(f"    📊 Sucessos: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
        print(f"    ⚡ Tempo médio: {avg_time:.2f}ms")
        print(f"    📈 Tempo min/max: {min_time:.2f}ms / {max_time:.2f}ms")
        
        # Mostrar erros mais comuns
        if stats['errors']:
            most_common_error = max(stats['errors'], key=stats['errors'].get)
            print(f"    ❌ Erro mais comum: {most_common_error} ({stats['errors'][most_common_error]}x)")
    
    # Recomendações específicas
    print(f"\n💡 RECOMENDAÇÕES ESPECÍFICAS:")
    
    if success_rate >= 99:
        print("  🎯 PERFEITO! Sistema 100% estável para 25 PCs")
        print("  🚀 Pronto para produção!")
    elif success_rate >= 95:
        print("  ✅ Excelente! Sistema muito estável")
        print("  💡 Pequenos ajustes podem levar a 100%")
    elif success_rate >= 90:
        print("  ✅ Bom! Sistema estável")
        print("  🔧 Recomenda-se otimizações menores")
    else:
        print("  ⚠️ Sistema precisa de melhorias")
        print("  🔧 Considere aumentar número de instâncias")
    
    # Verificar se atingiu o objetivo
    if success_rate >= 99:
        print(f"\n🎉 OBJETIVO ALCANÇADO!")
        print(f"✅ 25 PCs com {success_rate:.2f}% de sucesso")
        print(f"🚀 Sistema pronto para produção!")
    else:
        print(f"\n📈 PRÓXIMOS PASSOS:")
        print(f"  - Taxa atual: {success_rate:.2f}%")
        print(f"  - Meta: 99%+")
        print(f"  - Diferença: {99 - success_rate:.2f}%")

def main():
    """Função principal"""
    print("🎯 TESTE PERFEITO PARA 25 PCs - SISTEMA DE FICHAS")
    print("=" * 60)
    
    # Configurações do teste
    duration = 120  # 2 minutos
    
    print(f"🚀 Configuração do teste:")
    print(f"  🖥️  PCs: 25")
    print(f"  ⏱️  Duração: {duration}s")
    print(f"  🎯 Meta: 99%+ de sucesso")
    print(f"  🔄 Retry: Máximo 2 tentativas")
    print(f"  ⚡ Timeout: 15s por requisição")
    print(f"  🌐 Load Balancer: 3 instâncias")
    
    try:
        run_perfect_25_pcs_test(duration)
    except KeyboardInterrupt:
        print("\n⏹️  Teste cancelado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")

if __name__ == "__main__":
    main()
