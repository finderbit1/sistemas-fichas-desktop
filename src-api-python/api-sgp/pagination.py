"""
Sistema de Paginação para API Sistema de Fichas
"""
from typing import List, TypeVar, Generic, Optional
from pydantic import BaseModel
from sqlmodel import SQLModel, select, func
from sqlalchemy import text

T = TypeVar('T')

class PaginationParams(BaseModel):
    """Parâmetros de paginação"""
    page: int = 1
    size: int = 50
    max_size: int = 1000
    
    def __init__(self, **data):
        super().__init__(**data)
        # Validar limites
        if self.page < 1:
            self.page = 1
        if self.size < 1:
            self.size = 50
        if self.size > self.max_size:
            self.size = self.max_size

class PaginatedResponse(BaseModel, Generic[T]):
    """Resposta paginada"""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

class PaginationHelper:
    """Helper para paginação"""
    
    @staticmethod
    def paginate_query(
        session,
        query,
        pagination: PaginationParams,
        model_class
    ) -> PaginatedResponse:
        """Aplica paginação a uma query"""
        
        # Calcular offset
        offset = (pagination.page - 1) * pagination.size
        
        # Obter total de registros
        count_query = select(func.count()).select_from(query.subquery())
        total = session.exec(count_query).first() or 0
        
        # Aplicar paginação
        paginated_query = query.offset(offset).limit(pagination.size)
        items = session.exec(paginated_query).all()
        
        # Calcular metadados
        pages = (total + pagination.size - 1) // pagination.size
        has_next = pagination.page < pages
        has_prev = pagination.page > 1
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=pages,
            has_next=has_next,
            has_prev=has_prev
        )
    
    @staticmethod
    def paginate_list(
        items: List[T],
        pagination: PaginationParams
    ) -> PaginatedResponse:
        """Aplica paginação a uma lista"""
        
        total = len(items)
        offset = (pagination.page - 1) * pagination.size
        
        # Aplicar paginação
        paginated_items = items[offset:offset + pagination.size]
        
        # Calcular metadados
        pages = (total + pagination.size - 1) // pagination.size
        has_next = pagination.page < pages
        has_prev = pagination.page > 1
        
        return PaginatedResponse(
            items=paginated_items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=pages,
            has_next=has_next,
            has_prev=has_prev
        )

# Funções utilitárias para paginação específica
def paginate_clientes(session, pagination: PaginationParams):
    """Pagina lista de clientes"""
    from clientes.schema import Cliente
    query = select(Cliente)
    return PaginationHelper.paginate_query(session, query, pagination, Cliente)

def paginate_pedidos(session, pagination: PaginationParams):
    """Pagina lista de pedidos"""
    from pedidos.schema import Pedido
    query = select(Pedido)
    return PaginationHelper.paginate_query(session, query, pagination, Pedido)

def paginate_producoes(session, pagination: PaginationParams):
    """Pagina lista de produções"""
    from producoes.schema import ProducaoTipo
    query = select(ProducaoTipo)
    return PaginationHelper.paginate_query(session, query, pagination, ProducaoTipo)
