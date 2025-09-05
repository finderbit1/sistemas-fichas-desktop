from database.database import get_session, create_db_and_tables

# Re-export para manter compatibilidade
__all__ = ["get_session", "create_db_and_tables"]
