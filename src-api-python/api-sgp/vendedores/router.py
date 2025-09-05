from fastapi import APIRouter, HTTPException
from typing import List
from .schema import Vendedor, VendedorCreate, VendedorUpdate
from sqlmodel import Session, select

router = APIRouter(prefix="/vendedores", tags=["vendedores"])

def get_engine():
    from database.database import engine
    return engine

def get_session():
    with Session(get_engine()) as session:
        yield session

@router.get("/", response_model=List[Vendedor])
def get_vendedores():
    with Session(get_engine()) as session:
        statement = select(Vendedor)
        vendedores = session.exec(statement).all()
        return vendedores

@router.get("/{vendedor_id}", response_model=Vendedor)
def get_vendedor(vendedor_id: int):
    with Session(get_engine()) as session:
        vendedor = session.get(Vendedor, vendedor_id)
        if not vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        return vendedor

@router.post("/", response_model=Vendedor)
def create_vendedor(vendedor: VendedorCreate):
    with Session(get_engine()) as session:
        db_vendedor = Vendedor.model_validate(vendedor)
        session.add(db_vendedor)
        session.commit()
        session.refresh(db_vendedor)
        return db_vendedor

@router.patch("/{vendedor_id}", response_model=Vendedor)
def update_vendedor(vendedor_id: int, vendedor: VendedorUpdate):
    with Session(get_engine()) as session:
        db_vendedor = session.get(Vendedor, vendedor_id)
        if not db_vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        
        vendedor_data = vendedor.model_dump(exclude_unset=True)
        for field, value in vendedor_data.items():
            setattr(db_vendedor, field, value)
        
        session.add(db_vendedor)
        session.commit()
        session.refresh(db_vendedor)
        return db_vendedor

@router.delete("/{vendedor_id}")
def delete_vendedor(vendedor_id: int):
    with Session(get_engine()) as session:
        vendedor = session.get(Vendedor, vendedor_id)
        if not vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        
        session.delete(vendedor)
        session.commit()
        return {"message": "Vendedor deletado com sucesso"}