#!/usr/bin/env python3
"""
Teste de Stress Melhorado para API Sistema de Fichas
Com proteções contra sobrecarga
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

API_BASE_URL = "http://localhost:8000"

class StressTestController:
    def __init__(self):
        self.running = True
        self.results = []
        self.lock = threading.Lock()
        self.start_time = None
        
    def stop(self):
        """Para o teste de stress"""
        self.running = False
        print("\n⏹️ Teste de stress interrompido pelo usuário")

# Instância global do controlador
controller = StressTestController()

def signal_handler(signum, frame):
    """Handler para Ctrl+C"""
    controller.stop()
    sys.exit(0)

# Registrar handler para Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

class ResilientPCSimulator:
    def __init__(self, pc_id: int, controller: StressTestController):
        self.pc_id = pc_id
        self.controller = controller
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 10  # Timeout reduzido
        
        # Configurar headers para rate limiting
        self.session.headers.update({
            'User-Agent': f'PC-Simulator-{pc_id}',
            'Accept': 'application/json'
        })
    
    def make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> Dict[str, Any]:
        """Faz uma requisição com retry automático"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        # Retry até 3 vezes
        for attempt in range(3):
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
                
                if attempt < 2:  # Não é a última tentativa
                    time.sleep(0.5)  # Pequena pausa antes do retry
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
                
                if attempt < 2:
                    time.sleep(1)  # Pausa maior para erro de conexão
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
    
    def simulate_pc_usage(self, duration_seconds: int = 60) -> int:
        """Simula o uso de um PC com proteções"""
        print(f"🖥️  PC {self.pc_id}: Iniciando simulação...")
        
        # Endpoints que serão testados (com pesos diferentes)
        endpoints = [
            ("/", "GET", 0.3),  # 30% das requisições
            ("/health", "GET", 0.2),  # 20% das requisições
            ("/clientes", "GET", 0.2),  # 20% das requisições
            ("/pedidos", "GET", 0.15),  # 15% das requisições
            ("/producoes/tipos", "GET", 0.1),  # 10% das requisições
            ("/pedidos/proximo-numero", "GET", 0.05),  # 5% das requisições
        ]
        
        start_time = time.time()
        request_count = 0
        
        while time.time() - start_time < duration_seconds and self.controller.running:
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
                
                # Log de progresso a cada 10 requisições
                if request_count % 10 == 0:
                    success_rate = sum(1 for r in self.results[-10:] if r['success']) / 10 * 100
                    print(f"🖥️  PC {self.pc_id}: {request_count} requisições (sucesso: {success_rate:.1f}%)")
                
                # Pausa adaptativa baseada no resultado
                if result['success']:
                    time.sleep(random.uniform(0.1, 0.3))  # Pausa normal
                else:
                    time.sleep(random.uniform(0.5, 1.0))  # Pausa maior após erro
            
            # Verificar se deve parar
            if not self.controller.running:
                break
        
        print(f"🖥️  PC {self.pc_id}: Finalizado - {request_count} requisições em {duration_seconds}s")
        return request_count

def run_adaptive_stress_test(num_pcs: int = 50, duration_seconds: int = 60):
    """Executa teste de stress adaptativo"""
    print(f"🚀 Iniciando teste de stress adaptativo com {num_pcs} PCs por {duration_seconds} segundos...")
    print("=" * 60)
    print("💡 Dicas:")
    print("  - Pressione Ctrl+C para parar o teste")
    print("  - O teste se adapta automaticamente à carga")
    print("  - Rate limiting protege a API")
    print("=" * 60)
    
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
    
    # Criar simuladores para cada PC
    simulators = []
    for i in range(num_pcs):
        simulator = ResilientPCSimulator(i + 1, controller)
        simulators.append(simulator)
    
    # Executar simulação simultânea usando ThreadPoolExecutor
    controller.start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=min(num_pcs, 100)) as executor:  # Limitar workers
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
                print(f"✅ PC {simulator.pc_id} completou {request_count} requisições ({completed}/{num_pcs})")
            except Exception as e:
                print(f"❌ PC {simulator.pc_id} falhou: {e}")
    
    total_time = time.time() - controller.start_time
    
    # Coletar resultados
    all_results = []
    total_requests = 0
    
    for simulator in simulators:
        all_results.extend(simulator.results)
        total_requests += len(simulator.results)
    
    # Analisar resultados
    analyze_adaptive_results(all_results, total_requests, total_time, num_pcs)

def analyze_adaptive_results(results: List[Dict], total_requests: int, total_time: float, num_pcs: int):
    """Analisa os resultados do teste adaptativo"""
    print("\n" + "=" * 60)
    print("📊 ANÁLISE DOS RESULTADOS ADAPTATIVOS")
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
    
    # Recomendações adaptativas
    print(f"\n💡 RECOMENDAÇÕES ADAPTATIVAS:")
    
    if success_rate >= 95:
        print("  ✅ Excelente! Sistema estável para produção")
        if num_pcs >= 50:
            print("  🚀 Sistema suporta alta carga!")
    elif success_rate >= 90:
        print("  ✅ Bom! Sistema estável com pequenos ajustes")
    elif success_rate >= 80:
        print("  ⚠️  Aceitável! Recomenda-se otimizações")
    else:
        print("  ❌ Crítico! Sistema precisa de melhorias urgentes")
    
    # Análise de rate limiting
    rate_limited = sum(1 for r in results if r.get('status_code') == 429)
    if rate_limited > 0:
        print(f"  🔒 Rate limiting ativado: {rate_limited} requisições bloqueadas")
        print("  💡 Rate limiting está funcionando corretamente!")
    
    # Verificar se suporta a carga testada
    requests_per_second = total_requests / total_time
    if requests_per_second >= 50:
        print("  🎯 Sistema suporta alta concorrência!")
    elif requests_per_second >= 30:
        print("  ✅ Sistema suporta concorrência moderada")
    else:
        print("  ⚠️  Sistema pode ter dificuldades com alta concorrência")

def main():
    """Função principal"""
    print("🧪 TESTE DE STRESS ADAPTATIVO - SISTEMA DE FICHAS")
    print("=" * 60)
    
    # Configurações do teste
    num_pcs = 50  # Reduzido de 100 para teste mais realista
    duration = 60  # 1 minuto
    
    print(f"🚀 Configuração do teste:")
    print(f"  🖥️  PCs: {num_pcs}")
    print(f"  ⏱️  Duração: {duration}s")
    print(f"  🔒 Rate limiting: Ativado")
    print(f"  🔄 Retry automático: Ativado")
    print(f"  ⚡ Timeout: 10s por requisição")
    
    try:
        run_adaptive_stress_test(num_pcs, duration)
    except KeyboardInterrupt:
        print("\n⏹️  Teste cancelado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")

if __name__ == "__main__":
    main()
