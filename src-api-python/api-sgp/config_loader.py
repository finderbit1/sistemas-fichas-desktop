"""
📁 Config Loader - Carrega configuração do arquivo banco.conf

Lê o arquivo banco.conf e retorna as configurações do banco de dados
"""

import os
from pathlib import Path
from typing import Dict, Optional

# Cache da configuração
_cached_config: Optional[Dict] = None


def parse_conf_file(content: str) -> Dict[str, str]:
    """
    Parser simples para arquivo .conf
    Formato: CHAVE=valor
    """
    config = {}
    lines = content.split('\n')
    
    for line in lines:
        # Ignorar comentários e linhas vazias
        trimmed = line.strip()
        if not trimmed or trimmed.startswith('#'):
            continue
        
        # Parse CHAVE=VALOR
        if '=' in trimmed:
            key, value = trimmed.split('=', 1)
            config[key.strip()] = value.strip()
    
    return config


def load_database_config(config_file: str = "banco.conf") -> Dict:
    """
    Carregar configuração do arquivo banco.conf
    
    Returns:
        Dict com configurações do banco de dados
    """
    global _cached_config
    
    # Retornar cache se já carregado
    if _cached_config:
        return _cached_config
    
    # Caminho do arquivo de configuração
    config_path = Path(__file__).parent / config_file
    
    try:
        # Ler arquivo
        if not config_path.exists():
            raise FileNotFoundError(f"Arquivo {config_file} não encontrado")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse
        parsed_config = parse_conf_file(content)
        
        # Mapear para estrutura esperada
        config = {
            'type': parsed_config.get('DATABASE_TYPE', 'sqlite').lower(),
            
            # PostgreSQL
            'postgres': {
                'host': parsed_config.get('POSTGRES_HOST', 'localhost'),
                'port': int(parsed_config.get('POSTGRES_PORT', '5432')),
                'database': parsed_config.get('POSTGRES_DB', 'sgp_fichas'),
                'user': parsed_config.get('POSTGRES_USER', 'sgp_user'),
                'password': parsed_config.get('POSTGRES_PASSWORD', 'sgp_password_123'),
            },
            
            # SQLite
            'sqlite': {
                'path': parsed_config.get('SQLITE_PATH', 'db/banco.db'),
            },
            
            # Pool
            'pool': {
                'min_size': int(parsed_config.get('POOL_MIN_SIZE', '5')),
                'max_size': int(parsed_config.get('POOL_MAX_SIZE', '20')),
                'timeout': int(parsed_config.get('CONNECTION_TIMEOUT', '10')),
            },
            
            'source': 'banco.conf'
        }
        
        _cached_config = config
        print(f"✅ Configuração de banco carregada: {config['type']}")
        print(f"📁 Fonte: {config['source']}")
        
        return config
        
    except FileNotFoundError:
        print(f"⚠️ Arquivo {config_file} não encontrado, usando configuração padrão")
        
        # Configuração padrão (SQLite)
        default_config = {
            'type': 'sqlite',
            'postgres': {
                'host': 'localhost',
                'port': 5432,
                'database': 'sgp_fichas',
                'user': 'sgp_user',
                'password': 'sgp_password_123',
            },
            'sqlite': {
                'path': 'db/banco.db',
            },
            'pool': {
                'min_size': 5,
                'max_size': 20,
                'timeout': 10,
            },
            'source': 'padrão (fallback)'
        }
        
        _cached_config = default_config
        return default_config
        
    except Exception as e:
        print(f"❌ Erro ao carregar configuração: {e}")
        raise


def get_database_url() -> str:
    """
    Obter URL de conexão do banco de dados
    
    Returns:
        String de conexão (SQLAlchemy format)
    """
    config = load_database_config()
    
    if config['type'] == 'postgresql':
        pg = config['postgres']
        url = f"postgresql+psycopg2://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
        print(f"🔗 URL PostgreSQL: postgresql://{pg['user']}@{pg['host']}:{pg['port']}/{pg['database']}")
        return url
    else:
        # SQLite
        sqlite_path = config['sqlite']['path']
        url = f"sqlite:///./{sqlite_path}"
        print(f"🔗 URL SQLite: {url}")
        return url


def reload_config():
    """
    Recarregar configuração (limpa cache)
    """
    global _cached_config
    _cached_config = None
    return load_database_config()


def get_current_config() -> Optional[Dict]:
    """
    Obter configuração atual (sem recarregar)
    """
    return _cached_config


# Auto-carregar ao importar
if __name__ != "__main__":
    try:
        load_database_config()
    except Exception as e:
        print(f"⚠️ Não foi possível carregar configuração: {e}")

