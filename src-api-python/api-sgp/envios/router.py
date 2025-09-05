from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from base import get_session
from .schema import Envio, EnvioCreate, EnvioUpdate

router = APIRouter(prefix="/envios", tags=["envios"])

@router.post("/", response_model=Envio)
def create_envio(envio: EnvioCreate, session: Session = Depends(get_session)):
    db_envio = Envio(**envio.model_dump())
    session.add(db_envio)
    session.commit()
    session.refresh(db_envio)
    return db_envio

@router.get("/", response_model=list[Envio])
def list_envios(session: Session = Depends(get_session)):
    envios = session.exec(select(Envio)).all()
    return envios

@router.get("/{envio_id}", response_model=Envio)
def get_envio(envio_id: int, session: Session = Depends(get_session)):
    envio = session.get(Envio, envio_id)
    if not envio:
        raise HTTPException(status_code=404, detail="Tipo de envio não encontrado")
    return envio

@router.patch("/{envio_id}", response_model=Envio)
def update_envio(envio_id: int, envio_update: EnvioUpdate, session: Session = Depends(get_session)):
    db_envio = session.get(Envio, envio_id)
    if not db_envio:
        raise HTTPException(status_code=404, detail="Tipo de envio não encontrado")
    
    envio_data = envio_update.model_dump(exclude_unset=True)
    for field, value in envio_data.items():
        setattr(db_envio, field, value)
    
    session.add(db_envio)
    session.commit()
    session.refresh(db_envio)
    return db_envio

@router.delete("/{envio_id}")
def delete_envio(envio_id: int, session: Session = Depends(get_session)):
    db_envio = session.get(Envio, envio_id)
    if not db_envio:
        raise HTTPException(status_code=404, detail="Tipo de envio não encontrado")
    
    session.delete(db_envio)
    session.commit()
    return {"message": "Tipo de envio deletado com sucesso"}