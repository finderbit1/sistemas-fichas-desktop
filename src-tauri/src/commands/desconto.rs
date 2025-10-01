use crate::models::desconto::{Desconto, DescontoCreate, DescontoCalculado};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_descontos(state: AppState<'_>) -> Result<Vec<Desconto>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo, ativo, created_at, updated_at FROM descontos WHERE ativo = 1 ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let desconto_iter = stmt.query_map([], |row| {
        Ok(Desconto {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            tipo: row.get(2)?,
            valor: row.get(3)?,
            valor_minimo: row.get(4)?,
            ativo: row.get(5)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut descontos = Vec::new();
    for desconto in desconto_iter {
        descontos.push(desconto.map_err(|e| e.to_string())?);
    }
    
    Ok(descontos)
}

#[tauri::command]
pub async fn calcular_desconto(state: AppState<'_>, valor_total: f64) -> Result<Vec<DescontoCalculado>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo FROM descontos WHERE ativo = 1 AND (valor_minimo IS NULL OR valor_minimo <= ?1) ORDER BY valor DESC"
    ).map_err(|e| e.to_string())?;
    
    let desconto_iter = stmt.query_map([valor_total], |row| {
        let id: i64 = row.get(0)?;
        let nome: String = row.get(1)?;
        let tipo: String = row.get(2)?;
        let valor: f64 = row.get(3)?;
        
        let valor_desconto = match tipo.as_str() {
            "percentual" => valor_total * (valor / 100.0),
            "valor_fixo" => valor.min(valor_total),
            _ => 0.0,
        };
        
        Ok(DescontoCalculado {
            desconto_id: id,
            nome,
            valor_desconto,
            valor_final: valor_total - valor_desconto,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut descontos = Vec::new();
    for desconto in desconto_iter {
        descontos.push(desconto.map_err(|e| e.to_string())?);
    }
    
    Ok(descontos)
}

#[tauri::command]
pub async fn create_desconto(state: AppState<'_>, desconto: DescontoCreate) -> Result<Desconto, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let desconto = Desconto {
        id: None,
        nome: desconto.nome,
        tipo: desconto.tipo,
        valor: desconto.valor,
        valor_minimo: desconto.valor_minimo,
        ativo: desconto.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO descontos (nome, tipo, valor, valor_minimo, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            desconto.nome,
            desconto.tipo,
            desconto.valor,
            desconto.valor_minimo,
            desconto.ativo,
            desconto.created_at.unwrap().to_rfc3339(),
            desconto.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Desconto {
        id: Some(id as i64),
        ..desconto
    })
}

#[tauri::command]
pub async fn delete_desconto(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM descontos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}