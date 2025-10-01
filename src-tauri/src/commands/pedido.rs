use crate::models::pedido::{Pedido, PedidoCreate};
use crate::database::Database;
use tauri::State;
use anyhow::Result;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn create_pedido(
    state: AppState<'_>,
    pedido: PedidoCreate,
) -> Result<Pedido, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Obter próximo número de pedido
    let mut stmt = db.prepare("SELECT COALESCE(MAX(numero), 0) + 1 FROM pedidos").map_err(|e| e.to_string())?;
    let numero: i32 = stmt.query_row([], |row| row.get(0)).map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let data_pedido = pedido.data_pedido.unwrap_or(now);
    
    let pedido = Pedido {
        id: None,
        numero,
        cliente_id: pedido.cliente_id,
        cliente_nome: None,
        data_pedido,
        data_entrega: pedido.data_entrega,
        status: pedido.status.unwrap_or_else(|| "pendente".to_string()),
        valor_total: pedido.valor_total,
        observacoes: pedido.observacoes,
        vendedor_id: pedido.vendedor_id,
        designer_id: pedido.designer_id,
        forma_pagamento_id: pedido.forma_pagamento_id,
        forma_envio_id: pedido.forma_envio_id,
        desconto_id: pedido.desconto_id,
        items: pedido.items,
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO pedidos (numero, cliente_id, data_pedido, data_entrega, status, valor_total, observacoes, vendedor_id, designer_id, forma_pagamento_id, forma_envio_id, desconto_id, items, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        rusqlite::params![
            pedido.numero,
            pedido.cliente_id,
            pedido.data_pedido.to_rfc3339(),
            pedido.data_entrega.map(|d| d.to_rfc3339()),
            pedido.status,
            pedido.valor_total,
            pedido.observacoes,
            pedido.vendedor_id,
            pedido.designer_id,
            pedido.forma_pagamento_id,
            pedido.forma_envio_id,
            pedido.desconto_id,
            pedido.items,
            pedido.created_at.unwrap().to_rfc3339(),
            pedido.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Pedido {
        id: Some(id as i64),
        ..pedido
    })
}

#[tauri::command]
pub async fn get_all_pedidos(state: AppState<'_>) -> Result<Vec<Pedido>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT p.id, p.numero, p.cliente_id, c.nome as cliente_nome, p.data_pedido, p.data_entrega, p.status, p.valor_total, p.observacoes, p.vendedor_id, p.designer_id, p.forma_pagamento_id, p.forma_envio_id, p.desconto_id, p.items, p.created_at, p.updated_at 
         FROM pedidos p 
         LEFT JOIN clientes c ON p.cliente_id = c.id 
         ORDER BY p.numero DESC"
    ).map_err(|e| e.to_string())?;
    
    let pedido_iter = stmt.query_map([], |row| {
        Ok(Pedido {
            id: Some(row.get(0)?),
            numero: row.get(1)?,
            cliente_id: row.get(2)?,
            cliente_nome: row.get(3)?,
            data_pedido: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                .unwrap()
                .with_timezone(&chrono::Utc),
            data_entrega: row.get::<_, Option<String>>(5)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            status: row.get(6)?,
            valor_total: row.get(7)?,
            observacoes: row.get(8)?,
            vendedor_id: row.get(9)?,
            designer_id: row.get(10)?,
            forma_pagamento_id: row.get(11)?,
            forma_envio_id: row.get(12)?,
            desconto_id: row.get(13)?,
            items: row.get(14)?,
            created_at: row.get::<_, Option<String>>(15)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(16)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pedidos = Vec::new();
    for pedido in pedido_iter {
        pedidos.push(pedido.map_err(|e| e.to_string())?);
    }
    
    Ok(pedidos)
}

#[tauri::command]
pub async fn get_proximo_numero_pedido(state: AppState<'_>) -> Result<i32, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare("SELECT COALESCE(MAX(numero), 0) + 1 FROM pedidos").map_err(|e| e.to_string())?;
    let numero: i32 = stmt.query_row([], |row| row.get(0)).map_err(|e| e.to_string())?;
    
    Ok(numero)
}

#[tauri::command]
pub async fn delete_pedido(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM pedidos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}