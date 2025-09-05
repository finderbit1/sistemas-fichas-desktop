from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select
from base import get_session
from .schema import Cliente, ClienteCreate, ClienteUpdate

router = APIRouter(prefix='/clientes', tags=["Clientes"])

@router.post("/", response_model=Cliente)
def create_cliente(cliente: ClienteCreate, session: Session = Depends(get_session)):
    db_cliente = Cliente(**cliente.model_dump())
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

@router.get("/", response_model=list[Cliente])
def read_clientes(session: Session = Depends(get_session)):
    clientes = session.exec(select(Cliente)).all()
    return clientes

@router.get("/{cliente_id}", response_model=Cliente)
def read_cliente(cliente_id: int, session: Session = Depends(get_session)):
    cliente = session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@router.patch("/{cliente_id}", response_model=Cliente)
def update_cliente(cliente_id: int, cliente_update: ClienteUpdate, session: Session = Depends(get_session)):
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    cliente_data = cliente_update.model_dump(exclude_unset=True)
    for field, value in cliente_data.items():
        setattr(db_cliente, field, value)
    
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

@router.delete("/{cliente_id}")
def delete_cliente(cliente_id: int, session: Session = Depends(get_session)):
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    session.delete(db_cliente)
    session.commit()
    return {"message": "Cliente deletado com sucesso"}