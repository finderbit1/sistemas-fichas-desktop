"""
🔄 Script de Migração: SQLite → PostgreSQL

Migra todos os dados do SQLite para PostgreSQL preservando:
- Todos os registros
- IDs originais
- Relacionamentos
- Timestamps
"""

import sys
from sqlmodel import create_engine, Session, select
from sqlalchemy.exc import IntegrityError
from config_loader import load_database_config
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importar modelos
from pedidos.schema import Pedido
from clientes.schema import Cliente
from pagamentos.schema import Payments
from envios.schema import Envio
from designers.schema import Designer
from vendedores.schema import Vendedor
from descontos.schema import Desconto
from producoes.schema import ProducaoTipo
from tecidos.schema import Tecido
from materiais.schema import Material

def migrate_table(source_session: Session, target_session: Session, model_class, table_name: str):
    """
    Migra uma tabela do SQLite para PostgreSQL
    """
    logger.info(f"📊 Migrando tabela: {table_name}")
    
    try:
        # Buscar todos os registros do SQLite
        statement = select(model_class)
        records = source_session.exec(statement).all()
        
        if not records:
            logger.warning(f"⚠️  Tabela {table_name} está vazia")
            return 0
        
        logger.info(f"   Encontrados {len(records)} registros")
        
        # Inserir no PostgreSQL
        migrated = 0
        failed = 0
        
        for record in records:
            try:
                # Criar cópia do registro
                record_dict = record.model_dump()
                new_record = model_class(**record_dict)
                
                target_session.add(new_record)
                target_session.commit()
                migrated += 1
                
            except IntegrityError as e:
                target_session.rollback()
                failed += 1
                logger.warning(f"   ⚠️  Registro duplicado/erro: {e}")
                
            except Exception as e:
                target_session.rollback()
                failed += 1
                logger.error(f"   ❌ Erro ao migrar registro: {e}")
        
        logger.info(f"✅ {table_name}: {migrated} migrados, {failed} falharam")
        return migrated
        
    except Exception as e:
        logger.error(f"❌ Erro ao migrar tabela {table_name}: {e}")
        return 0


def main():
    """
    Função principal de migração
    """
    print("=" * 60)
    print("🔄 MIGRAÇÃO: SQLite → PostgreSQL")
    print("=" * 60)
    print()
    
    # Carregar configuração
    config = load_database_config()
    
    if config['type'] != 'postgresql':
        logger.error("❌ banco.conf deve estar configurado para PostgreSQL!")
        logger.error("   Altere DATABASE_TYPE=postgresql em banco.conf")
        sys.exit(1)
    
    # Criar engines
    logger.info("🔧 Criando conexões...")
    
    # SQLite (origem)
    sqlite_path = config['sqlite']['path']
    sqlite_url = f"sqlite:///./{sqlite_path}"
    source_engine = create_engine(sqlite_url)
    logger.info(f"📂 SQLite: {sqlite_path}")
    
    # PostgreSQL (destino)
    pg = config['postgres']
    postgres_url = f"postgresql+psycopg2://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
    target_engine = create_engine(postgres_url)
    logger.info(f"🐘 PostgreSQL: {pg['user']}@{pg['host']}:{pg['port']}/{pg['database']}")
    print()
    
    # Verificar se tabelas existem no PostgreSQL
    logger.info("🏗️  Criando tabelas no PostgreSQL...")
    from database.database import create_db_and_tables
    create_db_and_tables()
    logger.info("✅ Tabelas criadas")
    print()
    
    # Confirmar migração
    print("⚠️  ATENÇÃO: Esta operação irá migrar todos os dados do SQLite para PostgreSQL")
    print("   Os dados existentes no PostgreSQL serão preservados (sem deletar)")
    print()
    
    confirm = input("Deseja continuar? (s/N): ").strip().lower()
    if confirm != 's':
        logger.info("❌ Migração cancelada pelo usuário")
        sys.exit(0)
    
    print()
    logger.info("🚀 Iniciando migração...")
    print()
    
    # Ordem de migração (respeitar foreign keys)
    migrations = [
        (Designer, "designers"),
        (Vendedor, "vendedores"),
        (Cliente, "clientes"),
        (Payments, "formas_pagamento"),
        (Envio, "formas_envio"),
        (Desconto, "descontos"),
        (ProducaoTipo, "tipos_producao"),
        (Tecido, "tecidos"),
        (Material, "materiais"),
        (Pedido, "pedidos"),
    ]
    
    total_migrated = 0
    
    with Session(source_engine) as source_session:
        with Session(target_engine) as target_session:
            for model_class, table_name in migrations:
                count = migrate_table(source_session, target_session, model_class, table_name)
                total_migrated += count
                print()
    
    # Resumo final
    print("=" * 60)
    print("✅ MIGRAÇÃO CONCLUÍDA!")
    print("=" * 60)
    print()
    print(f"📊 Total de registros migrados: {total_migrated}")
    print()
    print("🎯 Próximos passos:")
    print("   1. Verifique os dados no PostgreSQL")
    print("   2. Teste a API: ./start.sh")
    print("   3. Se tudo estiver OK, pode remover o arquivo SQLite")
    print()
    print("💡 Dica: Use um cliente PostgreSQL para verificar:")
    print(f"   psql -h {pg['host']} -p {pg['port']} -U {pg['user']} -d {pg['database']}")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Migração interrompida pelo usuário")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Erro fatal: {e}")
        sys.exit(1)

