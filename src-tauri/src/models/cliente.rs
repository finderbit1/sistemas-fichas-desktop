use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cliente {
    pub id: Option<i64>,
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub endereco: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub cep: Option<String>,
    pub cpf_cnpj: Option<String>,
    pub observacoes: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClienteCreate {
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub endereco: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub cep: Option<String>,
    pub cpf_cnpj: Option<String>,
    pub observacoes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClienteUpdate {
    pub nome: Option<String>,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub endereco: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub cep: Option<String>,
    pub cpf_cnpj: Option<String>,
    pub observacoes: Option<String>,
}



