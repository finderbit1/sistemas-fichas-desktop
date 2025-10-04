use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Designer {
    pub id: Option<i64>,
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub especialidade: Option<String>,
    pub ativo: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesignerCreate {
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub especialidade: Option<String>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesignerUpdate {
    pub nome: Option<String>,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub especialidade: Option<String>,
    pub ativo: Option<bool>,
}



