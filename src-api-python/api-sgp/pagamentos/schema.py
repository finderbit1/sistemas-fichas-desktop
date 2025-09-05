from sqlmodel import SQLModel, Field
from typing import Optional, List

class PaymentsBase(SQLModel):
    name: str

class Payments(PaymentsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PaymentsCreate(PaymentsBase):
    pass

class PaymentsUpdate(SQLModel):
    name: Optional[str] = None
    