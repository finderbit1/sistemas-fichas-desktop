from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from base import get_session
from .schema import Pedido, PedidoCreate, PedidoUpdate, PedidoResponse, ItemPedido, Acabamento
from datetime import datetime
from typing import List
import json

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

def items_to_json_string(items) -> str:
    """Converte lista de items para string JSON"""
    items_data = []
    for item in items:
        if hasattr(item, 'model_dump'):
            # Se for um objeto SQLModel
            item_dict = item.model_dump()
            # Converter acabamento para dict
            if hasattr(item, 'acabamento') and item.acabamento:
                item_dict['acabamento'] = item.acabamento.model_dump()
        else:
            # Se já for um dict
            item_dict = item.copy()
            # Converter acabamento para dict se existir
            if 'acabamento' in item_dict and hasattr(item_dict['acabamento'], 'model_dump'):
                item_dict['acabamento'] = item_dict['acabamento'].model_dump()
        items_data.append(item_dict)
    return json.dumps(items_data, ensure_ascii=False)

def json_string_to_items(items_json: str) -> List[ItemPedido]:
    """Converte string JSON para lista de items"""
    if not items_json:
        return []
    
    try:
        items_data = json.loads(items_json)
        items = []
        for item_data in items_data:
            # Criar objeto Acabamento
            acabamento_data = item_data.get('acabamento', {})
            acabamento = Acabamento(**acabamento_data)
            
            # Criar objeto ItemPedido
            item = ItemPedido(
                **{k: v for k, v in item_data.items() if k != 'acabamento'},
                acabamento=acabamento
            )
            items.append(item)
        return items
    except (json.JSONDecodeError, Exception) as e:
        print(f"Erro ao converter JSON para items: {e}")
        return []

@router.post("/", response_model=PedidoResponse)
def criar_pedido(pedido: PedidoCreate, session: Session = Depends(get_session)):
    """
    Cria um novo pedido com todos os dados fornecidos.
    Aceita o JSON completo com items, dados do cliente, valores, etc.
    """
    try:
        # Converter o pedido para dict e preparar para o banco
        pedido_data = pedido.model_dump()
        
        # Converter items para JSON string para armazenar no banco
        items_json = items_to_json_string(pedido_data['items'])
        
        # Criar o pedido no banco
        db_pedido = Pedido(
            **{k: v for k, v in pedido_data.items() if k != 'items'},
            items=items_json,
            data_criacao=datetime.utcnow(),
            ultima_atualizacao=datetime.utcnow()
        )
        
        session.add(db_pedido)
        session.commit()
        session.refresh(db_pedido)
        
        # Converter de volta para response
        pedido_dict = db_pedido.model_dump()
        pedido_dict['items'] = pedido.items  # Usar os items originais
        return PedidoResponse(**pedido_dict)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar pedido: {str(e)}")

@router.get("/", response_model=List[PedidoResponse])
def listar_pedidos(session: Session = Depends(get_session)):
    """
    Lista todos os pedidos com seus items convertidos de volta para objetos.
    """
    try:
        pedidos = session.exec(select(Pedido)).all()
        
        # Converter items de JSON string para objetos
        response_pedidos = []
        for pedido in pedidos:
            items = json_string_to_items(pedido.items)
            
            pedido_dict = pedido.model_dump()
            pedido_dict['items'] = items
            response_pedido = PedidoResponse(**pedido_dict)
            response_pedidos.append(response_pedido)
        
        return response_pedidos
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos: {str(e)}")

@router.get("/{pedido_id}", response_model=PedidoResponse)
def obter_pedido(pedido_id: int, session: Session = Depends(get_session)):
    """
    Obtém um pedido específico por ID com seus items convertidos.
    """
    try:
        pedido = session.get(Pedido, pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Converter items de JSON string para objetos
        items = json_string_to_items(pedido.items)
        
        pedido_dict = pedido.model_dump()
        pedido_dict['items'] = items
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter pedido: {str(e)}")

@router.patch("/{pedido_id}", response_model=PedidoResponse)
def atualizar_pedido(pedido_id: int, pedido_update: PedidoUpdate, session: Session = Depends(get_session)):
    """
    Atualiza um pedido existente. Aceita atualizações parciais.
    """
    try:
        db_pedido = session.get(Pedido, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Preparar dados para atualização
        update_data = pedido_update.model_dump(exclude_unset=True)
        
        # Converter items para JSON string se existirem
        if 'items' in update_data and update_data['items'] is not None:
            update_data['items'] = items_to_json_string(update_data['items'])
        
        # Atualizar timestamp
        update_data['ultima_atualizacao'] = datetime.utcnow()
        
        # Aplicar atualizações
        for field, value in update_data.items():
            setattr(db_pedido, field, value)
        
        session.add(db_pedido)
        session.commit()
        session.refresh(db_pedido)
        
        # Converter de volta para response
        items = json_string_to_items(db_pedido.items)
        
        pedido_dict = db_pedido.model_dump()
        pedido_dict['items'] = items
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar pedido: {str(e)}")

@router.delete("/{pedido_id}")
def deletar_pedido(pedido_id: int, session: Session = Depends(get_session)):
    """
    Deleta um pedido existente.
    """
    try:
        db_pedido = session.get(Pedido, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        session.delete(db_pedido)
        session.commit()
        return {"message": "Pedido deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar pedido: {str(e)}")

@router.get("/status/{status}", response_model=List[PedidoResponse])
def listar_pedidos_por_status(status: str, session: Session = Depends(get_session)):
    """
    Lista pedidos por status específico.
    """
    try:
        from .schema import Status
        try:
            status_enum = Status(status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Status inválido: {status}")
        
        pedidos = session.exec(select(Pedido).where(Pedido.status == status_enum)).all()
        
        # Converter items de JSON string para objetos
        response_pedidos = []
        for pedido in pedidos:
            items = json_string_to_items(pedido.items)
            
            pedido_dict = pedido.model_dump()
            pedido_dict['items'] = items
            response_pedido = PedidoResponse(**pedido_dict)
            response_pedidos.append(response_pedido)
        
        return response_pedidos
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos por status: {str(e)}")
