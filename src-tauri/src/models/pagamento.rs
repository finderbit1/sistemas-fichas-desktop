use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagamento {
    pub id: Option<i64>,
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PagamentoCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PagamentoUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
}


