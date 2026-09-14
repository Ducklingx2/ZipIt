use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use uuid::Uuid;

use crate::{
    models::{
        CreateOrder,
        Order,
    },
    state::AppState,
};

pub async fn health() -> &'static str {
    "ZipIt API is running."
}

pub async fn providers(
    State(state): State<AppState>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "providers": &*state.providers
    }))
}

pub async fn provider(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let provider = state
        .providers
        .iter()
        .find(|provider| provider.id == id)
        .ok_or(StatusCode::NOT_FOUND)?;

    let services: Vec<_> = state
        .services
        .iter()
        .filter(|service| service.provider_id == id)
        .collect();

    Ok(Json(serde_json::json!({
        "provider": provider,
        "services": services
    })))
}

pub async fn create_order(
    State(state): State<AppState>,
    Json(payload): Json<CreateOrder>,
) -> Result<Json<Order>, StatusCode> {
    let service = state
        .services
        .iter()
        .find(|service| service.id == payload.service_id)
        .ok_or(StatusCode::BAD_REQUEST)?;

    if !state
        .providers
        .iter()
        .any(|provider| provider.id == payload.provider_id)
    {
        return Err(StatusCode::BAD_REQUEST);
    }

    if service.provider_id != payload.provider_id {
        return Err(StatusCode::BAD_REQUEST);
    }

    let delivery_fee = 30;

    let order = Order {
        id: Uuid::new_v4(),

        provider_id: payload.provider_id,
        service_id: payload.service_id,

        customer_name: payload.customer_name,

        pickup_address: payload.pickup_address,
        delivery_address: payload.delivery_address,

        status: "placed".into(),

        service_price: service.price,
        delivery_fee,

        total: service.price + delivery_fee,
    };

    state
        .orders
        .write()
        .unwrap()
        .push(order.clone());

    Ok(Json(order))
}

pub async fn get_order(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, StatusCode> {
    let orders = state.orders.read().unwrap();

    let order = orders
        .iter()
        .find(|order| order.id == id)
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(order.clone()))
}
