from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select, func
from base import get_session
from .schema import Pedido, PedidoCreate, PedidoUpdate, PedidoResponse, ItemPedido, Acabamento
from datetime import datetime
from typing import List
import json
import logging
from functools import lru_cache
import asyncio

logger = logging.getLogger(__name__)

# Importar o gerenciador de WebSocket
try:
    from websocket_manager import ws_manager
    WEBSOCKET_AVAILABLE = True
except ImportError:
    WEBSOCKET_AVAILABLE = False
    logger.warning("⚠️ WebSocket manager não disponível")

# Importar o gerenciador de locks
try:
    from .lock_manager import lock_manager
    LOCK_AVAILABLE = True
except ImportError:
    LOCK_AVAILABLE = False
    logger.warning("⚠️ Lock manager não disponível")

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

@lru_cache(maxsize=128)
def _serialize_item(item_data: dict) -> dict:
    """Serializa um item de forma otimizada"""
    if 'acabamento' in item_data and hasattr(item_data['acabamento'], 'model_dump'):
        item_data['acabamento'] = item_data['acabamento'].model_dump()
    return item_data

def items_to_json_string(items) -> str:
    """Converte lista de items para string JSON de forma otimizada"""
    if not items:
        return "[]"
    
    try:
        items_data = []
        for item in items:
            if hasattr(item, 'model_dump'):
                item_dict = item.model_dump()
            else:
                item_dict = item.copy()
            
            # Serializar acabamento se necessário
            if hasattr(item, 'acabamento') and item.acabamento:
                item_dict['acabamento'] = item.acabamento.model_dump()
            
            items_data.append(item_dict)
        
        return json.dumps(items_data, ensure_ascii=False, separators=(',', ':'))
    except Exception as e:
        logger.error(f"❌ Erro ao serializar items: {e}")
        return "[]"

def json_string_to_items(items_json: str) -> List[ItemPedido]:
    """Converte string JSON para lista de items de forma otimizada"""
    if not items_json or items_json.strip() == "[]":
        return []
    
    try:
        items_data = json.loads(items_json)
        if not items_data:
            return []
        
        items = []
        for item_data in items_data:
            try:
                # Criar objeto Acabamento com valores padrão
                acabamento_data = item_data.get('acabamento', {})
                acabamento = Acabamento(**acabamento_data)
                
                # Criar objeto ItemPedido
                item = ItemPedido(
                    **{k: v for k, v in item_data.items() if k != 'acabamento'},
                    acabamento=acabamento
                )
                items.append(item)
            except Exception as item_error:
                logger.warning(f"⚠️ Erro ao processar item: {item_error}")
                continue
        
        return items
    except json.JSONDecodeError as e:
        logger.error(f"❌ Erro de JSON ao converter items: {e}")
        return []
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao converter JSON para items: {e}")
        return []

async def notify_pedido_update(pedido_id: int, action: str, pedido_data: dict = None):
    """
    Envia notificação WebSocket sobre atualização de pedido.
    
    Args:
        pedido_id: ID do pedido
        action: Ação realizada ("create", "update", "delete")
        pedido_data: Dados do pedido (opcional)
    """
    if not WEBSOCKET_AVAILABLE:
        return
    
    try:
        await ws_manager.broadcast_pedido_update(
            pedido_id=pedido_id,
            action=action,
            data=pedido_data
        )
        logger.info(f"📡 Notificação enviada: {action} pedido {pedido_id}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar notificação WebSocket: {e}")

@router.post("/", response_model=PedidoResponse)
async def criar_pedido(pedido: PedidoCreate, session: Session = Depends(get_session)):
    """
    Cria um novo pedido com todos os dados fornecidos.
    Aceita o JSON completo com items, dados do cliente, valores, etc.
    """
    try:
        # Validar dados do pedido
        if not pedido.items:
            raise HTTPException(status_code=400, detail="Pedido deve conter pelo menos um item")
        
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
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        response = PedidoResponse(**pedido_dict)
        
        # Notificar clientes via WebSocket
        asyncio.create_task(notify_pedido_update(
            pedido_id=db_pedido.id,
            action="create",
            pedido_data=pedido_dict
        ))
        
        logger.info(f"✅ Pedido criado: {db_pedido.numero}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar pedido: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar pedido")

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
            
            # Tratar prioridade vazia ou inválida
            if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
                pedido_dict['prioridade'] = 'NORMAL'
            
            response_pedido = PedidoResponse(**pedido_dict)
            response_pedidos.append(response_pedido)
        
        return response_pedidos
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pedidos: {str(e)}")

@router.get("/proximo-numero")
def obter_proximo_numero_pedido(session: Session = Depends(get_session)):
    """Obtém o próximo número de pedido incremental"""
    try:
        # Buscar todos os números de pedidos existentes
        pedidos = session.exec(select(Pedido.numero)).all()
        
        if not pedidos:
            # Se não há pedidos, começar do 1
            proximo_numero = 1
        else:
            # Converter strings para int, filtrar valores válidos e pegar o maior
            numeros_validos = []
            for num_str in pedidos:
                try:
                    num_int = int(num_str)
                    numeros_validos.append(num_int)
                except (ValueError, TypeError):
                    # Ignorar números inválidos
                    continue
            
            if numeros_validos:
                maior_numero = max(numeros_validos)
                proximo_numero = maior_numero + 1
            else:
                # Se nenhum número válido foi encontrado, começar do 1
                proximo_numero = 1
        
        # Contar total de pedidos para estatística
        total_pedidos = session.exec(select(func.count(Pedido.id))).first()
        
        # Log para debug
        print(f"🔢 DEBUG: Números encontrados: {numeros_validos if 'numeros_validos' in locals() else 'Nenhum'}")
        print(f"🔢 DEBUG: Próximo número calculado: {proximo_numero}")
        
        return {
            "proximo_numero": proximo_numero,
            "total_pedidos": total_pedidos or 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter próximo número: {str(e)}")

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
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        return PedidoResponse(**pedido_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter pedido: {str(e)}")

@router.patch("/{pedido_id}", response_model=PedidoResponse)
async def atualizar_pedido(
    pedido_id: int, 
    pedido_update: PedidoUpdate,
    request: Request,
    session: Session = Depends(get_session)
):
    """
    Atualiza um pedido existente. Aceita atualizações parciais.
    Sistema de lock previne atualizações simultâneas.
    """
    # Identificar cliente pelo IP
    client_id = request.client.host if request.client else "unknown"
    
    try:
        db_pedido = session.get(Pedido, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Tentar travar pedido antes de atualizar
        if LOCK_AVAILABLE:
            if not lock_manager.try_lock(pedido_id, client_id):
                # Pedido está travado por outro cliente
                lock_info = lock_manager.get_lock_info(pedido_id)
                raise HTTPException(
                    status_code=423,  # Locked
                    detail={
                        "message": "Pedido está sendo editado por outro usuário",
                        "locked_by": lock_info['locked_by'],
                        "time_left": lock_info['time_left_seconds'],
                        "pedido_id": pedido_id
                    }
                )
        
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
        
        # Tratar prioridade vazia ou inválida
        if not pedido_dict.get('prioridade') or pedido_dict['prioridade'] == '':
            pedido_dict['prioridade'] = 'NORMAL'
        
        response = PedidoResponse(**pedido_dict)
        
        # Notificar clientes via WebSocket sobre atualização
        asyncio.create_task(notify_pedido_update(
            pedido_id=db_pedido.id,
            action="update",
            pedido_data=pedido_dict
        ))
        
        # Notificar sobre o lock
        if LOCK_AVAILABLE and WEBSOCKET_AVAILABLE:
            asyncio.create_task(ws_manager.broadcast({
                "type": "pedido_locked",
                "pedido_id": pedido_id,
                "locked_by": client_id,
                "action": "updated",
                "time_left": 30
            }, resource_type="pedidos"))
        
        logger.info(f"✅ Pedido {db_pedido.numero} atualizado por {client_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar pedido: {str(e)}")

@router.delete("/{pedido_id}")
async def deletar_pedido(pedido_id: int, session: Session = Depends(get_session)):
    """
    Deleta um pedido existente.
    """
    try:
        db_pedido = session.get(Pedido, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        session.delete(db_pedido)
        session.commit()
        
        # Notificar clientes via WebSocket
        asyncio.create_task(notify_pedido_update(
            pedido_id=pedido_id,
            action="delete"
        ))
        
        logger.info(f"🗑️ Pedido deletado: {pedido_id}")
        return {"message": "Pedido deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar pedido: {str(e)}")


# ============================================================================
# ENDPOINTS DE LOCK (TRAVA) DE PEDIDOS
# ============================================================================

@router.get("/{pedido_id}/lock")
async def verificar_lock_pedido(pedido_id: int):
    """
    Verifica se um pedido está travado.
    
    Retorna informações do lock se estiver travado, ou {"locked": False} se não.
    """
    if not LOCK_AVAILABLE:
        return {"locked": False, "message": "Sistema de lock não disponível"}
    
    if lock_manager.is_locked(pedido_id):
        lock_info = lock_manager.get_lock_info(pedido_id)
        return {
            "locked": True,
            **lock_info
        }
    
    return {"locked": False}


@router.delete("/{pedido_id}/lock")
async def remover_lock_pedido(pedido_id: int, request: Request):
    """
    Remove lock de um pedido manualmente.
    
    Apenas o cliente que travou pode destravar, exceto se for admin.
    """
    if not LOCK_AVAILABLE:
        raise HTTPException(
            status_code=501,
            detail="Sistema de lock não disponível"
        )
    
    client_id = request.client.host if request.client else "unknown"
    
    if lock_manager.unlock(pedido_id, client_id):
        # Notificar via WebSocket
        if WEBSOCKET_AVAILABLE:
            asyncio.create_task(ws_manager.broadcast({
                "type": "pedido_unlocked",
                "pedido_id": pedido_id,
                "unlocked_by": client_id
            }, resource_type="pedidos"))
        
        logger.info(f"🔓 Lock removido do pedido {pedido_id} por {client_id}")
        return {"success": True, "message": "Lock removido com sucesso"}
    
    # Verificar se existe lock
    if lock_manager.is_locked(pedido_id):
        lock_info = lock_manager.get_lock_info(pedido_id)
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Você não tem permissão para remover este lock",
                "locked_by": lock_info['locked_by'],
                "your_id": client_id
            }
        )
    
    return {"success": False, "message": "Pedido não está travado"}


@router.post("/{pedido_id}/lock/force")
async def forcar_remover_lock(pedido_id: int):
    """
    Remove lock de um pedido forçadamente (admin only).
    
    Use com cautela! Isso pode causar conflitos se alguém está editando.
    """
    if not LOCK_AVAILABLE:
        raise HTTPException(
            status_code=501,
            detail="Sistema de lock não disponível"
        )
    
    if lock_manager.force_unlock(pedido_id):
        # Notificar via WebSocket
        if WEBSOCKET_AVAILABLE:
            asyncio.create_task(ws_manager.broadcast({
                "type": "pedido_unlocked",
                "pedido_id": pedido_id,
                "unlocked_by": "admin",
                "forced": True
            }, resource_type="pedidos"))
        
        logger.warning(f"⚠️ Lock do pedido {pedido_id} removido FORÇADAMENTE")
        return {"success": True, "message": "Lock removido forçadamente"}
    
    return {"success": False, "message": "Pedido não estava travado"}


@router.get("/locks/all")
async def listar_todos_locks():
    """
    Lista todos os locks ativos no sistema.
    
    Útil para monitoramento e debug.
    """
    if not LOCK_AVAILABLE:
        return {"locks": [], "message": "Sistema de lock não disponível"}
    
    locks = lock_manager.get_all_locks()
    return {
        "locks": locks,
        "total": len(locks)
    }

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

