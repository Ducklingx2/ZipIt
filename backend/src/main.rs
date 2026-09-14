mod models;
mod routes;
mod state;

use axum::{
    routing::{get, post},
    Router,
};

use tower_http::cors::CorsLayer;

use state::create_state;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let state = create_state();

    let app = Router::new()
        .route("/api/health", get(routes::health))
        .route("/api/providers", get(routes::get_providers))
        .route("/api/providers/{id}", get(routes::get_provider))
        .route("/api/couriers", get(routes::get_couriers))
        .route("/api/orders", post(routes::create_order))
        .route("/api/orders/{id}", get(routes::get_order))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "10000".to_string());

    let address = format!("0.0.0.0:{}", port);

    println!("ZipIt API running on {}", address);

    let listener = tokio::net::TcpListener::bind(&address)
        .await
        .expect("Could not bind to port");

    axum::serve(listener, app)
        .await
        .expect("Server crashed");
}
