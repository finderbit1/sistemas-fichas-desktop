use crate::database::Database;
use tauri::State;

type AppState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn limpar_banco_dados(state: AppState<'_>) -> Result<String, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    // Desabilitar verificações de chave estrangeira temporariamente
    db.execute("PRAGMA foreign_keys = OFF", [])
        .map_err(|e| e.to_string())?;
    
    // Lista das tabelas para limpar
    let tabelas = vec![
        "clientes", "pedidos", "produtos", "pagamentos",
        "formas_envio", "designers", "vendedores",
        "descontos", "tipos_producao", "tecidos"
    ];
    
    let mut total_removidos = 0;
    let mut resultados = Vec::new();
    
    for tabela in &tabelas {
        // Contar registros antes da remoção
        let mut stmt = db.prepare(&format!("SELECT COUNT(*) FROM {}", tabela))
            .map_err(|e| e.to_string())?;
        let count: i64 = stmt.query_row([], |row| Ok(row.get(0)?))
            .map_err(|e| e.to_string())?;
        
        // Deletar todos os registros
        db.execute(&format!("DELETE FROM {}", tabela), [])
            .map_err(|e| e.to_string())?;
        
        // Resetar contador de ID
        db.execute(&format!("DELETE FROM sqlite_sequence WHERE name = '{}'", tabela), [])
            .map_err(|e| e.to_string())?;
        
        total_removidos += count;
        resultados.push(format!("{}: {} registros removidos", tabela, count));
    }
    
    // Reabilitar verificações de chave estrangeira
    db.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| e.to_string())?;
    
    // Inserir dados padrão novamente
    inserir_dados_padrao_interno(&db)?;
    
    let mensagem = format!(
        "Banco de dados limpo com sucesso!\nTotal de registros removidos: {}\n\nDetalhes:\n{}",
        total_removidos,
        resultados.join("\n")
    );
    
    Ok(mensagem)
}

#[tauri::command]
pub async fn verificar_status_banco(state: AppState<'_>) -> Result<String, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    let tabelas = vec![
        "clientes", "pedidos", "produtos", "pagamentos",
        "formas_envio", "designers", "vendedores",
        "descontos", "tipos_producao", "tecidos"
    ];
    
    let mut resultados = Vec::new();
    let mut total_registros = 0;
    
    for tabela in &tabelas {
        let mut stmt = db.prepare(&format!("SELECT COUNT(*) FROM {}", tabela))
            .map_err(|e| e.to_string())?;
        let count: i64 = stmt.query_row([], |row| Ok(row.get(0)?))
            .map_err(|e| e.to_string())?;
        
        total_registros += count;
        resultados.push(format!("{}: {} registros", tabela, count));
    }
    
    let mensagem = format!(
        "Status do Banco de Dados:\nTotal de registros: {}\n\nDetalhes:\n{}",
        total_registros,
        resultados.join("\n")
    );
    
    Ok(mensagem)
}

#[tauri::command]
pub async fn inserir_dados_padrao(state: AppState<'_>) -> Result<String, String> {
    let db = state.get_connection().map_err(|e| e.to_string())?;
    
    inserir_dados_padrao_interno(&db)?;
    
    let mensagem = "Dados padrão inseridos com sucesso!\n\nDetalhes:\n- Métodos de pagamento: Dinheiro, Cartão, PIX\n- Formas de envio: Correios, Transportadora, Retirada na Loja".to_string();
    
    Ok(mensagem)
}

fn inserir_dados_padrao_interno(db: &rusqlite::Connection) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    
    // Inserir métodos de pagamento padrão
    let pagamentos = vec![
        ("Dinheiro", "Pagamento em dinheiro"),
        ("Cartão", "Pagamento com cartão de crédito/débito"),
        ("Pix", "Pagamento instantâneo via PIX"),
    ];
    
    for (nome, descricao) in pagamentos {
        db.execute(
            "INSERT OR IGNORE INTO pagamentos (nome, descricao, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![nome, descricao, true, now, now],
        ).map_err(|e| e.to_string())?;
    }
    
    // Inserir formas de envio padrão
    let envios = vec![
        ("Correios", "Envio via Correios", 15.0),
        ("Transportadora", "Envio via transportadora", 25.0),
        ("Retirada na Loja", "Cliente retira na loja", 0.0),
    ];
    
    for (nome, descricao, valor) in envios {
        db.execute(
            "INSERT OR IGNORE INTO formas_envio (nome, descricao, valor, ativo, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![nome, descricao, valor, true, now, now],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}