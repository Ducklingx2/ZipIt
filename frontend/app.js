const API =
    "http://localhost:10000/api";

let providers = [];
let selectedProvider = null;
let selectedService = null;


/* LOAD PROVIDERS */

async function loadProviders() {

    try {

        const response =
            await fetch(
                `${API}/providers`
            );

        const data =
            await response.json();

        providers =
            data.providers;

        renderProviders();
        renderHeroProviders();

    } catch (error) {

        console.error(
            "Failed to load providers:",
            error
        );

        document.getElementById(
            "providers"
        ).innerHTML = `
            <p>
                Couldn't connect to ZipIt's API.
            </p>
        `;
    }
}


/* PROVIDERS */

function renderProviders(
    list = providers
) {

    const container =
        document.getElementById(
            "providers"
        );

    container.innerHTML = "";

    list.forEach(provider => {

        const card =
            document.createElement("div");

        card.className =
            "provider-card";

        card.innerHTML = `
            <div class="provider-visual">
                ${provider.category.toUpperCase()}
            </div>

            <div class="provider-content">

                <h3>
                    ${provider.name}
                    ${provider.verified ? "✓" : ""}
                </h3>

                <p class="category">
                    ${provider.category}
                </p>

                <div class="meta">
                    <span>
                        ★ ${provider.rating}
                        (${provider.reviews})
                    </span>

                    <span>
                        ${provider.distance_km} km
                    </span>
                </div>

            </div>
        `;

        card.onclick =
            () => showProvider(
                provider.id
            );

        container.appendChild(card);
    });
}


/* HERO */

function renderHeroProviders() {

    const container =
        document.getElementById(
            "heroProviders"
        );

    container.innerHTML = "";

    providers
        .slice(0, 2)
        .forEach(provider => {

            container.innerHTML += `
                <div class="hero-mini">

                    <div class="hero-mini-icon">
                        ${provider.category === "Tailoring"
                            ? "✂"
                            : "🧺"}
                    </div>

                    <div>
                        <strong>
                            ${provider.name}
                        </strong>

                        <p>
                            ${provider.distance_km}
                            km · ★
                            ${provider.rating}
                        </p>
                    </div>

                </div>
            `;
        });
}


/* PROVIDER PAGE */

async function showProvider(id) {

    const provider =
        providers.find(
            p => p.id === id
        );

    if (!provider) return;

    selectedProvider =
        provider;

    document
        .getElementById("explore")
        .classList.add("hidden");

    document
        .getElementById("tracking")
        .classList.add("hidden");

    document
        .getElementById("checkout")
        .classList.add("hidden");

    const view =
        document.getElementById(
            "providerView"
        );

    view.classList.remove(
        "hidden"
    );

    const response =
        await fetch(
            `${API}/providers/${id}`
        );

    const data =
        await response.json();

    document.getElementById(
        "providerDetails"
    ).innerHTML = `

        <div class="provider-detail">

            <div class="provider-detail-visual">
                ${provider.category.toUpperCase()}
            </div>

            <div>

                <div class="eyebrow">
                    ${provider.category}
                </div>

                <h1>
                    ${provider.name}
                </h1>

                <p>
                    ${provider.description}
                </p>

                <p>
                    ★ ${provider.rating}
                    · ${provider.reviews} reviews
                    · ${provider.distance_km} km
                </p>

                <h2>
                    Services
                </h2>

                <div class="service-list">

                    ${data.services
                        .map(service => `
                            <div class="service">

                                <div
                                    class="service-info"
                                >

                                    <h3>
                                        ${service.name}
                                    </h3>

                                    <p>
                                        ${service.description}
                                    </p>

                                </div>

                                <div>

                                    <div
                                        class="service-price"
                                    >
                                        ₹${service.price}
                                    </div>

                                    <button
                                        class="primary"
                                        onclick="startCheckout(
                                            '${service.id}',
                                            '${service.name}',
                                            ${service.price}
                                        )"
                                    >
                                        Select
                                    </button>

                                </div>

                            </div>
                        `)
                        .join("")}

                </div>

            </div>

        </div>
    `;
}


/* CHECKOUT */

function startCheckout(
    serviceId,
    serviceName,
    price
) {

    selectedService = {
        id: serviceId,
        name: serviceName,
        price
    };

    document
        .getElementById("providerView")
        .classList.add("hidden");

    const checkout =
        document.getElementById(
            "checkout"
        );

    checkout.classList.remove(
        "hidden"
    );

    document.getElementById(
        "checkoutContent"
    ).innerHTML = `

        <h1>
            Your order
        </h1>

        <p>
            ${selectedProvider.name}
        </p>

        <h3>
            ${serviceName}
        </h3>

        <p>
            Service · ₹${price}
        </p>

        <label>
            Your name

            <input
                id="customerName"
                placeholder="Your name"
            >
        </label>

        <label>
            Pickup address

            <input
                id="pickupAddress"
                placeholder="Where should we pick it up?"
            >
        </label>

        <label>
            Delivery address

            <input
                id="deliveryAddress"
                placeholder="Where should we deliver it?"
            >
        </label>

        <div class="total">

            <span>
                Total
            </span>

            <span>
                ₹${price + 30}
            </span>

        </div>

        <br>

        <button
            class="primary"
            onclick="placeOrder()"
        >
            Place Order
        </button>
    `;
}


/* CREATE ORDER */

async function placeOrder() {

    const customerName =
        document.getElementById(
            "customerName"
        ).value;

    const pickupAddress =
        document.getElementById(
            "pickupAddress"
        ).value;

    const deliveryAddress =
        document.getElementById(
            "deliveryAddress"
        ).value;

    if (
        !customerName ||
        !pickupAddress ||
        !deliveryAddress
    ) {
        alert(
            "Please fill in all fields."
        );

        return;
    }

    const response =
        await fetch(
            `${API}/orders`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    provider_id:
                        selectedProvider.id,

                    service_id:
                        selectedService.id,

                    customer_name:
                        customerName,

                    pickup_address:
                        pickupAddress,

                    delivery_address:
                        deliveryAddress
                })
            }
        );

    if (!response.ok) {

        alert(
            "Couldn't place your order."
        );

        return;
    }

    const order =
        await response.json();

    showTracking(order);
}


/* TRACKING */

function showTracking(order) {

    document
        .getElementById("checkout")
        .classList.add("hidden");

    document
        .getElementById("providerView")
        .classList.add("hidden");

    const tracking =
        document.getElementById(
            "tracking"
        );

    tracking.classList.remove(
        "hidden"
    );

    document.getElementById(
        "trackingContent"
    ).innerHTML = `

        <div class="tracking-card">

            <div class="eyebrow">
                ZIPIT ORDER
            </div>

            <h1>
                #${order.id
                    .slice(0, 8)
                    .toUpperCase()}
            </h1>

            <p>
                ${selectedProvider.name}
            </p>

            <div class="tracking-line">

                ${trackingStep(
                    "Order placed",
                    true
                )}

                ${trackingStep(
                    "Provider confirmed",
                    false
                )}

                ${trackingStep(
                    "Pickup assigned",
                    false
                )}

                ${trackingStep(
                    "Processing",
                    false
                )}

                ${trackingStep(
                    "Ready",
                    false
                )}

                ${trackingStep(
                    "Delivered",
                    false
                )}

            </div>

        </div>
    `;
}


function trackingStep(
    text,
    active
) {

    return `
        <div class="tracking-step">

            <div
                class="dot
                ${active ? "active" : ""}"
            ></div>

            <span>
                ${text}
            </span>

        </div>
    `;
}


/* NAVIGATION */

function showExplore() {

    document
        .getElementById("providerView")
        .classList.add("hidden");

    document
        .getElementById("checkout")
        .classList.add("hidden");

    document
        .getElementById("tracking")
        .classList.add("hidden");

    document
        .getElementById("explore")
        .classList.remove("hidden");

    window.scrollTo({
        top: document
            .getElementById("explore")
            .offsetTop - 80,

        behavior: "smooth"
    });
}


function scrollToExplore() {

    document
        .getElementById("explore")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* SEARCH */

document
    .getElementById("search")
    .addEventListener(
        "input",
        event => {

            const query =
                event.target.value
                    .toLowerCase();

            const filtered =
                providers.filter(
                    provider =>
                        provider.name
                            .toLowerCase()
                            .includes(query) ||

                        provider.category
                            .toLowerCase()
                            .includes(query)
                );

            renderProviders(
                filtered
            );
        }
    );


/* START */

loadProviders();
