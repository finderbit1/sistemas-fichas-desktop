#!/usr/bin/env python3
"""
Script de teste para verificar a estabilidade da API Python
"""
import requests
import json
import time
import sys
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000"

def test_health_check() -> bool:
    """Testa o endpoint de health check"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']}")
            return data['status'] == 'healthy'
        else:
            print(f"❌ Health Check falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Health Check: {e}")
        return False

def test_root_endpoint() -> bool:
    """Testa o endpoint raiz"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root Endpoint: {data['message']}")
            return True
        else:
            print(f"❌ Root Endpoint falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Root Endpoint: {e}")
        return False

def test_clientes_endpoint() -> bool:
    """Testa o endpoint de clientes"""
    try:
        response = requests.get(f"{API_BASE_URL}/clientes", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Clientes Endpoint: {len(data)} clientes encontrados")
            return True
        else:
            print(f"❌ Clientes Endpoint falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Clientes Endpoint: {e}")
        return False

def test_pedidos_endpoint() -> bool:
    """Testa o endpoint de pedidos"""
    try:
        response = requests.get(f"{API_BASE_URL}/pedidos", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pedidos Endpoint: {len(data)} pedidos encontrados")
            return True
        else:
            print(f"❌ Pedidos Endpoint falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Pedidos Endpoint: {e}")
        return False

def test_producoes_endpoint() -> bool:
    """Testa o endpoint de produções"""
    try:
        response = requests.get(f"{API_BASE_URL}/producoes/tipos", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Produções Endpoint: {len(data)} tipos encontrados")
            return True
        else:
            print(f"❌ Produções Endpoint falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Produções Endpoint: {e}")
        return False

def test_performance() -> Dict[str, float]:
    """Testa a performance dos endpoints"""
    endpoints = [
        ("/", "Root"),
        ("/health", "Health"),
        ("/clientes", "Clientes"),
        ("/pedidos", "Pedidos"),
        ("/producoes/tipos", "Produções")
    ]
    
    results = {}
    
    for endpoint, name in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                response_time = (end_time - start_time) * 1000  # em ms
                results[name] = response_time
                print(f"⚡ {name}: {response_time:.2f}ms")
            else:
                print(f"❌ {name}: Falhou ({response.status_code})")
                results[name] = -1
        except Exception as e:
            print(f"❌ {name}: Erro - {e}")
            results[name] = -1
    
    return results

def main():
    """Função principal de teste"""
    print("🧪 Iniciando testes de estabilidade da API...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("Clientes Endpoint", test_clientes_endpoint),
        ("Pedidos Endpoint", test_pedidos_endpoint),
        ("Produções Endpoint", test_producoes_endpoint)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testando: {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} FALHOU")
    
    print("\n" + "=" * 50)
    print(f"📊 Resultados: {passed}/{total} testes passaram")
    
    if passed == total:
        print("✅ Todos os testes passaram! API está estável.")
        
        print("\n⚡ Testando performance...")
        performance_results = test_performance()
        
        avg_time = sum(t for t in performance_results.values() if t > 0) / len([t for t in performance_results.values() if t > 0])
        print(f"\n📈 Tempo médio de resposta: {avg_time:.2f}ms")
        
        if avg_time < 100:
            print("🚀 Performance EXCELENTE!")
        elif avg_time < 500:
            print("✅ Performance BOA!")
        else:
            print("⚠️ Performance pode ser melhorada")
            
    else:
        print("❌ Alguns testes falharam. Verifique a API.")
        sys.exit(1)

if __name__ == "__main__":
    main()
