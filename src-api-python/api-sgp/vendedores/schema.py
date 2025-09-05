from sqlmodel import SQLModel, Field
from typing import Optional

class VendedorBase(SQLModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    active: bool = True

class Vendedor(VendedorBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class VendedorCreate(VendedorBase):
    pass

class VendedorUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None
