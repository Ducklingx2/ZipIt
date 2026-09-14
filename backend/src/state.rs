use std::sync::{Arc, RwLock};

use uuid::Uuid;

use crate::models::{
    Order,
    Provider,
    Service,
};

#[derive(Clone)]
pub struct AppState {
    pub providers: Arc<Vec<Provider>>,
    pub services: Arc<Vec<Service>>,
    pub orders: Arc<RwLock<Vec<Order>>>,
}

impl AppState {
    pub fn new() -> Self {
        let provider_1 = Provider {
            id: Uuid::new_v4(),
            name: "Sharma Tailors".into(),
            category: "Tailoring".into(),
            description:
                "Classic tailoring, alterations and custom stitching."
                    .into(),
            rating: 4.8,
            reviews: 142,
            distance_km: 0.8,
            location: "Main Market".into(),
            verified: true,
        };

        let provider_2 = Provider {
            id: Uuid::new_v4(),
            name: "FreshFold Laundry".into(),
            category: "Laundry".into(),
            description:
                "Wash, fold, iron and doorstep laundry service."
                    .into(),
            rating: 4.7,
            reviews: 218,
            distance_km: 1.2,
            location: "Station Road".into(),
            verified: true,
        };

        let provider_3 = Provider {
            id: Uuid::new_v4(),
            name: "QuickFix Shoes".into(),
            category: "Shoe Repair".into(),
            description:
                "Shoe repair, polishing and restoration."
                    .into(),
            rating: 4.6,
            reviews: 87,
            distance_km: 2.1,
            location: "Market Street".into(),
            verified: true,
        };

        let services = vec![
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_1.id,
                name: "Pant Alteration".into(),
                description:
                    "Professional pant length and waist alteration."
                        .into(),
                price: 120,
                estimated_minutes: 180,
            },
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_1.id,
                name: "Shirt Alteration".into(),
                description:
                    "Fit and sleeve alterations."
                        .into(),
                price: 100,
                estimated_minutes: 180,
            },
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_1.id,
                name: "Zip Replacement".into(),
                description:
                    "Replace broken trousers or jacket zips."
                        .into(),
                price: 80,
                estimated_minutes: 120,
            },
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_2.id,
                name: "Wash & Fold".into(),
                description:
                    "Washed, dried and neatly folded."
                        .into(),
                price: 80,
                estimated_minutes: 1440,
            },
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_2.id,
                name: "Ironing".into(),
                description:
                    "Professional ironing service."
                        .into(),
                price: 60,
                estimated_minutes: 720,
            },
            Service {
                id: Uuid::new_v4(),
                provider_id: provider_3.id,
                name: "Shoe Restoration".into(),
                description:
                    "Cleaning, polishing and basic restoration."
                        .into(),
                price: 250,
                estimated_minutes: 1440,
            },
        ];

        Self {
            providers: Arc::new(vec![
                provider_1,
                provider_2,
                provider_3,
            ]),
            services: Arc::new(services),
            orders: Arc::new(RwLock::new(Vec::new())),
        }
    }
}
