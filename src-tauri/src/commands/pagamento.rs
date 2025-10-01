use crate::models::pagamento::{Pagamento, PagamentoCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_pagamentos(state: AppState<'_>) -> Result<Vec<Pagamento>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, ativo, created_at, updated_at FROM pagamentos ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let pagamento_iter = stmt.query_map([], |row| {
        Ok(Pagamento {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            ativo: row.get(3)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pagamentos = Vec::new();
    for pagamento in pagamento_iter {
        pagamentos.push(pagamento.map_err(|e| e.to_string())?);
    }
    
    Ok(pagamentos)
}

#[tauri::command]
pub async fn create_pagamento(state: AppState<'_>, pagamento: PagamentoCreate) -> Result<Pagamento, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let pagamento = Pagamento {
        id: None,
        nome: pagamento.nome,
        descricao: pagamento.descricao,
        ativo: pagamento.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO pagamentos (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            pagamento.nome,
            pagamento.descricao,
            pagamento.ativo,
            pagamento.created_at.unwrap().to_rfc3339(),
            pagamento.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Pagamento {
        id: Some(id as i64),
        ..pagamento
    })
}

#[tauri::command]
pub async fn update_pagamento(
    state: AppState<'_>,
    id: i64,
    pagamento: PagamentoCreate,
) -> Result<Pagamento, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Atualizar no banco usando os dados fornecidos
    db.execute(
        "UPDATE pagamentos SET nome = ?1, descricao = ?2, ativo = ?3, updated_at = ?4 WHERE id = ?5",
        rusqlite::params![
            pagamento.nome,
            pagamento.descricao,
            pagamento.ativo.unwrap_or(true),
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o pagamento atualizado
    let mut stmt = db.prepare("SELECT id, nome, descricao, ativo, created_at, updated_at FROM pagamentos WHERE id = ?1").map_err(|e| e.to_string())?;
    let updated_pagamento = stmt.query_row([id], |row| {
        Ok(Pagamento {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            ativo: row.get(3)?,
            created_at: row.get::<_, Option<String>>(4)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(5)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_pagamento)
}

#[tauri::command]
pub async fn delete_pagamento(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM pagamentos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}