#!/usr/bin/env python3
"""
Script para alternar entre SQLite e PostgreSQL
Uso: python switch_database.py [sqlite|postgresql]
"""

import sys
import os
from pathlib import Path

def update_env_file(database_type):
    """Atualiza o arquivo .env com o tipo de banco selecionado"""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    # Se não existe .env, criar baseado no exemplo
    if not env_file.exists() and env_example.exists():
        print("📋 Criando arquivo .env baseado no env.example...")
        with open(env_example, 'r') as f:
            content = f.read()
        with open(env_file, 'w') as f:
            f.write(content)
    
    # Ler conteúdo atual do .env
    if env_file.exists():
        with open(env_file, 'r') as f:
            lines = f.readlines()
    else:
        print("❌ Arquivo .env não encontrado!")
        return False
    
    # Atualizar DATABASE_TYPE
    updated_lines = []
    for line in lines:
        if line.startswith('DATABASE_TYPE='):
            updated_lines.append(f'DATABASE_TYPE={database_type}\n')
        else:
            updated_lines.append(line)
    
    # Escrever arquivo atualizado
    with open(env_file, 'w') as f:
        f.writelines(updated_lines)
    
    return True

def show_current_config():
    """Mostra a configuração atual"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado!")
        return
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    print("🔧 Configuração atual do banco de dados:")
    print("-" * 50)
    
    for line in content.split('\n'):
        if line.startswith('DATABASE_TYPE='):
            db_type = line.split('=')[1]
            print(f"📊 Tipo: {db_type.upper()}")
        elif line.startswith('SQLITE_DATABASE_URL='):
            print(f"🗄️  SQLite: {line.split('=')[1]}")
        elif line.startswith('POSTGRES_HOST='):
            host = line.split('=')[1]
            print(f"🐘 PostgreSQL Host: {host}")
        elif line.startswith('POSTGRES_DB='):
            db = line.split('=')[1]
            print(f"🐘 PostgreSQL DB: {db}")

def main():
    if len(sys.argv) != 2:
        print("🔧 Script para alternar entre SQLite e PostgreSQL")
        print("Uso: python switch_database.py [sqlite|postgresql]")
        print()
        show_current_config()
        return
    
    database_type = sys.argv[1].lower()
    
    if database_type not in ['sqlite', 'postgresql']:
        print("❌ Tipo de banco inválido! Use 'sqlite' ou 'postgresql'")
        return
    
    print(f"🔄 Alternando para {database_type.upper()}...")
    
    if update_env_file(database_type):
        print(f"✅ Configuração alterada para {database_type.upper()}!")
        print()
        print("📋 Próximos passos:")
        if database_type == 'postgresql':
            print("1. Configure as variáveis do PostgreSQL no arquivo .env")
            print("2. Certifique-se de que o PostgreSQL está rodando")
            print("3. Execute: uv run python recreate_tables.py")
        else:
            print("1. Execute: uv run python recreate_tables.py")
        print("2. Execute: uv run uvicorn main:app --reload")
    else:
        print("❌ Erro ao atualizar configuração!")

if __name__ == "__main__":
    main()
