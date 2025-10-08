"""
Otimizações de consultas de banco de dados para melhor performance
"""
from sqlmodel import Session, select, func, text
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class OptimizedQueries:
    """Classe com consultas otimizadas para melhor performance"""
    
    @staticmethod
    def get_pedidos_paginated(
        session: Session, 
        page: int = 1, 
        size: int = 50,
        status: Optional[str] = None,
        cliente: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Consulta paginada otimizada para pedidos com filtros
        Usa índices para melhor performance
        """
        try:
            # Calcular offset
            offset = (page - 1) * size
            
            # Query base otimizada
            query = select(Pedido)
            count_query = select(func.count(Pedido.id))
            
            # Aplicar filtros se fornecidos
            if status:
                query = query.where(Pedido.status == status)
                count_query = count_query.where(Pedido.status == status)
            
            if cliente:
                query = query.where(Pedido.cliente.ilike(f"%{cliente}%"))
                count_query = count_query.where(Pedido.cliente.ilike(f"%{cliente}%"))
            
            # Executar consultas com índices otimizados
            pedidos = session.exec(
                query.order_by(Pedido.data_criacao.desc())
                .offset(offset)
                .limit(size)
            ).all()
            
            total = session.exec(count_query).first()
            
            return {
                "pedidos": pedidos,
                "total": total,
                "page": page,
                "size": size,
                "total_pages": (total + size - 1) // size if total else 0
            }
            
        except Exception as e:
            logger.error(f"❌ Erro na consulta paginada: {e}")
            raise
    
    @staticmethod
    def get_pedidos_by_date_range(
        session: Session,
        start_date: datetime,
        end_date: datetime,
        limit: int = 1000
    ) -> List[Any]:
        """
        Consulta otimizada por intervalo de datas
        Usa índice em data_criacao para melhor performance
        """
        try:
            return session.exec(
                select(Pedido)
                .where(Pedido.data_criacao.between(start_date, end_date))
                .order_by(Pedido.data_criacao.desc())
                .limit(limit)
            ).all()
            
        except Exception as e:
            logger.error(f"❌ Erro na consulta por data: {e}")
            raise
    
    @staticmethod
    def get_pedidos_stats(session: Session) -> Dict[str, Any]:
        """
        Estatísticas otimizadas de pedidos
        Usa agregações eficientes
        """
        try:
            # Estatísticas por status
            status_stats = session.exec(
                select(
                    Pedido.status,
                    func.count(Pedido.id).label('count'),
                    func.sum(func.cast(Pedido.valor_total, func.Float)).label('total_value')
                )
                .group_by(Pedido.status)
            ).all()
            
            # Total geral
            total_pedidos = session.exec(select(func.count(Pedido.id))).first()
            
            # Valor total geral
            total_value = session.exec(
                select(func.sum(func.cast(Pedido.valor_total, func.Float)))
            ).first()
            
            return {
                "total_pedidos": total_pedidos,
                "total_value": total_value,
                "status_stats": [
                    {
                        "status": stat.status,
                        "count": stat.count,
                        "total_value": stat.total_value
                    }
                    for stat in status_stats
                ]
            }
            
        except Exception as e:
            logger.error(f"❌ Erro nas estatísticas: {e}")
            raise
    
    @staticmethod
    def bulk_update_pedidos_status(
        session: Session,
        pedido_ids: List[int],
        new_status: str
    ) -> int:
        """
        Atualização em lote otimizada para status de pedidos
        """
        try:
            # Usar update direto para melhor performance
            result = session.exec(
                text("""
                    UPDATE pedidos 
                    SET status = :status, ultima_atualizacao = :now
                    WHERE id IN :ids
                """),
                {
                    "status": new_status,
                    "now": datetime.utcnow(),
                    "ids": tuple(pedido_ids)
                }
            )
            
            session.commit()
            return result.rowcount
            
        except Exception as e:
            session.rollback()
            logger.error(f"❌ Erro na atualização em lote: {e}")
            raise

# Importar modelo Pedido
from pedidos.schema import Pedido

