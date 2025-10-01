use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pedido {
    pub id: Option<i64>,
    pub numero: i32,
    pub cliente_id: i64,
    pub cliente_nome: Option<String>,
    pub data_pedido: DateTime<Utc>,
    pub data_entrega: Option<DateTime<Utc>>,
    pub status: String,
    pub valor_total: f64,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i64>,
    pub designer_id: Option<i64>,
    pub forma_pagamento_id: Option<i64>,
    pub forma_envio_id: Option<i64>,
    pub desconto_id: Option<i64>,
    pub items: Option<String>, // JSON string
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoCreate {
    pub cliente_id: i64,
    pub data_pedido: Option<DateTime<Utc>>,
    pub data_entrega: Option<DateTime<Utc>>,
    pub status: Option<String>,
    pub valor_total: f64,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i64>,
    pub designer_id: Option<i64>,
    pub forma_pagamento_id: Option<i64>,
    pub forma_envio_id: Option<i64>,
    pub desconto_id: Option<i64>,
    pub items: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoUpdate {
    pub cliente_id: Option<i64>,
    pub data_pedido: Option<DateTime<Utc>>,
    pub data_entrega: Option<DateTime<Utc>>,
    pub status: Option<String>,
    pub valor_total: Option<f64>,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i64>,
    pub designer_id: Option<i64>,
    pub forma_pagamento_id: Option<i64>,
    pub forma_envio_id: Option<i64>,
    pub desconto_id: Option<i64>,
    pub items: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemPedido {
    pub id: Option<i64>,
    pub pedido_id: i64,
    pub tipo_producao_id: i64,
    pub quantidade: i32,
    pub largura: f64,
    pub altura: f64,
    pub valor_unitario: f64,
    pub valor_total: f64,
    pub observacoes: Option<String>,
    pub acabamento: Option<String>, // JSON string
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Acabamento {
    pub tipo: String,
    pub valor: f64,
    pub observacoes: Option<String>,
}

