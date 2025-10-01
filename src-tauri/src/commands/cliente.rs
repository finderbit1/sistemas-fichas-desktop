use crate::models::cliente::{Cliente, ClienteCreate};
use crate::database::Database;
use tauri::State;
use anyhow::Result;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn create_cliente(
    state: AppState<'_>,
    cliente: ClienteCreate,
) -> Result<Cliente, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let cliente = Cliente {
        id: None,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        cpf_cnpj: cliente.cpf_cnpj,
        observacoes: cliente.observacoes,
        created_at: Some(chrono::Utc::now()),
        updated_at: Some(chrono::Utc::now()),
    };

    let id = db.execute(
        "INSERT INTO clientes (nome, email, telefone, endereco, cidade, estado, cep, cpf_cnpj, observacoes, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            cliente.nome,
            cliente.email,
            cliente.telefone,
            cliente.endereco,
            cliente.cidade,
            cliente.estado,
            cliente.cep,
            cliente.cpf_cnpj,
            cliente.observacoes,
            cliente.created_at.unwrap().to_rfc3339(),
            cliente.updated_at.unwrap().to_rfc3339()
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Cliente {
        id: Some(id as i64),
        ..cliente
    })
}

#[tauri::command]
pub async fn get_all_clientes(state: AppState<'_>) -> Result<Vec<Cliente>, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, endereco, cidade, estado, cep, cpf_cnpj, observacoes, created_at, updated_at 
         FROM clientes ORDER BY nome"
    ).map_err(|e| e.to_string())?;
    
    let cliente_iter = stmt.query_map([], |row| {
        Ok(Cliente {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            endereco: row.get(4)?,
            cidade: row.get(5)?,
            estado: row.get(6)?,
            cep: row.get(7)?,
            cpf_cnpj: row.get(8)?,
            observacoes: row.get(9)?,
            created_at: row.get::<_, Option<String>>(10)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(11)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut clientes = Vec::new();
    for cliente in cliente_iter {
        clientes.push(cliente.map_err(|e| e.to_string())?);
    }
    
    Ok(clientes)
}

#[tauri::command]
pub async fn get_cliente_by_id(state: AppState<'_>, id: i64) -> Result<Cliente, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = db.prepare(
        "SELECT id, nome, email, telefone, endereco, cidade, estado, cep, cpf_cnpj, observacoes, created_at, updated_at 
         FROM clientes WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let cliente = stmt.query_row([id], |row| {
        Ok(Cliente {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            endereco: row.get(4)?,
            cidade: row.get(5)?,
            estado: row.get(6)?,
            cep: row.get(7)?,
            cpf_cnpj: row.get(8)?,
            observacoes: row.get(9)?,
            created_at: row.get::<_, Option<String>>(10)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(11)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(cliente)
}

#[tauri::command]
pub async fn update_cliente(
    state: AppState<'_>,
    id: i64,
    cliente: ClienteCreate,
) -> Result<Cliente, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Atualizar no banco usando os dados fornecidos
    db.execute(
        "UPDATE clientes SET nome = ?1, email = ?2, telefone = ?3, endereco = ?4, cidade = ?5, estado = ?6, cep = ?7, cpf_cnpj = ?8, observacoes = ?9, updated_at = ?10 WHERE id = ?11",
        rusqlite::params![
            cliente.nome,
            cliente.email,
            cliente.telefone,
            cliente.endereco,
            cliente.cidade,
            cliente.estado,
            cliente.cep,
            cliente.cpf_cnpj,
            cliente.observacoes,
            chrono::Utc::now().to_rfc3339(),
            id
        ],
    ).map_err(|e| e.to_string())?;
    
    // Buscar o cliente atualizado
    let mut stmt = db.prepare("SELECT * FROM clientes WHERE id = ?1").map_err(|e| e.to_string())?;
    let updated_cliente = stmt.query_row([id], |row| {
        Ok(Cliente {
            id: Some(row.get(0)?),
            nome: row.get(1)?,
            email: row.get(2)?,
            telefone: row.get(3)?,
            endereco: row.get(4)?,
            cidade: row.get(5)?,
            estado: row.get(6)?,
            cep: row.get(7)?,
            cpf_cnpj: row.get(8)?,
            observacoes: row.get(9)?,
            created_at: row.get::<_, Option<String>>(10)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
            updated_at: row.get::<_, Option<String>>(11)?
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s.as_str()).ok())
                .map(|dt| dt.with_timezone(&chrono::Utc)),
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(updated_cliente)
}

#[tauri::command]
pub async fn delete_cliente(state: AppState<'_>, id: i64) -> Result<(), String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    db.execute("DELETE FROM clientes WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn import_clientes_csv(state: AppState<'_>, csv_content: String) -> Result<i32, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let mut reader = csv::Reader::from_reader(csv_content.as_bytes());
    let mut count = 0;
    
    for result in reader.records() {
        let record = result.map_err(|e| e.to_string())?;
        
        if record.len() < 1 {
            continue;
        }
        
        let nome = record.get(0).unwrap_or("").to_string();
        if nome.is_empty() {
            continue;
        }
        
        let email = record.get(1).map(|s| s.to_string());
        let telefone = record.get(2).map(|s| s.to_string());
        let endereco = record.get(3).map(|s| s.to_string());
        let cidade = record.get(4).map(|s| s.to_string());
        let estado = record.get(5).map(|s| s.to_string());
        let cep = record.get(6).map(|s| s.to_string());
        let cpf_cnpj = record.get(7).map(|s| s.to_string());
        
        let now = chrono::Utc::now().to_rfc3339();
        
        db.execute(
            "INSERT INTO clientes (nome, email, telefone, endereco, cidade, estado, cep, cpf_cnpj, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![nome, email, telefone, endereco, cidade, estado, cep, cpf_cnpj, now, now],
        ).map_err(|e| e.to_string())?;
        
        count += 1;
    }
    
    Ok(count)
}
