#!/usr/bin/env python3
"""
Gerenciador de Múltiplos Processos da API Sistema de Fichas
Load Balancing com 3 instâncias da API
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
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIProcessManager:
    def __init__(self, num_processes: int = 3, base_port: int = 8000):
        self.num_processes = num_processes
        self.base_port = base_port
        self.processes = []
        self.ports = []
        self.running = False
        
        # Configurar portas
        for i in range(num_processes):
            self.ports.append(base_port + i)
    
    def start_all_processes(self):
        """Inicia todos os processos da API"""
        logger.info(f"🚀 Iniciando {self.num_processes} processos da API...")
        
        for i, port in enumerate(self.ports):
            try:
                # Comando para iniciar a API
                cmd = [
                    "uv", "run", "python", "-m", "uvicorn", 
                    "main:app", 
                    "--host", "0.0.0.0", 
                    "--port", str(port),
                    "--workers", "1"  # Uma worker por processo
                ]
                
                # Iniciar processo
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=os.getcwd()
                )
                
                self.processes.append(process)
                logger.info(f"✅ Processo {i+1} iniciado na porta {port} (PID: {process.pid})")
                
                # Aguardar um pouco entre inicializações
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Erro ao iniciar processo {i+1}: {e}")
        
        self.running = True
        logger.info(f"🎉 {len(self.processes)} processos iniciados com sucesso!")
        
        # Verificar saúde de todos os processos
        self.health_check_all()
    
    def health_check_all(self):
        """Verifica a saúde de todos os processos"""
        logger.info("🔍 Verificando saúde de todos os processos...")
        
        healthy_processes = 0
        
        for i, port in enumerate(self.ports):
            try:
                response = requests.get(f"http://localhost:{port}/health", timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ Processo {i+1} (porta {port}): Saudável")
                    healthy_processes += 1
                else:
                    logger.warning(f"⚠️ Processo {i+1} (porta {port}): Status {response.status_code}")
            except Exception as e:
                logger.error(f"❌ Processo {i+1} (porta {port}): Erro - {e}")
        
        logger.info(f"📊 {healthy_processes}/{len(self.ports)} processos saudáveis")
        return healthy_processes == len(self.ports)
    
    def get_load_balancer_config(self) -> Dict[str, Any]:
        """Retorna configuração para load balancer"""
        return {
            "upstream_servers": [
                {"host": "localhost", "port": port, "weight": 1}
                for port in self.ports
            ],
            "load_balancing_method": "round_robin",
            "health_check_interval": 30,
            "max_fails": 3,
            "fail_timeout": 60
        }
    
    def stop_all_processes(self):
        """Para todos os processos"""
        logger.info("🛑 Parando todos os processos...")
        
        for i, process in enumerate(self.processes):
            try:
                process.terminate()
                process.wait(timeout=10)
                logger.info(f"✅ Processo {i+1} parado")
            except subprocess.TimeoutExpired:
                logger.warning(f"⚠️ Processo {i+1} não parou, forçando...")
                process.kill()
            except Exception as e:
                logger.error(f"❌ Erro ao parar processo {i+1}: {e}")
        
        self.processes.clear()
        self.running = False
        logger.info("🎉 Todos os processos foram parados")
    
    def restart_process(self, process_index: int):
        """Reinicia um processo específico"""
        if 0 <= process_index < len(self.processes):
            port = self.ports[process_index]
            logger.info(f"🔄 Reiniciando processo {process_index + 1} (porta {port})...")
            
            # Parar processo atual
            try:
                self.processes[process_index].terminate()
                self.processes[process_index].wait(timeout=5)
            except:
                self.processes[process_index].kill()
            
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
            
            self.processes[process_index] = process
            logger.info(f"✅ Processo {process_index + 1} reiniciado (PID: {process.pid})")
    
    def monitor_processes(self):
        """Monitora processos em background"""
        def monitor():
            while self.running:
                try:
                    for i, process in enumerate(self.processes):
                        if process.poll() is not None:
                            logger.warning(f"⚠️ Processo {i+1} morreu, reiniciando...")
                            self.restart_process(i)
                    
                    time.sleep(10)  # Verificar a cada 10 segundos
                except Exception as e:
                    logger.error(f"❌ Erro no monitoramento: {e}")
                    time.sleep(30)
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
        logger.info("👁️ Monitoramento de processos iniciado")
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status de todos os processos"""
        status = {
            "total_processes": len(self.processes),
            "running": self.running,
            "processes": []
        }
        
        for i, (process, port) in enumerate(zip(self.processes, self.ports)):
            process_status = {
                "index": i + 1,
                "port": port,
                "pid": process.pid if process.poll() is None else None,
                "alive": process.poll() is None,
                "healthy": False
            }
            
            # Verificar saúde
            try:
                response = requests.get(f"http://localhost:{port}/health", timeout=2)
                process_status["healthy"] = response.status_code == 200
            except:
                pass
            
            status["processes"].append(process_status)
        
        return status

def signal_handler(signum, frame):
    """Handler para Ctrl+C"""
    logger.info("🛑 Recebido sinal de parada...")
    if 'manager' in globals():
        manager.stop_all_processes()
    sys.exit(0)

def main():
    """Função principal"""
    print("🚀 GERENCIADOR DE MÚLTIPLOS PROCESSOS - API SISTEMA DE FICHAS")
    print("=" * 70)
    
    # Registrar handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Criar gerenciador
    manager = APIProcessManager(num_processes=3, base_port=8000)
    
    try:
        # Iniciar todos os processos
        manager.start_all_processes()
        
        # Iniciar monitoramento
        manager.monitor_processes()
        
        # Mostrar configuração do load balancer
        print("\n📋 CONFIGURAÇÃO DO LOAD BALANCER:")
        print("=" * 50)
        config = manager.get_load_balancer_config()
        print(json.dumps(config, indent=2))
        
        print(f"\n🌐 URLs das APIs:")
        for i, port in enumerate(manager.ports):
            print(f"  API {i+1}: http://localhost:{port}")
        
        print(f"\n💡 Para testar:")
        print(f"  curl http://localhost:8000/health")
        print(f"  curl http://localhost:8001/health") 
        print(f"  curl http://localhost:8002/health")
        
        print(f"\n⏹️ Pressione Ctrl+C para parar todos os processos")
        
        # Manter rodando
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("⏹️ Interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro: {e}")
    finally:
        manager.stop_all_processes()

if __name__ == "__main__":
    main()
