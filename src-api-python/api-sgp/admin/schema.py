from sqlmodel import SQLModel, Field
from typing import Optional

class UserBase(SQLModel):
    name: str
    password: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class UserCreate(UserBase):
    pass

class UserUpdate(SQLModel):
    name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(SQLModel):
    id: int
    name: str
