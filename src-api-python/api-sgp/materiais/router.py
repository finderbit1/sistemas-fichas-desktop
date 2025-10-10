from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .schema import Material, MaterialCreate, MaterialUpdate
from sqlmodel import Session, select
from base import get_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/materiais", tags=["materiais"])


@router.get("/", response_model=List[Material])
def list_materiais(session: Session = Depends(get_session)):
    """Lista todos os materiais"""
    try:
        statement = select(Material)
        materiais = session.exec(statement).all()
        logger.info(f"✅ {len(materiais)} materiais encontrados")
        return materiais
    except Exception as e:
        logger.error(f"❌ Erro ao listar materiais: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao listar materiais")


@router.get("/tipo/{tipo_producao}", response_model=List[Material])
def list_materiais_por_tipo(tipo_producao: str, session: Session = Depends(get_session)):
    """Lista materiais filtrados por tipo de produção"""
    try:
        statement = select(Material).where(Material.tipo_producao == tipo_producao, Material.active == True)
        materiais = session.exec(statement).all()
        logger.info(f"✅ {len(materiais)} materiais encontrados para {tipo_producao}")
        return materiais
    except Exception as e:
        logger.error(f"❌ Erro ao listar materiais por tipo: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao listar materiais")


@router.get("/{material_id}", response_model=Material)
def get_material(material_id: int, session: Session = Depends(get_session)):
    """Obtém um material específico por ID"""
    try:
        material = session.get(Material, material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")
        return material
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao obter material")


@router.post("/", response_model=Material)
def create_material(payload: MaterialCreate, session: Session = Depends(get_session)):
    """Cria um novo material"""
    try:
        # Verificar se já existe material com o mesmo nome e tipo
        exists = session.exec(
            select(Material).where(
                Material.name == payload.name,
                Material.tipo_producao == payload.tipo_producao
            )
        ).first()
        if exists:
            raise HTTPException(status_code=400, detail="Já existe um material com esse nome para este tipo de produção")

        db_obj = Material.model_validate(payload)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        logger.info(f"✅ Material criado: {db_obj.name} ({db_obj.tipo_producao})")
        return db_obj
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar material")


@router.patch("/{material_id}", response_model=Material)
def update_material(material_id: int, payload: MaterialUpdate, session: Session = Depends(get_session)):
    """Atualiza um material existente"""
    try:
        material = session.get(Material, material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(material, key, value)

        session.add(material)
        session.commit()
        session.refresh(material)
        logger.info(f"✅ Material atualizado: {material.name}")
        return material
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar material")


@router.delete("/{material_id}")
def delete_material(material_id: int, session: Session = Depends(get_session)):
    """Deleta um material"""
    try:
        material = session.get(Material, material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        session.delete(material)
        session.commit()
        logger.info(f"✅ Material deletado: {material.name}")
        return {"ok": True, "message": "Material deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao deletar material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao deletar material")



