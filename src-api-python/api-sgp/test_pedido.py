#!/usr/bin/env python3
"""
Script de teste para a API de pedidos
"""

import requests
import json
from datetime import datetime

# URL base da API (sem o prefixo /api/v1)
BASE_URL = "http://localhost:8000"

def test_criar_pedido():
    """Testa a criação de um pedido"""
    
    # Dados do pedido conforme o JSON fornecido
    pedido_data = {
        "numero": "1",
        "data_entrada": "2024-01-15",
        "data_entrega": "2024-01-20",
        "observacao": "Pedido urgente para evento",
        "prioridade": "ALTA",
        "status": "pendente",
        
        "cliente": "João Silva",
        "telefone_cliente": "(11) 99999-9999",
        "cidade_cliente": "São Paulo",
        
        "valor_total": "450.00",
        "valor_frete": "25.00",
        "valor_itens": "425.00",
        "tipo_pagamento": "1",
        "obs_pagamento": "2x sem juros",
        
        "forma_envio": "Sedex",
        "forma_envio_id": 1,
        
        "items": [
            {
                "id": 1,
                "tipo_producao": "painel",
                "descricao": "Painel de Fundo para Evento",
                "largura": "3.00",
                "altura": "2.50",
                "metro_quadrado": "7.50",
                "vendedor": "Maria Santos",
                "designer": "Carlos Lima",
                "tecido": "Banner",
                "acabamento": {
                    "overloque": True,
                    "elastico": False,
                    "ilhos": True
                },
                "emenda": "sem-emenda",
                "observacao": "Impressão em alta resolução",
                "valor_unitario": "250.00",
                "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
            },
            {
                "id": 2,
                "tipo_producao": "totem",
                "descricao": "Totem de Informações",
                "largura": "0.80",
                "altura": "2.00",
                "metro_quadrado": "1.60",
                "vendedor": "Pedro Costa",
                "designer": "Ana Oliveira",
                "tecido": "Vinil",
                "acabamento": {
                    "overloque": False,
                    "elastico": False,
                    "ilhos": True
                },
                "emenda": "com-emenda",
                "observacao": "Com ilhós para fixação",
                "valor_unitario": "175.00",
                "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
                "ilhos_qtd": "4",
                "ilhos_valor_unitario": "2.50",
                "ilhos_distancia": "0.20"
            }
        ],
        
        "financeiro": False,
        "sublimacao": False,
        "costura": False,
        "expedicao": False
    }
    
    try:
        print("🔄 Testando criação de pedido...")
        response = requests.post(f"{BASE_URL}/pedidos/", json=pedido_data)
        
        if response.status_code == 200:
            print("✅ Pedido criado com sucesso!")
            pedido_criado = response.json()
            print(f"   ID: {pedido_criado['id']}")
            print(f"   Número: {pedido_criado['numero']}")
            print(f"   Cliente: {pedido_criado['cliente']}")
            print(f"   Status: {pedido_criado['status']}")
            print(f"   Items: {len(pedido_criado['items'])}")
            return pedido_criado['id']
        else:
            print(f"❌ Erro ao criar pedido: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão. Verifique se a API está rodando em http://localhost:8000")
        return None
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return None

def test_listar_pedidos():
    """Testa a listagem de pedidos"""
    try:
        print("\n🔄 Testando listagem de pedidos...")
        response = requests.get(f"{BASE_URL}/pedidos/")
        
        if response.status_code == 200:
            pedidos = response.json()
            print(f"✅ Encontrados {len(pedidos)} pedidos")
            for pedido in pedidos:
                print(f"   - ID: {pedido['id']}, Número: {pedido['numero']}, Cliente: {pedido['cliente']}")
        else:
            print(f"❌ Erro ao listar pedidos: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro ao listar pedidos: {e}")

def test_obter_pedido(pedido_id):
    """Testa a obtenção de um pedido específico"""
    if not pedido_id:
        return
        
    try:
        print(f"\n🔄 Testando obtenção do pedido {pedido_id}...")
        response = requests.get(f"{BASE_URL}/pedidos/{pedido_id}")
        
        if response.status_code == 200:
            pedido = response.json()
            print("✅ Pedido obtido com sucesso!")
            print(f"   Número: {pedido['numero']}")
            print(f"   Cliente: {pedido['cliente']}")
            print(f"   Status: {pedido['status']}")
            print(f"   Items: {len(pedido['items'])}")
        else:
            print(f"❌ Erro ao obter pedido: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro ao obter pedido: {e}")

def test_pedidos_por_status():
    """Testa a listagem de pedidos por status"""
    try:
        print("\n🔄 Testando listagem de pedidos por status...")
        response = requests.get(f"{BASE_URL}/pedidos/status/pendente")
        
        if response.status_code == 200:
            pedidos = response.json()
            print(f"✅ Encontrados {len(pedidos)} pedidos pendentes")
        else:
            print(f"❌ Erro ao listar pedidos por status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro ao listar pedidos por status: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando testes da API de Pedidos")
    print("=" * 50)
    
    # Teste de criação
    pedido_id = test_criar_pedido()
    
    # Teste de listagem
    test_listar_pedidos()
    
    # Teste de obtenção específica
    test_obter_pedido(pedido_id)
    
    # Teste de listagem por status
    test_pedidos_por_status()
    
    print("\n" + "=" * 50)
    print("🏁 Testes concluídos!")
