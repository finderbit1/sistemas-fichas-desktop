use crate::models::envio::{Envio, EnvioCreate, EnvioUpdate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_envios(state: AppState<'_>) -> Result<Vec<Envio>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor, ativo, created_at, updated_at FROM formas_envio ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let envio_iter = stmt.query_map([], |row| {
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
    
    let mut envios = Vec::new();
    for envio in envio_iter {
        envios.push(envio.map_err(|e| e.to_string())?);
    }
    
    Ok(envios)
}

#[tauri::command]
pub async fn get_envio_by_id(state: AppState<'_>, id: i64) -> Result<Envio, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor, ativo, created_at, updated_at 
         FROM formas_envio WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let envio = stmt.query_row([id], |row| {
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
    
    Ok(envio)
}

#[tauri::command]
pub async fn create_envio(state: AppState<'_>, envio: EnvioCreate) -> Result<Envio, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let envio_obj = Envio {
        id: None,
        nome: envio.nome,
        descricao: envio.descricao,
        valor: envio.valor,
        ativo: envio.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    db.execute(
        "INSERT INTO formas_envio (nome, descricao, valor, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            envio_obj.nome,
            envio_obj.descricao,
            envio_obj.valor,
            envio_obj.ativo,
            envio_obj.created_at.unwrap().to_rfc3339(),
            envio_obj.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Envio {
        id: Some(id),
        ..envio_obj
    })
}

#[tauri::command]
pub async fn update_envio(
    state: AppState<'_>,
    id: i64,
    envio: EnvioUpdate,
) -> Result<Envio, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Buscar o envio atual diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor, ativo, created_at, updated_at 
         FROM formas_envio WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let current_envio = stmt.query_row([id], |row| {
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
    
    // Aplicar as atualizações apenas nos campos fornecidos
    let nome = envio.nome.unwrap_or(current_envio.nome);
    let descricao = envio.descricao.or(current_envio.descricao);
    let valor = envio.valor.unwrap_or(current_envio.valor);
    let ativo = envio.ativo.unwrap_or(current_envio.ativo);
    
    // Atualizar no banco
    db.execute(
        "UPDATE formas_envio SET nome = ?1, descricao = ?2, valor = ?3, ativo = ?4, updated_at = ?5 WHERE id = ?6",
        rusqlite::params![
            nome,
            descricao,
            valor,
            ativo,
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o envio atualizado diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor, ativo, created_at, updated_at 
         FROM formas_envio WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
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
    
    db.execute("DELETE FROM formas_envio WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}