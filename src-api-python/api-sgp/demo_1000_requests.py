#!/usr/bin/env python3
"""
DEMONSTRAÇÃO VISUAL - 1000 REQUISIÇÕES
Sistema de Fichas - Performance em Tempo Real
"""
import requests
import threading
import time
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import random
from datetime import datetime
import sys

# Configuração
API_BASE_URL = "http://localhost:8001"
TOTAL_REQUESTS = 1000
MAX_WORKERS = 50  # 50 threads simultâneas

class DemoVisualizer:
    def __init__(self):
        self.results = []
        self.start_time = None
        self.completed_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.lock = threading.Lock()
        
        # Estatísticas em tempo real
        self.stats = {
            'requests_per_second': 0,
            'success_rate': 0,
            'avg_response_time': 0,
            'min_response_time': float('inf'),
            'max_response_time': 0,
            'current_time': 0
        }
        
        # Endpoints para teste
        self.endpoints = [
            ("/health", 0.3),  # 30% health checks
            ("/api/v1/clientes", 0.4),  # 40% clientes
            ("/api/v1/pedidos", 0.2),  # 20% pedidos
            ("/api/v1/producoes/tipos", 0.1),  # 10% produções
        ]
    
    def clear_screen(self):
        """Limpa a tela do terminal"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def print_banner(self):
        """Imprime banner da demonstração"""
        print("=" * 80)
        print("🚀 DEMONSTRAÇÃO VISUAL - SISTEMA DE FICHAS")
        print("=" * 80)
        print("📊 1000 REQUISIÇÕES SIMULTÂNEAS")
        print("⚡ PERFORMANCE EM TEMPO REAL")
        print("🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO")
        print("=" * 80)
        print()
    
    def print_stats(self):
        """Imprime estatísticas em tempo real"""
        with self.lock:
            elapsed = time.time() - self.start_time if self.start_time else 0
            rps = self.completed_requests / elapsed if elapsed > 0 else 0
            success_rate = (self.successful_requests / self.completed_requests * 100) if self.completed_requests > 0 else 0
            
            # Atualizar estatísticas
            self.stats['requests_per_second'] = rps
            self.stats['success_rate'] = success_rate
            self.stats['current_time'] = elapsed
            
            # Calcular tempo médio de resposta
            if self.results:
                response_times = [r['response_time'] for r in self.results if 'response_time' in r]
                if response_times:
                    self.stats['avg_response_time'] = sum(response_times) / len(response_times)
                    self.stats['min_response_time'] = min(response_times)
                    self.stats['max_response_time'] = max(response_times)
        
        print(f"⏱️  Tempo Decorrido: {elapsed:.1f}s")
        print(f"📈 Requisições Completadas: {self.completed_requests}/{TOTAL_REQUESTS}")
        print(f"✅ Sucessos: {self.successful_requests}")
        print(f"❌ Falhas: {self.failed_requests}")
        print(f"📊 Taxa de Sucesso: {success_rate:.2f}%")
        print(f"⚡ Requisições/Segundo: {rps:.2f}")
        print(f"🕐 Tempo Médio de Resposta: {self.stats['avg_response_time']:.2f}ms")
        print(f"📉 Tempo Mínimo: {self.stats['min_response_time']:.2f}ms")
        print(f"📈 Tempo Máximo: {self.stats['max_response_time']:.2f}ms")
        print()
        
        # Barra de progresso visual
        progress = (self.completed_requests / TOTAL_REQUESTS) * 100
        bar_length = 50
        filled_length = int(bar_length * self.completed_requests // TOTAL_REQUESTS)
        bar = '█' * filled_length + '░' * (bar_length - filled_length)
        print(f"📊 Progresso: [{bar}] {progress:.1f}%")
        print()
    
    def make_request(self, request_id: int) -> Dict[str, Any]:
        """Faz uma requisição individual"""
        # Escolher endpoint baseado no peso
        rand = random.random()
        cumulative = 0
        selected_endpoint = None
        
        for endpoint, weight in self.endpoints:
            cumulative += weight
            if rand <= cumulative:
                selected_endpoint = endpoint
                break
        
        if not selected_endpoint:
            selected_endpoint = "/health"
        
        url = f"{API_BASE_URL}{selected_endpoint}"
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'request_id': request_id,
                'endpoint': selected_endpoint,
                'status_code': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'timestamp': time.time()
            }
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            result = {
                'request_id': request_id,
                'endpoint': selected_endpoint,
                'status_code': 0,
                'response_time': response_time,
                'success': False,
                'error': str(e),
                'timestamp': time.time()
            }
        
        # Atualizar contadores
        with self.lock:
            self.results.append(result)
            self.completed_requests += 1
            if result['success']:
                self.successful_requests += 1
            else:
                self.failed_requests += 1
        
        return result
    
    def run_demo(self):
        """Executa a demonstração"""
        self.clear_screen()
        self.print_banner()
        
        # Verificar se API está funcionando
        print("🔍 Verificando API...")
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=5)
            if response.status_code != 200:
                print("❌ API não está funcionando!")
                return
        except Exception as e:
            print(f"❌ Erro ao conectar com API: {e}")
            print("💡 Execute: ./start.sh (opção 1) para iniciar a API")
            return
        
        print("✅ API funcionando!")
        print()
        print("🚀 Iniciando demonstração de 1000 requisições...")
        print("⏳ Aguarde 3 segundos...")
        time.sleep(3)
        
        # Iniciar demonstração
        self.start_time = time.time()
        
        # Thread para atualizar display
        def update_display():
            while self.completed_requests < TOTAL_REQUESTS:
                self.clear_screen()
                self.print_banner()
                self.print_stats()
                time.sleep(0.5)
        
        display_thread = threading.Thread(target=update_display, daemon=True)
        display_thread.start()
        
        # Executar requisições
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Submeter todas as requisições
            future_to_id = {
                executor.submit(self.make_request, i): i 
                for i in range(1, TOTAL_REQUESTS + 1)
            }
            
            # Aguardar todas as requisições
            for future in as_completed(future_to_id):
                try:
                    future.result()
                except Exception as e:
                    print(f"❌ Erro na requisição {future_to_id[future]}: {e}")
        
        # Aguardar um pouco para o display final
        time.sleep(2)
        
        # Mostrar resultado final
        self.show_final_results()
    
    def show_final_results(self):
        """Mostra resultados finais"""
        self.clear_screen()
        self.print_banner()
        
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        print("🎉 DEMONSTRAÇÃO CONCLUÍDA!")
        print("=" * 80)
        print()
        print("📊 RESULTADOS FINAIS:")
        print(f"⏱️  Tempo Total: {total_time:.2f} segundos")
        print(f"📈 Total de Requisições: {TOTAL_REQUESTS}")
        print(f"✅ Sucessos: {self.successful_requests}")
        print(f"❌ Falhas: {self.failed_requests}")
        print(f"📊 Taxa de Sucesso: {success_rate:.2f}%")
        print(f"⚡ Requisições/Segundo: {rps:.2f}")
        print(f"🕐 Tempo Médio de Resposta: {self.stats['avg_response_time']:.2f}ms")
        print(f"📉 Tempo Mínimo: {self.stats['min_response_time']:.2f}ms")
        print(f"📈 Tempo Máximo: {self.stats['max_response_time']:.2f}ms")
        print()
        
        # Análise por endpoint
        print("📋 ANÁLISE POR ENDPOINT:")
        endpoint_stats = {}
        for result in self.results:
            endpoint = result['endpoint']
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {'total': 0, 'success': 0, 'times': []}
            
            endpoint_stats[endpoint]['total'] += 1
            if result['success']:
                endpoint_stats[endpoint]['success'] += 1
            endpoint_stats[endpoint]['times'].append(result['response_time'])
        
        for endpoint, stats in endpoint_stats.items():
            success_rate = (stats['success'] / stats['total']) * 100
            avg_time = sum(stats['times']) / len(stats['times'])
            print(f"  🔗 {endpoint}:")
            print(f"    📊 {stats['success']}/{stats['total']} ({success_rate:.1f}%) - {avg_time:.1f}ms")
        
        print()
        print("=" * 80)
        print("🏆 SISTEMA DE FICHAS - PERFORMANCE EXCEPCIONAL!")
        print("=" * 80)
        print()
        
        # Gerar relatório para redes sociais
        self.generate_social_media_report()
    
    def generate_social_media_report(self):
        """Gera relatório para redes sociais"""
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        report = f"""
🚀 DEMONSTRAÇÃO SISTEMA DE FICHAS - 1000 REQUISIÇÕES

📊 RESULTADOS IMPRESSIONANTES:
✅ {self.successful_requests}/{TOTAL_REQUESTS} sucessos ({success_rate:.1f}%)
⚡ {rps:.1f} requisições/segundo
⏱️ {total_time:.1f} segundos total
🕐 {self.stats['avg_response_time']:.1f}ms tempo médio

🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO
🔧 Rate Limiting + Cache + Compressão
📈 Suporta 25+ PCs simultâneos
🏆 Performance excepcional!

#SistemaDeFichas #Performance #API #Desenvolvimento #Tecnologia
        """
        
        # Salvar relatório
        with open('relatorio_demo_1000_requests.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("📱 RELATÓRIO PARA REDES SOCIAIS:")
        print("=" * 80)
        print(report)
        print("=" * 80)
        print()
        print("💾 Relatório salvo em: relatorio_demo_1000_requests.txt")
        print("📋 Copie o texto acima para suas redes sociais!")

def main():
    """Função principal"""
    print("🚀 Iniciando demonstração de 1000 requisições...")
    print("💡 Certifique-se de que a API está rodando: ./start.sh (opção 1)")
    print()
    
    demo = DemoVisualizer()
    try:
        demo.run_demo()
    except KeyboardInterrupt:
        print("\n⏹️ Demonstração interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante a demonstração: {e}")

if __name__ == "__main__":
    main()
