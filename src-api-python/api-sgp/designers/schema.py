from sqlmodel import SQLModel, Field
from typing import Optional

class DesignerBase(SQLModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    active: bool = True

class Designer(DesignerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class DesignerCreate(DesignerBase):
    pass

class DesignerUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None


