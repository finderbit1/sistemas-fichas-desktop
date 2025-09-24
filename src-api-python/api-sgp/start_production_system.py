#!/usr/bin/env python3
"""
Sistema de Produção Completo - Sistema de Fichas
Inicia múltiplas instâncias da API + Load Balancer
"""
import subprocess
import time
import signal
import sys
import os
import requests
import threading
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionSystem:
    def __init__(self):
        self.api_processes = []
        self.load_balancer_process = None
        self.running = False
        
    def start_api_instances(self, num_instances: int = 3):
        """Inicia múltiplas instâncias da API"""
        logger.info(f"🚀 Iniciando {num_instances} instâncias da API...")
        
        for i in range(num_instances):
            port = 8000 + i
            cmd = [
                "uv", "run", "python", "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", str(port),
                "--workers", "1"
            ]
            
            try:
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=os.getcwd()
                )
                
                self.api_processes.append(process)
                logger.info(f"✅ API {i+1} iniciada na porta {port} (PID: {process.pid})")
                
                # Aguardar inicialização
                time.sleep(3)
                
            except Exception as e:
                logger.error(f"❌ Erro ao iniciar API {i+1}: {e}")
    
    def start_load_balancer(self):
        """Inicia o load balancer"""
        logger.info("🚀 Iniciando Load Balancer...")
        
        cmd = [
            "uv", "run", "python", "load_balancer.py"
        ]
        
        try:
            self.load_balancer_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.getcwd()
            )
            
            logger.info(f"✅ Load Balancer iniciado (PID: {self.load_balancer_process.pid})")
            
            # Aguardar inicialização
            time.sleep(5)
            
        except Exception as e:
            logger.error(f"❌ Erro ao iniciar Load Balancer: {e}")
    
    def health_check_all(self):
        """Verifica saúde de todo o sistema"""
        logger.info("🔍 Verificando saúde do sistema...")
        
        # Verificar APIs
        api_healthy = 0
        for i, process in enumerate(self.api_processes):
            port = 8000 + i
            try:
                response = requests.get(f"http://localhost:{port}/health", timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ API {i+1} (porta {port}): Saudável")
                    api_healthy += 1
                else:
                    logger.warning(f"⚠️ API {i+1} (porta {port}): Status {response.status_code}")
            except Exception as e:
                logger.error(f"❌ API {i+1} (porta {port}): Erro - {e}")
        
        # Verificar Load Balancer
        lb_healthy = False
        try:
            response = requests.get("http://localhost:9000/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ Load Balancer: Saudável")
                lb_healthy = True
            else:
                logger.warning(f"⚠️ Load Balancer: Status {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Load Balancer: Erro - {e}")
        
        logger.info(f"📊 Sistema: {api_healthy}/{len(self.api_processes)} APIs + Load Balancer {'✅' if lb_healthy else '❌'}")
        return api_healthy == len(self.api_processes) and lb_healthy
    
    def stop_all(self):
        """Para todo o sistema"""
        logger.info("🛑 Parando sistema de produção...")
        
        # Parar Load Balancer
        if self.load_balancer_process:
            try:
                self.load_balancer_process.terminate()
                self.load_balancer_process.wait(timeout=10)
                logger.info("✅ Load Balancer parado")
            except subprocess.TimeoutExpired:
                self.load_balancer_process.kill()
                logger.warning("⚠️ Load Balancer forçado a parar")
            except Exception as e:
                logger.error(f"❌ Erro ao parar Load Balancer: {e}")
        
        # Parar APIs
        for i, process in enumerate(self.api_processes):
            try:
                process.terminate()
                process.wait(timeout=10)
                logger.info(f"✅ API {i+1} parada")
            except subprocess.TimeoutExpired:
                process.kill()
                logger.warning(f"⚠️ API {i+1} forçada a parar")
            except Exception as e:
                logger.error(f"❌ Erro ao parar API {i+1}: {e}")
        
        self.api_processes.clear()
        self.load_balancer_process = None
        self.running = False
        logger.info("🎉 Sistema de produção parado")
    
    def monitor_system(self):
        """Monitora o sistema em background"""
        def monitor():
            while self.running:
                try:
                    # Verificar se processos ainda estão rodando
                    for i, process in enumerate(self.api_processes):
                        if process.poll() is not None:
                            logger.warning(f"⚠️ API {i+1} morreu, reiniciando...")
                            self.restart_api(i)
                    
                    if self.load_balancer_process and self.load_balancer_process.poll() is not None:
                        logger.warning("⚠️ Load Balancer morreu, reiniciando...")
                        self.restart_load_balancer()
                    
                    time.sleep(15)  # Verificar a cada 15 segundos
                except Exception as e:
                    logger.error(f"❌ Erro no monitoramento: {e}")
                    time.sleep(30)
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
        logger.info("👁️ Monitoramento do sistema iniciado")
    
    def restart_api(self, api_index: int):
        """Reinicia uma API específica"""
        if 0 <= api_index < len(self.api_processes):
            port = 8000 + api_index
            logger.info(f"🔄 Reiniciando API {api_index + 1} (porta {port})...")
            
            # Parar processo atual
            try:
                self.api_processes[api_index].terminate()
                self.api_processes[api_index].wait(timeout=5)
            except:
                self.api_processes[api_index].kill()
            
            # Iniciar novo processo
            cmd = [
                "uv", "run", "python", "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", str(port),
                "--workers", "1"
            ]
            
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.getcwd()
            )
            
            self.api_processes[api_index] = process
            logger.info(f"✅ API {api_index + 1} reiniciada (PID: {process.pid})")
    
    def restart_load_balancer(self):
        """Reinicia o load balancer"""
        logger.info("🔄 Reiniciando Load Balancer...")
        
        # Parar processo atual
        try:
            self.load_balancer_process.terminate()
            self.load_balancer_process.wait(timeout=5)
        except:
            self.load_balancer_process.kill()
        
        # Iniciar novo processo
        cmd = [
            "uv", "run", "python", "load_balancer.py"
        ]
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=os.getcwd()
        )
        
        self.load_balancer_process = process
        logger.info(f"✅ Load Balancer reiniciado (PID: {process.pid})")
    
    def get_system_info(self):
        """Retorna informações do sistema"""
        return {
            "apis": len(self.api_processes),
            "load_balancer": self.load_balancer_process is not None,
            "running": self.running,
            "urls": {
                "load_balancer": "http://localhost:9000",
                "apis": [f"http://localhost:{8000 + i}" for i in range(len(self.api_processes))]
            }
        }

def signal_handler(signum, frame):
    """Handler para Ctrl+C"""
    logger.info("🛑 Recebido sinal de parada...")
    if 'system' in globals():
        system.stop_all()
    sys.exit(0)

def main():
    """Função principal"""
    print("🚀 SISTEMA DE PRODUÇÃO - SISTEMA DE FICHAS")
    print("=" * 60)
    print("🎯 Configuração:")
    print("  - 3 instâncias da API (portas 8000, 8001, 8002)")
    print("  - 1 Load Balancer (porta 9000)")
    print("  - Monitoramento automático")
    print("  - Reinicialização automática")
    print("=" * 60)
    
    # Registrar handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Criar sistema
    system = ProductionSystem()
    
    try:
        # Iniciar APIs
        system.start_api_instances(3)
        
        # Iniciar Load Balancer
        system.start_load_balancer()
        
        # Verificar saúde
        if system.health_check_all():
            logger.info("🎉 Sistema iniciado com sucesso!")
        else:
            logger.warning("⚠️ Sistema iniciado com problemas")
        
        # Iniciar monitoramento
        system.monitor_system()
        system.running = True
        
        # Mostrar informações
        info = system.get_system_info()
        print(f"\n🌐 URLs do Sistema:")
        print(f"  Load Balancer: {info['urls']['load_balancer']}")
        for i, url in enumerate(info['urls']['apis']):
            print(f"  API {i+1}: {url}")
        
        print(f"\n💡 Para testar:")
        print(f"  curl {info['urls']['load_balancer']}/health")
        print(f"  curl {info['urls']['load_balancer']}/stats")
        
        print(f"\n⏹️ Pressione Ctrl+C para parar o sistema")
        
        # Manter rodando
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("⏹️ Interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro: {e}")
    finally:
        system.stop_all()

if __name__ == "__main__":
    main()
