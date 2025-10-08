"""
Router otimizado para pedidos com melhorias de performance
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from base import get_session
from .schema import Pedido, PedidoCreate, PedidoUpdate, PedidoResponse, ItemPedido, Acabamento
from datetime import datetime
from typing import List, Optional
import logging

# Importar otimizações
from utils.json_optimizer import serialize_items_fast, deserialize_items_fast
from utils.pagination_optimizer import paginate_pedidos, PaginationParams
from utils.advanced_cache import cached, cache_invalidate, get_cached, set_cached
from database.optimized_queries import OptimizedQueries

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

@router.post("/", response_model=PedidoResponse)
@cache_invalidate("pedidos")
def criar_pedido(pedido: PedidoCreate, session: Session = Depends(get_session)):
    """
    Cria um novo pedido com otimizações de performance
    """
    try:
        # Validar dados do pedido
        if not pedido.items:
            raise HTTPException(status_code=400, detail="Pedido deve conter pelo menos um item")
        
        # Converter o pedido para dict e preparar para o banco
        pedido_data = pedido.model_dump()
        
        # Usar serialização otimizada
        items_json = serialize_items_fast(pedido_data['items'])
        
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
        
        # Converter de volta para response usando deserialização otimizada
        pedido_dict = db_pedido.model_dump()
        pedido_dict['items'] = deserialize_items_fast(db_pedido.items)
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        logger.info(f"✅ Pedido criado: {db_pedido.numero}")
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar pedido: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar pedido")

@router.get("/", response_model=dict)
@cached(ttl=60, key_prefix="pedidos_list")
def listar_pedidos_paginado(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(50, ge=1, le=1000, description="Tamanho da página"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    cliente: Optional[str] = Query(None, description="Filtrar por cliente"),
    sort_by: str = Query("data_criacao", description="Campo para ordenação"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Ordem da classificação"),
    session: Session = Depends(get_session)
):
    """
    Lista pedidos com paginação otimizada e filtros
    """
    try:
        # Usar paginação otimizada
        result = paginate_pedidos(
            session=session,
            page=page,
            size=size,
            status=status,
            cliente=cliente,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Converter items usando deserialização otimizada
        for pedido in result.items:
            if hasattr(pedido, 'items') and pedido.items:
                pedido.items = deserialize_items_fast(pedido.items)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar pedidos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos: {str(e)}")

@router.get("/all", response_model=List[PedidoResponse])
@cached(ttl=30, key_prefix="pedidos_all")
def listar_todos_pedidos(session: Session = Depends(get_session)):
    """
    Lista todos os pedidos (para compatibilidade com código existente)
    """
    try:
        pedidos = session.exec(select(Pedido)).all()
        
        # Converter items usando deserialização otimizada
        response_pedidos = []
        for pedido in pedidos:
            items = deserialize_items_fast(pedido.items)
            
            pedido_dict = pedido.model_dump()
            pedido_dict['items'] = items
            
            # Tratar prioridade vazia ou inválida
            if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
                pedido_dict['prioridade'] = 'NORMAL'
            
            response_pedido = PedidoResponse(**pedido_dict)
            response_pedidos.append(response_pedido)
        
        return response_pedidos
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos: {str(e)}")

@router.get("/proximo-numero")
@cached(ttl=10, key_prefix="proximo_numero")
def obter_proximo_numero_pedido(session: Session = Depends(get_session)):
    """Obtém o próximo número de pedido incremental com cache"""
    try:
        # Buscar todos os números de pedidos existentes
        pedidos = session.exec(select(Pedido.numero)).all()
        
        if not pedidos:
            proximo_numero = 1
        else:
            # Converter strings para int, filtrar valores válidos e pegar o maior
            numeros_validos = []
            for num_str in pedidos:
                try:
                    num_int = int(num_str)
                    numeros_validos.append(num_int)
                except (ValueError, TypeError):
                    continue
            
            if numeros_validos:
                maior_numero = max(numeros_validos)
                proximo_numero = maior_numero + 1
            else:
                proximo_numero = 1
        
        # Contar total de pedidos para estatística
        total_pedidos = session.exec(select(func.count(Pedido.id))).first()
        
        return {
            "proximo_numero": proximo_numero,
            "total_pedidos": total_pedidos or 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter próximo número: {str(e)}")

@router.get("/{pedido_id}", response_model=PedidoResponse)
@cached(ttl=300, key_prefix="pedido_by_id")
def obter_pedido(pedido_id: int, session: Session = Depends(get_session)):
    """
    Obtém um pedido específico por ID com cache
    """
    try:
        pedido = session.get(Pedido, pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Converter items usando deserialização otimizada
        items = deserialize_items_fast(pedido.items)
        
        pedido_dict = pedido.model_dump()
        pedido_dict['items'] = items
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter pedido: {str(e)}")

@router.patch("/{pedido_id}", response_model=PedidoResponse)
@cache_invalidate("pedidos")
@cache_invalidate("pedido_by_id")
def atualizar_pedido(pedido_id: int, pedido_update: PedidoUpdate, session: Session = Depends(get_session)):
    """
    Atualiza um pedido existente com otimizações
    """
    try:
        db_pedido = session.get(Pedido, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Preparar dados para atualização
        update_data = pedido_update.model_dump(exclude_unset=True)
        
        # Usar serialização otimizada se items foram atualizados
        if 'items' in update_data and update_data['items'] is not None:
            update_data['items'] = serialize_items_fast(update_data['items'])
        
        # Atualizar timestamp
        update_data['ultima_atualizacao'] = datetime.utcnow()
        
        # Aplicar atualizações
        for field, value in update_data.items():
            setattr(db_pedido, field, value)
        
        session.add(db_pedido)
        session.commit()
        session.refresh(db_pedido)
        
        # Converter de volta para response usando deserialização otimizada
        items = deserialize_items_fast(db_pedido.items)
        
        pedido_dict = db_pedido.model_dump()
        pedido_dict['items'] = items
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar pedido: {str(e)}")

@router.delete("/{pedido_id}")
@cache_invalidate("pedidos")
def deletar_pedido(pedido_id: int, session: Session = Depends(get_session)):
    """
    Deleta um pedido existente
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
@cached(ttl=60, key_prefix="pedidos_by_status")
def listar_pedidos_por_status(status: str, session: Session = Depends(get_session)):
    """
    Lista pedidos por status específico com cache
    """
    try:
        from .schema import Status
        try:
            status_enum = Status(status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Status inválido: {status}")
        
        pedidos = session.exec(select(Pedido).where(Pedido.status == status_enum)).all()
        
        # Converter items usando deserialização otimizada
        response_pedidos = []
        for pedido in pedidos:
            items = deserialize_items_fast(pedido.items)
            
            pedido_dict = pedido.model_dump()
            pedido_dict['items'] = items
            
            # Tratar prioridade vazia ou inválida
            if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
                pedido_dict['prioridade'] = 'NORMAL'
            
            response_pedido = PedidoResponse(**pedido_dict)
            response_pedidos.append(response_pedido)
        
        return response_pedidos
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos por status: {str(e)}")

@router.get("/stats/summary")
@cached(ttl=300, key_prefix="pedidos_stats")
def obter_estatisticas_pedidos(session: Session = Depends(get_session)):
    """
    Obtém estatísticas resumidas dos pedidos
    """
    try:
        stats = OptimizedQueries.get_pedidos_stats(session)
        return stats
        
    except Exception as e:
        logger.error(f"❌ Erro ao obter estatísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

@router.post("/bulk-update-status")
@cache_invalidate("pedidos")
@cache_invalidate("pedidos_by_status")
def atualizar_status_em_lote(
    pedido_ids: List[int],
    new_status: str,
    session: Session = Depends(get_session)
):
    """
    Atualiza status de múltiplos pedidos em lote
    """
    try:
        from .schema import Status
        try:
            status_enum = Status(new_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Status inválido: {new_status}")
        
        updated_count = OptimizedQueries.bulk_update_pedidos_status(
            session, pedido_ids, new_status
        )
        
        return {
            "message": f"{updated_count} pedidos atualizados",
            "updated_count": updated_count,
            "new_status": new_status
        }
        
    except Exception as e:
        logger.error(f"❌ Erro na atualização em lote: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na atualização em lote: {str(e)}")
