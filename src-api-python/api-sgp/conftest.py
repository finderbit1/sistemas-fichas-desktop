"""
Configuração do pytest para os testes
"""

import pytest
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Desabilitar cache Redis durante testes
os.environ["REDIS_ENABLED"] = "false"

# Configurar pytest para mostrar prints
pytest_plugins = []


def pytest_configure(config):
    """Configuração inicial do pytest"""
    print("\n" + "=" * 60)
    print("🧪 INICIANDO TESTES - Sistema de Fichas")
    print("=" * 60)


def pytest_sessionfinish(session, exitstatus):
    """Executado após todos os testes"""
    print("\n" + "=" * 60)
    print("✅ TESTES CONCLUÍDOS")
    print("=" * 60)



