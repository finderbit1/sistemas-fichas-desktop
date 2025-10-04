use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "formas_pagamento")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: bool,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormaPagamentoCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormaPagamentoUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
}
