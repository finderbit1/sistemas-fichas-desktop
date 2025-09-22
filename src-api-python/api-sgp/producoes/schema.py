from sqlmodel import SQLModel, Field
from typing import Optional


class ProducaoTipoBase(SQLModel):
    name: str
    description: Optional[str] = None
    uses_fabric: bool = False
    active: bool = True


class ProducaoTipo(ProducaoTipoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class ProducaoTipoCreate(ProducaoTipoBase):
    pass


class ProducaoTipoUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    uses_fabric: Optional[bool] = None
    active: Optional[bool] = None




