use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Serialize)]
pub struct Provider {
    pub id: String,
    pub name: String,
    pub category: String,
    pub address: String,
    pub latitude: f64,
    pub longitude: f64,
    pub rating: f64,
    pub services: Vec<Service>,
}

#[derive(Clone, Serialize)]
pub struct Service {
    pub id: String,
    pub name: String,
    pub price: u32,
    pub estimated_minutes: u32,
}

#[derive(Clone, Serialize)]
pub struct Courier {
    pub id: String,
    pub name: String,
    pub vehicle: String,
    pub latitude: f64,
    pub longitude: f64,
    pub rating: f64,
    pub available: bool,
}

#[derive(Clone, Serialize)]
pub struct Delivery {
    pub id: String,
    pub courier_id: String,
    pub courier_name: String,
    pub status: String,
    pub distance_km: f64,
    pub delivery_fee: u32,
}

#[derive(Clone, Serialize)]
pub struct Order {
    pub id: String,
    pub customer_name: String,
    pub provider_id: String,
    pub provider_name: String,
    pub service_id: String,
    pub service_name: String,
    pub service_price: u32,
    pub delivery_fee: u32,
    pub total_price: u32,
    pub status: String,
    pub delivery: Option<Delivery>,
}

#[derive(Deserialize)]
pub struct CreateOrder {
    pub customer_name: String,
    pub provider_id: String,
    pub service_id: String,
}
