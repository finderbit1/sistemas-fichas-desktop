#!/usr/bin/env python3
"""
🔬 Teste Manual de Cliente - Diagnóstico Rápido
Execute direto: python test_cliente_manual.py
"""

import sys
import os

# Adicionar diretório ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_import_modules():
    """Teste 1: Verificar imports"""
    print("\n" + "=" * 60)
    print("1️⃣ TESTANDO IMPORTS")
    print("=" * 60)
    
    try:
        print("   Importando Cliente...")
        from clientes.schema import Cliente, ClienteCreate
        print("   ✅ Schema de Cliente OK")
        
        print("   Importando database...")
        from database.database import get_session_context, engine
        print("   ✅ Database OK")
        
        print("   Importando main...")
        from main import app
        print("   ✅ Main OK")
        
        return True
    except Exception as e:
        print(f"   ❌ Erro nos imports: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_database_connection():
    """Teste 2: Verificar conexão com banco"""
    print("\n" + "=" * 60)
    print("2️⃣ TESTANDO CONEXÃO COM BANCO")
    print("=" * 60)
    
    try:
        from database.database import get_session_context
        from sqlalchemy import text
        
        print("   Conectando ao banco...")
        with get_session_context() as session:
            result = session.execute(text("SELECT 1"))
            print("   ✅ Conexão OK")
            
            # Verificar tipo de banco
            from config_loader import load_database_config
            config = load_database_config()
            print(f"   📊 Banco: {config['type']}")
            
            if config['type'] == 'postgresql':
                pg = config['postgres']
                print(f"   🐘 PostgreSQL: {pg['user']}@{pg['host']}:{pg['port']}/{pg['database']}")
            else:
                print(f"   📁 SQLite: {config['sqlite']['path']}")
            
            return True
    except Exception as e:
        print(f"   ❌ Erro de conexão: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_table_exists():
    """Teste 3: Verificar se tabela existe"""
    print("\n" + "=" * 60)
    print("3️⃣ VERIFICANDO TABELA DE CLIENTES")
    print("=" * 60)
    
    try:
        from database.database import engine
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"   📋 Tabelas no banco: {tables}")
        
        if "cliente" in tables:
            print("   ✅ Tabela 'cliente' existe")
            
            # Verificar colunas
            columns = inspector.get_columns("cliente")
            print(f"   📝 Colunas: {[col['name'] for col in columns]}")
            return True
        else:
            print("   ⚠️  Tabela 'cliente' não encontrada")
            print("   💡 Criando tabelas...")
            from database.database import create_db_and_tables
            create_db_and_tables()
            print("   ✅ Tabelas criadas")
            return True
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar tabela: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_create_cliente_database():
    """Teste 4: Criar cliente direto no banco"""
    print("\n" + "=" * 60)
    print("4️⃣ CRIANDO CLIENTE DIRETO NO BANCO")
    print("=" * 60)
    
    try:
        from database.database import get_session_context
        from clientes.schema import Cliente
        from sqlalchemy import select
        
        with get_session_context() as session:
            # Criar cliente
            print("   Criando cliente...")
            cliente = Cliente(
                nome="Teste Manual",
                cep="12345-678",
                cidade="São Paulo",
                estado="SP",
                telefone="11999999999"
            )
            
            session.add(cliente)
            session.commit()
            session.refresh(cliente)
            
            cliente_id = cliente.id
            print(f"   ✅ Cliente criado com ID: {cliente_id}")
            
            # Verificar se foi salvo
            print("   Verificando no banco...")
            db_cliente = session.get(Cliente, cliente_id)
            
            if db_cliente:
                print(f"   ✅ Cliente recuperado: {db_cliente.nome}")
                print(f"      - Cidade: {db_cliente.cidade}")
                print(f"      - Telefone: {db_cliente.telefone}")
                
                # Listar todos os clientes
                print("   Listando todos os clientes...")
                clientes = session.exec(select(Cliente)).all()
                print(f"   📊 Total de clientes no banco: {len(clientes)}")
                
                return True
            else:
                print(f"   ❌ Cliente {cliente_id} não encontrado após criação")
                return False
                
    except Exception as e:
        print(f"   ❌ Erro ao criar cliente: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_create_cliente_api():
    """Teste 5: Criar cliente via API"""
    print("\n" + "=" * 60)
    print("5️⃣ CRIANDO CLIENTE VIA API")
    print("=" * 60)
    
    try:
        import requests
        
        print("   Verificando se API está rodando...")
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            print(f"   ✅ API está online (status: {response.status_code})")
        except:
            print("   ⚠️  API não está rodando!")
            print("   💡 Inicie a API com: ./start.sh")
            return False
        
        print("   Criando cliente via API...")
        cliente_data = {
            "nome": "Cliente API Teste",
            "cep": "98765-432",
            "cidade": "Rio de Janeiro",
            "estado": "RJ",
            "telefone": "21988888888"
        }
        
        response = requests.post(
            "http://localhost:8000/api/v1/clientes/",
            json=cliente_data,
            timeout=5
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"   ✅ Cliente criado via API!")
            print(f"      - ID: {data.get('id')}")
            print(f"      - Nome: {data.get('nome')}")
            
            # Verificar listagem
            print("   Verificando listagem...")
            list_response = requests.get(
                "http://localhost:8000/api/v1/clientes/",
                timeout=5
            )
            
            if list_response.status_code == 200:
                clientes = list_response.json()
                print(f"   ✅ Listagem funcionando ({len(clientes)} clientes)")
                return True
            else:
                print(f"   ⚠️  Erro na listagem: {list_response.status_code}")
                return False
        else:
            print(f"   ❌ Erro ao criar: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro no teste de API: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Executa todos os testes"""
    print("\n" + "=" * 60)
    print("🔬 DIAGNÓSTICO MANUAL - SISTEMA DE CLIENTES")
    print("=" * 60)
    
    results = []
    
    # Teste 1: Imports
    results.append(("Imports", test_import_modules()))
    
    # Teste 2: Conexão
    results.append(("Conexão", test_database_connection()))
    
    # Teste 3: Tabela
    results.append(("Tabela", test_table_exists()))
    
    # Teste 4: Criar no banco
    results.append(("Criar no Banco", test_create_cliente_database()))
    
    # Teste 5: Criar via API
    results.append(("Criar via API", test_create_cliente_api()))
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Passou: {passed}/{len(results)}")
    print(f"❌ Falhou: {failed}/{len(results)}")
    print("=" * 60)
    
    if failed == 0:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("   O sistema de clientes está funcionando corretamente.")
    else:
        print(f"\n⚠️  {failed} TESTE(S) FALHARAM")
        print("   Verifique os erros acima para mais detalhes.")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


