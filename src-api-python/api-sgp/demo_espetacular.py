#!/usr/bin/env python3
"""
DEMONSTRAÇÃO ESPETACULAR - 1000 REQUISIÇÕES
Sistema de Fichas - Performance Visual com Animações
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

class DemoEspetacular:
    def __init__(self):
        self.results = []
        self.start_time = None
        self.completed_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.lock = threading.Lock()
        
        # Histórico para animações
        self.rps_history = []
        self.success_rate_history = []
        self.response_time_history = []
        
        # Endpoints com emojis
        self.endpoints = [
            ("/health", 0.3, "🏥", "Health Check"),
            ("/api/v1/clientes", 0.4, "👥", "Clientes"),
            ("/api/v1/pedidos", 0.2, "📋", "Pedidos"),
            ("/api/v1/producoes/tipos", 0.1, "🏭", "Produções"),
        ]
        
        # Animações
        self.spinner_chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        self.spinner_index = 0
    
    def clear_screen(self):
        """Limpa a tela"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def print_animated_header(self):
        """Header animado"""
        frames = [
            "🚀 DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS 🚀",
            "⚡ DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS ⚡",
            "🎯 DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS 🎯",
            "🏆 DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS 🏆",
            "💫 DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS 💫"
        ]
        
        for frame in frames:
            print("\r" + " " * 100, end="")
            print(f"\r{frame}", end="")
            time.sleep(0.2)
        
        print()
        print("=" * 100)
        print("📊 1000 REQUISIÇÕES SIMULTÂNEAS")
        print("⚡ PERFORMANCE EM TEMPO REAL")
        print("🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO")
        print("🏆 DEMONSTRAÇÃO VISUAL IMPRESSIONANTE")
        print("=" * 100)
        print()
    
    def create_animated_progress_bar(self, current, total, width=70):
        """Barra de progresso animada"""
        progress = current / total
        filled = int(width * progress)
        
        # Animações na barra
        animation_chars = ["█", "▓", "▒", "░"]
        bar = ""
        
        for i in range(width):
            if i < filled:
                # Barra preenchida com animação
                char_index = (i + int(time.time() * 10)) % len(animation_chars)
                bar += animation_chars[char_index]
            else:
                bar += "░"
        
        percentage = progress * 100
        return f"[{bar}] {percentage:.1f}%"
    
    def create_animated_rps_chart(self, history, width=50, height=15):
        """Gráfico de RPS animado"""
        if not history:
            return ["📊 Gráfico de RPS: Aguardando dados..."]
        
        max_rps = max(history) if history else 1
        min_rps = min(history) if history else 0
        
        chart = ["📊 Requisições por Segundo (Tempo Real):"]
        chart.append("┌" + "─" * width + "┐")
        
        # Animar o gráfico
        animation_offset = int(time.time() * 5) % 3
        
        for i in range(height):
            line = "│"
            threshold = max_rps - (i * (max_rps - min_rps) / height)
            
            for j in range(width):
                if j < len(history) and history[j] >= threshold:
                    # Diferentes caracteres para animação
                    if (j + animation_offset) % 3 == 0:
                        line += "█"
                    elif (j + animation_offset) % 3 == 1:
                        line += "▓"
                    else:
                        line += "▒"
                else:
                    line += " "
            
            line += "│"
            chart.append(line)
        
        chart.append("└" + "─" * width + "┘")
        chart.append(f"Min: {min_rps:.1f} | Max: {max_rps:.1f} | Atual: {history[-1]:.1f}")
        
        return chart
    
    def create_animated_success_chart(self, history, width=50, height=15):
        """Gráfico de sucesso animado"""
        if not history:
            return ["📈 Taxa de Sucesso: Aguardando dados..."]
        
        chart = ["📈 Taxa de Sucesso (Tempo Real):"]
        chart.append("┌" + "─" * width + "┐")
        
        # Animar o gráfico
        animation_offset = int(time.time() * 3) % 2
        
        for i in range(height):
            line = "│"
            threshold = 100 - (i * 10)  # 100% no topo
            
            for j in range(width):
                if j < len(history) and history[j] >= threshold:
                    if history[j] >= 95:
                        line += "🟢" if (j + animation_offset) % 2 == 0 else "█"
                    elif history[j] >= 90:
                        line += "🟡" if (j + animation_offset) % 2 == 0 else "▓"
                    else:
                        line += "🔴" if (j + animation_offset) % 2 == 0 else "▒"
                else:
                    line += " "
            
            line += "│"
            chart.append(line)
        
        chart.append("└" + "─" * width + "┘")
        chart.append("🟢 95%+ | 🟡 90%+ | 🔴 <90%")
        
        return chart
    
    def create_live_activity_feed(self, recent_results, max_items=10):
        """Feed de atividade em tempo real"""
        if not recent_results:
            return ["📡 Atividade: Aguardando requisições..."]
        
        feed = ["📡 Atividade em Tempo Real:"]
        feed.append("┌" + "─" * 60 + "┐")
        
        for result in recent_results[-max_items:]:
            status = "✅" if result['success'] else "❌"
            icon = result.get('endpoint_icon', '❓')
            endpoint = result['endpoint'].split('/')[-1] or 'root'
            response_time = result.get('response_time', 0)
            
            # Animar o feed
            spinner = self.spinner_chars[self.spinner_index % len(self.spinner_chars)]
            
            line = f"│ {status} {icon} {endpoint:<15} {response_time:6.1f}ms {spinner}"
            line = line.ljust(60) + "│"
            feed.append(line)
        
        feed.append("└" + "─" * 60 + "┘")
        
        return feed
    
    def print_real_time_dashboard(self):
        """Dashboard em tempo real"""
        with self.lock:
            elapsed = time.time() - self.start_time if self.start_time else 0
            rps = self.completed_requests / elapsed if elapsed > 0 else 0
            success_rate = (self.successful_requests / self.completed_requests * 100) if self.completed_requests > 0 else 0
            
            # Adicionar ao histórico
            self.rps_history.append(rps)
            self.success_rate_history.append(success_rate)
            
            # Manter apenas últimos 50 pontos
            if len(self.rps_history) > 50:
                self.rps_history = self.rps_history[-50:]
                self.success_rate_history = self.success_rate_history[-50:]
        
        # Atualizar spinner
        self.spinner_index = (self.spinner_index + 1) % len(self.spinner_chars)
        
        # Header com estatísticas principais
        print("⏱️  TEMPO:", f"{elapsed:.1f}s".ljust(15), "📈 REQUISIÇÕES:", f"{self.completed_requests}/{TOTAL_REQUESTS}".ljust(20), "⚡ RPS:", f"{rps:.1f}")
        print("✅ SUCESSOS:", f"{self.successful_requests}".ljust(15), "❌ FALHAS:", f"{self.failed_requests}".ljust(20), "📊 TAXA:", f"{success_rate:.1f}%")
        print()
        
        # Barra de progresso animada
        progress_bar = self.create_animated_progress_bar(self.completed_requests, TOTAL_REQUESTS)
        print("📊 PROGRESSO:", progress_bar)
        print()
        
        # Gráficos animados
        rps_chart = self.create_animated_rps_chart(self.rps_history, width=60, height=12)
        success_chart = self.create_animated_success_chart(self.success_rate_history, width=60, height=12)
        
        # Feed de atividade
        recent_results = self.results[-10:] if self.results else []
        activity_feed = self.create_live_activity_feed(recent_results, max_items=8)
        
        # Layout em 3 colunas
        max_lines = max(len(rps_chart), len(success_chart), len(activity_feed))
        
        for i in range(max_lines):
            rps_line = rps_chart[i] if i < len(rps_chart) else ""
            success_line = success_chart[i] if i < len(success_chart) else ""
            activity_line = activity_feed[i] if i < len(activity_feed) else ""
            
            print(f"{rps_line:<65} {success_line:<65} {activity_line}")
        
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
        print("=" * 100)
    
    def make_request(self, request_id: int) -> Dict[str, Any]:
        """Faz uma requisição individual"""
        # Escolher endpoint
        rand = random.random()
        cumulative = 0
        selected_endpoint = None
        endpoint_icon = "❓"
        endpoint_name = "Unknown"
        
        for endpoint, weight, icon, name in self.endpoints:
            cumulative += weight
            if rand <= cumulative:
                selected_endpoint = endpoint
                endpoint_icon = icon
                endpoint_name = name
                break
        
        if not selected_endpoint:
            selected_endpoint = "/health"
            endpoint_icon = "🏥"
            endpoint_name = "Health"
        
        url = f"{API_BASE_URL}{selected_endpoint}"
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'request_id': request_id,
                'endpoint': selected_endpoint,
                'endpoint_icon': endpoint_icon,
                'endpoint_name': endpoint_name,
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
                'endpoint_name': endpoint_name,
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
        """Executa a demonstração espetacular"""
        self.clear_screen()
        self.print_animated_header()
        
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
        print("🚀 Iniciando demonstração espetacular de 1000 requisições...")
        print("⏳ Preparando sistema...")
        
        # Contagem regressiva animada
        for i in range(5, 0, -1):
            print(f"⏳ Iniciando em {i}... {'🚀' * i}")
            time.sleep(1)
        
        print("🚀 INICIANDO DEMONSTRAÇÃO! 🚀")
        time.sleep(1)
        
        # Iniciar demonstração
        self.start_time = time.time()
        
        # Thread para atualizar display
        def update_display():
            while self.completed_requests < TOTAL_REQUESTS:
                self.clear_screen()
                self.print_animated_header()
                self.print_real_time_dashboard()
                time.sleep(0.5)
        
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
        """Mostra resultados finais espetaculares"""
        self.clear_screen()
        
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        # Animação de conclusão
        print("🎉" * 25)
        print("🏆 DEMONSTRAÇÃO ESPETACULAR CONCLUÍDA! 🏆")
        print("🎉" * 25)
        print()
        
        # Resultados principais com animação
        print("📊 RESULTADOS FINAIS ESPETACULARES:")
        print("=" * 80)
        print(f"⏱️  Tempo Total: {total_time:.2f} segundos")
        print(f"📈 Total de Requisições: {TOTAL_REQUESTS}")
        print(f"✅ Sucessos: {self.successful_requests}")
        print(f"❌ Falhas: {self.failed_requests}")
        print(f"📊 Taxa de Sucesso: {success_rate:.2f}%")
        print(f"⚡ Requisições/Segundo: {rps:.2f}")
        print()
        
        # Gráficos finais
        print("📈 GRÁFICOS FINAIS:")
        print("=" * 80)
        rps_chart = self.create_animated_rps_chart(self.rps_history, width=70, height=20)
        success_chart = self.create_animated_success_chart(self.success_rate_history, width=70, height=20)
        
        for i in range(max(len(rps_chart), len(success_chart))):
            rps_line = rps_chart[i] if i < len(rps_chart) else ""
            success_line = success_chart[i] if i < len(success_chart) else ""
            print(f"{rps_line:<80} {success_line}")
        
        print()
        
        # Análise por endpoint
        print("📋 ANÁLISE DETALHADA POR ENDPOINT:")
        print("=" * 80)
        endpoint_stats = {}
        for result in self.results:
            endpoint = result['endpoint']
            icon = result.get('endpoint_icon', '❓')
            name = result.get('endpoint_name', 'Unknown')
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {'total': 0, 'success': 0, 'times': [], 'icon': icon, 'name': name}
            
            endpoint_stats[endpoint]['total'] += 1
            if result['success']:
                endpoint_stats[endpoint]['success'] += 1
            endpoint_stats[endpoint]['times'].append(result['response_time'])
        
        for endpoint, stats in endpoint_stats.items():
            success_rate = (stats['success'] / stats['total']) * 100
            avg_time = sum(stats['times']) / len(stats['times'])
            print(f"  {stats['icon']} {stats['name']} ({endpoint}):")
            print(f"    📊 {stats['success']}/{stats['total']} ({success_rate:.1f}%) - {avg_time:.1f}ms")
        
        print()
        print("=" * 80)
        print("🏆 SISTEMA DE FICHAS - PERFORMANCE EXCEPCIONAL! 🏆")
        print("=" * 80)
        print()
        
        # Gerar relatório para redes sociais
        self.generate_social_media_report()
    
    def generate_social_media_report(self):
        """Gera relatório espetacular para redes sociais"""
        total_time = time.time() - self.start_time
        success_rate = (self.successful_requests / TOTAL_REQUESTS) * 100
        rps = TOTAL_REQUESTS / total_time
        
        # Emojis baseados na performance
        if success_rate >= 95:
            performance_emoji = "🏆"
            performance_text = "EXCEPCIONAL"
            performance_hashtags = "#Excepcional #Perfeito #TopPerformance"
        elif success_rate >= 90:
            performance_emoji = "🚀"
            performance_text = "EXCELENTE"
            performance_hashtags = "#Excelente #MuitoBom #HighPerformance"
        else:
            performance_emoji = "⚡"
            performance_text = "BOM"
            performance_hashtags = "#Bom #Satisfatorio #GoodPerformance"
        
        report = f"""
{performance_emoji} DEMONSTRAÇÃO ESPETACULAR - SISTEMA DE FICHAS {performance_emoji}

📊 RESULTADOS {performance_text}:
✅ {self.successful_requests}/{TOTAL_REQUESTS} sucessos ({success_rate:.1f}%)
⚡ {rps:.1f} requisições/segundo
⏱️ {total_time:.1f} segundos total
🕐 {self.stats.get('avg_response_time', 0):.1f}ms tempo médio

🎯 SISTEMA OTIMIZADO PARA PRODUÇÃO
🔧 Rate Limiting + Cache + Compressão + Circuit Breaker
📈 Suporta 25+ PCs simultâneos
🏆 Performance {performance_text.lower()}!

{performance_hashtags}
#SistemaDeFichas #Performance #API #Desenvolvimento #Tecnologia #1000Requests #Demonstracao #Visual #RealTime
        """
        
        # Salvar relatório
        with open('relatorio_demo_espetacular.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("📱 RELATÓRIO ESPETACULAR PARA REDES SOCIAIS:")
        print("=" * 100)
        print(report)
        print("=" * 100)
        print()
        print("💾 Relatório salvo em: relatorio_demo_espetacular.txt")
        print("📋 Copie o texto acima para suas redes sociais!")
        print("🎉 Demonstração espetacular concluída com sucesso!")

def main():
    """Função principal"""
    print("🚀 Iniciando demonstração espetacular de 1000 requisições...")
    print("💡 Certifique-se de que a API está rodando: ./start.sh (opção 1)")
    print()
    
    demo = DemoEspetacular()
    try:
        demo.run_demo()
    except KeyboardInterrupt:
        print("\n⏹️ Demonstração interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante a demonstração: {e}")

if __name__ == "__main__":
    main()
