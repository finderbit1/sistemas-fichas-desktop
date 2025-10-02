use crate::models::desconto::{Desconto, DescontoCreate, DescontoUpdate, DescontoCalculado};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_descontos(state: AppState<'_>) -> Result<Vec<Desconto>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo, ativo, created_at, updated_at FROM descontos ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let desconto_iter = stmt.query_map([], |row| {
        Ok(Desconto {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            tipo: row.get(2)?,
            valor: row.get(3)?,
            valor_minimo: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut descontos = Vec::new();
    for desconto in desconto_iter {
        descontos.push(desconto.map_err(|e| e.to_string())?);
    }
    
    Ok(descontos)
}

#[tauri::command]
pub async fn get_desconto_by_id(state: AppState<'_>, id: i64) -> Result<Desconto, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo, ativo, created_at, updated_at 
         FROM descontos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let desconto = stmt.query_row([id], |row| {
        Ok(Desconto {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            tipo: row.get(2)?,
            valor: row.get(3)?,
            valor_minimo: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(desconto)
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
    // Validação dos dados obrigatórios
    if desconto.nome.trim().is_empty() {
        return Err("Nome do desconto é obrigatório".to_string());
    }
    
    if desconto.tipo.trim().is_empty() {
        return Err("Tipo do desconto é obrigatório".to_string());
    }
    
    if !["percentual", "valor_fixo"].contains(&desconto.tipo.as_str()) {
        return Err("Tipo deve ser 'percentual' ou 'valor_fixo'".to_string());
    }
    
    if desconto.valor < 0.0 {
        return Err("Valor do desconto não pode ser negativo".to_string());
    }

    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let desconto_obj = Desconto {
        id: None,
        nome: desconto.nome.trim().to_string(),
        tipo: desconto.tipo.trim().to_string(),
        valor: desconto.valor,
        valor_minimo: desconto.valor_minimo.filter(|&v| v > 0.0),
        ativo: desconto.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    db.execute(
        "INSERT INTO descontos (nome, tipo, valor, valor_minimo, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            desconto_obj.nome,
            desconto_obj.tipo,
            desconto_obj.valor,
            desconto_obj.valor_minimo,
            desconto_obj.ativo,
            desconto_obj.created_at.unwrap().to_rfc3339(),
            desconto_obj.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Desconto {
        id: Some(id),
        ..desconto_obj
    })
}

#[tauri::command]
pub async fn update_desconto(
    state: AppState<'_>,
    id: i64,
    desconto: DescontoUpdate,
) -> Result<Desconto, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Buscar o desconto atual diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo, ativo, created_at, updated_at 
         FROM descontos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let current_desconto = stmt.query_row([id], |row| {
        Ok(Desconto {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            tipo: row.get(2)?,
            valor: row.get(3)?,
            valor_minimo: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    // Aplicar as atualizações apenas nos campos fornecidos
    let nome = desconto.nome.unwrap_or(current_desconto.nome);
    let tipo = desconto.tipo.unwrap_or(current_desconto.tipo);
    let valor = desconto.valor.unwrap_or(current_desconto.valor);
    let valor_minimo = desconto.valor_minimo.or(current_desconto.valor_minimo);
    let ativo = desconto.ativo.unwrap_or(current_desconto.ativo);
    
    // Atualizar no banco
    db.execute(
        "UPDATE descontos SET nome = ?1, tipo = ?2, valor = ?3, valor_minimo = ?4, ativo = ?5, updated_at = ?6 WHERE id = ?7",
        rusqlite::params![
            nome,
            tipo,
            valor,
            valor_minimo,
            ativo,
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o desconto atualizado diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, tipo, valor, valor_minimo, ativo, created_at, updated_at 
         FROM descontos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let updated_desconto = stmt.query_row([id], |row| {
        Ok(Desconto {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            tipo: row.get(2)?,
            valor: row.get(3)?,
            valor_minimo: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_desconto)
}

#[tauri::command]
pub async fn delete_desconto(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM descontos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}