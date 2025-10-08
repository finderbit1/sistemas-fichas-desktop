from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, JSONResponse
from sqlmodel import Session, select, func, text
from base import get_session
from .schema import (
    RelatorioDiario,
    RelatorioSemanal,
    RelatorioMensal,
    RelatorioRequest,
    TipoRelatorio,
    RelatorioCliente,
    RelatorioVendedor,
    RelatorioDesigner,
    MatrizRequest,
    MatrizResponse,
    SinteticoRequest,
    SinteticoResponse,
    SinteticoLinha,
    RelatorioEnviosRequest,
    RelatorioEnviosResponse,
    EnvioEstatistica,
    EnvioDetalhado,
)
from pedidos.schema import Pedido, Status
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
import json
from decimal import Decimal
from collections import defaultdict

# Função para verificar se o usuário é admin
def verificar_admin():
    # Por enquanto, sempre retorna True
    # Em um sistema real, você verificaria o token JWT ou sessão
    return True

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

def calcular_relatorio_diario(data: date, session: Session, filtro_tipo: str = None, filtro_nome: str = None) -> RelatorioDiario:
    """Calcula relatório diário para uma data específica"""
    
    # Buscar pedidos do dia
    pedidos_dia = session.exec(
        select(Pedido).where(
            func.date(Pedido.data_criacao) == data
        )
    ).all()
    
    # Aplicar filtro por pessoa se especificado
    if filtro_tipo and filtro_nome:
        pedidos_filtrados = []
        for pedido in pedidos_dia:
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                for item in items:
                    if filtro_tipo == "cliente" and pedido.cliente == filtro_nome:
                        pedidos_filtrados.append(pedido)
                        break
                    elif filtro_tipo == "vendedor" and item.get('vendedor') == filtro_nome:
                        pedidos_filtrados.append(pedido)
                        break
                    elif filtro_tipo == "designer" and item.get('designer') == filtro_nome:
                        pedidos_filtrados.append(pedido)
                        break
        pedidos_dia = pedidos_filtrados
    
    # Calcular totais
    total_pedidos = len(pedidos_dia)
    total_faturado = sum(float(p.valor_total) for p in pedidos_dia if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Pedidos cancelados
    pedidos_cancelados = [p for p in pedidos_dia if p.status == Status.CANCELADO]
    qtd_cancelados = len(pedidos_cancelados)
    valor_cancelados = sum(float(p.valor_total) for p in pedidos_cancelados)
    
    # Resumo por forma de pagamento
    resumo_pagamento = {}
    for pedido in pedidos_dia:
        if pedido.status != Status.CANCELADO:
            forma = pedido.tipo_pagamento
            if forma not in resumo_pagamento:
                resumo_pagamento[forma] = {"quantidade": 0, "valor": 0.0}
            resumo_pagamento[forma]["quantidade"] += 1
            resumo_pagamento[forma]["valor"] += float(pedido.valor_total)
    
    # Produtos mais vendidos
    produtos_vendidos = {}
    quantidade_produtos = 0
    
    for pedido in pedidos_dia:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                produto = item.get('descricao', 'Produto sem nome')
                if produto not in produtos_vendidos:
                    produtos_vendidos[produto] = {"quantidade": 0, "valor": 0.0}
                produtos_vendidos[produto]["quantidade"] += 1
                produtos_vendidos[produto]["valor"] += float(item.get('valor_unitario', 0))
                quantidade_produtos += 1
    
    produtos_mais_vendidos = sorted(
        [{"produto": k, **v} for k, v in produtos_vendidos.items()],
        key=lambda x: x["quantidade"],
        reverse=True
    )[:10]
    
    # Vendas por vendedor
    vendas_vendedor = {}
    for pedido in pedidos_dia:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                vendedor = item.get('vendedor', 'Sem vendedor')
                if vendedor not in vendas_vendedor:
                    vendas_vendedor[vendedor] = {"quantidade": 0, "valor": 0.0}
                vendas_vendedor[vendedor]["quantidade"] += 1
                vendas_vendedor[vendedor]["valor"] += float(item.get('valor_unitario', 0))
    
    vendas_por_vendedor = sorted(
        [{"vendedor": k, **v} for k, v in vendas_vendedor.items()],
        key=lambda x: x["valor"],
        reverse=True
    )
    
    # Dados específicos do filtro
    dados_filtrados = None
    if filtro_tipo and filtro_nome:
        if filtro_tipo == "cliente":
            dados_filtrados = {
                "tipo": "cliente",
                "nome": filtro_nome,
                "primeiro_pedido": min([p.data_criacao.date() for p in pedidos_dia]) if pedidos_dia else None,
                "ultimo_pedido": max([p.data_criacao.date() for p in pedidos_dia]) if pedidos_dia else None,
                "produtos_comprados": produtos_mais_vendidos[:10],
                "valor_por_forma_pagamento": resumo_pagamento
            }
        elif filtro_tipo == "vendedor":
            clientes_unicos = set(p.cliente for p in pedidos_dia)
            dados_filtrados = {
                "tipo": "vendedor",
                "nome": filtro_nome,
                "clientes_atendidos": len(clientes_unicos),
                "produtos_vendidos": produtos_mais_vendidos[:10],
                "performance_mensal": []  # Seria calculado se necessário
            }
        elif filtro_tipo == "designer":
            clientes_unicos = set(p.cliente for p in pedidos_dia)
            dados_filtrados = {
                "tipo": "designer",
                "nome": filtro_nome,
                "clientes_atendidos": len(clientes_unicos),
                "produtos_desenhados": produtos_mais_vendidos[:10],
                "performance_mensal": []  # Seria calculado se necessário
            }

    return RelatorioDiario(
        data=data,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        quantidade_produtos=quantidade_produtos,
        pedidos_cancelados=qtd_cancelados,
        valor_cancelados=valor_cancelados,
        resumo_pagamento=resumo_pagamento,
        produtos_mais_vendidos=produtos_mais_vendidos,
        vendas_por_vendedor=vendas_por_vendedor,
        filtro_tipo=filtro_tipo,
        filtro_nome=filtro_nome,
        dados_filtrados=dados_filtrados
    )

def calcular_relatorio_semanal(data_inicio: date, session: Session) -> RelatorioSemanal:
    """Calcula relatório semanal"""
    
    data_fim = data_inicio + timedelta(days=6)
    
    # Buscar pedidos da semana
    pedidos_semana = session.exec(
        select(Pedido).where(
            func.date(Pedido.data_criacao) >= data_inicio,
            func.date(Pedido.data_criacao) <= data_fim
        )
    ).all()
    
    # Calcular totais
    total_pedidos = len(pedidos_semana)
    total_faturado = sum(float(p.valor_total) for p in pedidos_semana if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Comparativo por dia
    comparativo_dias = []
    for i in range(7):
        dia_atual = data_inicio + timedelta(days=i)
        pedidos_dia = [p for p in pedidos_semana if p.data_criacao.date() == dia_atual]
        faturamento_dia = sum(float(p.valor_total) for p in pedidos_dia if p.status != Status.CANCELADO)
        
        comparativo_dias.append({
            "dia": dia_atual.strftime("%A"),
            "data": dia_atual.isoformat(),
            "pedidos": len(pedidos_dia),
            "faturamento": faturamento_dia
        })
    
    # Top clientes da semana
    clientes_semana = {}
    for pedido in pedidos_semana:
        if pedido.status != Status.CANCELADO:
            cliente = pedido.cliente
            if cliente not in clientes_semana:
                clientes_semana[cliente] = {"pedidos": 0, "valor": 0.0}
            clientes_semana[cliente]["pedidos"] += 1
            clientes_semana[cliente]["valor"] += float(pedido.valor_total)
    
    top_clientes = sorted(
        [{"cliente": k, **v} for k, v in clientes_semana.items()],
        key=lambda x: x["valor"],
        reverse=True
    )[:10]
    
    return RelatorioSemanal(
        semana_inicio=data_inicio,
        semana_fim=data_fim,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        comparativo_dias=comparativo_dias,
        top_clientes=top_clientes
    )

def calcular_relatorio_mensal(mes: int, ano: int, session: Session) -> RelatorioMensal:
    """Calcula relatório mensal"""
    
    # Buscar pedidos do mês
    pedidos_mes = session.exec(
        select(Pedido).where(
            func.extract('year', Pedido.data_criacao) == ano,
            func.extract('month', Pedido.data_criacao) == mes
        )
    ).all()
    
    # Calcular totais
    total_pedidos = len(pedidos_mes)
    total_faturado = sum(float(p.valor_total) for p in pedidos_mes if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Comparativo com meses anteriores
    comparativo_meses = []
    for i in range(1, 4):  # Últimos 3 meses
        mes_anterior = mes - i
        ano_anterior = ano
        if mes_anterior <= 0:
            mes_anterior += 12
            ano_anterior -= 1
        
        pedidos_anterior = session.exec(
            select(Pedido).where(
                func.extract('year', Pedido.data_criacao) == ano_anterior,
                func.extract('month', Pedido.data_criacao) == mes_anterior
            )
        ).all()
        
        faturamento_anterior = sum(float(p.valor_total) for p in pedidos_anterior if p.status != Status.CANCELADO)
        
        comparativo_meses.append({
            "mes": f"{mes_anterior:02d}/{ano_anterior}",
            "pedidos": len(pedidos_anterior),
            "faturamento": faturamento_anterior
        })
    
    # Top clientes do mês
    clientes_mes = {}
    for pedido in pedidos_mes:
        if pedido.status != Status.CANCELADO:
            cliente = pedido.cliente
            if cliente not in clientes_mes:
                clientes_mes[cliente] = {"pedidos": 0, "valor": 0.0}
            clientes_mes[cliente]["pedidos"] += 1
            clientes_mes[cliente]["valor"] += float(pedido.valor_total)
    
    top_clientes = sorted(
        [{"cliente": k, **v} for k, v in clientes_mes.items()],
        key=lambda x: x["valor"],
        reverse=True
    )[:10]
    
    # Produtos mais e menos vendidos
    produtos_mes = {}
    for pedido in pedidos_mes:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                produto = item.get('descricao', 'Produto sem nome')
                if produto not in produtos_mes:
                    produtos_mes[produto] = {"quantidade": 0, "valor": 0.0}
                produtos_mes[produto]["quantidade"] += 1
                produtos_mes[produto]["valor"] += float(item.get('valor_unitario', 0))
    
    produtos_mais_vendidos = sorted(
        [{"produto": k, **v} for k, v in produtos_mes.items()],
        key=lambda x: x["quantidade"],
        reverse=True
    )[:10]
    
    produtos_menos_vendidos = sorted(
        [{"produto": k, **v} for k, v in produtos_mes.items()],
        key=lambda x: x["quantidade"]
    )[:10]
    
    # Distribuição por forma de pagamento
    distribuicao_pagamento = {}
    for pedido in pedidos_mes:
        if pedido.status != Status.CANCELADO:
            forma = pedido.tipo_pagamento
            if forma not in distribuicao_pagamento:
                distribuicao_pagamento[forma] = {"quantidade": 0, "valor": 0.0}
            distribuicao_pagamento[forma]["quantidade"] += 1
            distribuicao_pagamento[forma]["valor"] += float(pedido.valor_total)
    
    return RelatorioMensal(
        mes=mes,
        ano=ano,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        comparativo_meses=comparativo_meses,
        top_clientes=top_clientes,
        produtos_mais_vendidos=produtos_mais_vendidos,
        produtos_menos_vendidos=produtos_menos_vendidos,
        distribuicao_pagamento=distribuicao_pagamento
    )

# ===== Relatórios Dinâmicos =====

DIMENSIONS = {
    "cliente": lambda p, item: getattr(p, "cliente", None) or "Não informado",
    "designer": lambda p, item: (item or {}).get("designer") or "Não informado",
    "vendedor": lambda p, item: (item or {}).get("vendedor") or "Não informado",
    "painel": lambda p, item: (item or {}).get("tipo_producao") or (item or {}).get("nome") or "Outro",
    "envio": lambda p, item: getattr(p, "forma_envio", None) or "Não informado",
    "data_dia": lambda p, item: p.data_criacao.date().isoformat(),
    "data_mes": lambda p, item: p.data_criacao.strftime("%Y-%m"),
}

DEFAULT_METRICS = ["qtd_pedidos", "qtd_itens", "valor_total", "ticket_medio"]

def metric_init():
    return {"_pedidos": set(), "qtd_itens": 0, "valor_total": Decimal("0")}

def acumular_metricas(m, pedido, item):
    if pedido.id is not None:
        m["_pedidos"].add(pedido.id)
    m["qtd_itens"] += 1
    try:
        valor_item = (item or {}).get("valor_unitario") or 0
        m["valor_total"] += Decimal(str(valor_item))
    except Exception:
        pass

def finalizar_metricas(m):
    qtd_pedidos = len(m["_pedidos"]) if m.get("_pedidos") is not None else 0
    valor_total = m["valor_total"]
    ticket = (valor_total / qtd_pedidos) if qtd_pedidos else Decimal("0")
    return {
        "qtd_pedidos": qtd_pedidos,
        "qtd_itens": m["qtd_itens"],
        "valor_total": float(valor_total),
        "ticket_medio": float(ticket),
    }

def filtrar_pedidos(pedidos, filtros, data_inicio=None, data_fim=None):
    def in_range(p):
        if data_inicio and p.data_criacao.date() < data_inicio:
            return False
        if data_fim and p.data_criacao.date() > data_fim:
            return False
        return True

    pedidos_base = [p for p in pedidos if in_range(p)]

    if not filtros:
        return pedidos_base

    def matches(p):
        # cliente
        if filtros.get("cliente") and (getattr(p, "cliente", "") or "").lower() != str(filtros["cliente"]).lower():
            return False
        # envio
        if filtros.get("envio") and (getattr(p, "forma_envio", "") or "").lower() != str(filtros["envio"]).lower():
            return False
        return True

    return [p for p in pedidos_base if matches(p)]

def iter_itens(pedido):
    if not pedido.items:
        return []
    items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
    return items if isinstance(items, list) else []

def item_atende_filtros(p, item, filtros: Dict[str, Any]):
    if not filtros:
        return True
    # Filtros por campos de item
    if filtros.get("designer"):
        if (item or {}).get("designer", "").lower() != str(filtros["designer"]).lower():
            return False
    if filtros.get("vendedor"):
        if (item or {}).get("vendedor", "").lower() != str(filtros["vendedor"]).lower():
            return False
    if filtros.get("painel"):
        tipo = (item or {}).get("tipo_producao") or (item or {}).get("nome") or ""
        if str(tipo).lower() != str(filtros["painel"]).lower():
            return False
    return True

@router.post("/matriz", response_model=MatrizResponse)
def relatorio_matriz(req: MatrizRequest, session: Session = Depends(get_session)):
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")

    if req.dim_x not in DIMENSIONS or req.dim_y not in DIMENSIONS:
        raise HTTPException(status_code=400, detail="Dimensão inválida. Use: " + ", ".join(DIMENSIONS.keys()))

    try:
        pedidos = session.exec(select(Pedido)).all()
        pedidos_f = filtrar_pedidos(pedidos, req.filtros or {}, req.data_inicio, req.data_fim)

        matriz = defaultdict(lambda: defaultdict(metric_init))
        totais = metric_init()

        for p in pedidos_f:
            for it in iter_itens(p):
                if not item_atende_filtros(p, it, req.filtros or {}):
                    continue
                x = DIMENSIONS[req.dim_x](p, it)
                y = DIMENSIONS[req.dim_y](p, it)
                acumular_metricas(matriz[x][y], p, it)
                acumular_metricas(totais, p, it)

        resposta_matriz = {
            x: {y: finalizar_metricas(m) for y, m in col.items()} for x, col in matriz.items()
        }

        return MatrizResponse(
            matriz=resposta_matriz,
            totais=finalizar_metricas(totais),
            meta={
                "dim_x": req.dim_x,
                "dim_y": req.dim_y,
                "metrics": req.metrics or DEFAULT_METRICS,
                "data_inicio": req.data_inicio,
                "data_fim": req.data_fim,
                "filtros": req.filtros or {},
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar matriz: {str(e)}")

@router.post("/sintetico", response_model=SinteticoResponse)
def relatorio_sintetico(req: SinteticoRequest, session: Session = Depends(get_session)):
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")

    if not req.group_by or any(dim not in DIMENSIONS for dim in req.group_by):
        raise HTTPException(status_code=400, detail="Group by inválido. Use: " + ", ".join(DIMENSIONS.keys()))

    try:
        pedidos = session.exec(select(Pedido)).all()
        pedidos_f = filtrar_pedidos(pedidos, req.filtros or {}, req.data_inicio, req.data_fim)

        agregados = defaultdict(metric_init)
        totais = metric_init()

        for p in pedidos_f:
            for it in iter_itens(p):
                if not item_atende_filtros(p, it, req.filtros or {}):
                    continue
                chave = tuple(DIMENSIONS[dim](p, it) for dim in req.group_by)
                acumular_metricas(agregados[chave], p, it)
                acumular_metricas(totais, p, it)

        linhas = []
        for chave, m in agregados.items():
            group_dict = {dim: chave[idx] for idx, dim in enumerate(req.group_by)}
            linhas.append(SinteticoLinha(group=group_dict, metrics=finalizar_metricas(m)))

        return SinteticoResponse(
            linhas=linhas,
            totais=finalizar_metricas(totais),
            meta={
                "group_by": req.group_by,
                "metrics": req.metrics or DEFAULT_METRICS,
                "data_inicio": req.data_inicio,
                "data_fim": req.data_fim,
                "filtros": req.filtros or {},
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar sintético: {str(e)}")

@router.post("/matriz/pdf")
def relatorio_matriz_pdf(req: MatrizRequest, session: Session = Depends(get_session)):
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")

    if req.dim_x not in DIMENSIONS or req.dim_y not in DIMENSIONS:
        raise HTTPException(status_code=400, detail="Dimensão inválida. Use: " + ", ".join(DIMENSIONS.keys()))

    try:
        pedidos = session.exec(select(Pedido)).all()
        pedidos_f = filtrar_pedidos(pedidos, req.filtros or {}, req.data_inicio, req.data_fim)

        matriz = defaultdict(lambda: defaultdict(metric_init))
        totais = metric_init()

        for p in pedidos_f:
            for it in iter_itens(p):
                if not item_atende_filtros(p, it, req.filtros or {}):
                    continue
                x = DIMENSIONS[req.dim_x](p, it)
                y = DIMENSIONS[req.dim_y](p, it)
                acumular_metricas(matriz[x][y], p, it)
                acumular_metricas(totais, p, it)

        resposta_matriz = {
            x: {y: finalizar_metricas(m) for y, m in col.items()} for x, col in matriz.items()
        }
        totais_final = finalizar_metricas(totais)

        # Montar HTML
        def esc(v):
            try:
                return str(v).replace("<", "&lt;").replace(">", "&gt;")
            except Exception:
                return str(v)

        linhas = []
        for x, col in resposta_matriz.items():
            for y, m in col.items():
                linhas.append(f"<tr><td>{esc(x)}</td><td>{esc(y)}</td><td>{m['qtd_pedidos']}</td><td>{m['qtd_itens']}</td><td>{m['valor_total']}</td><td>{m['ticket_medio']}</td></tr>")

        filtros_txt = esc(req.filtros or {})
        data_ini_txt = esc(req.data_inicio or "-")
        data_fim_txt = esc(req.data_fim or "-")
        titulo = f"Matriz {req.dim_x} × {req.dim_y}"

        html = f"""<!DOCTYPE html><html><head><meta charset=\"utf-8\" />
        <title>{esc(titulo)}</title>
        <style>
          body{{font-family: Arial, sans-serif; margin:20px;}}
          h2{{margin:0 0 8px 0}}
          p{{margin:0 0 12px 0}}
          table{{width:100%; border-collapse:collapse}}
          th,td{{border:1px solid #ddd; padding:8px; text-align:left}}
          th{{background:#f5f5f5; text-transform:uppercase; font-size:12px}}
          tfoot th{{font-weight:bold}}
        </style></head><body>
        <h2>{esc(titulo)}</h2>
        <p>Período: {data_ini_txt} a {data_fim_txt}</p>
        <p>Filtros: {filtros_txt}</p>
        <table>
          <thead><tr><th>{esc(req.dim_x)}</th><th>{esc(req.dim_y)}</th><th>qtd_pedidos</th><th>qtd_itens</th><th>valor_total</th><th>ticket_medio</th></tr></thead>
          <tbody>{''.join(linhas)}</tbody>
          <tfoot><tr><th colspan=\"2\">Totais</th><th>{totais_final['qtd_pedidos']}</th><th>{totais_final['qtd_itens']}</th><th>{totais_final['valor_total']}</th><th>{totais_final['ticket_medio']}</th></tr></tfoot>
        </table>
        </body></html>"""

        # Tentar gerar PDF via WeasyPrint se disponível
        try:
            from weasyprint import HTML  # type: ignore
            pdf_bytes = HTML(string=html).write_pdf()
            filename = f"matriz_{req.dim_x}_x_{req.dim_y}.pdf"
            return Response(content=pdf_bytes, media_type="application/pdf", headers={
                "Content-Disposition": f"attachment; filename={filename}"
            })
        except Exception:
            # Fallback: retornar HTML para impressão client-side
            return JSONResponse({"html": html, "fallback": "client_print"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF da matriz: {str(e)}")

@router.post("/diario", response_model=RelatorioDiario)
def gerar_relatorio_diario(data: date, filtro_tipo: str = None, filtro_nome: str = None, session: Session = Depends(get_session)):
    """Gera relatório diário para uma data específica - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_diario(data, session, filtro_tipo, filtro_nome)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório diário: {str(e)}")

@router.post("/semanal", response_model=RelatorioSemanal)
def gerar_relatorio_semanal(data_inicio: date, session: Session = Depends(get_session)):
    """Gera relatório semanal a partir de uma data de início - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_semanal(data_inicio, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório semanal: {str(e)}")

@router.post("/mensal", response_model=RelatorioMensal)
def gerar_relatorio_mensal(mes: int, ano: int, session: Session = Depends(get_session)):
    """Gera relatório mensal para um mês e ano específicos - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_mensal(mes, ano, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório mensal: {str(e)}")

@router.get("/ranking-produtos")
def obter_ranking_produtos(limite: int = 20, session: Session = Depends(get_session)):
    """Obtém ranking dos produtos mais vendidos - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        # Buscar todos os pedidos não cancelados
        pedidos = session.exec(
            select(Pedido).where(Pedido.status != Status.CANCELADO)
        ).all()
        
        produtos_ranking = {}
        for pedido in pedidos:
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                for item in items:
                    produto = item.get('descricao', 'Produto sem nome')
                    if produto not in produtos_ranking:
                        produtos_ranking[produto] = {
                            "quantidade": 0,
                            "valor_total": 0.0,
                            "vendas": 0
                        }
                    produtos_ranking[produto]["quantidade"] += 1
                    produtos_ranking[produto]["valor_total"] += float(item.get('valor_unitario', 0))
                    produtos_ranking[produto]["vendas"] += 1
        
        ranking = sorted(
            [{"produto": k, **v} for k, v in produtos_ranking.items()],
            key=lambda x: x["quantidade"],
            reverse=True
        )[:limite]
        
        return {"ranking": ranking, "total_produtos": len(produtos_ranking)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter ranking de produtos: {str(e)}")

@router.get("/cancelamentos")
def obter_relatorio_cancelamentos(session: Session = Depends(get_session)):
    """Obtém relatório de cancelamentos - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        pedidos_cancelados = session.exec(
            select(Pedido).where(Pedido.status == Status.CANCELADO)
        ).all()
        
        total_cancelados = len(pedidos_cancelados)
        valor_cancelados = sum(float(p.valor_total) for p in pedidos_cancelados)
        
        # Agrupar por motivo (se houver campo de observação)
        cancelamentos_por_motivo = {}
        for pedido in pedidos_cancelados:
            motivo = pedido.observacao or "Sem motivo informado"
            if motivo not in cancelamentos_por_motivo:
                cancelamentos_por_motivo[motivo] = {"quantidade": 0, "valor": 0.0}
            cancelamentos_por_motivo[motivo]["quantidade"] += 1
            cancelamentos_por_motivo[motivo]["valor"] += float(pedido.valor_total)
        
        return {
            "total_cancelamentos": total_cancelados,
            "valor_cancelamentos": valor_cancelados,
            "cancelamentos_por_motivo": cancelamentos_por_motivo
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter relatório de cancelamentos: {str(e)}")

def calcular_relatorio_cliente(nome_cliente: str, session: Session) -> RelatorioCliente:
    """Calcula relatório por cliente específico"""
    
    # Buscar pedidos do cliente
    pedidos_cliente = session.exec(
        select(Pedido).where(Pedido.cliente == nome_cliente)
    ).all()
    
    if not pedidos_cliente:
        raise HTTPException(status_code=404, detail=f"Cliente '{nome_cliente}' não encontrado")
    
    # Calcular totais
    total_pedidos = len(pedidos_cliente)
    total_faturado = sum(float(p.valor_total) for p in pedidos_cliente if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Datas
    datas_pedidos = [p.data_criacao.date() for p in pedidos_cliente]
    primeiro_pedido = min(datas_pedidos) if datas_pedidos else None
    ultimo_pedido = max(datas_pedidos) if datas_pedidos else None
    
    # Produtos comprados
    produtos_comprados = {}
    for pedido in pedidos_cliente:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                produto = item.get('descricao', 'Produto sem nome')
                if produto not in produtos_comprados:
                    produtos_comprados[produto] = {"quantidade": 0, "valor": 0.0}
                produtos_comprados[produto]["quantidade"] += 1
                produtos_comprados[produto]["valor"] += float(item.get('valor_unitario', 0))
    
    produtos_comprados_lista = sorted(
        [{"produto": k, **v} for k, v in produtos_comprados.items()],
        key=lambda x: x["quantidade"],
        reverse=True
    )
    
    # Pedidos por status
    pedidos_por_status = {}
    for pedido in pedidos_cliente:
        status = pedido.status.value if hasattr(pedido.status, 'value') else str(pedido.status)
        pedidos_por_status[status] = pedidos_por_status.get(status, 0) + 1
    
    # Valor por forma de pagamento
    valor_por_forma_pagamento = {}
    for pedido in pedidos_cliente:
        if pedido.status != Status.CANCELADO:
            forma = pedido.tipo_pagamento
            valor_por_forma_pagamento[forma] = valor_por_forma_pagamento.get(forma, 0) + float(pedido.valor_total)
    
    return RelatorioCliente(
        cliente=nome_cliente,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        primeiro_pedido=primeiro_pedido,
        ultimo_pedido=ultimo_pedido,
        produtos_comprados=produtos_comprados_lista,
        pedidos_por_status=pedidos_por_status,
        valor_por_forma_pagamento=valor_por_forma_pagamento
    )

def calcular_relatorio_vendedor(nome_vendedor: str, session: Session) -> RelatorioVendedor:
    """Calcula relatório por vendedor específico"""
    
    # Buscar todos os pedidos
    todos_pedidos = session.exec(select(Pedido)).all()
    
    # Filtrar pedidos do vendedor
    pedidos_vendedor = []
    for pedido in todos_pedidos:
        if pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                if item.get('vendedor') == nome_vendedor:
                    pedidos_vendedor.append(pedido)
                    break
    
    if not pedidos_vendedor:
        raise HTTPException(status_code=404, detail=f"Vendedor '{nome_vendedor}' não encontrado")
    
    # Calcular totais
    total_pedidos = len(pedidos_vendedor)
    total_faturado = sum(float(p.valor_total) for p in pedidos_vendedor if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Clientes únicos atendidos
    clientes_unicos = set(p.cliente for p in pedidos_vendedor)
    clientes_atendidos = len(clientes_unicos)
    
    # Produtos vendidos
    produtos_vendidos = {}
    for pedido in pedidos_vendedor:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                if item.get('vendedor') == nome_vendedor:
                    produto = item.get('descricao', 'Produto sem nome')
                    if produto not in produtos_vendidos:
                        produtos_vendidos[produto] = {"quantidade": 0, "valor": 0.0}
                    produtos_vendidos[produto]["quantidade"] += 1
                    produtos_vendidos[produto]["valor"] += float(item.get('valor_unitario', 0))
    
    produtos_vendidos_lista = sorted(
        [{"produto": k, **v} for k, v in produtos_vendidos.items()],
        key=lambda x: x["quantidade"],
        reverse=True
    )
    
    # Pedidos por status
    pedidos_por_status = {}
    for pedido in pedidos_vendedor:
        status = pedido.status.value if hasattr(pedido.status, 'value') else str(pedido.status)
        pedidos_por_status[status] = pedidos_por_status.get(status, 0) + 1
    
    # Performance mensal (últimos 6 meses)
    performance_mensal = []
    for i in range(6):
        data_inicio = date.today().replace(day=1) - timedelta(days=30*i)
        data_fim = data_inicio + timedelta(days=32)
        data_fim = data_fim.replace(day=1) - timedelta(days=1)
        
        pedidos_mes = [p for p in pedidos_vendedor if data_inicio <= p.data_criacao.date() <= data_fim]
        faturamento_mes = sum(float(p.valor_total) for p in pedidos_mes if p.status != Status.CANCELADO)
        
        performance_mensal.append({
            "mes": data_inicio.strftime("%m/%Y"),
            "pedidos": len(pedidos_mes),
            "faturamento": faturamento_mes
        })
    
    return RelatorioVendedor(
        vendedor=nome_vendedor,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        clientes_atendidos=clientes_atendidos,
        produtos_vendidos=produtos_vendidos_lista,
        pedidos_por_status=pedidos_por_status,
        performance_mensal=performance_mensal
    )

def calcular_relatorio_designer(nome_designer: str, session: Session) -> RelatorioDesigner:
    """Calcula relatório por designer específico"""
    
    # Buscar todos os pedidos
    todos_pedidos = session.exec(select(Pedido)).all()
    
    # Filtrar pedidos do designer
    pedidos_designer = []
    for pedido in todos_pedidos:
        if pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                if item.get('designer') == nome_designer:
                    pedidos_designer.append(pedido)
                    break
    
    if not pedidos_designer:
        raise HTTPException(status_code=404, detail=f"Designer '{nome_designer}' não encontrado")
    
    # Calcular totais
    total_pedidos = len(pedidos_designer)
    total_faturado = sum(float(p.valor_total) for p in pedidos_designer if p.status != Status.CANCELADO)
    ticket_medio = total_faturado / total_pedidos if total_pedidos > 0 else 0
    
    # Clientes únicos atendidos
    clientes_unicos = set(p.cliente for p in pedidos_designer)
    clientes_atendidos = len(clientes_unicos)
    
    # Produtos desenhados
    produtos_desenhados = {}
    for pedido in pedidos_designer:
        if pedido.status != Status.CANCELADO and pedido.items:
            items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
            for item in items:
                if item.get('designer') == nome_designer:
                    produto = item.get('descricao', 'Produto sem nome')
                    if produto not in produtos_desenhados:
                        produtos_desenhados[produto] = {"quantidade": 0, "valor": 0.0}
                    produtos_desenhados[produto]["quantidade"] += 1
                    produtos_desenhados[produto]["valor"] += float(item.get('valor_unitario', 0))
    
    produtos_desenhados_lista = sorted(
        [{"produto": k, **v} for k, v in produtos_desenhados.items()],
        key=lambda x: x["quantidade"],
        reverse=True
    )
    
    # Pedidos por status
    pedidos_por_status = {}
    for pedido in pedidos_designer:
        status = pedido.status.value if hasattr(pedido.status, 'value') else str(pedido.status)
        pedidos_por_status[status] = pedidos_por_status.get(status, 0) + 1
    
    # Performance mensal (últimos 6 meses)
    performance_mensal = []
    for i in range(6):
        data_inicio = date.today().replace(day=1) - timedelta(days=30*i)
        data_fim = data_inicio + timedelta(days=32)
        data_fim = data_fim.replace(day=1) - timedelta(days=1)
        
        pedidos_mes = [p for p in pedidos_designer if data_inicio <= p.data_criacao.date() <= data_fim]
        faturamento_mes = sum(float(p.valor_total) for p in pedidos_mes if p.status != Status.CANCELADO)
        
        performance_mensal.append({
            "mes": data_inicio.strftime("%m/%Y"),
            "pedidos": len(pedidos_mes),
            "faturamento": faturamento_mes
        })
    
    return RelatorioDesigner(
        designer=nome_designer,
        total_pedidos=total_pedidos,
        total_faturado=total_faturado,
        ticket_medio=ticket_medio,
        clientes_atendidos=clientes_atendidos,
        produtos_desenhados=produtos_desenhados_lista,
        pedidos_por_status=pedidos_por_status,
        performance_mensal=performance_mensal
    )

@router.post("/cliente", response_model=RelatorioCliente)
def gerar_relatorio_cliente(nome_cliente: str, session: Session = Depends(get_session)):
    """Gera relatório por cliente específico - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_cliente(nome_cliente, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório do cliente: {str(e)}")

@router.post("/vendedor", response_model=RelatorioVendedor)
def gerar_relatorio_vendedor(nome_vendedor: str, session: Session = Depends(get_session)):
    """Gera relatório por vendedor específico - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_vendedor(nome_vendedor, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório do vendedor: {str(e)}")

@router.post("/designer", response_model=RelatorioDesigner)
def gerar_relatorio_designer(nome_designer: str, session: Session = Depends(get_session)):
    """Gera relatório por designer específico - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        return calcular_relatorio_designer(nome_designer, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório do designer: {str(e)}")

@router.get("/clientes-lista")
def obter_lista_clientes(session: Session = Depends(get_session)):
    """Obtém lista de clientes para seleção - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        pedidos = session.exec(select(Pedido)).all()
        clientes_unicos = list(set(p.cliente for p in pedidos))
        return {"clientes": sorted(clientes_unicos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter lista de clientes: {str(e)}")

@router.get("/vendedores-lista")
def obter_lista_vendedores(session: Session = Depends(get_session)):
    """Obtém lista de vendedores para seleção - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        pedidos = session.exec(select(Pedido)).all()
        vendedores_unicos = set()
        for pedido in pedidos:
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                for item in items:
                    vendedor = item.get('vendedor')
                    if vendedor:
                        vendedores_unicos.add(vendedor)
        
        return {"vendedores": sorted(list(vendedores_unicos))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter lista de vendedores: {str(e)}")

@router.get("/designers-lista")
def obter_lista_designers(session: Session = Depends(get_session)):
    """Obtém lista de designers para seleção - APENAS ADMIN"""
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        pedidos = session.exec(select(Pedido)).all()
        designers_unicos = set()
        for pedido in pedidos:
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                for item in items:
                    designer = item.get('designer')
                    if designer:
                        designers_unicos.add(designer)
        
        return {"designers": sorted(list(designers_unicos))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter lista de designers: {str(e)}")

# ===== RELATÓRIO DE ENVIOS =====

@router.post("/envios", response_model=RelatorioEnviosResponse)
def gerar_relatorio_envios(req: RelatorioEnviosRequest, session: Session = Depends(get_session)):
    """
    Gera relatório completo de envios com estatísticas e análises
    - Agregações otimizadas no SQL
    - Filtros múltiplos
    - Análise geográfica
    - KPIs e tendências
    """
    if not verificar_admin():
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem acessar relatórios.")
    
    try:
        # Buscar pedidos base
        query = select(Pedido).where(Pedido.status != Status.CANCELADO)
        
        # Aplicar filtros de data
        if req.data_inicio:
            query = query.where(func.date(Pedido.data_criacao) >= req.data_inicio)
        if req.data_fim:
            query = query.where(func.date(Pedido.data_criacao) <= req.data_fim)
        
        pedidos = session.exec(query).all()
        
        # Aplicar filtros adicionais (Python) - idealmente seria no SQL
        pedidos_filtrados = []
        for pedido in pedidos:
            # Filtro de valor
            if req.valor_min and float(pedido.valor_total) < req.valor_min:
                continue
            if req.valor_max and float(pedido.valor_total) > req.valor_max:
                continue
            
            # Filtro de forma de envio
            if req.formas_envio and pedido.forma_envio not in req.formas_envio:
                continue
            
            # Filtros de localização (assumindo campos no pedido)
            cidade = getattr(pedido, 'cidade_cliente', None) or getattr(pedido, 'cidade', '')
            estado = getattr(pedido, 'estado_cliente', None) or getattr(pedido, 'estado', '')
            
            if req.cidades and cidade not in req.cidades:
                continue
            if req.estados and estado not in req.estados:
                continue
            
            # Filtros de vendedor/designer (verificar items)
            if req.vendedor or req.designer:
                if pedido.items:
                    items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                    tem_vendedor = any(item.get('vendedor') == req.vendedor for item in items) if req.vendedor else True
                    tem_designer = any(item.get('designer') == req.designer for item in items) if req.designer else True
                    if not (tem_vendedor and tem_designer):
                        continue
            
            # Filtro de status (múltiplos)
            if req.status and pedido.status.value not in req.status:
                continue
            
            pedidos_filtrados.append(pedido)
        
        # ===== CALCULAR KPIs GERAIS =====
        total_pedidos = len(pedidos_filtrados)
        valor_total = sum(float(p.valor_total) for p in pedidos_filtrados)
        
        total_itens = 0
        for p in pedidos_filtrados:
            if p.items:
                items = json.loads(p.items) if isinstance(p.items, str) else p.items
                total_itens += len(items)
        
        ticket_medio = valor_total / total_pedidos if total_pedidos > 0 else 0
        
        # ===== ESTATÍSTICAS POR FORMA DE ENVIO =====
        envios_map = defaultdict(lambda: {
            'quantidade_pedidos': 0,
            'quantidade_itens': 0,
            'valor_total': 0.0,
            'cidades_map': defaultdict(int)
        })
        
        for pedido in pedidos_filtrados:
            forma = pedido.forma_envio or "Não especificado"
            envios_map[forma]['quantidade_pedidos'] += 1
            envios_map[forma]['valor_total'] += float(pedido.valor_total)
            
            # Contar itens
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                envios_map[forma]['quantidade_itens'] += len(items)
            
            # Mapear cidades
            cidade = getattr(pedido, 'cidade_cliente', None) or getattr(pedido, 'cidade', 'Não informado')
            envios_map[forma]['cidades_map'][cidade] += 1
        
        # Converter para lista de estatísticas
        estatisticas_envios = []
        for forma, dados in envios_map.items():
            qtd_pedidos = dados['quantidade_pedidos']
            valor = dados['valor_total']
            ticket = valor / qtd_pedidos if qtd_pedidos > 0 else 0
            
            cidades_lista = [
                {"cidade": cidade, "quantidade": qtd}
                for cidade, qtd in sorted(dados['cidades_map'].items(), key=lambda x: x[1], reverse=True)[:5]
            ]
            
            estatisticas_envios.append(EnvioEstatistica(
                forma_envio=forma,
                quantidade_pedidos=qtd_pedidos,
                quantidade_itens=dados['quantidade_itens'],
                valor_total=valor,
                ticket_medio=ticket,
                percentual_pedidos=(qtd_pedidos / total_pedidos * 100) if total_pedidos > 0 else 0,
                percentual_valor=(valor / valor_total * 100) if valor_total > 0 else 0,
                cidades=cidades_lista
            ))
        
        # Ordenar por quantidade de pedidos
        estatisticas_envios.sort(key=lambda x: x.quantidade_pedidos, reverse=True)
        
        # ===== DISTRIBUIÇÃO GEOGRÁFICA =====
        cidades_map = defaultdict(lambda: {'quantidade': 0, 'valor': 0.0})
        estados_map = defaultdict(lambda: {'quantidade': 0, 'valor': 0.0})
        
        for pedido in pedidos_filtrados:
            cidade = getattr(pedido, 'cidade_cliente', None) or getattr(pedido, 'cidade', 'Não informado')
            estado = getattr(pedido, 'estado_cliente', None) or getattr(pedido, 'estado', 'Não informado')
            
            cidades_map[cidade]['quantidade'] += 1
            cidades_map[cidade]['valor'] += float(pedido.valor_total)
            
            estados_map[estado]['quantidade'] += 1
            estados_map[estado]['valor'] += float(pedido.valor_total)
        
        distribuicao_cidades = [
            {"cidade": cidade, **dados}
            for cidade, dados in sorted(cidades_map.items(), key=lambda x: x[1]['quantidade'], reverse=True)
        ]
        
        distribuicao_estados = [
            {"estado": estado, **dados}
            for estado, dados in sorted(estados_map.items(), key=lambda x: x[1]['quantidade'], reverse=True)
        ]
        
        # ===== RANKINGS =====
        top_cidades = distribuicao_cidades[:10]
        
        # Top clientes por envio
        clientes_map = defaultdict(lambda: {'pedidos': 0, 'valor': 0.0, 'formas_envio': set()})
        for pedido in pedidos_filtrados:
            cliente = pedido.cliente or "Não informado"
            clientes_map[cliente]['pedidos'] += 1
            clientes_map[cliente]['valor'] += float(pedido.valor_total)
            clientes_map[cliente]['formas_envio'].add(pedido.forma_envio or "Não especificado")
        
        top_clientes = [
            {
                "cliente": cliente,
                "pedidos": dados['pedidos'],
                "valor": dados['valor'],
                "formas_envio": list(dados['formas_envio'])
            }
            for cliente, dados in sorted(clientes_map.items(), key=lambda x: x[1]['pedidos'], reverse=True)[:10]
        ]
        
        # ===== TENDÊNCIA TEMPORAL (se houver período) =====
        tendencia_temporal = None
        if req.data_inicio and req.data_fim:
            dias_map = defaultdict(lambda: {'pedidos': 0, 'valor': 0.0})
            for pedido in pedidos_filtrados:
                dia = pedido.data_criacao.date().isoformat()
                dias_map[dia]['pedidos'] += 1
                dias_map[dia]['valor'] += float(pedido.valor_total)
            
            tendencia_temporal = [
                {"data": dia, **dados}
                for dia, dados in sorted(dias_map.items())
            ]
        
        # ===== COMPARATIVO PERÍODO ANTERIOR =====
        comparativo_periodo_anterior = None
        if req.data_inicio and req.data_fim:
            delta = req.data_fim - req.data_inicio
            periodo_anterior_inicio = req.data_inicio - delta - timedelta(days=1)
            periodo_anterior_fim = req.data_inicio - timedelta(days=1)
            
            pedidos_anterior = session.exec(
                select(Pedido).where(
                    func.date(Pedido.data_criacao) >= periodo_anterior_inicio,
                    func.date(Pedido.data_criacao) <= periodo_anterior_fim,
                    Pedido.status != Status.CANCELADO
                )
            ).all()
            
            total_anterior = len(pedidos_anterior)
            valor_anterior = sum(float(p.valor_total) for p in pedidos_anterior)
            
            comparativo_periodo_anterior = {
                "periodo_anterior": {
                    "inicio": periodo_anterior_inicio.isoformat(),
                    "fim": periodo_anterior_fim.isoformat(),
                    "total_pedidos": total_anterior,
                    "valor_total": valor_anterior
                },
                "variacao_pedidos": ((total_pedidos - total_anterior) / total_anterior * 100) if total_anterior > 0 else 0,
                "variacao_valor": ((valor_total - valor_anterior) / valor_anterior * 100) if valor_anterior > 0 else 0
            }
        
        # ===== DETALHES (limitado a 100 para performance) =====
        detalhes = []
        for pedido in pedidos_filtrados[:100]:
            tipos_itens = []
            qtd_itens = 0
            if pedido.items:
                items = json.loads(pedido.items) if isinstance(pedido.items, str) else pedido.items
                qtd_itens = len(items)
                tipos_itens = list(set(item.get('tipo_producao') or item.get('nome') or 'Item' for item in items))
            
            detalhes.append(EnvioDetalhado(
                pedido_id=pedido.id,
                cliente=pedido.cliente or "Não informado",
                forma_envio=pedido.forma_envio or "Não especificado",
                cidade=getattr(pedido, 'cidade_cliente', None) or getattr(pedido, 'cidade', 'Não informado'),
                estado=getattr(pedido, 'estado_cliente', None) or getattr(pedido, 'estado', 'Não informado'),
                tipos_itens=tipos_itens,
                quantidade_itens=qtd_itens,
                valor_total=float(pedido.valor_total),
                data_entrega=pedido.data_entrega if hasattr(pedido, 'data_entrega') else None,
                status=pedido.status.value
            ))
        
        # ===== MONTAR RESPOSTA =====
        return RelatorioEnviosResponse(
            total_pedidos=total_pedidos,
            total_itens=total_itens,
            valor_total=valor_total,
            ticket_medio=ticket_medio,
            periodo={
                "inicio": req.data_inicio.isoformat() if req.data_inicio else None,
                "fim": req.data_fim.isoformat() if req.data_fim else None
            },
            estatisticas_envios=estatisticas_envios,
            distribuicao_cidades=distribuicao_cidades,
            distribuicao_estados=distribuicao_estados,
            top_cidades=top_cidades,
            top_clientes=top_clientes,
            tendencia_temporal=tendencia_temporal,
            comparativo_periodo_anterior=comparativo_periodo_anterior,
            detalhes=detalhes
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório de envios: {str(e)}")
