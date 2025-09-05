#!/usr/bin/env python3
"""
Script para configurar o banco PostgreSQL
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import settings
import sys

def create_database():
    """Cria o banco de dados se não existir"""
    try:
        # Conectar ao PostgreSQL (sem especificar database)
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Verificar se o banco existe
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"📊 Criando banco de dados '{settings.POSTGRES_DB}'...")
            cursor.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
            print("✅ Banco de dados criado com sucesso!")
        else:
            print(f"ℹ️  Banco de dados '{settings.POSTGRES_DB}' já existe.")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Erro de conexão com PostgreSQL: {e}")
        print("📋 Verifique se:")
        print("   - PostgreSQL está rodando")
        print("   - As credenciais estão corretas no arquivo .env")
        print("   - O usuário tem permissão para criar bancos")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_connection():
    """Testa a conexão com o banco"""
    try:
        from database.database import engine
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ Conexão com PostgreSQL testada com sucesso!")
            return True
    except Exception as e:
        print(f"❌ Erro ao testar conexão: {e}")
        return False

def main():
    print("🐘 Configurando PostgreSQL para Sistema de Fichas")
    print("=" * 50)
    
    print(f"📋 Configurações:")
    print(f"   Host: {settings.POSTGRES_HOST}")
    print(f"   Porta: {settings.POSTGRES_PORT}")
    print(f"   Usuário: {settings.POSTGRES_USER}")
    print(f"   Banco: {settings.POSTGRES_DB}")
    print()
    
    # Criar banco de dados
    if not create_database():
        sys.exit(1)
    
    # Testar conexão
    if not test_connection():
        print("❌ Falha no teste de conexão!")
        sys.exit(1)
    
    print()
    print("🎉 Setup do PostgreSQL concluído com sucesso!")
    print("📋 Próximos passos:")
    print("   1. Execute: uv run python recreate_tables.py")
    print("   2. Execute: uv run uvicorn main:app --reload")

if __name__ == "__main__":
    main()
