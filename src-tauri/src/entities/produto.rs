use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "produtos")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub pedido_id: Option<i32>,
    pub tipo: Option<String>,
    pub descricao: Option<String>,
    pub quantidade: Option<i32>,
    pub preco: Option<f64>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::pedido::Entity",
        from = "Column::PedidoId",
        to = "super::pedido::Column::Id"
    )]
    Pedido,
}

impl Related<super::pedido::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Pedido.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

