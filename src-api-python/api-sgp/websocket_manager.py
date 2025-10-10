"""
Gerenciador de conexões WebSocket para sincronização em tempo real.
"""

from fastapi import WebSocket
from typing import Dict, Set, Any
import json
import logging
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Gerencia conexões WebSocket ativas e broadcast de mensagens.
    """
    def __init__(self):
        # Dict[str, Set[WebSocket]] - organizado por tipo de recurso
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "pedidos": set(),
            "global": set()
        }
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, resource_type: str = "pedidos"):
        """
        Aceita e registra uma nova conexão WebSocket.
        
        Args:
            websocket: Conexão WebSocket
            resource_type: Tipo de recurso a monitorar ("pedidos", "global")
        """
        await websocket.accept()
        
        # Adicionar à lista de conexões ativas
        if resource_type not in self.active_connections:
            self.active_connections[resource_type] = set()
        
        self.active_connections[resource_type].add(websocket)
        
        # Armazenar metadata da conexão
        self.connection_metadata[websocket] = {
            "resource_type": resource_type,
            "connected_at": datetime.utcnow(),
            "client_info": None
        }
        
        # Log de conexão
        total_connections = sum(len(conns) for conns in self.active_connections.values())
        logger.info(f"✅ Nova conexão WebSocket [{resource_type}] - Total: {total_connections}")
        
        # Enviar mensagem de boas-vindas
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "message": f"Conectado ao canal {resource_type}",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
        
    def disconnect(self, websocket: WebSocket):
        """
        Remove uma conexão WebSocket.
        
        Args:
            websocket: Conexão WebSocket a ser removida
        """
        # Remover de todas as listas
        for resource_type, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
                logger.info(f"🔌 Desconexão WebSocket [{resource_type}]")
        
        # Remover metadata
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
        
        # Log total de conexões
        total_connections = sum(len(conns) for conns in self.active_connections.values())
        logger.info(f"📊 Conexões ativas: {total_connections}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Envia mensagem para uma conexão específica.
        
        Args:
            message: Dicionário com os dados da mensagem
            websocket: Conexão WebSocket destino
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem pessoal: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: dict, resource_type: str = "pedidos"):
        """
        Envia mensagem para todas as conexões de um tipo de recurso.
        
        Args:
            message: Dicionário com os dados da mensagem
            resource_type: Tipo de recurso ("pedidos", "global")
        """
        if resource_type not in self.active_connections:
            logger.warning(f"⚠️ Tipo de recurso desconhecido: {resource_type}")
            return
        
        # Adicionar timestamp se não existir
        if "timestamp" not in message:
            message["timestamp"] = datetime.utcnow().isoformat()
        
        # Lista de conexões a remover (se falharem)
        disconnected = []
        
        # Enviar para todas as conexões do tipo
        connections = self.active_connections[resource_type].copy()
        
        logger.info(f"📢 Broadcast para {len(connections)} clientes [{resource_type}]")
        
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"❌ Erro ao enviar broadcast: {e}")
                disconnected.append(connection)
        
        # Remover conexões que falharam
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_pedido_update(self, pedido_id: int, action: str, data: dict = None):
        """
        Envia notificação de atualização de pedido para todos os clientes.
        
        Args:
            pedido_id: ID do pedido atualizado
            action: Tipo de ação ("create", "update", "delete")
            data: Dados do pedido (opcional)
        """
        message = {
            "type": "pedido_update",
            "action": action,
            "pedido_id": pedido_id,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast(message, resource_type="pedidos")
    
    async def broadcast_status_update(self, pedido_id: int, status_field: str, new_value: bool):
        """
        Envia notificação de atualização de status específico.
        
        Args:
            pedido_id: ID do pedido
            status_field: Campo de status atualizado (ex: "financeiro", "conferencia")
            new_value: Novo valor do status
        """
        message = {
            "type": "status_update",
            "pedido_id": pedido_id,
            "status_field": status_field,
            "new_value": new_value,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast(message, resource_type="pedidos")
    
    def get_stats(self) -> dict:
        """
        Retorna estatísticas das conexões ativas.
        
        Returns:
            Dict com estatísticas
        """
        total = sum(len(conns) for conns in self.active_connections.values())
        
        return {
            "total_connections": total,
            "connections_by_type": {
                resource_type: len(connections)
                for resource_type, connections in self.active_connections.items()
            },
            "active_types": list(self.active_connections.keys())
        }

# Instância global do gerenciador
ws_manager = ConnectionManager()

