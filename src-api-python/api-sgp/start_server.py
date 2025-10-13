#!/usr/bin/env python3
"""
Script de inicialização do servidor API
Configurado para aceitar conexões de outros computadores na rede local
"""

import uvicorn
import sys
import os

if __name__ == "__main__":
    print("="*70)
    print("🚀 INICIANDO SERVIDOR API - SISTEMA DE FICHAS")
    print("="*70)
    print()
    print("📡 Configuração:")
    print("   ├─ Host: 0.0.0.0 (todas as interfaces)")
    print("   ├─ Porta: 8000")
    print("   └─ Permitindo conexões externas: SIM")
    print()
    print("🌐 Acesso:")
    
    # Tentar descobrir o IP local
    import socket
    try:
        # Conecta em um endereço externo para descobrir IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        print(f"   ├─ Local: http://localhost:8000")
        print(f"   └─ Rede:  http://{local_ip}:8000")
        print()
        print(f"💡 Outros computadores devem usar: http://{local_ip}:8000")
    except Exception:
        print("   └─ http://localhost:8000")
    
    print()
    print("⚠️  IMPORTANTE: Configure o firewall se necessário")
    print()
    print("="*70)
    print()
    
    # Iniciar servidor
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Escuta em todas as interfaces
        port=8000,
        reload=False,    # Desabilitar reload em produção
        log_level="info"
    )

