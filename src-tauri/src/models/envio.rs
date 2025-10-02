use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envio {
    pub id: Option<i64>,
    pub nome: String,
    pub descricao: Option<String>,
    pub valor: f64,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvioCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub valor: f64,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvioUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub valor: Option<f64>,
    pub ativo: Option<bool>,
}


