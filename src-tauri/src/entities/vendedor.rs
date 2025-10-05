use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "vendedores")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub ativo: bool,
    pub comissao_percentual: f64,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::pedido::Entity")]
    Pedidos,
}

impl Related<super::pedido::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Pedidos.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendedorCreate {
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub ativo: Option<bool>,
    pub comissao_percentual: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendedorUpdate {
    pub nome: Option<String>,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub ativo: Option<bool>,
    pub comissao_percentual: Option<f64>,
}

