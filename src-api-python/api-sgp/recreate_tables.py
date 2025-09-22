#!/usr/bin/env python3
"""
Script para recriar as tabelas do banco de dados
"""
import os
import sys
from pathlib import Path

# Adicionar o diretório atual ao path
sys.path.insert(0, str(Path(__file__).parent))

from database.database import engine, create_db_and_tables
from sqlmodel import SQLModel

def recreate_tables():
    """Recria todas as tabelas do banco de dados"""
    print("🔄 Recriando tabelas do banco de dados...")
    
    # Remover arquivo do banco se existir
    db_path = "db/banco.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"✅ Arquivo {db_path} removido")
    
    # Criar diretório db se não existir
    os.makedirs("db", exist_ok=True)
    
    # Recriar todas as tabelas
    try:
        create_db_and_tables()
        print("✅ Tabelas criadas com sucesso!")
        
        # Verificar se as tabelas foram criadas
        from sqlmodel import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Tabelas criadas: {tables}")
            
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = recreate_tables()
    if success:
        print("\n🎉 Banco de dados recriado com sucesso!")
        print("Agora você pode iniciar a API com: uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("\n💥 Falha ao recriar o banco de dados")
        sys.exit(1)













