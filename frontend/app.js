const API = "http://localhost:10000/api";

let providers = [];
let selectedProvider = null;
let selectedService = null;
let currentOrder = null;

const mainScreen = document.getElementById("mainScreen");
const providerScreen = document.getElementById("providerScreen");
const checkoutScreen = document.getElementById("checkoutScreen");
const trackingScreen = document.getElementById("trackingScreen");

const providerList = document.getElementById("providerList");
const providerCount = document.getElementById("providerCount");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

const providerDetail = document.getElementById("providerDetail");

const checkoutService =
    document.getElementById("checkoutService");

const checkoutProvider =
    document.getElementById("checkoutProvider");

const checkoutServicePrice =
    document.getElementById("checkoutServicePrice");

const checkoutDeliveryPrice =
    document.getElementById("checkoutDeliveryPrice");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const checkoutIcon =
    document.getElementById("checkoutIcon");

const confirmOrder =
    document.getElementById("confirmOrder");

const trackingStatus =
    document.getElementById("trackingStatus");

const trackingDescription =
    document.getElementById("trackingDescription");

const courierName =
    document.getElementById("courierName");

const courierVehicle =
    document.getElementById("courierVehicle");

const courierRating =
    document.getElementById("courierRating");

const courierAvatar =
    document.getElementById("courierAvatar");

const courierMapLabel =
    document.getElementById("courierMapLabel");

const orderId =
    document.getElementById("orderId");


/* ------------------------------
   INITIAL LOAD
------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
    loadProviders();
    setupEvents();
});


/* ------------------------------
   API
------------------------------ */

async function apiRequest(url, options = {}) {

    const response = await fetch(`${API}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        throw new Error(
            `API error ${response.status}`
        );
    }

    return response.json();
}


async function loadProviders() {

    providerList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Finding nearby services...
        </div>
    `;

    try {

        providers = await apiRequest("/providers");

        renderProviders(providers);

        updateMapMarkers(providers);

    } catch (error) {

        console.error(error);

        providerList.innerHTML = `
            <div class="loading">
                <strong>
                    Couldn't connect to ZipIt.
                </strong>
                <br>
                Start the Rust server first.
            </div>
        `;

    }
}


/* ------------------------------
   PROVIDERS
------------------------------ */

function renderProviders(list) {

    providerCount.textContent =
        `${list.length} ${list.length === 1 ? "place" : "places"}`;

    if (!list.length) {

        providerList.innerHTML = `
            <div class="loading">
                No services found.
            </div>
        `;

        return;
    }

    providerList.innerHTML = list
        .map(provider => {

            return `
                <button
                    class="provider-card"
                    data-provider="${provider.id}"
                >

                    <div class="provider-icon">
                        ${getProviderIcon(provider.category)}
                    </div>

                    <div class="provider-main">

                        <h3>
                            ${escapeHtml(provider.name)}
                        </h3>

                        <div class="provider-meta">
                            ${escapeHtml(provider.category)}
                            ·
                            ${escapeHtml(provider.address)}
                        </div>

                        <div class="provider-rating">
                            <span class="star">★</span>
                            ${provider.rating.toFixed(1)}
                        </div>

                    </div>

                    <div class="provider-arrow">
                        ›
                    </div>

                </button>
            `;

        })
        .join("");

    document
        .querySelectorAll(".provider-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const provider =
                    providers.find(
                        p => p.id === card.dataset.provider
                    );

                if (provider) {
                    openProvider(provider);
                }

            });

        });
}


function getProviderIcon(category) {

    switch (category) {

        case "Tailoring":
            return "✂";

        case "Laundry":
            return "▱";

        case "Shoe Repair":
            return "⌁";

        default:
            return "●";
    }
}


/* ------------------------------
   PROVIDER
------------------------------ */

function openProvider(provider) {

    selectedProvider = provider;

    selectedService = null;

    mainScreen.classList.add("hidden");
    checkoutScreen.classList.add("hidden");
    trackingScreen.classList.add("hidden");

    providerScreen.classList.remove("hidden");

    providerDetail.innerHTML = `

        <div class="provider-detail">

            <div class="detail-hero">

                <span class="detail-category">
                    ${escapeHtml(provider.category)}
                </span>

                <h1>
                    ${escapeHtml(provider.name)}
                </h1>

                <span class="detail-address">
                    ${escapeHtml(provider.address)}
                </span>

                <div class="detail-rating">
                    ★ ${provider.rating.toFixed(1)}
                </div>

            </div>


            <h2 class="service-title">
                Choose a service
            </h2>


            <div id="serviceList">

                ${provider.services
                    .map(service => `

                        <button
                            class="service-card"
                            data-service="${service.id}"
                        >

                            <div class="service-main">

                                <strong>
                                    ${escapeHtml(service.name)}
                                </strong>

                                <span>
                                    Estimated time:
                                    ${service.estimated_minutes}
                                    min
                                </span>

                            </div>

                            <div class="service-price">
                                ₹${service.price}
                            </div>

                            <div class="select-circle">
                            </div>

                        </button>

                    `)
                    .join("")}

            </div>

        </div>
    `;


    document
        .querySelectorAll(".service-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                document
                    .querySelectorAll(".service-card")
                    .forEach(c =>
                        c.classList.remove("selected")
                    );

                card.classList.add("selected");

                const service =
                    provider.services.find(
                        s => s.id === card.dataset.service
                    );

                if (!service) return;

                selectedService = service;

                const circle =
                    card.querySelector(".select-circle");

                circle.textContent = "✓";

                document
                    .querySelectorAll(
                        ".service-card:not(.selected) .select-circle"
                    )
                    .forEach(el => {
                        el.textContent = "";
                    });

                setTimeout(() => {
                    openCheckout();
                }, 180);

            });

        });
}


/* ------------------------------
   CHECKOUT
------------------------------ */

function openCheckout() {

    if (!selectedProvider || !selectedService) {
        return;
    }

    providerScreen.classList.add("hidden");
    checkoutScreen.classList.remove("hidden");

    checkoutService.textContent =
        selectedService.name;

    checkoutProvider.textContent =
        selectedProvider.name;

    checkoutServicePrice.textContent =
        `₹${selectedService.price}`;

    const estimatedDistance = 1.5;

    const deliveryFee =
        estimatedDistance < 2
            ? 40
            : estimatedDistance < 5
                ? 60
                : 90;

    checkoutDeliveryPrice.textContent =
        `₹${deliveryFee}`;

    checkoutTotal.textContent =
        `₹${selectedService.price + deliveryFee}`;

    checkoutIcon.textContent =
        getProviderIcon(selectedProvider.category);
}


/* ------------------------------
   CREATE ORDER
------------------------------ */

async function createOrder() {

    if (!selectedProvider || !selectedService) {
        return;
    }

    confirmOrder.disabled = true;

    confirmOrder.innerHTML = `
        <span>Finding a nearby courier...</span>
        <span class="spinner"></span>
    `;

    try {

        const order =
            await apiRequest("/orders", {

                method: "POST",

                body: JSON.stringify({

                    customer_name: "Vihaan",

                    provider_id:
                        selectedProvider.id,

                    service_id:
                        selectedService.id

                })

            });

        currentOrder = order;

        showTracking(order);

    } catch (error) {

        console.error(error);

        alert(
            "ZipIt couldn't find an available courier."
        );

    } finally {

        confirmOrder.disabled = false;

        confirmOrder.innerHTML = `
            <span>Find me a courier</span>
            <span>→</span>
        `;
    }
}


/* ------------------------------
   TRACKING
------------------------------ */

function showTracking(order) {

    checkoutScreen.classList.add("hidden");
    trackingScreen.classList.remove("hidden");

    orderId.textContent =
        order.id.slice(0, 8).toUpperCase();

    updateTracking(order);

    startOrderPolling(order.id);
}


function updateTracking(order) {

    const delivery =
        order.delivery;

    if (!delivery) {

        trackingStatus.textContent =
            "Finding a courier";

        trackingDescription.textContent =
            "Looking for someone nearby.";

        return;
    }

    courierName.textContent =
        delivery.courier_name;

    courierVehicle.textContent =
        "Courier · Assigned";

    courierRating.textContent =
        "--";

    courierAvatar.textContent =
        delivery.courier_name
            .charAt(0)
            .toUpperCase();

    courierMapLabel.textContent =
        delivery.courier_name;


    switch (order.status) {

        case "Courier assigned":

            trackingStatus.textContent =
                "Courier assigned";

            trackingDescription.textContent =
                `${delivery.courier_name} is ready to collect your item.`;

            break;


        case "Picked up":

            trackingStatus.textContent =
                "Item picked up";

            trackingDescription.textContent =
                "Your item is on its way to the service provider.";

            break;


        case "At provider":

            trackingStatus.textContent =
                "At service provider";

            trackingDescription.textContent =
                `${order.provider_name} has received your item.`;

            break;


        case "Ready":

            trackingStatus.textContent =
                "Ready for return";

            trackingDescription.textContent =
                "Your item is ready to come back to you.";

            break;


        case "Returning":

            trackingStatus.textContent =
                "Returning to you";

            trackingDescription.textContent =
                "Your courier is bringing your item back.";

            break;


        case "Delivered":

            trackingStatus.textContent =
                "Delivered";

            trackingDescription.textContent =
                "Your ZipIt order is complete.";

            break;


        default:

            trackingStatus.textContent =
                order.status;

            trackingDescription.textContent =
                "Your order is being processed.";
    }
}


/* ------------------------------
   POLLING
------------------------------ */

let pollingTimer = null;

function startOrderPolling(id) {

    if (pollingTimer) {
        clearInterval(pollingTimer);
    }

    pollingTimer = setInterval(
        async () => {

            try {

                const order =
                    await apiRequest(
                        `/orders/${id}`
                    );

                currentOrder = order;

                updateTracking(order);

            } catch (error) {

                console.error(
                    "Tracking update failed:",
                    error
                );

            }

        },
        3000
    );
}


/* ------------------------------
   SEARCH
------------------------------ */

searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        clearSearch.classList.toggle(
            "hidden",
            !query
        );

        const filtered =
            providers.filter(provider => {

                const providerText =
                    `${provider.name}
                    ${provider.category}
                    ${provider.address}
                    ${provider.services
                        .map(s => s.name)
                        .join(" ")}`
                        .toLowerCase();

                return providerText.includes(query);

            });

        renderProviders(filtered);

    }
);


clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.add(
            "hidden"
        );

        renderProviders(providers);

        searchInput.focus();

    }
);


/* ------------------------------
   CATEGORIES
------------------------------ */

document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".category")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                const category =
                    button.dataset.category;

                if (category === "All") {

                    renderProviders(providers);

                    return;
                }

                const filtered =
                    providers.filter(
                        p => p.category === category
                    );

                renderProviders(filtered);

            }
        );

    });


/* ------------------------------
   NAVIGATION
------------------------------ */

function showHome() {

    providerScreen.classList.add("hidden");
    checkoutScreen.classList.add("hidden");
    trackingScreen.classList.add("hidden");

    mainScreen.classList.remove("hidden");

}


document
    .getElementById("providerBack")
    .addEventListener(
        "click",
        showHome
    );


document
    .getElementById("checkoutBack")
    .addEventListener(
        "click",
        () => {

            checkoutScreen.classList.add(
                "hidden"
            );

            providerScreen.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("trackingBack")
    .addEventListener(
        "click",
        showHome
    );


document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".nav-item")
                    .forEach(nav =>
                        nav.classList.remove("active")
                    );

                item.classList.add("active");

                if (
                    item.dataset.screen === "home"
                ) {
                    showHome();
                }

            }
        );

    });


/* ------------------------------
   LOCATION
------------------------------ */

document
    .getElementById("locationButton")
    .addEventListener(
        "click",
        () => {

            if (!navigator.geolocation) {

                alert(
                    "Location isn't available in this browser."
                );

                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {

                    const lat =
                        position.coords.latitude
                            .toFixed(4);

                    const lon =
                        position.coords.longitude
                            .toFixed(4);

                    document
                        .getElementById("locationText")
                        .textContent =
                        `${lat}, ${lon}`;

                },

                () => {

                    document
                        .getElementById("locationText")
                        .textContent =
                        "Location unavailable";

                }
            );

        }
    );


document
    .getElementById("recenterButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("locationButton")
                .click();

        }
    );


/* ------------------------------
   MAP
------------------------------ */

function updateMapMarkers(providerList) {

    const markers =
        document.querySelectorAll(
            ".provider-marker"
        );

    markers.forEach(
        marker => {
            marker.style.display = "none";
        }
    );

    providerList
        .slice(0, 3)
        .forEach((provider, index) => {

            if (markers[index]) {
                markers[index].style.display =
                    "flex";
            }

        });
}


/* ------------------------------
   EVENTS
------------------------------ */

function setupEvents() {

    confirmOrder.addEventListener(
        "click",
        createOrder
    );

}


/* ------------------------------
   SAFETY / HTML
------------------------------ */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
