const API =
    "http://localhost:10000/api";


let providers = [];
let selectedProvider = null;
let selectedService = null;
let currentOrder = null;


// -----------------------------
// INITIAL LOAD
// -----------------------------

async function loadProviders() {

    const container =
        document.getElementById("provider-list");

    try {

        const response =
            await fetch(`${API}/providers`);

        if (!response.ok) {
            throw new Error("Failed to load providers");
        }

        providers =
            await response.json();

        renderProviders();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error">
                Could not connect to ZipIt.
                Make sure the Rust backend is running.
            </div>
        `;
    }
}


// -----------------------------
// PROVIDER CARDS
// -----------------------------

function renderProviders() {

    const container =
        document.getElementById("provider-list");

    container.innerHTML = "";

    providers.forEach(provider => {

        const card =
            document.createElement("div");

        card.className =
            "provider-card";

        card.innerHTML = `

            <div class="provider-icon">
                ${getProviderIcon(provider.category)}
            </div>

            <div class="provider-info">

                <div class="provider-top">

                    <h3>
                        ${provider.name}
                    </h3>

                    <span class="rating">
                        ★ ${provider.rating}
                    </span>

                </div>

                <p class="category">
                    ${provider.category}
                </p>

                <p class="address">
                    ${provider.address}
                </p>

            </div>

            <div class="arrow">
                →
            </div>
        `;

        card.onclick = () =>
            selectProvider(provider.id);

        container.appendChild(card);
    });
}


// -----------------------------
// SELECT PROVIDER
// -----------------------------

async function selectProvider(id) {

    try {

        const response =
            await fetch(`${API}/providers/${id}`);

        selectedProvider =
            await response.json();

        renderProviderDetail();

        showSection("provider-section");

    } catch (error) {

        console.error(error);

        alert("Could not load this provider.");
    }
}


// -----------------------------
// PROVIDER DETAIL
// -----------------------------

function renderProviderDetail() {

    const container =
        document.getElementById("provider-detail");

    container.innerHTML = `

        <div class="provider-header">

            <div>

                <p class="eyebrow">
                    ${selectedProvider.category}
                </p>

                <h2>
                    ${selectedProvider.name}
                </h2>

                <p>
                    ★ ${selectedProvider.rating}
                    · ${selectedProvider.address}
                </p>

            </div>

        </div>

        <h3 class="service-title">
            Choose what you need
        </h3>

        <div class="service-list">

            ${selectedProvider.services
                .map(service => `

                    <div
                        class="service-card"
                        onclick="selectService('${service.id}')"
                    >

                        <div>

                            <h3>
                                ${service.name}
                            </h3>

                            <p>
                                Approx.
                                ${service.estimated_minutes}
                                min
                            </p>

                        </div>

                        <strong>
                            ₹${service.price}
                        </strong>

                    </div>

                `)
                .join("")}

        </div>
    `;
}


// -----------------------------
// SELECT SERVICE
// -----------------------------

function selectService(serviceId) {

    selectedService =
        selectedProvider.services.find(
            service => service.id === serviceId
        );

    renderCheckout();

    showSection("checkout-section");
}


// -----------------------------
// CHECKOUT
// -----------------------------

function renderCheckout() {

    const container =
        document.getElementById("checkout-details");

    const estimatedDelivery =
        60;

    const total =
        selectedService.price +
        estimatedDelivery;

    container.innerHTML = `

        <div class="order-summary">

            <div>
                <span>Service</span>
                <strong>
                    ${selectedService.name}
                </strong>
            </div>

            <div>
                <span>Provider</span>
                <strong>
                    ${selectedProvider.name}
                </strong>
            </div>

            <div>
                <span>Service price</span>
                <strong>
                    ₹${selectedService.price}
                </strong>
            </div>

            <div>
                <span>Estimated delivery</span>
                <strong>
                    ₹${estimatedDelivery}
                </strong>
            </div>

            <div class="total">

                <span>
                    Estimated total
                </span>

                <strong>
                    ₹${total}
                </strong>

            </div>

        </div>
    `;
}


// -----------------------------
// CREATE ORDER
// -----------------------------

async function placeOrder() {

    const name =
        document
            .getElementById("customer-name")
            .value
            .trim();

    if (!name) {

        alert("Enter your name first.");

        return;
    }

    const button =
        document.querySelector(
            "#checkout-section .primary-button"
        );

    button.disabled = true;

    button.textContent =
        "Finding nearby courier...";

    try {

        const response =
            await fetch(`${API}/orders`, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    customer_name: name,

                    provider_id:
                        selectedProvider.id,

                    service_id:
                        selectedService.id
                })
            });

        if (!response.ok) {

            throw new Error(
                "No courier available"
            );
        }

        currentOrder =
            await response.json();

        renderTracking();

        showSection("tracking-section");

    } catch (error) {

        console.error(error);

        alert(
            "We couldn't find a courier right now."
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Find me a courier";
    }
}


// -----------------------------
// TRACKING
// -----------------------------

function renderTracking() {

    const container =
        document.getElementById(
            "tracking-details"
        );

    const delivery =
        currentOrder.delivery;

    container.innerHTML = `

        <div class="courier-card">

            <div class="courier-avatar">
                ${delivery.courier_name
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div>

                <p class="eyebrow">
                    YOUR COURIER
                </p>

                <h3>
                    ${delivery.courier_name}
                </h3>

                <p>
                    ${delivery.distance_km} km away
                </p>

            </div>

            <div class="courier-status">
                ● Online
            </div>

        </div>

        <div class="delivery-price">

            <span>
                Delivery
            </span>

            <strong>
                ₹${delivery.delivery_fee}
            </strong>

        </div>

        <div class="tracking-order">

            <span>
                Order
            </span>

            <code>
                ${currentOrder.id.slice(0, 8)}
            </code>

        </div>
    `;
}


// -----------------------------
// NAVIGATION
// -----------------------------

function showSection(sectionId) {

    [
        "provider-section",
        "checkout-section",
        "tracking-section"
    ].forEach(id => {

        document
            .getElementById(id)
            .classList.add("hidden");

    });

    document
        .getElementById(sectionId)
        .classList.remove("hidden");

    document
        .getElementById(sectionId)
        .scrollIntoView({
            behavior: "smooth"
        });
}


function goBackToProviders() {

    document
        .getElementById("provider-section")
        .classList.add("hidden");

    document
        .getElementById("services")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function scrollToServices() {

    document
        .getElementById("services")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// -----------------------------
// ICONS
// -----------------------------

function getProviderIcon(category) {

    if (category === "Tailoring")
        return "✂";

    if (category === "Laundry")
        return "◌";

    if (category === "Shoe Repair")
        return "◈";

    return "•";
}


// -----------------------------
// START
// -----------------------------

loadProviders();
