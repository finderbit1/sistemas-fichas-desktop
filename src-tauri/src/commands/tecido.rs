use crate::models::tecido::{Tecido, TecidoCreate, TecidoUpdate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_tecidos(state: AppState<'_>) -> Result<Vec<Tecido>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at FROM tecidos ORDER BY nome"
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
            created_at: row.get::<_, Option<String>>(8)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(9)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tecidos = Vec::new();
    for tecido in tecido_iter {
        tecidos.push(tecido.map_err(|e| e.to_string())?);
    }
    
    Ok(tecidos)
}

#[tauri::command]
pub async fn get_tecido_by_id(state: AppState<'_>, id: i64) -> Result<Tecido, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at 
         FROM tecidos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let tecido = stmt.query_row([id], |row| {
        Ok(Tecido {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            cor: row.get(3)?,
            material: row.get(4)?,
            largura: row.get(5)?,
            valor_metro: row.get(6)?,
            ativo: row.get(7)?,
            created_at: row.get::<_, Option<String>>(8)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(9)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(tecido)
}

#[tauri::command]
pub async fn create_tecido(state: AppState<'_>, tecido: TecidoCreate) -> Result<Tecido, String> {
    // Validação dos dados obrigatórios
    if tecido.nome.trim().is_empty() {
        return Err("Nome do tecido é obrigatório".to_string());
    }

    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let tecido_obj = Tecido {
        id: None,
        nome: tecido.nome.trim().to_string(),
        descricao: tecido.descricao.map(|d| d.trim().to_string()).filter(|d| !d.is_empty()),
        cor: tecido.cor.map(|c| c.trim().to_string()).filter(|c| !c.is_empty()),
        material: tecido.material.map(|m| m.trim().to_string()).filter(|m| !m.is_empty()),
        largura: tecido.largura.filter(|&l| l > 0.0),
        valor_metro: tecido.valor_metro.filter(|&v| v >= 0.0),
        ativo: tecido.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    db.execute(
        "INSERT INTO tecidos (nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![
            tecido_obj.nome,
            tecido_obj.descricao,
            tecido_obj.cor,
            tecido_obj.material,
            tecido_obj.largura,
            tecido_obj.valor_metro,
            tecido_obj.ativo,
            tecido_obj.created_at.unwrap().to_rfc3339(),
            tecido_obj.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Tecido {
        id: Some(id),
        ..tecido_obj
    })
}

#[tauri::command]
pub async fn update_tecido(
    state: AppState<'_>,
    id: i64,
    tecido: TecidoUpdate,
) -> Result<Tecido, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Buscar o tecido atual diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at 
         FROM tecidos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let current_tecido = stmt.query_row([id], |row| {
        Ok(Tecido {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            cor: row.get(3)?,
            material: row.get(4)?,
            largura: row.get(5)?,
            valor_metro: row.get(6)?,
            ativo: row.get(7)?,
            created_at: row.get::<_, Option<String>>(8)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(9)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    // Aplicar as atualizações apenas nos campos fornecidos
    let nome = tecido.nome.unwrap_or(current_tecido.nome);
    let descricao = tecido.descricao.or(current_tecido.descricao);
    let cor = tecido.cor.or(current_tecido.cor);
    let material = tecido.material.or(current_tecido.material);
    let largura = tecido.largura.or(current_tecido.largura);
    let valor_metro = tecido.valor_metro.or(current_tecido.valor_metro);
    let ativo = tecido.ativo.unwrap_or(current_tecido.ativo);
    
    // Atualizar no banco
    db.execute(
        "UPDATE tecidos SET nome = ?1, descricao = ?2, cor = ?3, material = ?4, largura = ?5, valor_metro = ?6, ativo = ?7, updated_at = ?8 WHERE id = ?9",
        rusqlite::params![
            nome,
            descricao,
            cor,
            material,
            largura,
            valor_metro,
            ativo,
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o tecido atualizado diretamente no banco
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, cor, material, largura, valor_metro, ativo, created_at, updated_at 
         FROM tecidos WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let updated_tecido = stmt.query_row([id], |row| {
        Ok(Tecido {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            cor: row.get(3)?,
            material: row.get(4)?,
            largura: row.get(5)?,
            valor_metro: row.get(6)?,
            ativo: row.get(7)?,
            created_at: row.get::<_, Option<String>>(8)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(9)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_tecido)
}

#[tauri::command]
pub async fn delete_tecido(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM tecidos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}