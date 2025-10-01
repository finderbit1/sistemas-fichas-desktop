use serde::{Deserialize, Serialize};
// use chrono::{DateTime, Utc}; // Removido: não utilizado
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelatorioDiario {
    pub data: String,
    pub total_pedidos: i32,
    pub valor_total: f64,
    pub pedidos: Vec<PedidoResumo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelatorioSemanal {
    pub data_inicio: String,
    pub data_fim: String,
    pub total_pedidos: i32,
    pub valor_total: f64,
    pub pedidos_por_dia: Vec<PedidoPorDia>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelatorioMensal {
    pub mes: i32,
    pub ano: i32,
    pub total_pedidos: i32,
    pub valor_total: f64,
    pub pedidos_por_dia: Vec<PedidoPorDia>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoResumo {
    pub id: i64,
    pub numero: i32,
    pub cliente_nome: String,
    pub valor_total: f64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoPorDia {
    pub data: String,
    pub total_pedidos: i32,
    pub valor_total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankingProduto {
    pub tipo_producao_id: i64,
    pub nome: String,
    pub quantidade: i32,
    pub valor_total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelatorioMatriz {
    pub filtros: RelatorioFiltros,
    pub dados: Vec<DadoMatriz>,
    pub totais: TotaisMatriz,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelatorioFiltros {
    pub data_inicio: Option<String>,
    pub data_fim: Option<String>,
    pub cliente_id: Option<i64>,
    pub vendedor_id: Option<i64>,
    pub designer_id: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DadoMatriz {
    pub pedido_id: i64,
    pub numero: i32,
    pub cliente_nome: String,
    pub vendedor_nome: Option<String>,
    pub designer_nome: Option<String>,
    pub data_pedido: String,
    pub status: String,
    pub valor_total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotaisMatriz {
    pub total_pedidos: i32,
    pub valor_total: f64,
    pub valor_por_status: HashMap<String, f64>,
}
