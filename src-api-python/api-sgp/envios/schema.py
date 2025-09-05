from sqlmodel import SQLModel, Field
from typing import Optional, List
from decimal import Decimal

class EnvioBase(SQLModel):
    name: str
    value: Optional[float] = None

class Envio(EnvioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class EnvioCreate(EnvioBase):
    pass

class EnvioUpdate(SQLModel):
    name: Optional[str] = None
    value: Optional[float] = None