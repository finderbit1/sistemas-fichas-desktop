use crate::models::producao::{ProducaoTipo, ProducaoTipoCreate};
use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_all_tipos_producao(state: AppState<'_>) -> Result<Vec<ProducaoTipo>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, descricao, valor_metro_quadrado, ativo, created_at, updated_at FROM producoes_tipos WHERE ativo = 1 ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let producao_iter = stmt.query_map([], |row| {
        Ok(ProducaoTipo {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            descricao: row.get(2)?,
            valor_metro_quadrado: row.get(3)?,
            ativo: row.get(4)?,
            created_at: None,
            updated_at: None,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut producoes = Vec::new();
    for producao in producao_iter {
        producoes.push(producao.map_err(|e| e.to_string())?);
    }
    
    Ok(producoes)
}

#[tauri::command]
pub async fn create_tipo_producao(state: AppState<'_>, producao: ProducaoTipoCreate) -> Result<ProducaoTipo, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now();
    let producao = ProducaoTipo {
        id: None,
        nome: producao.nome,
        descricao: producao.descricao,
        valor_metro_quadrado: producao.valor_metro_quadrado,
        ativo: producao.ativo.unwrap_or(true),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let id = db.execute(
        "INSERT INTO producoes_tipos (nome, descricao, valor_metro_quadrado, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            producao.nome,
            producao.descricao,
            producao.valor_metro_quadrado,
            producao.ativo,
            producao.created_at.unwrap().to_rfc3339(),
            producao.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(ProducaoTipo {
        id: Some(id as i64),
        ..producao
    })
}

#[tauri::command]
pub async fn delete_tipo_producao(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM producoes_tipos WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}