use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "designers")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub nome: String,
    pub email: Option<String>,
    pub telefone: Option<String>,
    pub especialidade: Option<String>,
    pub ativo: bool,
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

