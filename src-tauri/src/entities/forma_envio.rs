use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "formas_envio")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: bool,
    pub valor: f64,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormaEnvioCreate {
    pub nome: String,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
    pub valor: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormaEnvioUpdate {
    pub nome: Option<String>,
    pub descricao: Option<String>,
    pub ativo: Option<bool>,
    pub valor: Option<f64>,
}
