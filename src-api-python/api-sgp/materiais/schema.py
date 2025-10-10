from sqlmodel import SQLModel, Field
from typing import Optional


class MaterialBase(SQLModel):
    name: str
    description: Optional[str] = None
    tipo_producao: str  # painel, totem, lona, almofada, bolsinha
    active: bool = True


class Material(MaterialBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tipo_producao: Optional[str] = None
    active: Optional[bool] = None


