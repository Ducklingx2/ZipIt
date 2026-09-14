use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize)]
pub struct Provider {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    pub description: String,
    pub rating: f32,
    pub reviews: u32,
    pub distance_km: f32,
    pub location: String,
    pub verified: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct Service {
    pub id: Uuid,
    pub provider_id: Uuid,
    pub name: String,
    pub description: String,
    pub price: u32,
    pub estimated_minutes: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct Order {
    pub id: Uuid,
    pub provider_id: Uuid,
    pub service_id: Uuid,

    pub customer_name: String,
    pub pickup_address: String,
    pub delivery_address: String,

    pub status: String,

    pub service_price: u32,
    pub delivery_fee: u32,
    pub total: u32,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrder {
    pub provider_id: Uuid,
    pub service_id: Uuid,

    pub customer_name: String,
    pub pickup_address: String,
    pub delivery_address: String,
}
