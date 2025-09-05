from sqlmodel import SQLModel, Field
from typing import Optional

class DescontoBase(SQLModel):
    nivel: int
    percentual: float
    valor_minimo: float
    descricao: str

class Desconto(DescontoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class DescontoCreate(DescontoBase):
    pass

class DescontoUpdate(SQLModel):
    nivel: Optional[int] = None
    percentual: Optional[float] = None
    valor_minimo: Optional[float] = None
    descricao: Optional[str] = None
