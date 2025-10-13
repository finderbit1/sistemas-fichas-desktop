"""
🧪 Teste de Carga - Simula 20 Clientes Conectados Simultaneamente

Este script simula 20 clientes (totems/painéis) conectando-se simultaneamente
à API central via WebSocket, exatamente como será em produção.

Execute enquanto o servidor está rodando:
    python test_20_clientes.py
"""

import asyncio
import websockets
import json
from datetime import datetime
import sys

# Configurações
SERVIDOR = "ws://localhost:8000/ws/pedidos"
NUM_CLIENTES = 20
DURACAO_TESTE = 30  # segundos

class Cliente:
    """Simula um cliente (totem/painel) conectando ao servidor"""
    
    def __init__(self, cliente_id):
        self.id = cliente_id
        self.nome = f"Cliente-{cliente_id:02d}"
        self.conectado = False
        self.mensagens_recebidas = 0
        self.websocket = None
    
    async def conectar_e_ouvir(self):
        """Conecta ao WebSocket e fica ouvindo mensagens"""
        try:
            async with websockets.connect(SERVIDOR) as websocket:
                self.websocket = websocket
                self.conectado = True
                
                # Receber mensagem de boas-vindas
                welcome = await websocket.recv()
                print(f"✅ {self.nome}: Conectado!")
                
                # Enviar identificação
                await websocket.send(json.dumps({
                    "type": "identify",
                    "client_id": self.id,
                    "client_name": self.nome
                }))
                
                # Ficar ouvindo mensagens
                while True:
                    try:
                        mensagem = await asyncio.wait_for(
                            websocket.recv(), 
                            timeout=DURACAO_TESTE + 5
                        )
                        data = json.loads(mensagem)
                        self.mensagens_recebidas += 1
                        
                        # Log apenas mensagens importantes
                        if data.get('type') in ['pedido_update', 'status_update']:
                            print(f"📨 {self.nome}: Recebeu {data.get('type')} (total: {self.mensagens_recebidas})")
                        
                    except asyncio.TimeoutError:
                        print(f"⏰ {self.nome}: Timeout - finalizando")
                        break
                    except json.JSONDecodeError:
                        print(f"⚠️ {self.nome}: Mensagem inválida")
                        
        except ConnectionRefusedError:
            print(f"❌ {self.nome}: Não conseguiu conectar ao servidor")
        except Exception as e:
            print(f"❌ {self.nome}: Erro - {e}")
        finally:
            self.conectado = False

async def monitorar_estatisticas():
    """Monitora estatísticas do servidor periodicamente"""
    import aiohttp
    
    print("\n📊 Monitorando estatísticas do servidor...\n")
    
    for i in range(DURACAO_TESTE // 5):
        await asyncio.sleep(5)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:8000/ws/stats') as response:
                    if response.status == 200:
                        stats = await response.json()
                        total = stats.get('total_connections', 0)
                        print(f"\n📈 Estatísticas ({i*5}s):")
                        print(f"   └─ Conexões ativas: {total}")
                        print(f"   └─ Por tipo: {stats.get('connections_by_type', {})}")
        except Exception as e:
            print(f"⚠️ Erro ao buscar estatísticas: {e}")

async def simular_atualizacao():
    """Simula criação de um pedido para testar broadcast"""
    import aiohttp
    
    await asyncio.sleep(10)  # Aguarda clientes conectarem
    
    print("\n🚀 Simulando criação de pedido...\n")
    
    try:
        async with aiohttp.ClientSession() as session:
            # Criar um pedido de teste
            pedido_teste = {
                "cliente_id": 1,
                "valor_total": 1500.00,
                "descricao": "Pedido de Teste - 20 Clientes",
                "status": "pendente"
            }
            
            async with session.post(
                'http://localhost:8000/pedidos',
                json=pedido_teste
            ) as response:
                if response.status == 201:
                    pedido = await response.json()
                    print(f"✅ Pedido criado: ID {pedido.get('id')}")
                    print(f"   └─ TODOS os {NUM_CLIENTES} clientes devem receber notificação!")
                    
                    # Aguardar um pouco e atualizar o pedido
                    await asyncio.sleep(3)
                    
                    pedido_id = pedido.get('id')
                    async with session.patch(
                        f'http://localhost:8000/pedidos/{pedido_id}',
                        json={"financeiro": True}
                    ) as update_response:
                        if update_response.status == 200:
                            print(f"✅ Pedido {pedido_id} atualizado (financeiro=true)")
                            print(f"   └─ TODOS os clientes devem ver a atualização!")
                            
    except Exception as e:
        print(f"❌ Erro ao simular atualização: {e}")

async def main():
    """Função principal do teste"""
    print("="*70)
    print("🧪 TESTE DE CARGA - 20 CLIENTES SIMULTÂNEOS")
    print("="*70)
    print()
    print(f"📋 Configuração:")
    print(f"   └─ Servidor: {SERVIDOR}")
    print(f"   └─ Número de clientes: {NUM_CLIENTES}")
    print(f"   └─ Duração: {DURACAO_TESTE}s")
    print()
    print("⚠️  Certifique-se de que o servidor está rodando!")
    print()
    print("-"*70)
    print()
    
    # Criar clientes
    clientes = [Cliente(i+1) for i in range(NUM_CLIENTES)]
    
    # Tarefas
    tarefas = []
    
    # Conectar todos os clientes
    print(f"🔌 Conectando {NUM_CLIENTES} clientes...\n")
    for cliente in clientes:
        tarefas.append(asyncio.create_task(cliente.conectar_e_ouvir()))
    
    # Monitorar estatísticas
    tarefas.append(asyncio.create_task(monitorar_estatisticas()))
    
    # Simular atualizações
    tarefas.append(asyncio.create_task(simular_atualizacao()))
    
    # Aguardar todas as tarefas
    try:
        await asyncio.gather(*tarefas, return_exceptions=True)
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário")
    
    # Relatório final
    print("\n" + "="*70)
    print("📊 RELATÓRIO FINAL")
    print("="*70)
    print()
    
    conectados = sum(1 for c in clientes if c.conectado or c.mensagens_recebidas > 0)
    total_mensagens = sum(c.mensagens_recebidas for c in clientes)
    
    print(f"✅ Clientes que conectaram: {conectados}/{NUM_CLIENTES}")
    print(f"📨 Total de mensagens recebidas: {total_mensagens}")
    print(f"📊 Média por cliente: {total_mensagens/NUM_CLIENTES:.1f} mensagens")
    print()
    
    # Top 5 clientes que mais receberam mensagens
    top_clientes = sorted(clientes, key=lambda c: c.mensagens_recebidas, reverse=True)[:5]
    print("🏆 Top 5 clientes (mais mensagens):")
    for i, cliente in enumerate(top_clientes, 1):
        print(f"   {i}. {cliente.nome}: {cliente.mensagens_recebidas} mensagens")
    
    print()
    
    if conectados == NUM_CLIENTES and total_mensagens > 0:
        print("✅ TESTE PASSOU! Sistema está pronto para 20 clientes!")
    elif conectados < NUM_CLIENTES:
        print(f"⚠️  ATENÇÃO: Apenas {conectados}/{NUM_CLIENTES} clientes conectaram")
        print("   Verifique se o servidor está rodando corretamente")
    else:
        print("⚠️  ATENÇÃO: Clientes conectaram mas não receberam mensagens")
        print("   Verifique se o broadcast está funcionando")
    
    print()
    print("="*70)
    print()

if __name__ == "__main__":
    try:
        # Verificar se aiohttp está instalado
        try:
            import aiohttp
        except ImportError:
            print("❌ Erro: aiohttp não está instalado")
            print("   Execute: pip install aiohttp")
            sys.exit(1)
        
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste cancelado pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro fatal: {e}")

