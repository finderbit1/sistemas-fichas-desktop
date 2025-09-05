import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = "sqlite:///db/banco.db"
    
    # Configurações da API
    API_V1_STR: str = ""
    PROJECT_NAME: str = "API Sistema de Fichas"
    VERSION: str = "0.1.0"
    
    # Configurações de CORS
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    # Configurações de Segurança
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 dias
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()


