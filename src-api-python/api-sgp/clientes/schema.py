from sqlmodel import SQLModel, Field
from typing import Optional

class ClienteBase(SQLModel):
    nome: str
    cep: str
    cidade: str
    estado: str
    telefone: str

class Cliente(ClienteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(SQLModel):
    nome: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    telefone: Optional[str] = None
    
