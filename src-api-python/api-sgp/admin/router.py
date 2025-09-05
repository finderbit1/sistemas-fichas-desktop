from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from base import get_session
from .schema import User, UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = User(**user.model_dump())
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return UserResponse(id=db_user.id, name=db_user.name)

@router.get("/users/", response_model=list[UserResponse])
def get_all_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return [UserResponse(id=user.id, name=user.name) for user in users]

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return UserResponse(id=user.id, name=user.name)

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, session: Session = Depends(get_session)):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user_data = user_update.model_dump(exclude_unset=True)
    for field, value in user_data.items():
        setattr(db_user, field, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return UserResponse(id=db_user.id, name=db_user.name)

@router.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    session.delete(db_user)
    session.commit()
    return {"message": "Usuário deletado com sucesso"} 