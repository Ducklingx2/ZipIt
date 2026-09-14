use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::{
    Courier,
    Order,
    Provider,
    Service,
};

#[derive(Clone)]
pub struct AppState {
    pub providers: Arc<Vec<Provider>>,
    pub couriers: Arc<RwLock<Vec<Courier>>>,
    pub orders: Arc<RwLock<Vec<Order>>>,
}

pub fn create_state() -> AppState {
    let providers = vec![
        Provider {
            id: "provider_1".into(),
            name: "Sharma Tailors".into(),
            category: "Tailoring".into(),
            address: "Main Market Road".into(),
            latitude: 18.5204,
            longitude: 73.8567,
            rating: 4.8,
            services: vec![
                Service {
                    id: "service_1".into(),
                    name: "Pant Alteration".into(),
                    price: 120,
                    estimated_minutes: 60,
                },
                Service {
                    id: "service_2".into(),
                    name: "Shirt Alteration".into(),
                    price: 100,
                    estimated_minutes: 45,
                },
                Service {
                    id: "service_3".into(),
                    name: "Zip Replacement".into(),
                    price: 80,
                    estimated_minutes: 30,
                },
            ],
        },

        Provider {
            id: "provider_2".into(),
            name: "FreshFold Laundry".into(),
            category: "Laundry".into(),
            address: "Station Road".into(),
            latitude: 18.5250,
            longitude: 73.8500,
            rating: 4.6,
            services: vec![
                Service {
                    id: "service_4".into(),
                    name: "Wash & Fold".into(),
                    price: 80,
                    estimated_minutes: 180,
                },
                Service {
                    id: "service_5".into(),
                    name: "Ironing".into(),
                    price: 60,
                    estimated_minutes: 90,
                },
            ],
        },

        Provider {
            id: "provider_3".into(),
            name: "QuickFix Shoes".into(),
            category: "Shoe Repair".into(),
            address: "Central Street".into(),
            latitude: 18.5180,
            longitude: 73.8620,
            rating: 4.7,
            services: vec![
                Service {
                    id: "service_6".into(),
                    name: "Shoe Restoration".into(),
                    price: 250,
                    estimated_minutes: 240,
                },
            ],
        },
    ];

    let couriers = vec![
        Courier {
            id: "courier_1".into(),
            name: "Rahul".into(),
            vehicle: "Bike".into(),
            latitude: 18.5215,
            longitude: 73.8550,
            rating: 4.9,
            available: true,
        },

        Courier {
            id: "courier_2".into(),
            name: "Aman".into(),
            vehicle: "Scooter".into(),
            latitude: 18.5270,
            longitude: 73.8510,
            rating: 4.8,
            available: true,
        },

        Courier {
            id: "courier_3".into(),
            name: "Vikram".into(),
            vehicle: "Bike".into(),
            latitude: 18.5150,
            longitude: 73.8610,
            rating: 4.7,
            available: true,
        },
    ];

    AppState {
        providers: Arc::new(providers),
        couriers: Arc::new(RwLock::new(couriers)),
        orders: Arc::new(RwLock::new(Vec::new())),
    }
}
