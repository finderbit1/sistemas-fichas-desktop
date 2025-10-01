use crate::models::tecido::{Tecido, TecidoCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_tecidos(state: AppState<'_>) -> Result<Vec<Tecido>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at FROM tecidos WHERE ativo = 1 ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let tecido_iter = stmt.query_map([], |row| {
        Ok(Tecido {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            cor: row.get(3)?,
            material: row.get(4)?,
            largura: row.get(5)?,
            valor_metro: row.get(6)?,
            ativo: row.get(7)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tecidos = Vec::new();
    for tecido in tecido_iter {
        tecidos.push(tecido.map_err(|e| e.to_string())?);
    }
    
    Ok(tecidos)
}

#[tauri::command]
pub async fn create_tecido(state: AppState<'_>, tecido: TecidoCreate) -> Result<Tecido, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let tecido = Tecido {
        id: None,
        nome: tecido.nome,
        descricao: tecido.descricao,
        cor: tecido.cor,
        material: tecido.material,
        largura: tecido.largura,
        valor_metro: tecido.valor_metro,
        ativo: tecido.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO tecidos (nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![
            tecido.nome,
            tecido.descricao,
            tecido.cor,
            tecido.material,
            tecido.largura,
            tecido.valor_metro,
            tecido.ativo,
            tecido.created_at.unwrap().to_rfc3339(),
            tecido.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Tecido {
        id: Some(id as i64),
        ..tecido
    })
}

#[tauri::command]
pub async fn delete_tecido(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM tecidos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}