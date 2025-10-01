use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProducaoTipo {
    pub id: Option<i64>,
    pub nome: String,
    pub descricao: Option<String>,
    pub valor_metro_quadrado: f64,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProducaoTipoCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub valor_metro_quadrado: f64,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProducaoTipoUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub valor_metro_quadrado: Option<f64>,
    pub ativo: Option<bool>,
}

