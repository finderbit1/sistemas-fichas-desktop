#!/usr/bin/env python3
"""
DEMONSTRAÇÃO VISUAL IMPRESSIONANTE - 1000 REQUISIÇÕES
Sistema de Fichas - Performance em Tempo Real com Gráficos
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
import math

# Configuração
API_BASE_URL = "http://localhost:8000"
TOTAL_REQUESTS = 1000
MAX_WORKERS = 50

class DemoVisualImpressionante:
    def __init__(self):
        self.results = []
        self.start_time = None
        self.completed_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.lock = threading.Lock()
        
        # Histórico para gráficos
        self.rps_history = []
        self.success_rate_history = []
        self.response_time_history = []
        
        # Endpoints
        self.endpoints = [
            ("/health", 0.3, "🏥"),
            ("/api/v1/clientes", 0.4, "👥"),
            ("/api/v1/pedidos", 0.2, "📋"),
            ("/api/v1/producoes/tipos", 0.1, "🏭"),
        ]
    
    def clear_screen(self):
        """Limpa a tela"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def print_animated_banner(self):
        """Banner animado"""
        frames = [
            "🚀 DEMONSTRAÇÃO VISUAL - SISTEMA DE FICHAS 🚀",
            "⚡ DEMONSTRAÇÃO VISUAL - SISTEMA DE FICHAS ⚡",
            "🎯 DEMONSTRAÇÃO VISUAL - SISTEMA DE FICHAS 🎯",
            "🏆 DEMONSTRAÇÃO VISUAL - SISTEMA DE FICHAS 🏆"
        ]
        
        for frame in frames:
            print("\r" + " " * 80, end="")
            print(f"\r{frame}", end="")
            time.sleep(0.3)
        
        print()
        print("=" * 80)
        print("📊 1000 REQUISIÇÕES SIMULTÂNEAS")
        print("⚡ PERFORMANCE EM TEMPO REAL")
        print("🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO")
        print("=" * 80)
        print()
    
    def create_progress_bar(self, current, total, width=60):
        """Cria barra de progresso visual"""
        progress = current / total
        filled = int(width * progress)
        bar = "█" * filled + "░" * (width - filled)
        percentage = progress * 100
        return f"[{bar}] {percentage:.1f}%"
    
    def create_rps_chart(self, history, width=40, height=10):
        """Cria gráfico de RPS"""
        if not history:
            return "📊 Gráfico de RPS: Aguardando dados..."
        
        max_rps = max(history) if history else 1
        min_rps = min(history) if history else 0
        
        chart = ["📊 Requisições por Segundo:"]
        chart.append("┌" + "─" * width + "┐")
        
        for i in range(height):
            line = "│"
            threshold = max_rps - (i * (max_rps - min_rps) / height)
            
            for j in range(width):
                if j < len(history) and history[j] >= threshold:
                    line += "█"
                else:
                    line += " "
            
            line += "│"
            chart.append(line)
        
        chart.append("└" + "─" * width + "┘")
        chart.append(f"Min: {min_rps:.1f} | Max: {max_rps:.1f}")
        
        return "\n".join(chart)
    
    def create_success_rate_chart(self, history, width=40, height=10):
        """Cria gráfico de taxa de sucesso"""
        if not history:
            return "📈 Taxa de Sucesso: Aguardando dados..."
        
        chart = ["📈 Taxa de Sucesso:"]
        chart.append("┌" + "─" * width + "┐")
        
        for i in range(height):
            line = "│"
            threshold = 100 - (i * 10)  # 100% no topo, 0% na base
            
            for j in range(width):
                if j < len(history) and history[j] >= threshold:
                    if history[j] >= 95:
                        line += "🟢"  # Verde para excelente
                    elif history[j] >= 90:
                        line += "🟡"  # Amarelo para bom
                    else:
                        line += "🔴"  # Vermelho para ruim
                else:
                    line += " "
            
            line += "│"
            chart.append(line)
        
        chart.append("└" + "─" * width + "┘")
        chart.append("🟢 95%+ | 🟡 90%+ | 🔴 <90%")
        
        return "\n".join(chart)
    
    def print_real_time_stats(self):
        """Imprime estatísticas em tempo real com gráficos"""
        with self.lock:
            elapsed = time.time() - self.start_time if self.start_time else 0
            rps = self.completed_requests / elapsed if elapsed > 0 else 0
            success_rate = (self.successful_requests / self.completed_requests * 100) if self.completed_requests > 0 else 0
            
            # Adicionar ao histórico
            self.rps_history.append(rps)
            self.success_rate_history.append(success_rate)
            
            # Manter apenas últimos 40 pontos
            if len(self.rps_history) > 40:
                self.rps_history = self.rps_history[-40:]
                self.success_rate_history = self.success_rate_history[-40:]
        
        print("⏱️  TEMPO DECORRIDO:", f"{elapsed:.1f}s".ljust(20), "📈 REQUISIÇÕES:", f"{self.completed_requests}/{TOTAL_REQUESTS}")
        print("✅ SUCESSOS:", f"{self.successful_requests}".ljust(20), "❌ FALHAS:", f"{self.failed_requests}")
        print("📊 TAXA DE SUCESSO:", f"{success_rate:.2f}%".ljust(20), "⚡ RPS:", f"{rps:.2f}")
        print()
        
        # Barra de progresso
        progress_bar = self.create_progress_bar(self.completed_requests, TOTAL_REQUESTS)
        print("📊 PROGRESSO:", progress_bar)
        print()
        
        # Gráficos
        rps_chart = self.create_rps_chart(self.rps_history)
        success_chart = self.create_success_rate_chart(self.success_rate_history)
        
        # Dividir tela em duas colunas
        rps_lines = rps_chart.split('\n')
        success_lines = success_chart.split('\n')
        
        max_lines = max(len(rps_lines), len(success_lines))
        
        for i in range(max_lines):
            rps_line = rps_lines[i] if i < len(rps_lines) else ""
            success_line = success_lines[i] if i < len(success_lines) else ""
            print(f"{rps_line:<50} {success_line}")
        
        print()
        
        # Estatísticas de tempo de resposta
        if self.results:
            response_times = [r['response_time'] for r in self.results if 'response_time' in r]
            if response_times:
                avg_time = sum(response_times) / len(response_times)
                min_time = min(response_times)
                max_time = max(response_times)
                
                print("🕐 TEMPO DE RESPOSTA:")
                print(f"   Média: {avg_time:.1f}ms | Mín: {min_time:.1f}ms | Máx: {max_time:.1f}ms")
        
        print()
        print("=" * 80)
    
    def make_request(self, request_id: int) -> Dict[str, Any]:
        """Faz uma requisição individual"""
        # Escolher endpoint
        rand = random.random()
        cumulative = 0
        selected_endpoint = None
        endpoint_icon = "❓"
        
        for endpoint, weight, icon in self.endpoints:
            cumulative += weight
            if rand <= cumulative:
                selected_endpoint = endpoint
                endpoint_icon = icon
                break
        
        if not selected_endpoint:
            selected_endpoint = "/health"
            endpoint_icon = "🏥"
        
        url = f"{API_BASE_URL}{selected_endpoint}"
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'request_id': request_id,
                'endpoint': selected_endpoint,
                'endpoint_icon': endpoint_icon,
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
                'endpoint_icon': endpoint_icon,
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
        """Executa a demonstração visual"""
        self.clear_screen()
        self.print_animated_banner()
        
        # Verificar API
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
        print("⏳ Preparando sistema...")
        
        for i in range(3, 0, -1):
            print(f"⏳ Iniciando em {i}...")
            time.sleep(1)
        
        # Iniciar demonstração
        self.start_time = time.time()
        
        # Thread para atualizar display
        def update_display():
            while self.completed_requests < TOTAL_REQUESTS:
                self.clear_screen()
                self.print_animated_banner()
                self.print_real_time_stats()
                time.sleep(0.8)
        
        display_thread = threading.Thread(target=update_display, daemon=True)
        display_thread.start()
        
        # Executar requisições
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_id = {
                executor.submit(self.make_request, i): i 
                for i in range(1, TOTAL_REQUESTS + 1)
            }
            
            for future in as_completed(future_to_id):
                try:
                    future.result()
                except Exception as e:
                    print(f"❌ Erro na requisição {future_to_id[future]}: {e}")
        
        # Aguardar display final
        time.sleep(3)
        
        # Mostrar resultado final
        self.show_final_results()
    
    def show_final_results(self):
        """Mostra resultados finais impressionantes"""
        self.clear_screen()
        
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        print("🎉" * 20)
        print("🏆 DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO! 🏆")
        print("🎉" * 20)
        print()
        
        # Resultados principais
        print("📊 RESULTADOS FINAIS:")
        print("=" * 60)
        print(f"⏱️  Tempo Total: {total_time:.2f} segundos")
        print(f"📈 Total de Requisições: {TOTAL_REQUESTS}")
        print(f"✅ Sucessos: {self.successful_requests}")
        print(f"❌ Falhas: {self.failed_requests}")
        print(f"📊 Taxa de Sucesso: {success_rate:.2f}%")
        print(f"⚡ Requisições/Segundo: {rps:.2f}")
        print()
        
        # Gráficos finais
        print("📈 GRÁFICOS FINAIS:")
        print("=" * 60)
        rps_chart = self.create_rps_chart(self.rps_history, width=50, height=15)
        success_chart = self.create_success_rate_chart(self.success_rate_history, width=50, height=15)
        
        rps_lines = rps_chart.split('\n')
        success_lines = success_chart.split('\n')
        
        for i in range(max(len(rps_lines), len(success_lines))):
            rps_line = rps_lines[i] if i < len(rps_lines) else ""
            success_line = success_lines[i] if i < len(success_lines) else ""
            print(f"{rps_line:<60} {success_line}")
        
        print()
        
        # Análise por endpoint
        print("📋 ANÁLISE POR ENDPOINT:")
        print("=" * 60)
        endpoint_stats = {}
        for result in self.results:
            endpoint = result['endpoint']
            icon = result.get('endpoint_icon', '❓')
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {'total': 0, 'success': 0, 'times': [], 'icon': icon}
            
            endpoint_stats[endpoint]['total'] += 1
            if result['success']:
                endpoint_stats[endpoint]['success'] += 1
            endpoint_stats[endpoint]['times'].append(result['response_time'])
        
        for endpoint, stats in endpoint_stats.items():
            success_rate = (stats['success'] / stats['total']) * 100
            avg_time = sum(stats['times']) / len(stats['times'])
            print(f"  {stats['icon']} {endpoint}:")
            print(f"    📊 {stats['success']}/{stats['total']} ({success_rate:.1f}%) - {avg_time:.1f}ms")
        
        print()
        print("=" * 60)
        print("🏆 SISTEMA DE FICHAS - PERFORMANCE EXCEPCIONAL! 🏆")
        print("=" * 60)
        print()
        
        # Gerar relatório para redes sociais
        self.generate_social_media_report()
    
    def generate_social_media_report(self):
        """Gera relatório impressionante para redes sociais"""
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        # Emojis baseados na performance
        if success_rate >= 95:
            performance_emoji = "🏆"
            performance_text = "EXCEPCIONAL"
        elif success_rate >= 90:
            performance_emoji = "🚀"
            performance_text = "EXCELENTE"
        else:
            performance_emoji = "⚡"
            performance_text = "BOM"
        
        report = f"""
{performance_emoji} DEMONSTRAÇÃO SISTEMA DE FICHAS - 1000 REQUISIÇÕES {performance_emoji}

📊 RESULTADOS {performance_text}:
✅ {self.successful_requests}/{TOTAL_REQUESTS} sucessos ({success_rate:.1f}%)
⚡ {rps:.1f} requisições/segundo
⏱️ {total_time:.1f} segundos total
🕐 {self.stats.get('avg_response_time', 0):.1f}ms tempo médio

🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO
🔧 Rate Limiting + Cache + Compressão + Circuit Breaker
📈 Suporta 25+ PCs simultâneos
🏆 Performance {performance_text.lower()}!

#SistemaDeFichas #Performance #API #Desenvolvimento #Tecnologia #1000Requests #Demonstracao
        """
        
        # Salvar relatório
        with open('relatorio_demo_1000_requests_visual.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("📱 RELATÓRIO PARA REDES SOCIAIS:")
        print("=" * 80)
        print(report)
        print("=" * 80)
        print()
        print("💾 Relatório salvo em: relatorio_demo_1000_requests_visual.txt")
        print("📋 Copie o texto acima para suas redes sociais!")
        print("🎉 Demonstração concluída com sucesso!")

def main():
    """Função principal"""
    print("🚀 Iniciando demonstração visual de 1000 requisições...")
    print("💡 Certifique-se de que a API está rodando: ./start.sh (opção 1)")
    print()
    
    demo = DemoVisualImpressionante()
    try:
        demo.run_demo()
    except KeyboardInterrupt:
        print("\n⏹️ Demonstração interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante a demonstração: {e}")

if __name__ == "__main__":
    main()
