#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Cliente {
    id: Option<i32>,
    nome: String,
    cidade: String,
    estado: String,
    telefone: String,
}

// Função que abre conexão e cria tabela se não existir
fn conectar() -> Result<Connection> {
    let conn = Connection::open("clientes.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cidade TEXT NOT NULL,
            estado TEXT NOT NULL,
            telefone TEXT NOT NULL
        )",
        [],
    )?;
    Ok(conn)
}

#[command]
fn listar_clientes() -> Result<Vec<Cliente>, String> {
    let conn = conectar().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, nome, cidade, estado, telefone FROM clientes")
        .map_err(|e| e.to_string())?;

    let clientes = stmt
        .query_map([], |row| {
            Ok(Cliente {
                id: Some(row.get(0)?),
                nome: row.get(1)?,
                cidade: row.get(2)?,
                estado: row.get(3)?,
                telefone: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .map(|r| r.unwrap())
        .collect();

    Ok(clientes)
}

#[command]
fn criar_cliente(cliente: Cliente) -> Result<(), String> {
    let conn = conectar().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO clientes (nome, cidade, estado, telefone) VALUES (?1, ?2, ?3, ?4)",
        params![
            cliente.nome,
            cliente.cidade,
            cliente.estado,
            cliente.telefone
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn editar_cliente(cliente: Cliente) -> Result<(), String> {
    let conn = conectar().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE clientes SET nome = ?1, cidade = ?2, estado = ?3, telefone = ?4 WHERE id = ?5",
        params![
            cliente.nome,
            cliente.cidade,
            cliente.estado,
            cliente.telefone,
            cliente.id
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn excluir_cliente(id: i32) -> Result<(), String> {
    let conn = conectar().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clientes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            listar_clientes,
            criar_cliente,
            editar_cliente,
            excluir_cliente
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao rodar o app");
}
