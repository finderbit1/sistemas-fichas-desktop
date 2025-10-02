use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vendedor {
    pub id: Option<i64>,
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub comissao_percentual: Option<f64>,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendedorCreate {
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub comissao_percentual: Option<f64>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendedorUpdate {
    pub nome: Option<String>,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub comissao_percentual: Option<f64>,
    pub ativo: Option<bool>,
}


