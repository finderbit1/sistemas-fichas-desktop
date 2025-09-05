from fastapi import APIRouter, HTTPException
from typing import List
from .schema import Designer, DesignerCreate, DesignerUpdate
from sqlmodel import Session, select

router = APIRouter(prefix="/designers", tags=["designers"])

def get_engine():
    from database.database import engine
    return engine

def get_session():
    with Session(get_engine()) as session:
        yield session

@router.get("/", response_model=List[Designer])
def get_designers():
    with Session(get_engine()) as session:
        statement = select(Designer)
        designers = session.exec(statement).all()
        return designers

@router.get("/{designer_id}", response_model=Designer)
def get_designer(designer_id: int):
    with Session(get_engine()) as session:
        designer = session.get(Designer, designer_id)
        if not designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        return designer

@router.post("/", response_model=Designer)
def create_designer(designer: DesignerCreate):
    with Session(get_engine()) as session:
        db_designer = Designer.model_validate(designer)
        session.add(db_designer)
        session.commit()
        session.refresh(db_designer)
        return db_designer

@router.patch("/{designer_id}", response_model=Designer)
def update_designer(designer_id: int, designer: DesignerUpdate):
    with Session(get_engine()) as session:
        db_designer = session.get(Designer, designer_id)
        if not db_designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        
        designer_data = designer.model_dump(exclude_unset=True)
        for field, value in designer_data.items():
            setattr(db_designer, field, value)
        
        session.add(db_designer)
        session.commit()
        session.refresh(db_designer)
        return db_designer

@router.delete("/{designer_id}")
def delete_designer(designer_id: int):
    with Session(get_engine()) as session:
        designer = session.get(Designer, designer_id)
        if not designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        
        session.delete(designer)
        session.commit()
        return {"message": "Designer deletado com sucesso"}