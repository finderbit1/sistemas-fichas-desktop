use crate::models::designer::{Designer, DesignerCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_designers(state: AppState<'_>) -> Result<Vec<Designer>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, especialidade, ativo, created_at, updated_at FROM designers WHERE ativo = 1 ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let designer_iter = stmt.query_map([], |row| {
        Ok(Designer {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            especialidade: row.get(4)?,
            ativo: row.get(5)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut designers = Vec::new();
    for designer in designer_iter {
        designers.push(designer.map_err(|e| e.to_string())?);
    }
    
    Ok(designers)
}

#[tauri::command]
pub async fn create_designer(state: AppState<'_>, designer: DesignerCreate) -> Result<Designer, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let designer = Designer {
        id: None,
        nome: designer.nome,
        email: designer.email,
        telefone: designer.telefone,
        especialidade: designer.especialidade,
        ativo: designer.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO designers (nome, email, telefone, especialidade, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            designer.nome,
            designer.email,
            designer.telefone,
            designer.especialidade,
            designer.ativo,
            designer.created_at.unwrap().to_rfc3339(),
            designer.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Designer {
        id: Some(id as i64),
        ..designer
    })
}

#[tauri::command]
pub async fn delete_designer(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM designers WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}