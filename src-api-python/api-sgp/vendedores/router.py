from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .schema import Vendedor, VendedorCreate, VendedorUpdate
from sqlmodel import Session, select
from base import get_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vendedores", tags=["vendedores"])

@router.get("/", response_model=List[Vendedor])
def get_vendedores(session: Session = Depends(get_session)):
    """Lista todos os vendedores"""
    try:
        statement = select(Vendedor)
        vendedores = session.exec(statement).all()
        logger.info(f"✅ {len(vendedores)} vendedores encontrados")
        return vendedores
    except Exception as e:
        logger.error(f"❌ Erro ao listar vendedores: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao listar vendedores")

@router.get("/{vendedor_id}", response_model=Vendedor)
def get_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    """Obtém um vendedor específico por ID"""
    try:
        vendedor = session.get(Vendedor, vendedor_id)
        if not vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        return vendedor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter vendedor {vendedor_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao obter vendedor")

@router.post("/", response_model=Vendedor)
def create_vendedor(vendedor: VendedorCreate, session: Session = Depends(get_session)):
    """Cria um novo vendedor"""
    try:
        # Verificar se já existe vendedor com o mesmo nome
        existing = session.exec(select(Vendedor).where(Vendedor.name == vendedor.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Já existe um vendedor com este nome")
        
        db_vendedor = Vendedor.model_validate(vendedor)
        session.add(db_vendedor)
        session.commit()
        session.refresh(db_vendedor)
        logger.info(f"✅ Vendedor criado: {db_vendedor.name}")
        return db_vendedor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar vendedor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar vendedor")

@router.patch("/{vendedor_id}", response_model=Vendedor)
def update_vendedor(vendedor_id: int, vendedor: VendedorUpdate, session: Session = Depends(get_session)):
    """Atualiza um vendedor existente"""
    try:
        db_vendedor = session.get(Vendedor, vendedor_id)
        if not db_vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        
        vendedor_data = vendedor.model_dump(exclude_unset=True)
        
        # Verificar conflito de nome se estiver sendo alterado
        if 'name' in vendedor_data:
            existing = session.exec(
                select(Vendedor).where(Vendedor.name == vendedor_data['name'], Vendedor.id != vendedor_id)
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Já existe outro vendedor com este nome")
        
        for field, value in vendedor_data.items():
            setattr(db_vendedor, field, value)
        
        session.add(db_vendedor)
        session.commit()
        session.refresh(db_vendedor)
        logger.info(f"✅ Vendedor atualizado: {db_vendedor.name}")
        return db_vendedor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar vendedor {vendedor_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar vendedor")

@router.delete("/{vendedor_id}")
def delete_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    """Deleta um vendedor"""
    try:
        vendedor = session.get(Vendedor, vendedor_id)
        if not vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        
        session.delete(vendedor)
        session.commit()
        logger.info(f"✅ Vendedor deletado: {vendedor.name}")
        return {"message": "Vendedor deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao deletar vendedor {vendedor_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao deletar vendedor")