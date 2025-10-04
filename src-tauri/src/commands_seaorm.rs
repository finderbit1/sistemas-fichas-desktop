use sea_orm::*;
use crate::entities::*;
use crate::database_new::DatabaseManager;
use tauri::State;
use anyhow::Result;

type AppState<'a> = State<'a, DatabaseManager>;

#[tauri::command]
pub async fn create_cliente_seaorm(
    state: AppState<'_>,
    cliente_data: cliente::ClienteCreate,
) -> Result<cliente::Model, String> {
    let db = &state.connection;
    
    let now = chrono::Utc::now();
    let cliente = cliente::ActiveModel {
        nome: Set(cliente_data.nome),
        email: Set(cliente_data.email),
        telefone: Set(cliente_data.telefone),
        endereco: Set(cliente_data.endereco),
        cidade: Set(cliente_data.cidade),
        estado: Set(cliente_data.estado),
        cep: Set(cliente_data.cep),
        cpf_cnpj: Set(cliente_data.cpf_cnpj),
        observacoes: Set(cliente_data.observacoes),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    };

    let result = cliente::Entity::insert(cliente)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    let cliente_criado = cliente::Entity::find_by_id(result.last_insert_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Cliente não encontrado após criação".to_string())?;

    Ok(cliente_criado)
}

#[tauri::command]
pub async fn get_all_clientes_seaorm(
    state: AppState<'_>,
) -> Result<Vec<cliente::Model>, String> {
    let db = &state.connection;
    
    let clientes = cliente::Entity::find()
        .order_by_asc(cliente::Column::Nome)
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(clientes)
}

#[tauri::command]
pub async fn get_cliente_by_id_seaorm(
    state: AppState<'_>,
    id: i32,
) -> Result<Option<cliente::Model>, String> {
    let db = &state.connection;
    
    let cliente = cliente::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(cliente)
}

#[tauri::command]
pub async fn update_cliente_seaorm(
    state: AppState<'_>,
    id: i32,
    cliente_data: cliente::ClienteUpdate,
) -> Result<cliente::Model, String> {
    let db = &state.connection;
    
    let mut cliente: cliente::ActiveModel = cliente::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Cliente não encontrado".to_string())?
        .into();

    // Aplicar atualizações
    if let Some(nome) = cliente_data.nome {
        cliente.nome = Set(nome);
    }
    if let Some(email) = cliente_data.email {
        cliente.email = Set(email);
    }
    if let Some(telefone) = cliente_data.telefone {
        cliente.telefone = Set(telefone);
    }
    if let Some(endereco) = cliente_data.endereco {
        cliente.endereco = Set(endereco);
    }
    if let Some(cidade) = cliente_data.cidade {
        cliente.cidade = Set(cidade);
    }
    if let Some(estado) = cliente_data.estado {
        cliente.estado = Set(estado);
    }
    if let Some(cep) = cliente_data.cep {
        cliente.cep = Set(cep);
    }
    if let Some(cpf_cnpj) = cliente_data.cpf_cnpj {
        cliente.cpf_cnpj = Set(cpf_cnpj);
    }
    if let Some(observacoes) = cliente_data.observacoes {
        cliente.observacoes = Set(observacoes);
    }

    cliente.updated_at = Set(Some(chrono::Utc::now()));

    let cliente_atualizado = cliente.update(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(cliente_atualizado)
}

#[tauri::command]
pub async fn delete_cliente_seaorm(
    state: AppState<'_>,
    id: i32,
) -> Result<(), String> {
    let db = &state.connection;
    
    cliente::Entity::delete_by_id(id)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_pedido_seaorm(
    state: AppState<'_>,
    pedido_data: pedido::PedidoCreate,
) -> Result<pedido::Model, String> {
    let db = &state.connection;
    
    // Obter próximo número de pedido
    let ultimo_numero = pedido::Entity::find()
        .order_by_desc(pedido::Column::Numero)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .map(|p| p.numero)
        .unwrap_or(0);

    let now = chrono::Utc::now();
    let pedido = pedido::ActiveModel {
        numero: Set(ultimo_numero + 1),
        cliente_id: Set(pedido_data.cliente_id),
        data_pedido: Set(pedido_data.data_pedido.unwrap_or(now)),
        data_entrega: Set(pedido_data.data_entrega),
        status: Set(pedido_data.status.unwrap_or_else(|| "pendente".to_string())),
        valor_total: Set(pedido_data.valor_total),
        observacoes: Set(pedido_data.observacoes),
        vendedor_id: Set(pedido_data.vendedor_id),
        designer_id: Set(pedido_data.designer_id),
        forma_pagamento_id: Set(pedido_data.forma_pagamento_id),
        forma_envio_id: Set(pedido_data.forma_envio_id),
        desconto_id: Set(pedido_data.desconto_id),
        items: Set(pedido_data.items.map(|i| serde_json::to_string(&i).unwrap_or_default())),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    };

    let result = pedido::Entity::insert(pedido)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    let pedido_criado = pedido::Entity::find_by_id(result.last_insert_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Pedido não encontrado após criação".to_string())?;

    Ok(pedido_criado)
}

#[tauri::command]
pub async fn get_all_pedidos_seaorm(
    state: AppState<'_>,
) -> Result<Vec<pedido::Model>, String> {
    let db = &state.connection;
    
    let pedidos = pedido::Entity::find()
        .order_by_desc(pedido::Column::Numero)
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pedidos)
}

#[tauri::command]
pub async fn get_proximo_numero_pedido_seaorm(
    state: AppState<'_>,
) -> Result<i32, String> {
    let db = &state.connection;
    
    let ultimo_numero = pedido::Entity::find()
        .order_by_desc(pedido::Column::Numero)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .map(|p| p.numero)
        .unwrap_or(0);

    Ok(ultimo_numero + 1)
}

#[tauri::command]
pub async fn update_pedido_seaorm(
    state: AppState<'_>,
    id: i32,
    pedido_data: pedido::PedidoUpdateFromFrontend,
) -> Result<pedido::Model, String> {
    let db = &state.connection;
    
    let mut pedido: pedido::ActiveModel = pedido::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Pedido não encontrado".to_string())?
        .into();

    // Aplicar atualizações
    if let Some(cliente_id) = pedido_data.cliente_id {
        pedido.cliente_id = Set(cliente_id);
    }
    if let Some(data_pedido_str) = pedido_data.data_pedido {
        if let Ok(data_pedido) = chrono::DateTime::parse_from_rfc3339(&data_pedido_str) {
            pedido.data_pedido = Set(data_pedido.with_timezone(&chrono::Utc));
        }
    }
    if let Some(data_entrega_str) = pedido_data.data_entrega {
        if let Ok(data_entrega) = chrono::DateTime::parse_from_rfc3339(&data_entrega_str) {
            pedido.data_entrega = Set(Some(data_entrega.with_timezone(&chrono::Utc)));
        }
    }
    if let Some(status) = pedido_data.status {
        pedido.status = Set(status);
    }
    if let Some(valor_total) = pedido_data.valor_total {
        pedido.valor_total = Set(valor_total);
    }
    if let Some(observacoes) = pedido_data.observacoes {
        pedido.observacoes = Set(observacoes);
    }
    if let Some(vendedor_id) = pedido_data.vendedor_id {
        pedido.vendedor_id = Set(Some(vendedor_id));
    }
    if let Some(designer_id) = pedido_data.designer_id {
        pedido.designer_id = Set(Some(designer_id));
    }
    if let Some(forma_pagamento_id) = pedido_data.forma_pagamento_id {
        pedido.forma_pagamento_id = Set(Some(forma_pagamento_id));
    }
    if let Some(forma_envio_id) = pedido_data.forma_envio_id {
        pedido.forma_envio_id = Set(Some(forma_envio_id));
    }
    if let Some(desconto_id) = pedido_data.desconto_id {
        pedido.desconto_id = Set(Some(desconto_id));
    }
    if let Some(items) = pedido_data.items {
        pedido.items = Set(Some(serde_json::to_string(&items).unwrap_or_default()));
    }

    pedido.updated_at = Set(Some(chrono::Utc::now()));

    let pedido_atualizado = pedido.update(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pedido_atualizado)
}

#[tauri::command]
pub async fn delete_pedido_seaorm(
    state: AppState<'_>,
    id: i32,
) -> Result<(), String> {
    let db = &state.connection;
    
    pedido::Entity::delete_by_id(id)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_designer_seaorm(
    state: AppState<'_>,
    designer_data: designer::DesignerCreate,
) -> Result<designer::Model, String> {
    let db = &state.connection;
    
    let now = chrono::Utc::now();
    let designer = designer::ActiveModel {
        nome: Set(designer_data.nome),
        email: Set(designer_data.email),
        telefone: Set(designer_data.telefone),
        especialidade: Set(designer_data.especialidade),
        ativo: Set(designer_data.ativo.unwrap_or(true)),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    };

    let result = designer::Entity::insert(designer)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    let designer_criado = designer::Entity::find_by_id(result.last_insert_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Designer não encontrado após criação".to_string())?;

    Ok(designer_criado)
}

#[tauri::command]
pub async fn get_all_designers_seaorm(
    state: AppState<'_>,
) -> Result<Vec<designer::Model>, String> {
    let db = &state.connection;
    
    let designers = designer::Entity::find()
        .filter(designer::Column::Ativo.eq(true))
        .order_by_asc(designer::Column::Nome)
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(designers)
}

#[tauri::command]
pub async fn create_vendedor_seaorm(
    state: AppState<'_>,
    vendedor_data: vendedor::VendedorCreate,
) -> Result<vendedor::Model, String> {
    let db = &state.connection;
    
    let now = chrono::Utc::now();
    let vendedor = vendedor::ActiveModel {
        nome: Set(vendedor_data.nome),
        email: Set(vendedor_data.email),
        telefone: Set(vendedor_data.telefone),
        ativo: Set(vendedor_data.ativo.unwrap_or(true)),
        comissao_percentual: Set(vendedor_data.comissao_percentual.unwrap_or(0.0)),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    };

    let result = vendedor::Entity::insert(vendedor)
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    let vendedor_criado = vendedor::Entity::find_by_id(result.last_insert_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Vendedor não encontrado após criação".to_string())?;

    Ok(vendedor_criado)
}

#[tauri::command]
pub async fn get_all_vendedores_seaorm(
    state: AppState<'_>,
) -> Result<Vec<vendedor::Model>, String> {
    let db = &state.connection;
    
    let vendedores = vendedor::Entity::find()
        .filter(vendedor::Column::Ativo.eq(true))
        .order_by_asc(vendedor::Column::Nome)
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(vendedores)
}

#[tauri::command]
pub async fn database_backup_seaorm(
    state: AppState<'_>,
) -> Result<String, String> {
    let backup_filename = state.create_backup().await.map_err(|e| e.to_string())?;
    Ok(backup_filename)
}

#[tauri::command]
pub async fn optimize_database_seaorm(
    state: AppState<'_>,
) -> Result<(), String> {
    state.optimize_database().await.map_err(|e| e.to_string())?;
    Ok(())
}
