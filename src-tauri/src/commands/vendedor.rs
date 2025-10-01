use crate::models::vendedor::{Vendedor, VendedorCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_vendedores(state: AppState<'_>) -> Result<Vec<Vendedor>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, comissao_percentual, ativo, created_at, updated_at FROM vendedores WHERE ativo = 1 ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let vendedor_iter = stmt.query_map([], |row| {
        Ok(Vendedor {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            comissao_percentual: row.get(4)?,
            ativo: row.get(5)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut vendedores = Vec::new();
    for vendedor in vendedor_iter {
        vendedores.push(vendedor.map_err(|e| e.to_string())?);
    }
    
    Ok(vendedores)
}

#[tauri::command]
pub async fn create_vendedor(state: AppState<'_>, vendedor: VendedorCreate) -> Result<Vendedor, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let vendedor = Vendedor {
        id: None,
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        comissao_percentual: vendedor.comissao_percentual,
        ativo: vendedor.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO vendedores (nome, email, telefone, comissao_percentual, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            vendedor.nome,
            vendedor.email,
            vendedor.telefone,
            vendedor.comissao_percentual,
            vendedor.ativo,
            vendedor.created_at.unwrap().to_rfc3339(),
            vendedor.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Vendedor {
        id: Some(id as i64),
        ..vendedor
    })
}

#[tauri::command]
pub async fn delete_vendedor(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM vendedores WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}