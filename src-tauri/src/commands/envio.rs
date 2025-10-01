use crate::models::envio::{Envio, EnvioCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_envios(state: AppState<'_>) -> Result<Vec<Envio>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor, ativo, created_at, updated_at FROM envios ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let envio_iter = stmt.query_map([], |row| {
        Ok(Envio {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            valor: row.get(3)?,
            ativo: row.get(4)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut envios = Vec::new();
    for envio in envio_iter {
        envios.push(envio.map_err(|e| e.to_string())?);
    }
    
    Ok(envios)
}

#[tauri::command]
pub async fn create_envio(state: AppState<'_>, envio: EnvioCreate) -> Result<Envio, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let envio = Envio {
        id: None,
        nome: envio.nome,
        descricao: envio.descricao,
        valor: envio.valor,
        ativo: envio.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO envios (nome, descricao, valor, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            envio.nome,
            envio.descricao,
            envio.valor,
            envio.ativo,
            envio.created_at.unwrap().to_rfc3339(),
            envio.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Envio {
        id: Some(id as i64),
        ..envio
    })
}

#[tauri::command]
pub async fn update_envio(
    state: AppState<'_>,
    id: i64,
    envio: EnvioCreate,
) -> Result<Envio, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Atualizar no banco usando os dados fornecidos
    db.execute(
        "UPDATE envios SET nome = ?1, descricao = ?2, valor = ?3, ativo = ?4, updated_at = ?5 WHERE id = ?6",
        rusqlite::params![
            envio.nome,
            envio.descricao,
            envio.valor,
            envio.ativo.unwrap_or(true),
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o envio atualizado
    let mut stmt = db.prepare("SELECT id, nome, descricao, valor, ativo, created_at, updated_at FROM envios WHERE id = ?1").map_err(|e| e.to_string())?;
    let updated_envio = stmt.query_row([id], |row| {
        Ok(Envio {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            valor: row.get(3)?,
            ativo: row.get(4)?,
            created_at: row.get::<_, Option<String>>(5)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_envio)
}

#[tauri::command]
pub async fn delete_envio(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM envios WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}