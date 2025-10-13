#!/usr/bin/env python3
"""
🔍 Teste Rápido da API
Verifica se a API está funcionando e se é possível cadastrar dados
"""

import requests
import sys
from datetime import datetime

API_URL = "http://localhost:8000"

def test_health():
    """Testa o health check"""
    print("🏥 Testando health check...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API está online!")
            print(f"   Resposta: {response.json()}")
            return True
        else:
            print(f"❌ Health check falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        print("   Certifique-se de que a API está rodando (./start.sh)")
        return False

def test_create_designer():
    """Testa criação de um designer"""
    print("\n👨‍🎨 Testando cadastro de designer...")
    try:
        data = {
            "name": f"Designer Teste {datetime.now().strftime('%H:%M:%S')}",
            "email": "teste@example.com",
            "phone": "11999999999",
            "active": True
        }
        response = requests.post(f"{API_URL}/api/v1/designers/", json=data, timeout=5)
        if response.status_code in [200, 201]:
            print("✅ Designer cadastrado com sucesso!")
            print(f"   ID: {response.json().get('id')}")
            return True
        else:
            print(f"❌ Falha ao cadastrar: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro ao cadastrar: {e}")
        return False

def test_list_designers():
    """Testa listagem de designers"""
    print("\n📋 Testando listagem de designers...")
    try:
        response = requests.get(f"{API_URL}/api/v1/designers/", timeout=5)
        if response.status_code == 200:
            designers = response.json()
            print(f"✅ Listagem funcionando! Total: {len(designers)} designer(s)")
            return True
        else:
            print(f"❌ Falha ao listar: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao listar: {e}")
        return False

def test_create_vendedor():
    """Testa criação de um vendedor"""
    print("\n🤵 Testando cadastro de vendedor...")
    try:
        data = {
            "name": f"Vendedor Teste {datetime.now().strftime('%H:%M:%S')}",
            "email": "vendedor@example.com",
            "phone": "11988888888",
            "active": True
        }
        response = requests.post(f"{API_URL}/api/v1/vendedores/", json=data, timeout=5)
        if response.status_code in [200, 201]:
            print("✅ Vendedor cadastrado com sucesso!")
            print(f"   ID: {response.json().get('id')}")
            return True
        else:
            print(f"❌ Falha ao cadastrar: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro ao cadastrar: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("=" * 60)
    print("🔍 TESTE RÁPIDO DA API")
    print("=" * 60)
    
    # Teste 1: Health Check
    if not test_health():
        print("\n❌ API não está acessível. Não é possível continuar os testes.")
        sys.exit(1)
    
    # Teste 2: Criar designer
    designer_ok = test_create_designer()
    
    # Teste 3: Listar designers
    list_ok = test_list_designers()
    
    # Teste 4: Criar vendedor
    vendedor_ok = test_create_vendedor()
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    print(f"Health Check: {'✅' if True else '❌'}")
    print(f"Cadastrar Designer: {'✅' if designer_ok else '❌'}")
    print(f"Listar Designers: {'✅' if list_ok else '❌'}")
    print(f"Cadastrar Vendedor: {'✅' if vendedor_ok else '❌'}")
    print("=" * 60)
    
    if designer_ok and list_ok and vendedor_ok:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("   A API está funcionando corretamente.")
        sys.exit(0)
    else:
        print("\n⚠️ ALGUNS TESTES FALHARAM")
        print("   Verifique os erros acima.")
        sys.exit(1)

if __name__ == "__main__":
    main()



