use crate::models::vendedor::{Vendedor, VendedorCreate, VendedorUpdate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_vendedores(state: AppState<'_>) -> Result<Vec<Vendedor>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, comissao_percentual, ativo, created_at, updated_at FROM vendedores ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let vendedor_iter = stmt.query_map([], |row| {
        Ok(Vendedor {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            comissao_percentual: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut vendedores = Vec::new();
    for vendedor in vendedor_iter {
        vendedores.push(vendedor.map_err(|e| e.to_string())?);
    }
    
    Ok(vendedores)
}

#[tauri::command]
pub async fn get_vendedor_by_id(state: AppState<'_>, id: i64) -> Result<Vendedor, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, comissao_percentual, ativo, created_at, updated_at 
         FROM vendedores WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let vendedor = stmt.query_row([id], |row| {
        Ok(Vendedor {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            comissao_percentual: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(vendedor)
}

#[tauri::command]
pub async fn create_vendedor(state: AppState<'_>, vendedor: VendedorCreate) -> Result<Vendedor, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let vendedor_obj = Vendedor {
        id: None,
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        comissao_percentual: vendedor.comissao_percentual,
        ativo: vendedor.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    db.execute(
        "INSERT INTO vendedores (nome, email, telefone, comissao_percentual, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            vendedor_obj.nome,
            vendedor_obj.email,
            vendedor_obj.telefone,
            vendedor_obj.comissao_percentual,
            vendedor_obj.ativo,
            vendedor_obj.created_at.unwrap().to_rfc3339(),
            vendedor_obj.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Vendedor {
        id: Some(id),
        ..vendedor_obj
    })
}

#[tauri::command]
pub async fn update_vendedor(
    state: AppState<'_>,
    id: i64,
    vendedor: VendedorUpdate,
) -> Result<Vendedor, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Buscar o vendedor atual diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, comissao_percentual, ativo, created_at, updated_at 
         FROM vendedores WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let current_vendedor = stmt.query_row([id], |row| {
        Ok(Vendedor {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            comissao_percentual: row.get(4)?,
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
    let nome = vendedor.nome.unwrap_or(current_vendedor.nome);
    let email = vendedor.email.or(current_vendedor.email);
    let telefone = vendedor.telefone.or(current_vendedor.telefone);
    let comissao_percentual = vendedor.comissao_percentual.or(current_vendedor.comissao_percentual);
    let ativo = vendedor.ativo.unwrap_or(current_vendedor.ativo);
    
    // Atualizar no banco
    db.execute(
        "UPDATE vendedores SET nome = ?1, email = ?2, telefone = ?3, comissao_percentual = ?4, ativo = ?5, updated_at = ?6 WHERE id = ?7",
        rusqlite::params![
            nome,
            email,
            telefone,
            comissao_percentual,
            ativo,
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o vendedor atualizado diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, comissao_percentual, ativo, created_at, updated_at 
         FROM vendedores WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let updated_vendedor = stmt.query_row([id], |row| {
        Ok(Vendedor {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            comissao_percentual: row.get(4)?,
            ativo: row.get(5)?,
            created_at: row.get::<_, Option<String>>(6)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(7)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_vendedor)
}

#[tauri::command]
pub async fn delete_vendedor(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM vendedores WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}