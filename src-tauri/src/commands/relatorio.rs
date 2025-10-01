use crate::models::relatorio::*;
use crate::database::Database;
use tauri::State;
use std::collections::HashMap;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn gerar_relatorio_diario(
    state: AppState<'_>,
    data: String,
    filtro_tipo: Option<String>,
    filtro_nome: Option<String>,
) -> Result<RelatorioDiario, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT p.id, p.numero, c.nome as cliente_nome, p.valor_total, p.status 
                    FROM pedidos p 
                    LEFT JOIN clientes c ON p.cliente_id = c.id 
                    WHERE DATE(p.data_pedido) = ?1".to_string();
    
    let mut params: Vec<String> = vec![data.clone()];
    
    if let Some(tipo) = filtro_tipo {
        query.push_str(" AND p.status = ?2");
        params.push(tipo);
    }
    
    if let Some(nome) = filtro_nome {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND c.nome LIKE ?{}", param_index));
        params.push(format!("%{}%", nome));
    }
    
    query.push_str(" ORDER BY p.numero");
    
    let mut stmt = db.prepare(&query).map_err(|e| e.to_string())?;
    
    let pedido_iter = stmt.query_map(rusqlite::params_from_iter(params.iter()), |row| {
        Ok(PedidoResumo {
            id: row.get(0)?,
            numero: row.get(1)?,
            cliente_nome: row.get(2)?,
            valor_total: row.get(3)?,
            status: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pedidos = Vec::new();
    let mut total_pedidos = 0;
    let mut valor_total = 0.0;
    
    for pedido in pedido_iter {
        let pedido = pedido.map_err(|e| e.to_string())?;
        valor_total += pedido.valor_total;
        total_pedidos += 1;
        pedidos.push(pedido);
    }
    
    Ok(RelatorioDiario {
        data,
        total_pedidos,
        valor_total,
        pedidos,
    })
}

#[tauri::command]
pub async fn gerar_relatorio_semanal(
    state: AppState<'_>,
    data_inicio: String,
) -> Result<RelatorioSemanal, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Calcular data fim (7 dias depois)
    let data_inicio_dt = chrono::NaiveDate::parse_from_str(&data_inicio, "%Y-%m-%d")
        .map_err(|e| e.to_string())?;
    let data_fim_dt = data_inicio_dt + chrono::Duration::days(7);
    let data_fim = data_fim_dt.format("%Y-%m-%d").to_string();
    
    let mut stmt = db.prepare(
        "SELECT DATE(p.data_pedido) as data, COUNT(*) as total_pedidos, SUM(p.valor_total) as valor_total
         FROM pedidos p 
         WHERE DATE(p.data_pedido) >= ?1 AND DATE(p.data_pedido) < ?2
         GROUP BY DATE(p.data_pedido)
         ORDER BY data"
    ).map_err(|e| e.to_string())?;
    
    let pedido_iter = stmt.query_map([&data_inicio, &data_fim], |row| {
        Ok(PedidoPorDia {
            data: row.get(0)?,
            total_pedidos: row.get(1)?,
            valor_total: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pedidos_por_dia = Vec::new();
    let mut total_pedidos = 0;
    let mut valor_total = 0.0;
    
    for pedido in pedido_iter {
        let pedido = pedido.map_err(|e| e.to_string())?;
        total_pedidos += pedido.total_pedidos;
        valor_total += pedido.valor_total;
        pedidos_por_dia.push(pedido);
    }
    
    Ok(RelatorioSemanal {
        data_inicio,
        data_fim,
        total_pedidos,
        valor_total,
        pedidos_por_dia,
    })
}

#[tauri::command]
pub async fn gerar_relatorio_mensal(
    state: AppState<'_>,
    mes: i32,
    ano: i32,
) -> Result<RelatorioMensal, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT DATE(p.data_pedido) as data, COUNT(*) as total_pedidos, SUM(p.valor_total) as valor_total
         FROM pedidos p 
         WHERE strftime('%m', p.data_pedido) = ?1 AND strftime('%Y', p.data_pedido) = ?2
         GROUP BY DATE(p.data_pedido)
         ORDER BY data"
    ).map_err(|e| e.to_string())?;
    
    let pedido_iter = stmt.query_map([&mes.to_string(), &ano.to_string()], |row| {
        Ok(PedidoPorDia {
            data: row.get(0)?,
            total_pedidos: row.get(1)?,
            valor_total: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pedidos_por_dia = Vec::new();
    let mut total_pedidos = 0;
    let mut valor_total = 0.0;
    
    for pedido in pedido_iter {
        let pedido = pedido.map_err(|e| e.to_string())?;
        total_pedidos += pedido.total_pedidos;
        valor_total += pedido.valor_total;
        pedidos_por_dia.push(pedido);
    }
    
    Ok(RelatorioMensal {
        mes,
        ano,
        total_pedidos,
        valor_total,
        pedidos_por_dia,
    })
}

#[tauri::command]
pub async fn obter_ranking_produtos(
    state: AppState<'_>,
    limite: Option<i32>,
) -> Result<Vec<RankingProduto>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let limite = limite.unwrap_or(20);
    
    let mut stmt = db.prepare(
        "SELECT pt.id, pt.nome, COUNT(*) as quantidade, SUM(p.valor_total) as valor_total
         FROM pedidos p
         JOIN producoes_tipos pt ON p.items LIKE '%' || pt.nome || '%'
         GROUP BY pt.id, pt.nome
         ORDER BY quantidade DESC
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;
    
    let produto_iter = stmt.query_map([limite], |row| {
        Ok(RankingProduto {
            tipo_producao_id: row.get(0)?,
            nome: row.get(1)?,
            quantidade: row.get(2)?,
            valor_total: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut produtos = Vec::new();
    for produto in produto_iter {
        produtos.push(produto.map_err(|e| e.to_string())?);
    }
    
    Ok(produtos)
}

#[tauri::command]
pub async fn gerar_relatorio_matriz(
    state: AppState<'_>,
    filtros: RelatorioFiltros,
) -> Result<RelatorioMatriz, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT p.id, p.numero, c.nome as cliente_nome, v.nome as vendedor_nome, d.nome as designer_nome, DATE(p.data_pedido) as data_pedido, p.status, p.valor_total
                    FROM pedidos p
                    LEFT JOIN clientes c ON p.cliente_id = c.id
                    LEFT JOIN vendedores v ON p.vendedor_id = v.id
                    LEFT JOIN designers d ON p.designer_id = d.id
                    WHERE 1=1".to_string();
    
    let mut params: Vec<String> = vec![];
    
    if let Some(data_inicio) = &filtros.data_inicio {
        query.push_str(" AND DATE(p.data_pedido) >= ?1");
        params.push(data_inicio.clone());
    }
    
    if let Some(data_fim) = &filtros.data_fim {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND DATE(p.data_pedido) <= ?{}", param_index));
        params.push(data_fim.clone());
    }
    
    if let Some(cliente_id) = filtros.cliente_id {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND p.cliente_id = ?{}", param_index));
        params.push(cliente_id.to_string());
    }
    
    if let Some(vendedor_id) = filtros.vendedor_id {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND p.vendedor_id = ?{}", param_index));
        params.push(vendedor_id.to_string());
    }
    
    if let Some(designer_id) = filtros.designer_id {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND p.designer_id = ?{}", param_index));
        params.push(designer_id.to_string());
    }
    
    if let Some(status) = &filtros.status {
        let param_index = params.len() + 1;
        query.push_str(&format!(" AND p.status = ?{}", param_index));
        params.push(status.clone());
    }
    
    query.push_str(" ORDER BY p.numero DESC");
    
    let mut stmt = db.prepare(&query).map_err(|e| e.to_string())?;
    
    let pedido_iter = stmt.query_map(rusqlite::params_from_iter(params.iter()), |row| {
        Ok(DadoMatriz {
            pedido_id: row.get(0)?,
            numero: row.get(1)?,
            cliente_nome: row.get(2)?,
            vendedor_nome: row.get(3)?,
            designer_nome: row.get(4)?,
            data_pedido: row.get(5)?,
            status: row.get(6)?,
            valor_total: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut dados = Vec::new();
    let mut total_pedidos = 0;
    let mut valor_total = 0.0;
    let mut valor_por_status: HashMap<String, f64> = HashMap::new();
    
    for pedido in pedido_iter {
        let pedido = pedido.map_err(|e| e.to_string())?;
        total_pedidos += 1;
        valor_total += pedido.valor_total;
        
        let status_valor = valor_por_status.entry(pedido.status.clone()).or_insert(0.0);
        *status_valor += pedido.valor_total;
        
        dados.push(pedido);
    }
    
    Ok(RelatorioMatriz {
        filtros,
        dados,
        totais: TotaisMatriz {
            total_pedidos,
            valor_total,
            valor_por_status,
        },
    })
}