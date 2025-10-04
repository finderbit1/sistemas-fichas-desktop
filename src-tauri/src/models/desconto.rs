use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Desconto {
    pub id: Option<i64>,
    pub nome: String,
    pub tipo: String, // "percentual" ou "valor_fixo"
    pub valor: f64,
    pub valor_minimo: Option<f64>,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DescontoCreate {
    pub nome: String,
    pub tipo: String,
    pub valor: f64,
    pub valor_minimo: Option<f64>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DescontoUpdate {
    pub nome: Option<String>,
    pub tipo: Option<String>,
    pub valor: Option<f64>,
    pub valor_minimo: Option<f64>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DescontoCalculado {
    pub desconto_id: i64,
    pub nome: String,
    pub valor_desconto: f64,
    pub valor_final: f64,
}



