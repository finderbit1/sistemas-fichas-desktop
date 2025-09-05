from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from .schema import Desconto, DescontoCreate, DescontoUpdate

def get_session():
    from database.database import engine
    with Session(engine) as session:
        yield session

router = APIRouter(prefix="/descontos", tags=["descontos"])

@router.post("/", response_model=Desconto)
def create_desconto(desconto: DescontoCreate, session: Session = Depends(get_session)):
    db_desconto = Desconto(**desconto.model_dump())
    session.add(db_desconto)
    session.commit()
    session.refresh(db_desconto)
    return db_desconto

@router.get("/", response_model=list[Desconto])
def list_descontos(session: Session = Depends(get_session)):
    descontos = session.exec(select(Desconto).order_by(Desconto.nivel)).all()
    return descontos

@router.get("/{desconto_id}", response_model=Desconto)
def get_desconto(desconto_id: int, session: Session = Depends(get_session)):
    desconto = session.get(Desconto, desconto_id)
    if not desconto:
        raise HTTPException(status_code=404, detail="Desconto não encontrado")
    return desconto

@router.patch("/{desconto_id}", response_model=Desconto)
def update_desconto(desconto_id: int, desconto_update: DescontoUpdate, session: Session = Depends(get_session)):
    db_desconto = session.get(Desconto, desconto_id)
    if not db_desconto:
        raise HTTPException(status_code=404, detail="Desconto não encontrado")
    
    desconto_data = desconto_update.model_dump(exclude_unset=True)
    for field, value in desconto_data.items():
        setattr(db_desconto, field, value)
    
    session.add(db_desconto)
    session.commit()
    session.refresh(db_desconto)
    return db_desconto

@router.delete("/{desconto_id}")
def delete_desconto(desconto_id: int, session: Session = Depends(get_session)):
    db_desconto = session.get(Desconto, desconto_id)
    if not db_desconto:
        raise HTTPException(status_code=404, detail="Desconto não encontrado")
    
    session.delete(db_desconto)
    session.commit()
    return {"message": "Desconto deletado com sucesso"}

@router.get("/calcular/{valor_total}", response_model=dict)
def calcular_desconto(valor_total: float, session: Session = Depends(get_session)):
    """Calcula o desconto aplicável baseado no valor total"""
    descontos = session.exec(select(Desconto).order_by(Desconto.valor_minimo.desc())).all()
    
    desconto_aplicavel = None
    for desconto in descontos:
        if valor_total >= desconto.valor_minimo:
            desconto_aplicavel = desconto
            break
    
    if desconto_aplicavel:
        valor_desconto = valor_total * (desconto_aplicavel.percentual / 100)
        valor_final = valor_total - valor_desconto
        return {
            "desconto_aplicado": desconto_aplicavel,
            "valor_original": valor_total,
            "valor_desconto": round(valor_desconto, 2),
            "valor_final": round(valor_final, 2),
            "percentual_aplicado": desconto_aplicavel.percentual
        }
    else:
        return {
            "desconto_aplicado": None,
            "valor_original": valor_total,
            "valor_desconto": 0,
            "valor_final": valor_total,
            "percentual_aplicado": 0
        }
