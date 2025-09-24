#!/usr/bin/env python3
"""
Teste de Performance para verificar melhorias implementadas
"""
import requests
import time
import json
from typing import List, Dict, Any
import statistics

API_BASE_URL = "http://localhost:8000"

def test_endpoint_performance(endpoint: str, iterations: int = 10) -> Dict[str, Any]:
    """Testa performance de um endpoint"""
    times = []
    successes = 0
    
    print(f"🔍 Testando {endpoint}...")
    
    for i in range(iterations):
        start_time = time.time()
        try:
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=30)
            end_time = time.time()
            
            if response.status_code == 200:
                response_time = (end_time - start_time) * 1000
                times.append(response_time)
                successes += 1
            else:
                print(f"  ❌ Iteração {i+1}: Status {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Iteração {i+1}: Erro - {e}")
    
    if times:
        return {
            "endpoint": endpoint,
            "success_rate": (successes / iterations) * 100,
            "avg_time": statistics.mean(times),
            "median_time": statistics.median(times),
            "min_time": min(times),
            "max_time": max(times),
            "p95_time": sorted(times)[int(len(times) * 0.95)],
            "iterations": iterations,
            "successes": successes
        }
    else:
        return {
            "endpoint": endpoint,
            "success_rate": 0,
            "avg_time": 0,
            "median_time": 0,
            "min_time": 0,
            "max_time": 0,
            "p95_time": 0,
            "iterations": iterations,
            "successes": 0
        }

def test_cache_performance():
    """Testa performance do cache"""
    print("\n🎯 TESTANDO PERFORMANCE DO CACHE")
    print("=" * 50)
    
    # Primeira chamada (cache miss)
    print("🔄 Primeira chamada (cache miss)...")
    result1 = test_endpoint_performance("/clientes", iterations=1)
    
    # Segunda chamada (cache hit)
    print("🎯 Segunda chamada (cache hit)...")
    result2 = test_endpoint_performance("/clientes", iterations=1)
    
    # Terceira chamada (cache hit)
    print("🎯 Terceira chamada (cache hit)...")
    result3 = test_endpoint_performance("/clientes", iterations=1)
    
    print(f"\n📊 RESULTADOS DO CACHE:")
    print(f"  🔄 Cache Miss: {result1['avg_time']:.2f}ms")
    print(f"  🎯 Cache Hit 1: {result2['avg_time']:.2f}ms")
    print(f"  🎯 Cache Hit 2: {result3['avg_time']:.2f}ms")
    
    if result1['avg_time'] > 0 and result2['avg_time'] > 0:
        improvement = ((result1['avg_time'] - result2['avg_time']) / result1['avg_time']) * 100
        print(f"  🚀 Melhoria: {improvement:.1f}% mais rápido com cache")

def test_pagination_performance():
    """Testa performance da paginação"""
    print("\n📄 TESTANDO PERFORMANCE DA PAGINAÇÃO")
    print("=" * 50)
    
    # Testar diferentes tamanhos de página
    page_sizes = [10, 50, 100]
    
    for size in page_sizes:
        endpoint = f"/clientes/paginated?page=1&size={size}"
        result = test_endpoint_performance(endpoint, iterations=5)
        
        print(f"  📄 Página {size}: {result['avg_time']:.2f}ms (sucesso: {result['success_rate']:.1f}%)")

def test_compression():
    """Testa compressão gzip"""
    print("\n🗜️ TESTANDO COMPRESSÃO GZIP")
    print("=" * 50)
    
    # Testar com e sem compressão
    headers_with_compression = {"Accept-Encoding": "gzip, deflate"}
    headers_without_compression = {"Accept-Encoding": "identity"}
    
    # Testar endpoint que retorna dados grandes
    endpoint = "/clientes"
    
    print("🗜️ Com compressão...")
    start_time = time.time()
    response1 = requests.get(f"{API_BASE_URL}{endpoint}", headers=headers_with_compression, timeout=30)
    time1 = (time.time() - start_time) * 1000
    size1 = len(response1.content)
    
    print("📦 Sem compressão...")
    start_time = time.time()
    response2 = requests.get(f"{API_BASE_URL}{endpoint}", headers=headers_without_compression, timeout=30)
    time2 = (time.time() - start_time) * 1000
    size2 = len(response2.content)
    
    print(f"\n📊 RESULTADOS DA COMPRESSÃO:")
    print(f"  🗜️ Com compressão: {time1:.2f}ms, {size1} bytes")
    print(f"  📦 Sem compressão: {time2:.2f}ms, {size2} bytes")
    
    if size2 > 0:
        compression_ratio = ((size2 - size1) / size2) * 100
        print(f"  📉 Redução de tamanho: {compression_ratio:.1f}%")
    
    if time1 > 0 and time2 > 0:
        time_improvement = ((time2 - time1) / time2) * 100
        print(f"  ⚡ Melhoria de tempo: {time_improvement:.1f}%")

def main():
    """Função principal"""
    print("🚀 TESTE DE PERFORMANCE - OTIMIZAÇÕES IMPLEMENTADAS")
    print("=" * 60)
    
    # Verificar se API está funcionando
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code != 200:
            print("❌ API não está funcionando")
            return
    except Exception as e:
        print(f"❌ Erro ao conectar com a API: {e}")
        return
    
    print("✅ API está funcionando!")
    
    # Testar endpoints principais
    endpoints = [
        "/",
        "/health", 
        "/clientes",
        "/pedidos",
        "/producoes/tipos",
        "/clientes/paginated?page=1&size=50"
    ]
    
    print(f"\n🔍 TESTANDO ENDPOINTS PRINCIPAIS")
    print("=" * 50)
    
    results = []
    for endpoint in endpoints:
        result = test_endpoint_performance(endpoint, iterations=5)
        results.append(result)
        
        print(f"  🔗 {endpoint}: {result['avg_time']:.2f}ms (sucesso: {result['success_rate']:.1f}%)")
    
    # Calcular estatísticas gerais
    avg_times = [r['avg_time'] for r in results if r['avg_time'] > 0]
    if avg_times:
        overall_avg = statistics.mean(avg_times)
        print(f"\n📊 Tempo médio geral: {overall_avg:.2f}ms")
        
        if overall_avg < 100:
            print("🚀 Performance EXCELENTE!")
        elif overall_avg < 500:
            print("✅ Performance BOA!")
        else:
            print("⚠️ Performance pode ser melhorada")
    
    # Testes específicos
    test_cache_performance()
    test_pagination_performance()
    test_compression()
    
    print(f"\n🎉 TESTE DE PERFORMANCE CONCLUÍDO!")
    print("=" * 60)

if __name__ == "__main__":
    main()
