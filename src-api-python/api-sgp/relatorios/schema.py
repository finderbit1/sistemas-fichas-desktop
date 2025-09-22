from sqlmodel import SQLModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

class TipoRelatorio(str, Enum):
    DIARIO = "diario"
    SEMANAL = "semanal"
    MENSAL = "mensal"

class RelatorioDiario(SQLModel):
    data: date
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    quantidade_produtos: int
    pedidos_cancelados: int
    valor_cancelados: float
    resumo_pagamento: Dict[str, Any]
    produtos_mais_vendidos: List[Dict[str, Any]]
    vendas_por_vendedor: List[Dict[str, Any]]
    # Filtros por pessoa
    filtro_tipo: Optional[str] = None  # "cliente", "vendedor", "designer"
    filtro_nome: Optional[str] = None
    dados_filtrados: Optional[Dict[str, Any]] = None

class RelatorioSemanal(SQLModel):
    semana_inicio: date
    semana_fim: date
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    comparativo_dias: List[Dict[str, Any]]
    top_clientes: List[Dict[str, Any]]
    # Filtros por pessoa
    filtro_tipo: Optional[str] = None  # "cliente", "vendedor", "designer"
    filtro_nome: Optional[str] = None
    dados_filtrados: Optional[Dict[str, Any]] = None

class RelatorioMensal(SQLModel):
    mes: int
    ano: int
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    comparativo_meses: List[Dict[str, Any]]
    top_clientes: List[Dict[str, Any]]
    produtos_mais_vendidos: List[Dict[str, Any]]
    produtos_menos_vendidos: List[Dict[str, Any]]
    distribuicao_pagamento: Dict[str, Any]
    lucratividade: Optional[Dict[str, Any]] = None
    # Filtros por pessoa
    filtro_tipo: Optional[str] = None  # "cliente", "vendedor", "designer"
    filtro_nome: Optional[str] = None
    dados_filtrados: Optional[Dict[str, Any]] = None

class RelatorioRequest(SQLModel):
    tipo: TipoRelatorio
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    mes: Optional[int] = None
    ano: Optional[int] = None

class RelatorioCliente(SQLModel):
    cliente: str
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    primeiro_pedido: Optional[date] = None
    ultimo_pedido: Optional[date] = None
    produtos_comprados: List[Dict[str, Any]]
    pedidos_por_status: Dict[str, int]
    valor_por_forma_pagamento: Dict[str, float]

class RelatorioVendedor(SQLModel):
    vendedor: str
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    clientes_atendidos: int
    produtos_vendidos: List[Dict[str, Any]]
    pedidos_por_status: Dict[str, int]
    performance_mensal: List[Dict[str, Any]]

class RelatorioDesigner(SQLModel):
    designer: str
    total_pedidos: int
    total_faturado: float
    ticket_medio: float
    clientes_atendidos: int
    produtos_desenhados: List[Dict[str, Any]]
    pedidos_por_status: Dict[str, int]
    performance_mensal: List[Dict[str, Any]]

# ===== Relatórios Dinâmicos (Matriz/Sintético) =====

class MatrizRequest(SQLModel):
    dim_x: str
    dim_y: str
    metrics: Optional[List[str]] = None  # ["qtd_pedidos", "qtd_itens", "valor_total", "ticket_medio"]
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    filtros: Optional[Dict[str, Any]] = None  # {cliente?, vendedor?, designer?, envio?, painel?}

class MatrizResponse(SQLModel):
    matriz: Dict[str, Dict[str, Any]]
    totais: Dict[str, Any]
    meta: Dict[str, Any]

class SinteticoRequest(SQLModel):
    group_by: List[str]
    metrics: Optional[List[str]] = None
    bucket_data: Optional[str] = None  # "dia" | "mes"
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    filtros: Optional[Dict[str, Any]] = None

class SinteticoLinha(SQLModel):
    group: Dict[str, Any]
    metrics: Dict[str, Any]

class SinteticoResponse(SQLModel):
    linhas: List[SinteticoLinha]
    totais: Dict[str, Any]
    meta: Dict[str, Any]
