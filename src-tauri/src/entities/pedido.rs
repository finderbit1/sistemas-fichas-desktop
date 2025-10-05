use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "pedidos")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub numero: i32,
    pub cliente_id: i32,
    pub cliente_nome: Option<String>,
    pub data_pedido: DateTimeUtc,
    pub data_entrega: Option<DateTimeUtc>,
    pub status: String,
    pub valor_total: f64,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i32>,
    pub designer_id: Option<i32>,
    pub forma_pagamento_id: Option<i32>,
    pub forma_envio_id: Option<i32>,
    pub desconto_id: Option<i32>,
    #[sea_orm(column_type = "Text")]
    pub items: Option<String>,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::cliente::Entity",
        from = "Column::ClienteId",
        to = "super::cliente::Column::Id"
    )]
    Cliente,
    #[sea_orm(has_many = "super::produto::Entity")]
    Produtos,
    #[sea_orm(
        belongs_to = "super::designer::Entity",
        from = "Column::DesignerId",
        to = "super::designer::Column::Id"
    )]
    Designer,
    #[sea_orm(
        belongs_to = "super::vendedor::Entity",
        from = "Column::VendedorId",
        to = "super::vendedor::Column::Id"
    )]
    Vendedor,
}

impl Related<super::cliente::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Cliente.def()
    }
}

impl Related<super::produto::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Produtos.def()
    }
}

impl Related<super::designer::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Designer.def()
    }
}

impl Related<super::vendedor::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Vendedor.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

// DTOs para API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoCreate {
    pub cliente_id: i32,
    pub data_pedido: Option<DateTimeUtc>,
    pub data_entrega: Option<DateTimeUtc>,
    pub status: Option<String>,
    pub valor_total: f64,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i32>,
    pub designer_id: Option<i32>,
    pub forma_pagamento_id: Option<i32>,
    pub forma_envio_id: Option<i32>,
    pub desconto_id: Option<i32>,
    pub items: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoUpdate {
    pub cliente_id: Option<i32>,
    pub data_pedido: Option<DateTimeUtc>,
    pub data_entrega: Option<DateTimeUtc>,
    pub status: Option<String>,
    pub valor_total: Option<f64>,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i32>,
    pub designer_id: Option<i32>,
    pub forma_pagamento_id: Option<i32>,
    pub forma_envio_id: Option<i32>,
    pub desconto_id: Option<i32>,
    pub items: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoUpdateFromFrontend {
    pub cliente_id: Option<i32>,
    pub data_pedido: Option<String>, // ISO string
    pub data_entrega: Option<String>, // ISO string
    pub status: Option<String>,
    pub valor_total: Option<f64>,
    pub observacoes: Option<String>,
    pub vendedor_id: Option<i32>,
    pub designer_id: Option<i32>,
    pub forma_pagamento_id: Option<i32>,
    pub forma_envio_id: Option<i32>,
    pub desconto_id: Option<i32>,
    pub items: Option<String>,
}
