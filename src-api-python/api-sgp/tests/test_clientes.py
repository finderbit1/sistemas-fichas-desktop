"""
🧪 Testes de Clientes - Diagnóstico Completo
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
import sys
import os

# Adicionar diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from clientes.schema import Cliente, ClienteCreate
from database.database import get_session_context


# Fixture para criar banco de dados de teste
@pytest.fixture(name="session")
def session_fixture():
    """Cria uma sessão de banco de dados de teste em memória"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


# Fixture para cliente de teste
@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Cria um cliente de teste da API"""
    def get_session_override():
        return session

    app.dependency_overrides[get_session_context] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# ============================================
# TESTES DE CONEXÃO E CONFIGURAÇÃO
# ============================================

def test_database_connection():
    """Testa se consegue conectar ao banco de dados"""
    print("\n🔌 Testando conexão com banco de dados...")
    try:
        from database.database import engine, get_session_context
        
        with get_session_context() as session:
            from sqlalchemy import text
            result = session.execute(text("SELECT 1"))
            assert result is not None
            print("✅ Conexão com banco de dados OK")
            return True
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        pytest.fail(f"Falha na conexão com banco: {e}")


def test_cliente_table_exists():
    """Testa se a tabela de clientes existe"""
    print("\n📋 Testando se tabela de clientes existe...")
    try:
        from database.database import engine
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"   Tabelas encontradas: {tables}")
        assert "cliente" in tables or "clientes" in tables, "Tabela de clientes não encontrada"
        print("✅ Tabela de clientes existe")
    except Exception as e:
        print(f"❌ Erro ao verificar tabela: {e}")
        pytest.fail(f"Erro ao verificar tabela: {e}")


# ============================================
# TESTES DE VALIDAÇÃO DE DADOS
# ============================================

def test_cliente_schema_validation():
    """Testa validação do schema de cliente"""
    print("\n✅ Testando validação de schema...")
    
    # Teste 1: Cliente válido
    try:
        cliente = ClienteCreate(
            nome="João Silva",
            cep="12345-678",
            cidade="São Paulo",
            estado="SP",
            telefone="11999999999"
        )
        print("✅ Schema válido aceito corretamente")
        assert cliente.nome == "João Silva"
    except Exception as e:
        pytest.fail(f"Schema válido rejeitado: {e}")
    
    # Teste 2: Cliente sem nome (deve falhar)
    with pytest.raises(Exception):
        ClienteCreate(
            cep="12345-678",
            cidade="São Paulo",
            estado="SP",
            telefone="11999999999"
        )
        print("✅ Schema inválido rejeitado corretamente")


def test_cliente_required_fields():
    """Testa campos obrigatórios"""
    print("\n📝 Testando campos obrigatórios...")
    
    required_fields = ["nome", "cep", "cidade", "estado", "telefone"]
    
    for field in required_fields:
        data = {
            "nome": "João Silva",
            "cep": "12345-678",
            "cidade": "São Paulo",
            "estado": "SP",
            "telefone": "11999999999"
        }
        data.pop(field)
        
        with pytest.raises(Exception):
            ClienteCreate(**data)
        print(f"   ✅ Campo '{field}' é obrigatório (correto)")


# ============================================
# TESTES DE CRUD - CREATE
# ============================================

def test_create_cliente_direct_database(session: Session):
    """Testa criação de cliente direto no banco de dados"""
    print("\n💾 Testando criação direta no banco...")
    
    try:
        # Criar cliente
        cliente = Cliente(
            nome="Cliente Teste",
            cep="12345-678",
            cidade="São Paulo",
            estado="SP",
            telefone="11999999999"
        )
        
        session.add(cliente)
        session.commit()
        session.refresh(cliente)
        
        print(f"   ✅ Cliente criado com ID: {cliente.id}")
        
        # Verificar se foi salvo
        db_cliente = session.get(Cliente, cliente.id)
        assert db_cliente is not None
        assert db_cliente.nome == "Cliente Teste"
        print("   ✅ Cliente recuperado do banco corretamente")
        
    except Exception as e:
        print(f"   ❌ Erro ao criar cliente: {e}")
        pytest.fail(f"Erro ao criar cliente direto no banco: {e}")


def test_create_cliente_api(client: TestClient):
    """Testa criação de cliente via API"""
    print("\n🌐 Testando criação via API...")
    
    cliente_data = {
        "nome": "Cliente API",
        "cep": "12345-678",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
        "telefone": "21988888888"
    }
    
    try:
        response = client.post("/api/v1/clientes/", json=cliente_data)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Resposta: {response.text}")
        
        if response.status_code not in [200, 201]:
            print(f"   ❌ Erro: {response.json()}")
            pytest.fail(f"API retornou status {response.status_code}: {response.text}")
        
        data = response.json()
        assert data["nome"] == cliente_data["nome"]
        assert data["cidade"] == cliente_data["cidade"]
        assert "id" in data
        
        print(f"   ✅ Cliente criado via API com ID: {data['id']}")
        
    except Exception as e:
        print(f"   ❌ Erro na API: {e}")
        pytest.fail(f"Erro ao criar cliente via API: {e}")


def test_create_multiple_clientes(client: TestClient):
    """Testa criação de múltiplos clientes"""
    print("\n📊 Testando criação de múltiplos clientes...")
    
    clientes = [
        {
            "nome": "Cliente 1",
            "cep": "11111-111",
            "cidade": "São Paulo",
            "estado": "SP",
            "telefone": "11111111111"
        },
        {
            "nome": "Cliente 2",
            "cep": "22222-222",
            "cidade": "Rio de Janeiro",
            "estado": "RJ",
            "telefone": "22222222222"
        },
        {
            "nome": "Cliente 3",
            "cep": "33333-333",
            "cidade": "Belo Horizonte",
            "estado": "MG",
            "telefone": "33333333333"
        }
    ]
    
    created_ids = []
    
    for i, cliente_data in enumerate(clientes, 1):
        response = client.post("/api/v1/clientes/", json=cliente_data)
        
        if response.status_code not in [200, 201]:
            pytest.fail(f"Falha ao criar cliente {i}: {response.text}")
        
        data = response.json()
        created_ids.append(data["id"])
        print(f"   ✅ Cliente {i} criado (ID: {data['id']})")
    
    assert len(created_ids) == 3
    print(f"   ✅ Todos os {len(created_ids)} clientes criados com sucesso")


# ============================================
# TESTES DE CRUD - READ
# ============================================

def test_list_clientes_empty(client: TestClient):
    """Testa listagem quando não há clientes"""
    print("\n📋 Testando listagem vazia...")
    
    response = client.get("/api/v1/clientes/")
    assert response.status_code == 200
    data = response.json()
    print(f"   ✅ Listagem funcionou (total: {len(data)} clientes)")


def test_list_clientes_after_create(client: TestClient):
    """Testa listagem após criar clientes"""
    print("\n📋 Testando listagem após criação...")
    
    # Criar cliente
    cliente_data = {
        "nome": "Cliente Lista",
        "cep": "99999-999",
        "cidade": "Curitiba",
        "estado": "PR",
        "telefone": "41999999999"
    }
    
    create_response = client.post("/api/v1/clientes/", json=cliente_data)
    assert create_response.status_code in [200, 201]
    
    # Listar
    list_response = client.get("/api/v1/clientes/")
    assert list_response.status_code == 200
    
    clientes = list_response.json()
    assert len(clientes) >= 1
    
    # Verificar se o cliente criado está na lista
    found = any(c["nome"] == "Cliente Lista" for c in clientes)
    assert found, "Cliente criado não aparece na listagem"
    
    print(f"   ✅ Cliente aparece na listagem (total: {len(clientes)})")


def test_get_cliente_by_id(client: TestClient):
    """Testa busca de cliente por ID"""
    print("\n🔍 Testando busca por ID...")
    
    # Criar cliente
    cliente_data = {
        "nome": "Cliente Busca",
        "cep": "88888-888",
        "cidade": "Porto Alegre",
        "estado": "RS",
        "telefone": "51888888888"
    }
    
    create_response = client.post("/api/v1/clientes/", json=cliente_data)
    assert create_response.status_code in [200, 201]
    
    cliente_id = create_response.json()["id"]
    
    # Buscar por ID
    get_response = client.get(f"/api/v1/clientes/{cliente_id}")
    assert get_response.status_code == 200
    
    cliente = get_response.json()
    assert cliente["id"] == cliente_id
    assert cliente["nome"] == "Cliente Busca"
    
    print(f"   ✅ Cliente encontrado por ID: {cliente_id}")


# ============================================
# TESTES DE CRUD - UPDATE
# ============================================

def test_update_cliente(client: TestClient):
    """Testa atualização de cliente"""
    print("\n✏️ Testando atualização...")
    
    # Criar cliente
    cliente_data = {
        "nome": "Cliente Original",
        "cep": "77777-777",
        "cidade": "Brasília",
        "estado": "DF",
        "telefone": "61777777777"
    }
    
    create_response = client.post("/api/v1/clientes/", json=cliente_data)
    cliente_id = create_response.json()["id"]
    
    # Atualizar
    update_data = {"nome": "Cliente Atualizado"}
    update_response = client.patch(f"/api/v1/clientes/{cliente_id}", json=update_data)
    
    assert update_response.status_code == 200
    
    updated_cliente = update_response.json()
    assert updated_cliente["nome"] == "Cliente Atualizado"
    assert updated_cliente["cidade"] == "Brasília"  # Não deve mudar
    
    print(f"   ✅ Cliente {cliente_id} atualizado com sucesso")


# ============================================
# TESTES DE CRUD - DELETE
# ============================================

def test_delete_cliente(client: TestClient):
    """Testa exclusão de cliente"""
    print("\n🗑️ Testando exclusão...")
    
    # Criar cliente
    cliente_data = {
        "nome": "Cliente Deletar",
        "cep": "66666-666",
        "cidade": "Salvador",
        "estado": "BA",
        "telefone": "71666666666"
    }
    
    create_response = client.post("/api/v1/clientes/", json=cliente_data)
    cliente_id = create_response.json()["id"]
    
    # Deletar
    delete_response = client.delete(f"/api/v1/clientes/{cliente_id}")
    assert delete_response.status_code == 200
    
    # Verificar se foi deletado
    get_response = client.get(f"/api/v1/clientes/{cliente_id}")
    assert get_response.status_code == 404
    
    print(f"   ✅ Cliente {cliente_id} deletado com sucesso")


# ============================================
# TESTES DE EDGE CASES
# ============================================

def test_create_cliente_with_special_characters(client: TestClient):
    """Testa criação com caracteres especiais"""
    print("\n🔤 Testando caracteres especiais...")
    
    cliente_data = {
        "nome": "José da Silva Júnior",
        "cep": "12345-678",
        "cidade": "São José dos Campos",
        "estado": "SP",
        "telefone": "(11) 99999-9999"
    }
    
    response = client.post("/api/v1/clientes/", json=cliente_data)
    
    if response.status_code not in [200, 201]:
        print(f"   ⚠️ Falha com caracteres especiais: {response.text}")
    else:
        print(f"   ✅ Aceita caracteres especiais")


def test_create_cliente_with_long_name(client: TestClient):
    """Testa criação com nome muito longo"""
    print("\n📏 Testando nome longo...")
    
    cliente_data = {
        "nome": "A" * 200,  # Nome muito longo
        "cep": "12345-678",
        "cidade": "São Paulo",
        "estado": "SP",
        "telefone": "11999999999"
    }
    
    response = client.post("/api/v1/clientes/", json=cliente_data)
    
    if response.status_code not in [200, 201]:
        print(f"   ⚠️ Falha com nome longo: {response.text}")
    else:
        print(f"   ✅ Aceita nomes longos")


# ============================================
# TESTE DE PERFORMANCE
# ============================================

def test_performance_create_100_clientes(client: TestClient):
    """Testa performance criando 100 clientes"""
    print("\n⚡ Testando performance (100 clientes)...")
    
    import time
    
    start_time = time.time()
    errors = 0
    
    for i in range(100):
        cliente_data = {
            "nome": f"Cliente Performance {i}",
            "cep": f"{i:05d}-000",
            "cidade": "São Paulo",
            "estado": "SP",
            "telefone": f"119{i:08d}"
        }
        
        response = client.post("/api/v1/clientes/", json=cliente_data)
        if response.status_code not in [200, 201]:
            errors += 1
    
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"   ✅ {100 - errors} clientes criados em {duration:.2f}s")
    print(f"   ✅ Média: {duration/100*1000:.2f}ms por cliente")
    
    if errors > 0:
        print(f"   ⚠️ {errors} erros durante o teste")


# ============================================
# TESTE DE DIAGNÓSTICO COMPLETO
# ============================================

def test_diagnose_cliente_creation():
    """Diagnóstico completo do processo de criação de cliente"""
    print("\n🔬 DIAGNÓSTICO COMPLETO - Criação de Cliente")
    print("=" * 60)
    
    # Passo 1: Verificar imports
    print("\n1️⃣ Verificando imports...")
    try:
        from clientes.schema import Cliente, ClienteCreate
        from database.database import get_session_context
        print("   ✅ Imports OK")
    except Exception as e:
        print(f"   ❌ Erro nos imports: {e}")
        return
    
    # Passo 2: Verificar conexão
    print("\n2️⃣ Verificando conexão com banco...")
    try:
        with get_session_context() as session:
            from sqlalchemy import text
            session.execute(text("SELECT 1"))
            print("   ✅ Conexão OK")
    except Exception as e:
        print(f"   ❌ Erro de conexão: {e}")
        return
    
    # Passo 3: Criar cliente direto no banco
    print("\n3️⃣ Criando cliente direto no banco...")
    try:
        with get_session_context() as session:
            cliente = Cliente(
                nome="Diagnóstico Teste",
                cep="00000-000",
                cidade="Teste",
                estado="TS",
                telefone="00000000000"
            )
            session.add(cliente)
            session.commit()
            session.refresh(cliente)
            print(f"   ✅ Cliente criado com ID: {cliente.id}")
            
            # Verificar se foi salvo
            db_cliente = session.get(Cliente, cliente.id)
            if db_cliente:
                print(f"   ✅ Cliente recuperado: {db_cliente.nome}")
            else:
                print("   ❌ Cliente não encontrado após criação")
                
    except Exception as e:
        print(f"   ❌ Erro ao criar no banco: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 60)
    print("✅ DIAGNÓSTICO CONCLUÍDO")


if __name__ == "__main__":
    # Executar diagnóstico direto
    test_diagnose_cliente_creation()


