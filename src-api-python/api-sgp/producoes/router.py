from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .schema import ProducaoTipo, ProducaoTipoCreate, ProducaoTipoUpdate
from sqlmodel import Session, select
from base import get_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/producoes", tags=["producoes"])

@router.get("/tipos", response_model=List[ProducaoTipo])
def list_tipos(session: Session = Depends(get_session)):
    """Lista todos os tipos de produção"""
    try:
        statement = select(ProducaoTipo)
        tipos = session.exec(statement).all()
        logger.info(f"✅ {len(tipos)} tipos de produção encontrados")
        return tipos
    except Exception as e:
        logger.error(f"❌ Erro ao listar tipos de produção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao listar tipos de produção")

@router.get("/tipos/{tipo_id}", response_model=ProducaoTipo)
def get_tipo(tipo_id: int, session: Session = Depends(get_session)):
    """Obtém um tipo de produção específico por ID"""
    try:
        tipo = session.get(ProducaoTipo, tipo_id)
        if not tipo:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")
        return tipo
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter tipo de produção {tipo_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao obter tipo de produção")

@router.post("/tipos", response_model=ProducaoTipo)
def create_tipo(payload: ProducaoTipoCreate, session: Session = Depends(get_session)):
    """Cria um novo tipo de produção"""
    try:
        # Verificar se já existe tipo com o mesmo nome
        exists = session.exec(select(ProducaoTipo).where(ProducaoTipo.name == payload.name)).first()
        if exists:
            raise HTTPException(status_code=400, detail="Já existe um tipo com esse nome")

        db_obj = ProducaoTipo.model_validate(payload)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        logger.info(f"✅ Tipo de produção criado: {db_obj.name}")
        return db_obj
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar tipo de produção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar tipo de produção")

@router.patch("/tipos/{tipo_id}", response_model=ProducaoTipo)
def update_tipo(tipo_id: int, payload: ProducaoTipoUpdate, session: Session = Depends(get_session)):
    """Atualiza um tipo de produção existente"""
    try:
        db_obj = session.get(ProducaoTipo, tipo_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")

        data = payload.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            # Verificar conflito de nome
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
        logger.info(f"✅ Tipo de produção atualizado: {db_obj.name}")
        return db_obj
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar tipo de produção {tipo_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar tipo de produção")

@router.delete("/tipos/{tipo_id}")
def delete_tipo(tipo_id: int, session: Session = Depends(get_session)):
    """Deleta um tipo de produção"""
    try:
        db_obj = session.get(ProducaoTipo, tipo_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Tipo de produção não encontrado")
        
        session.delete(db_obj)
        session.commit()
        logger.info(f"✅ Tipo de produção deletado: {db_obj.name}")
        return {"message": "Tipo de produção deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao deletar tipo de produção {tipo_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao deletar tipo de produção")




