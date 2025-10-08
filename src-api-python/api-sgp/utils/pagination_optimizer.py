"""
Sistema de paginação eficiente para melhor performance
"""
from fastapi import Query, HTTPException
from sqlmodel import Session, select, func, text
from typing import List, Optional, Dict, Any, TypeVar, Generic
from pydantic import BaseModel
import math
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')

class PaginationParams(BaseModel):
    """Parâmetros de paginação"""
    page: int = Query(1, ge=1, description="Número da página")
    size: int = Query(50, ge=1, le=1000, description="Tamanho da página")
    sort_by: Optional[str] = Query(None, description="Campo para ordenação")
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Ordem da classificação")

class PaginatedResponse(BaseModel, Generic[T]):
    """Resposta paginada"""
    items: List[T]
    total: int
    page: int
    size: int
    total_pages: int
    has_next: bool
    has_prev: bool

class EfficientPagination:
    """Sistema de paginação eficiente"""
    
    @staticmethod
    def paginate_query(
        session: Session,
        query: select,
        pagination: PaginationParams,
        count_query: Optional[select] = None
    ) -> PaginatedResponse[T]:
        """
        Paginação eficiente com cursor-based pagination quando possível
        """
        try:
            # Calcular offset
            offset = (pagination.page - 1) * pagination.size
            
            # Aplicar ordenação se especificada
            if pagination.sort_by:
                # Validar campo de ordenação (implementar validação específica)
                try:
                    sort_column = getattr(query.column_descriptions[0]['entity'], pagination.sort_by)
                    if pagination.sort_order == "desc":
                        query = query.order_by(sort_column.desc())
                    else:
                        query = query.order_by(sort_column.asc())
                except (AttributeError, IndexError):
                    logger.warning(f"⚠️ Campo de ordenação inválido: {pagination.sort_by}")
            
            # Executar query principal
            items = session.exec(
                query.offset(offset).limit(pagination.size)
            ).all()
            
            # Contar total de registros
            if count_query:
                total = session.exec(count_query).first()
            else:
                # Usar query de contagem otimizada
                count_query = select(func.count()).select_from(query.subquery())
                total = session.exec(count_query).first()
            
            # Calcular metadados de paginação
            total_pages = math.ceil(total / pagination.size) if total > 0 else 0
            has_next = pagination.page < total_pages
            has_prev = pagination.page > 1
            
            return PaginatedResponse(
                items=items,
                total=total,
                page=pagination.page,
                size=pagination.size,
                total_pages=total_pages,
                has_next=has_next,
                has_prev=has_prev
            )
            
        except Exception as e:
            logger.error(f"❌ Erro na paginação: {e}")
            raise HTTPException(status_code=500, detail="Erro na paginação")
    
    @staticmethod
    def cursor_paginate(
        session: Session,
        query: select,
        cursor: Optional[str] = None,
        size: int = 50,
        sort_field: str = "id"
    ) -> Dict[str, Any]:
        """
        Paginação baseada em cursor para melhor performance em grandes datasets
        """
        try:
            # Decodificar cursor se fornecido
            cursor_value = None
            if cursor:
                try:
                    cursor_value = int(cursor)
                except ValueError:
                    raise HTTPException(status_code=400, detail="Cursor inválido")
            
            # Aplicar filtro de cursor
            if cursor_value:
                sort_column = getattr(query.column_descriptions[0]['entity'], sort_field)
                query = query.where(sort_column > cursor_value)
            
            # Executar query com limite
            items = session.exec(
                query.order_by(getattr(query.column_descriptions[0]['entity'], sort_field))
                .limit(size + 1)  # +1 para detectar se há próxima página
            ).all()
            
            # Verificar se há próxima página
            has_next = len(items) > size
            if has_next:
                items = items[:-1]  # Remover item extra
            
            # Gerar próximo cursor
            next_cursor = None
            if items and has_next:
                last_item = items[-1]
                next_cursor = str(getattr(last_item, sort_field))
            
            return {
                "items": items,
                "next_cursor": next_cursor,
                "has_next": has_next,
                "size": len(items)
            }
            
        except Exception as e:
            logger.error(f"❌ Erro na paginação por cursor: {e}")
            raise HTTPException(status_code=500, detail="Erro na paginação por cursor")

class OptimizedPagination:
    """Paginação otimizada para diferentes cenários"""
    
    @staticmethod
    def get_pedidos_paginated(
        session: Session,
        page: int = 1,
        size: int = 50,
        status: Optional[str] = None,
        cliente: Optional[str] = None,
        sort_by: str = "data_criacao",
        sort_order: str = "desc"
    ) -> PaginatedResponse:
        """
        Paginação otimizada para pedidos com filtros
        """
        try:
            # Query base otimizada
            from pedidos.schema import Pedido
            query = select(Pedido)
            count_query = select(func.count(Pedido.id))
            
            # Aplicar filtros
            if status:
                query = query.where(Pedido.status == status)
                count_query = count_query.where(Pedido.status == status)
            
            if cliente:
                query = query.where(Pedido.cliente.ilike(f"%{cliente}%"))
                count_query = count_query.where(Pedido.cliente.ilike(f"%{cliente}%"))
            
            # Criar parâmetros de paginação
            pagination = PaginationParams(
                page=page,
                size=size,
                sort_by=sort_by,
                sort_order=sort_order
            )
            
            return EfficientPagination.paginate_query(
                session, query, pagination, count_query
            )
            
        except Exception as e:
            logger.error(f"❌ Erro na paginação de pedidos: {e}")
            raise
    
    @staticmethod
    def get_clientes_paginated(
        session: Session,
        page: int = 1,
        size: int = 50,
        cidade: Optional[str] = None,
        nome: Optional[str] = None
    ) -> PaginatedResponse:
        """
        Paginação otimizada para clientes
        """
        try:
            from clientes.schema import Cliente
            query = select(Cliente)
            count_query = select(func.count(Cliente.id))
            
            # Aplicar filtros
            if cidade:
                query = query.where(Cliente.cidade.ilike(f"%{cidade}%"))
                count_query = count_query.where(Cliente.cidade.ilike(f"%{cidade}%"))
            
            if nome:
                query = query.where(Cliente.nome.ilike(f"%{nome}%"))
                count_query = count_query.where(Cliente.nome.ilike(f"%{nome}%"))
            
            pagination = PaginationParams(page=page, size=size, sort_by="nome")
            
            return EfficientPagination.paginate_query(
                session, query, pagination, count_query
            )
            
        except Exception as e:
            logger.error(f"❌ Erro na paginação de clientes: {e}")
            raise
    
    @staticmethod
    def get_stats_paginated(
        session: Session,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """
        Estatísticas paginadas para dashboards
        """
        try:
            from pedidos.schema import Pedido
            
            # Estatísticas por status
            status_stats = session.exec(
                select(
                    Pedido.status,
                    func.count(Pedido.id).label('count'),
                    func.sum(func.cast(Pedido.valor_total, func.Float)).label('total_value')
                )
                .group_by(Pedido.status)
                .offset((page - 1) * size)
                .limit(size)
            ).all()
            
            # Total de registros para paginação
            total_stats = session.exec(
                select(func.count(func.distinct(Pedido.status)))
            ).first()
            
            return {
                "stats": [
                    {
                        "status": stat.status,
                        "count": stat.count,
                        "total_value": stat.total_value
                    }
                    for stat in status_stats
                ],
                "pagination": {
                    "page": page,
                    "size": size,
                    "total": total_stats,
                    "total_pages": math.ceil(total_stats / size) if total_stats else 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Erro nas estatísticas paginadas: {e}")
            raise

# Funções de conveniência
def paginate_pedidos(session: Session, **kwargs) -> PaginatedResponse:
    """Paginação de pedidos com parâmetros flexíveis"""
    return OptimizedPagination.get_pedidos_paginated(session, **kwargs)

def paginate_clientes(session: Session, **kwargs) -> PaginatedResponse:
    """Paginação de clientes com parâmetros flexíveis"""
    return OptimizedPagination.get_clientes_paginated(session, **kwargs)

def cursor_paginate_pedidos(session: Session, cursor: Optional[str] = None, size: int = 50) -> Dict[str, Any]:
    """Paginação por cursor para pedidos"""
    from pedidos.schema import Pedido
    query = select(Pedido)
    return EfficientPagination.cursor_paginate(session, query, cursor, size)
