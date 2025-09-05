from sqlmodel import SQLModel, Field
from typing import Optional, List

class PaymentsBase(SQLModel):
    name: str
    value: Optional[float] = None

class Payments(PaymentsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PaymentsCreate(PaymentsBase):
    pass

class PaymentsUpdate(SQLModel):
    name: Optional[str] = None
    value: Optional[float] = None
    