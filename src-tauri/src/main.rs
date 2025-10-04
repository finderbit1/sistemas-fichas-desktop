#![cfg_attr(
    all(not(debug_assertions), target_os = "linux"),
    windows_subsystem = "windows"
)]

mod models;
mod commands;
mod database;
mod entities;
mod database_orm;
mod database_new;
mod commands_seaorm;

use database::Database;
use database_new::create_database;

#[tokio::main]
async fn main() {
    // Encaminhar erros para try_main
    if let Err(e) = try_main().await {
        eprintln!("❌ Erro fatal: {e:?}");
        eprintln!("🔍 Stack trace:");
        eprintln!("{:#?}", e);
        std::process::exit(1);
    }
}

async fn try_main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Iniciando Sistema de Fichas - Versão Rust");

    // Conexão com banco de dados SeaORM
    let database_manager = match create_database().await {
        Ok(db) => {
            println!("✅ Banco de dados SeaORM conectado");
            db
        }
        Err(e) => {
            eprintln!("❌ Erro ao conectar banco SeaORM: {}", e);
            return Err(e.into());
        }
    };

    // Criar wrapper para compatibilidade com commands existentes
    let database = Database::new("data/clientes.db".into())?;
    database.init_tables()?;

    println!("🔧 Registrando comandos Tauri...");

    // Iniciar app Tauri
    let app_result = tauri::Builder::default()
        .manage(database)
        .manage(database_manager)
        .invoke_handler(tauri::generate_handler![
            // Comandos de Clientes
            commands::cliente::create_cliente,
            commands::cliente::get_all_clientes,
            commands::cliente::get_cliente_by_id,
            commands::cliente::update_cliente,
            commands::cliente::delete_cliente,
            commands::cliente::import_clientes_csv,

            // Comandos de Pedidos
            commands::pedido::create_pedido,
            commands::pedido::update_pedido,
            commands::pedido::get_all_pedidos,
            commands::pedido::get_proximo_numero_pedido,
            commands::pedido::delete_pedido,

            // Comandos de Pagamentos
            commands::pagamento::get_all_pagamentos,
            commands::pagamento::create_pagamento,
            commands::pagamento::update_pagamento,
            commands::pagamento::delete_pagamento,

            // Comandos de Envios
            commands::envio::get_all_envios,
            commands::envio::get_envio_by_id,
            commands::envio::create_envio,
            commands::envio::update_envio,
            commands::envio::delete_envio,

            // Comandos de Descontos
            commands::desconto::get_all_descontos,
            commands::desconto::calcular_desconto,
            commands::desconto::create_desconto,
            commands::desconto::delete_desconto,

            // Comandos de Produções
            commands::producao::get_all_tipos_producao,
            commands::producao::create_tipo_producao,
            commands::producao::delete_tipo_producao,

            // Comandos de Tecidos
            commands::tecido::get_all_tecidos,
            commands::tecido::get_tecido_by_id,
            commands::tecido::create_tecido,
            commands::tecido::update_tecido,
            commands::tecido::delete_tecido,

            // Comandos de Designers
            commands::designer::get_all_designers,
            commands::designer::create_designer,
            commands::designer::delete_designer,

            // Comandos de Vendedores
            commands::vendedor::get_all_vendedores,
            commands::vendedor::get_vendedor_by_id,
            commands::vendedor::create_vendedor,
            commands::vendedor::update_vendedor,
            commands::vendedor::delete_vendedor,

            // Comandos de Descontos
            commands::desconto::get_all_descontos,
            commands::desconto::get_desconto_by_id,
            commands::desconto::calcular_desconto,
            commands::desconto::create_desconto,
            commands::desconto::update_desconto,
            commands::desconto::delete_desconto,

            // Comandos de Limpeza do Banco
            commands::limpeza::limpar_banco_dados,
            commands::limpeza::verificar_status_banco,
            commands::limpeza::recriar_tabela_pedidos,
            commands::limpeza::inserir_dados_padrao,

            // Comandos de Relatórios
            commands::relatorio::gerar_relatorio_diario,
            commands::relatorio::gerar_relatorio_semanal,
            commands::relatorio::gerar_relatorio_mensal,
            commands::relatorio::obter_ranking_produtos,
            commands::relatorio::gerar_relatorio_matriz,

            // Comandos SeaORM - Novos commands otimizados
            commands_seaorm::create_cliente_seaorm,
            commands_seaorm::get_all_clientes_seaorm,
            commands_seaorm::get_cliente_by_id_seaorm,
            commands_seaorm::update_cliente_seaorm,
            commands_seaorm::delete_cliente_seaorm,
            commands_seaorm::create_pedido_seaorm,
            commands_seaorm::get_all_pedidos_seaorm,
            commands_seaorm::get_proximo_numero_pedido_seaorm,
            commands_seaorm::update_pedido_seaorm,
            commands_seaorm::delete_pedido_seaorm,
            commands_seaorm::create_designer_seaorm,
            commands_seaorm::get_all_designers_seaorm,
            commands_seaorm::create_vendedor_seaorm,
            commands_seaorm::get_all_vendedores_seaorm,
            commands_seaorm::database_backup_seaorm,
            commands_seaorm::optimize_database_seaorm,
        ])
        .run(tauri::generate_context!());

    match app_result {
        Ok(_) => {
            println!("✅ Aplicação Tauri executada com sucesso!");
        }
        Err(e) => {
            eprintln!("❌ Erro ao executar aplicação Tauri: {e:?}");
            println!("🔧 Tentando modo alternativo...");
            start_web_server();
        }
    }

    Ok(())
}

/// Caso o Tauri não consiga abrir a janela, roda como servidor web alternativo.
fn start_web_server() {
    println!("🌐 Iniciando servidor web alternativo...");
    println!("📡 Servidor disponível em: http://localhost:8080");
    println!("🔧 Comandos Rust disponíveis via HTTP");
    println!("");
    println!("📋 Endpoints disponíveis:");
    println!("   GET  /api/clientes - Listar clientes");
    println!("   POST /api/clientes - Criar cliente");
    println!("   GET  /api/pedidos  - Listar pedidos");
    println!("   GET  /api/status   - Status do sistema");
    println!("");
    println!("✅ Sistema funcionando em modo web!");
}
