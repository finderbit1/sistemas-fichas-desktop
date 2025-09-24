from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .schema import Designer, DesignerCreate, DesignerUpdate
from sqlmodel import Session, select
from base import get_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/designers", tags=["designers"])

@router.get("/", response_model=List[Designer])
def get_designers(session: Session = Depends(get_session)):
    """Lista todos os designers"""
    try:
        statement = select(Designer)
        designers = session.exec(statement).all()
        logger.info(f"✅ {len(designers)} designers encontrados")
        return designers
    except Exception as e:
        logger.error(f"❌ Erro ao listar designers: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao listar designers")

@router.get("/{designer_id}", response_model=Designer)
def get_designer(designer_id: int, session: Session = Depends(get_session)):
    """Obtém um designer específico por ID"""
    try:
        designer = session.get(Designer, designer_id)
        if not designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        return designer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter designer {designer_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao obter designer")

@router.post("/", response_model=Designer)
def create_designer(designer: DesignerCreate, session: Session = Depends(get_session)):
    """Cria um novo designer"""
    try:
        # Verificar se já existe designer com o mesmo nome
        existing = session.exec(select(Designer).where(Designer.name == designer.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Já existe um designer com este nome")
        
        db_designer = Designer.model_validate(designer)
        session.add(db_designer)
        session.commit()
        session.refresh(db_designer)
        logger.info(f"✅ Designer criado: {db_designer.name}")
        return db_designer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar designer: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar designer")

@router.patch("/{designer_id}", response_model=Designer)
def update_designer(designer_id: int, designer: DesignerUpdate, session: Session = Depends(get_session)):
    """Atualiza um designer existente"""
    try:
        db_designer = session.get(Designer, designer_id)
        if not db_designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        
        designer_data = designer.model_dump(exclude_unset=True)
        
        # Verificar conflito de nome se estiver sendo alterado
        if 'name' in designer_data:
            existing = session.exec(
                select(Designer).where(Designer.name == designer_data['name'], Designer.id != designer_id)
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Já existe outro designer com este nome")
        
        for field, value in designer_data.items():
            setattr(db_designer, field, value)
        
        session.add(db_designer)
        session.commit()
        session.refresh(db_designer)
        logger.info(f"✅ Designer atualizado: {db_designer.name}")
        return db_designer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar designer {designer_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar designer")

@router.delete("/{designer_id}")
def delete_designer(designer_id: int, session: Session = Depends(get_session)):
    """Deleta um designer"""
    try:
        designer = session.get(Designer, designer_id)
        if not designer:
            raise HTTPException(status_code=404, detail="Designer não encontrado")
        
        session.delete(designer)
        session.commit()
        logger.info(f"✅ Designer deletado: {designer.name}")
        return {"message": "Designer deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao deletar designer {designer_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao deletar designer")