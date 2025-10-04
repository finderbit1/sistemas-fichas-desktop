use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tecido {
    pub id: Option<i64>,
    pub nome: String,
    pub descricao: Option<String>,
    pub cor: Option<String>,
    pub material: Option<String>,
    pub largura: Option<f64>,
    pub valor_metro: Option<f64>,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TecidoCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub cor: Option<String>,
    pub material: Option<String>,
    pub largura: Option<f64>,
    pub valor_metro: Option<f64>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TecidoUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub cor: Option<String>,
    pub material: Option<String>,
    pub largura: Option<f64>,
    pub valor_metro: Option<f64>,
    pub ativo: Option<bool>,
}



