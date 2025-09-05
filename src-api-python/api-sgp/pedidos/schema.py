from sqlmodel import SQLModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime
from pydantic import validator

class Prioridade(str, Enum):
    NORMAL = "NORMAL"
    ALTA = "ALTA"

class Status(str, Enum):
    PENDENTE = "pendente"
    EM_PRODUCAO = "em_producao"
    PRONTO = "pronto"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"

class Acabamento(SQLModel):
    overloque: bool = False
    elastico: bool = False
    ilhos: bool = False

class ItemPedido(SQLModel):
    id: Optional[int] = None
    tipo_producao: str  # "painel", "totem", "lona", etc.
    descricao: str
    largura: str
    altura: str
    metro_quadrado: str
    vendedor: str
    designer: str
    tecido: str
    acabamento: Acabamento
    emenda: str  # "sem-emenda" ou "com-emenda"
    observacao: Optional[str] = None
    valor_unitario: str
    imagem: Optional[str] = None
    
    # Campos específicos para totem
    ilhos_qtd: Optional[str] = None
    ilhos_valor_unitario: Optional[str] = None
    ilhos_distancia: Optional[str] = None

class PedidoBase(SQLModel):
    numero: str
    data_entrada: str
    data_entrega: str
    observacao: Optional[str] = None
    prioridade: Prioridade
    status: Status = Status.PENDENTE
    
    # Dados do cliente
    cliente: str
    telefone_cliente: str
    cidade_cliente: str
    
    # Valores
    valor_total: str
    valor_frete: str
    valor_itens: str
    tipo_pagamento: str
    obs_pagamento: Optional[str] = None
    
    # Envio
    forma_envio: str
    forma_envio_id: int
    
    # Status de produção
    financeiro: bool = False
    sublimacao: bool = False
    costura: bool = False
    expedicao: bool = False

class PedidoCreate(PedidoBase):
    items: List[ItemPedido]

class PedidoUpdate(SQLModel):
    numero: Optional[str] = None
    data_entrada: Optional[str] = None
    data_entrega: Optional[str] = None
    observacao: Optional[str] = None
    prioridade: Optional[Prioridade] = None
    status: Optional[Status] = None
    
    # Dados do cliente
    cliente: Optional[str] = None
    telefone_cliente: Optional[str] = None
    cidade_cliente: Optional[str] = None
    
    # Valores
    valor_total: Optional[str] = None
    valor_frete: Optional[str] = None
    valor_itens: Optional[str] = None
    tipo_pagamento: Optional[str] = None
    obs_pagamento: Optional[str] = None
    
    # Envio
    forma_envio: Optional[str] = None
    forma_envio_id: Optional[int] = None
    
    # Status de produção
    financeiro: Optional[bool] = None
    sublimacao: Optional[bool] = None
    costura: Optional[bool] = None
    expedicao: Optional[bool] = None
    
    # Items
    items: Optional[List[ItemPedido]] = None

class Pedido(PedidoBase, table=True):
    __tablename__ = "pedidos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    items: Optional[str] = Field(default=None)  # JSON string
    data_criacao: Optional[datetime] = Field(default_factory=datetime.utcnow)
    ultima_atualizacao: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    @validator('data_criacao', 'ultima_atualizacao', pre=True)
    def parse_datetime(cls, v):
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class PedidoResponse(PedidoBase):
    id: int
    items: List[ItemPedido]
    data_criacao: datetime
    ultima_atualizacao: datetime



