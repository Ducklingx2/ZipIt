use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use crate::{
    models::{CreateOrder, Delivery, Order},
    state::AppState,
};

fn distance(
    lat1: f64,
    lon1: f64,
    lat2: f64,
    lon2: f64,
) -> f64 {
    let lat_difference = lat1 - lat2;
    let lon_difference = lon1 - lon2;

    let raw_distance =
        (lat_difference.powi(2) + lon_difference.powi(2)).sqrt();

    raw_distance * 111.0
}

pub async fn health() -> &'static str {
    "ZipIt API is running"
}

pub async fn get_providers(
    State(state): State<AppState>,
) -> Json<Vec<crate::models::Provider>> {
    Json((*state.providers).clone())
}

pub async fn get_provider(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<crate::models::Provider>, StatusCode> {
    match state.providers.iter().find(|p| p.id == id) {
        Some(provider) => Ok(Json(provider.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn get_couriers(
    State(state): State<AppState>,
) -> Json<Vec<crate::models::Courier>> {
    let couriers = state.couriers.read().await;

    Json(couriers.clone())
}

pub async fn create_order(
    State(state): State<AppState>,
    Json(request): Json<CreateOrder>,
) -> Result<Json<Order>, StatusCode> {

    let provider = match state
        .providers
        .iter()
        .find(|p| p.id == request.provider_id)
    {
        Some(provider) => provider,
        None => return Err(StatusCode::NOT_FOUND),
    };

    let service = match provider
        .services
        .iter()
        .find(|s| s.id == request.service_id)
    {
        Some(service) => service,
        None => return Err(StatusCode::NOT_FOUND),
    };

    let mut couriers = state.couriers.write().await;

    let mut best_index: Option<usize> = None;
    let mut best_distance = f64::MAX;

    for (index, courier) in couriers.iter().enumerate() {
        if !courier.available {
            continue;
        }

        let courier_distance = distance(
            courier.latitude,
            courier.longitude,
            18.5204,
            73.8567,
        );

        if courier_distance < best_distance {
            best_distance = courier_distance;
            best_index = Some(index);
        }
    }

    let courier_index = match best_index {
        Some(index) => index,
        None => return Err(StatusCode::SERVICE_UNAVAILABLE),
    };

    let courier = &mut couriers[courier_index];

    courier.available = false;

    let delivery_fee =
        if best_distance < 2.0 {
            40
        } else if best_distance < 5.0 {
            60
        } else {
            90
        };

    let delivery = Delivery {
        id: uuid::Uuid::new_v4().to_string(),
        courier_id: courier.id.clone(),
        courier_name: courier.name.clone(),
        status: "Courier assigned".into(),
        distance_km: (best_distance * 10.0).round() / 10.0,
        delivery_fee,
    };

    let order = Order {
        id: uuid::Uuid::new_v4().to_string(),
        customer_name: request.customer_name,
        provider_id: provider.id.clone(),
        provider_name: provider.name.clone(),
        service_id: service.id.clone(),
        service_name: service.name.clone(),
        service_price: service.price,
        delivery_fee,
        total_price: service.price + delivery_fee,
        status: "Courier assigned".into(),
        delivery: Some(delivery),
    };

    let mut orders = state.orders.write().await;

    orders.push(order.clone());

    Ok(Json(order))
}

pub async fn get_order(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Order>, StatusCode> {

    let orders = state.orders.read().await;

    match orders.iter().find(|order| order.id == id) {
        Some(order) => Ok(Json(order.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}
