from sqlmodel import SQLModel, Field
from typing import Optional


class TecidoBase(SQLModel):
    name: str
    description: Optional[str] = None
    gsm: Optional[int] = None  # gramatura opcional
    composition: Optional[str] = None  # composição opcional
    active: bool = True


class Tecido(TecidoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class TecidoCreate(TecidoBase):
    pass


class TecidoUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    gsm: Optional[int] = None
    composition: Optional[str] = None
    active: Optional[bool] = None




