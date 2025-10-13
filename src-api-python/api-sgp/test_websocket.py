"""
Script de teste para verificar se o WebSocket está funcionando corretamente.
Execute este script em um terminal separado enquanto o servidor está rodando.
"""

import asyncio
import websockets
import json
from datetime import datetime

async def test_websocket():
    """Testa a conexão WebSocket e troca de mensagens"""
    
    uri = "ws://localhost:8000/ws/pedidos"
    print(f"🔌 Conectando ao WebSocket: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Conectado com sucesso!")
            
            # Aguardar mensagem de boas-vindas
            welcome_msg = await websocket.recv()
            welcome_data = json.loads(welcome_msg)
            print(f"📨 Mensagem de boas-vindas: {welcome_data}")
            
            # Enviar ping
            print("\n💓 Enviando ping...")
            await websocket.send(json.dumps({"type": "ping"}))
            
            # Aguardar pong
            pong_msg = await websocket.recv()
            pong_data = json.loads(pong_msg)
            print(f"📨 Resposta: {pong_data}")
            
            # Solicitar refresh
            print("\n🔄 Solicitando refresh dos pedidos...")
            await websocket.send(json.dumps({"type": "get_pedidos"}))
            
            # Aguardar resposta
            refresh_msg = await websocket.recv()
            refresh_data = json.loads(refresh_msg)
            print(f"📨 Resposta: {refresh_data}")
            
            # Aguardar por 5 segundos para receber qualquer atualização
            print("\n⏳ Aguardando 5 segundos por atualizações...")
            try:
                while True:
                    msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(msg)
                    print(f"📨 Atualização recebida: {data.get('type')} - {data.get('message', data.get('action'))}")
            except asyncio.TimeoutError:
                print("⏰ Timeout - nenhuma atualização recebida (isso é normal)")
            
            print("\n✅ Teste concluído com sucesso!")
            
    except ConnectionRefusedError:
        print("❌ Erro: Não foi possível conectar ao servidor")
        print("   Certifique-se de que o servidor está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")

async def test_multiple_clients():
    """Testa múltiplos clientes conectados simultaneamente"""
    
    print("\n" + "="*60)
    print("🔌 Testando múltiplos clientes simultâneos...")
    print("="*60 + "\n")
    
    uri = "ws://localhost:8000/ws/pedidos"
    
    async def client(client_id):
        """Simula um cliente"""
        try:
            async with websockets.connect(uri) as websocket:
                # Receber mensagem de boas-vindas
                welcome = await websocket.recv()
                print(f"Cliente {client_id}: Conectado!")
                
                # Aguardar por mensagens
                try:
                    while True:
                        msg = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                        data = json.loads(msg)
                        print(f"Cliente {client_id}: Recebeu {data.get('type')}")
                except asyncio.TimeoutError:
                    print(f"Cliente {client_id}: Timeout (normal)")
                    
        except Exception as e:
            print(f"Cliente {client_id}: Erro - {e}")
    
    # Criar 3 clientes simultâneos
    tasks = [client(i) for i in range(1, 4)]
    await asyncio.gather(*tasks)
    
    print("\n✅ Teste de múltiplos clientes concluído!")

async def main():
    """Função principal"""
    print("="*60)
    print("🧪 TESTE DO SISTEMA DE SINCRONIZAÇÃO WEBSOCKET")
    print("="*60)
    print()
    print("Este script testará:")
    print("1. Conexão básica ao WebSocket")
    print("2. Troca de mensagens (ping/pong)")
    print("3. Múltiplos clientes simultâneos")
    print()
    print("⚠️  Certifique-se de que o servidor está rodando!")
    print()
    
    # Teste 1: Conexão básica
    print("\n📋 TESTE 1: Conexão Básica")
    print("-" * 60)
    await test_websocket()
    
    # Aguardar um pouco
    await asyncio.sleep(2)
    
    # Teste 2: Múltiplos clientes
    print("\n📋 TESTE 2: Múltiplos Clientes")
    print("-" * 60)
    await test_multiple_clients()
    
    print("\n" + "="*60)
    print("🎉 TODOS OS TESTES CONCLUÍDOS!")
    print("="*60)
    print()
    print("Se todos os testes passaram, o sistema está funcionando corretamente!")
    print()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro fatal: {e}")


