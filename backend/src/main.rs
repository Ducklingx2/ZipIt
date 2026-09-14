mod models;
mod routes;
mod state;

use axum::{
    routing::{get, post},
    Router,
};

use tower_http::cors::{Any, CorsLayer};

use state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let state = AppState::new();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(routes::health))
        .route("/api/providers", get(routes::providers))
        .route(
            "/api/providers/{id}",
            get(routes::provider),
        )
        .route(
            "/api/orders",
            post(routes::create_order),
        )
        .route(
            "/api/orders/{id}",
            get(routes::get_order),
        )
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "10000".into());

    let address =
        format!("0.0.0.0:{port}");

    println!(
        "ZipIt API running on {}",
        address
    );

    let listener =
        tokio::net::TcpListener::bind(&address)
            .await
            .unwrap();

    axum::serve(listener, app)
        .await
        .unwrap();
}
