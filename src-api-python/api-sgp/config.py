import os
from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_TYPE: Literal["sqlite", "postgresql"] = "sqlite"
    
    # SQLite Configuration
    SQLITE_DATABASE_URL: str = "sqlite:///db/banco.db"
    
    # PostgreSQL Configuration
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "sistema_fichas"
    
    # Database URL (auto-generated based on DATABASE_TYPE)
    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_TYPE == "postgresql":
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        else:
            return self.SQLITE_DATABASE_URL
    
    # Configurações da API
    API_V1_STR: str = ""
    PROJECT_NAME: str = "API Sistema de Fichas"
    VERSION: str = "0.1.0"
    
    # Configurações de CORS
    BACKEND_CORS_ORIGINS: list = ["*", "http://localhost:1420", "http://127.0.0.1:1420"]
    
    # Configurações de Segurança
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 dias
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()


