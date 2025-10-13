"""
Sistema de Lock (Trava) para Pedidos
Previne atualizações simultâneas que causam inconsistências
"""

from datetime import datetime, timedelta
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class PedidoLockManager:
    """
    Gerencia locks (travas) de pedidos para prevenir race conditions.
    
    Quando um cliente está editando um pedido, ele fica travado por X segundos.
    Outros clientes não podem editar durante esse tempo.
    """
    
    def __init__(self, lock_duration_seconds: int = 30):
        """
        Args:
            lock_duration_seconds: Duração do lock em segundos (padrão: 30)
        """
        self.locks: Dict[int, dict] = {}  # {pedido_id: {locked_by, locked_at, expires_at}}
        self.lock_duration = lock_duration_seconds
        
    def try_lock(self, pedido_id: int, client_id: str) -> bool:
        """
        Tenta travar um pedido para edição.
        
        Args:
            pedido_id: ID do pedido
            client_id: Identificador do cliente (IP, user_id, etc)
            
        Returns:
            True se conseguiu travar, False se já está travado
        """
        now = datetime.utcnow()
        
        # Verificar se já existe lock
        if pedido_id in self.locks:
            lock_info = self.locks[pedido_id]
            
            # Se o lock expirou, remover
            if now >= lock_info['expires_at']:
                logger.info(f"🔓 Lock expirado para pedido {pedido_id}, removendo...")
                del self.locks[pedido_id]
            else:
                # Lock ainda válido
                # Permitir se for o mesmo cliente
                if lock_info['locked_by'] == client_id:
                    # Renovar o lock
                    lock_info['locked_at'] = now
                    lock_info['expires_at'] = now + timedelta(seconds=self.lock_duration)
                    logger.info(f"🔄 Lock renovado para pedido {pedido_id} por {client_id}")
                    return True
                else:
                    # Outro cliente tem o lock
                    time_left = (lock_info['expires_at'] - now).total_seconds()
                    logger.warning(
                        f"🔒 Pedido {pedido_id} já está travado por {lock_info['locked_by']} "
                        f"(resta {time_left:.0f}s)"
                    )
                    return False
        
        # Criar novo lock
        self.locks[pedido_id] = {
            'locked_by': client_id,
            'locked_at': now,
            'expires_at': now + timedelta(seconds=self.lock_duration)
        }
        
        logger.info(f"🔒 Pedido {pedido_id} travado por {client_id} por {self.lock_duration}s")
        return True
    
    def unlock(self, pedido_id: int, client_id: str) -> bool:
        """
        Destrava um pedido manualmente.
        
        Args:
            pedido_id: ID do pedido
            client_id: Identificador do cliente que travou
            
        Returns:
            True se destravou, False se não tinha lock ou cliente diferente
        """
        if pedido_id not in self.locks:
            return False
        
        lock_info = self.locks[pedido_id]
        
        # Só pode destravar quem travou
        if lock_info['locked_by'] == client_id:
            del self.locks[pedido_id]
            logger.info(f"🔓 Pedido {pedido_id} destravado por {client_id}")
            return True
        
        logger.warning(
            f"⚠️ Cliente {client_id} tentou destravar pedido {pedido_id} "
            f"mas quem travou foi {lock_info['locked_by']}"
        )
        return False
    
    def is_locked(self, pedido_id: int) -> bool:
        """
        Verifica se um pedido está travado.
        Remove locks expirados automaticamente.
        
        Args:
            pedido_id: ID do pedido
            
        Returns:
            True se está travado, False caso contrário
        """
        if pedido_id not in self.locks:
            return False
        
        now = datetime.utcnow()
        lock_info = self.locks[pedido_id]
        
        # Se expirou, remover
        if now >= lock_info['expires_at']:
            del self.locks[pedido_id]
            return False
        
        return True
    
    def get_lock_info(self, pedido_id: int) -> Optional[dict]:
        """
        Retorna informações do lock de um pedido.
        
        Args:
            pedido_id: ID do pedido
            
        Returns:
            Dict com informações do lock ou None se não está travado
        """
        if not self.is_locked(pedido_id):
            return None
        
        lock_info = self.locks[pedido_id]
        now = datetime.utcnow()
        time_left = (lock_info['expires_at'] - now).total_seconds()
        
        return {
            'pedido_id': pedido_id,
            'locked_by': lock_info['locked_by'],
            'locked_at': lock_info['locked_at'].isoformat(),
            'expires_at': lock_info['expires_at'].isoformat(),
            'time_left_seconds': int(time_left)
        }
    
    def cleanup_expired(self) -> int:
        """
        Remove todos os locks expirados.
        
        Returns:
            Número de locks removidos
        """
        now = datetime.utcnow()
        expired = [
            pedido_id for pedido_id, lock_info in self.locks.items()
            if now >= lock_info['expires_at']
        ]
        
        for pedido_id in expired:
            del self.locks[pedido_id]
        
        if expired:
            logger.info(f"🧹 Removidos {len(expired)} locks expirados")
        
        return len(expired)
    
    def get_all_locks(self) -> list:
        """
        Retorna todos os locks ativos.
        
        Returns:
            Lista de informações de locks
        """
        self.cleanup_expired()
        
        return [
            self.get_lock_info(pedido_id)
            for pedido_id in self.locks.keys()
        ]
    
    def force_unlock(self, pedido_id: int) -> bool:
        """
        Destrava um pedido forçadamente (admin).
        
        Args:
            pedido_id: ID do pedido
            
        Returns:
            True se destravou, False se não estava travado
        """
        if pedido_id in self.locks:
            del self.locks[pedido_id]
            logger.info(f"🔓 Pedido {pedido_id} destravado FORÇADAMENTE")
            return True
        return False


# Instância global do gerenciador de locks
lock_manager = PedidoLockManager(lock_duration_seconds=30)

