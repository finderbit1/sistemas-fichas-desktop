use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "tecidos")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub nome: String,
    pub descricao: Option<String>,
    pub cor: Option<String>,
    pub material: Option<String>,
    pub largura: Option<f64>,
    pub valor_metro: Option<f64>,
    pub ativo: bool,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

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
