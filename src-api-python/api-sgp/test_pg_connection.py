#!/usr/bin/env python3
"""
Teste rápido de conexão PostgreSQL
"""

import socket
import sys

def test_pg_connection(host, port, timeout=3):
    """Testa se consegue conectar no PostgreSQL"""
    print(f"🔌 Testando conexão: {host}:{port}")
    print(f"   Timeout: {timeout}s")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✅ Porta {port} está ABERTA em {host}")
            return True
        else:
            print(f"❌ Porta {port} está FECHADA em {host}")
            return False
    except socket.timeout:
        print(f"⏰ TIMEOUT - {host}:{port} não respondeu em {timeout}s")
        return False
    except socket.gaierror:
        print(f"❌ ERRO - Host {host} não encontrado")
        return False
    except Exception as e:
        print(f"❌ ERRO - {e}")
        return False

if __name__ == "__main__":
    from config_loader import load_database_config
    
    print("=" * 60)
    print("🔍 TESTE DE CONEXÃO POSTGRESQL")
    print("=" * 60)
    
    config = load_database_config()
    
    if config['type'] == 'postgresql':
        pg = config['postgres']
        print(f"\n📋 Configuração:")
        print(f"   Host: {pg['host']}")
        print(f"   Porta: {pg['port']}")
        print(f"   Database: {pg['database']}")
        print(f"   User: {pg['user']}")
        print()
        
        if test_pg_connection(pg['host'], pg['port'], timeout=3):
            print("\n✅ PostgreSQL está acessível!")
            print("   Você pode usar PostgreSQL.")
        else:
            print("\n❌ PostgreSQL NÃO está acessível!")
            print("\n💡 Soluções:")
            print("   1. Verifique se PostgreSQL está rodando")
            print("   2. Verifique firewall/rede")
            print("   3. Use SQLite para desenvolvimento local:")
            print("      - Edite banco.conf")
            print("      - Mude DATABASE_TYPE=sqlite")
            sys.exit(1)
    else:
        print("✅ Usando SQLite (sem problemas de rede)")

