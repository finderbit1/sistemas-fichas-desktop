from fastapi import APIRouter, HTTPException
from typing import List
from .schema import Tecido, TecidoCreate, TecidoUpdate
from sqlmodel import Session, select

router = APIRouter(prefix="/tecidos", tags=["tecidos"]) 


def get_engine():
    from database.database import engine
    return engine


@router.get("/", response_model=List[Tecido])
def list_tecidos():
    with Session(get_engine()) as session:
        statement = select(Tecido)
        rows = session.exec(statement).all()
        return rows


@router.get("/{tecido_id}", response_model=Tecido)
def get_tecido(tecido_id: int):
    with Session(get_engine()) as session:
        obj = session.get(Tecido, tecido_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Tecido não encontrado")
        return obj


@router.post("/", response_model=Tecido)
def create_tecido(payload: TecidoCreate):
    with Session(get_engine()) as session:
        # Evitar duplicidade de nome
        exists = session.exec(select(Tecido).where(Tecido.name == payload.name)).first()
        if exists:
            raise HTTPException(status_code=400, detail="Já existe um tecido com esse nome")

        obj = Tecido.model_validate(payload)
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj


@router.patch("/{tecido_id}", response_model=Tecido)
def update_tecido(tecido_id: int, payload: TecidoUpdate):
    with Session(get_engine()) as session:
        obj = session.get(Tecido, tecido_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Tecido não encontrado")

        data = payload.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            conflict = session.exec(select(Tecido).where(Tecido.name == data["name"], Tecido.id != tecido_id)).first()
            if conflict:
                raise HTTPException(status_code=400, detail="Nome já utilizado por outro tecido")

        for field, value in data.items():
            setattr(obj, field, value)
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj


@router.delete("/{tecido_id}")
def delete_tecido(tecido_id: int):
    with Session(get_engine()) as session:
        obj = session.get(Tecido, tecido_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Tecido não encontrado")
        session.delete(obj)
        session.commit()
        return {"message": "Tecido deletado com sucesso"}




