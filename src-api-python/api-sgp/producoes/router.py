from fastapi import APIRouter, HTTPException
from typing import List
from .schema import ProducaoTipo, ProducaoTipoCreate, ProducaoTipoUpdate
from sqlmodel import Session, select

router = APIRouter(prefix="/producoes", tags=["producoes"]) 


def get_engine():
    from database.database import engine
    return engine


@router.get("/tipos", response_model=List[ProducaoTipo])
def list_tipos():
    with Session(get_engine()) as session:
        statement = select(ProducaoTipo)
        tipos = session.exec(statement).all()
        return tipos


@router.get("/tipos/{tipo_id}", response_model=ProducaoTipo)
def get_tipo(tipo_id: int):
    with Session(get_engine()) as session:
        tipo = session.get(ProducaoTipo, tipo_id)
        if not tipo:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")
        return tipo


@router.post("/tipos", response_model=ProducaoTipo)
def create_tipo(payload: ProducaoTipoCreate):
    with Session(get_engine()) as session:
        # evitar duplicidade por name
        exists = session.exec(select(ProducaoTipo).where(ProducaoTipo.name == payload.name)).first()
        if exists:
            raise HTTPException(status_code=400, detail="Já existe um tipo com esse nome")

        db_obj = ProducaoTipo.model_validate(payload)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj


@router.patch("/tipos/{tipo_id}", response_model=ProducaoTipo)
def update_tipo(tipo_id: int, payload: ProducaoTipoUpdate):
    with Session(get_engine()) as session:
        db_obj = session.get(ProducaoTipo, tipo_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")

        data = payload.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            # checar conflito de nome
            conflict = session.exec(
                select(ProducaoTipo).where(ProducaoTipo.name == data["name"], ProducaoTipo.id != tipo_id)
            ).first()
            if conflict:
                raise HTTPException(status_code=400, detail="Nome já utilizado por outro tipo")

        for field, value in data.items():
            setattr(db_obj, field, value)

        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj


@router.delete("/tipos/{tipo_id}")
def delete_tipo(tipo_id: int):
    with Session(get_engine()) as session:
        db_obj = session.get(ProducaoTipo, tipo_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")
        session.delete(db_obj)
        session.commit()
        return {"message": "Tipo de produção deletado com sucesso"}




