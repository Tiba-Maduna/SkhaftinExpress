
let cart = {};

// 1. LOAD the trolley from phone memory when page opens
try {
    cart = JSON.parse(localStorage.getItem("skhaftin_cart") || "{}");
} catch(e) {
    cart = {};
}

// 2. SAVE the trolley every time it changes
function saveCart() {
    localStorage.setItem("skhaftin_cart", JSON.stringify(cart));
}

// 3. Which aisle are we on? Reads <body data-aisle="Dairy">
function getAisleName() {
    if (document.body.dataset.aisle) return document.body.dataset.aisle;
    let file = window.location.pathname.split("/").pop().replace(".html","").replace(".htm","");
    return file ? file.charAt(0).toUpperCase() + file.slice(1) : "General";
}

// FORMAT RAND
function money(amount) {
    return "R" + amount.toFixed(2);
}


// POPUPS - NO alert()
function ensurePopupStyles() {
    if (document.getElementById("skhaftin-popup-styles")) return;
    const style = document.createElement("style");
    style.id = "skhaftin-popup-styles";
    style.textContent = `
        .toast { position: fixed; bottom: 90px; left: 50%; transform: translate(-50%, 20px); background: #111; color: #fff; padding: 13px 20px; border-radius: 30px; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif; z-index: 99999; opacity: 0; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 90%; text-align: center; pointer-events: none; }
        .toast.show { opacity: 1; transform: translate(-50%, 0); }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 100000; display: flex; align-items: flex-end; justify-content: center; opacity: 0; transition: opacity 0.25s ease; }
        .confirm-overlay.show { opacity: 1; }
        .confirm-box { background: white; width: 100%; max-width: 420px; padding: 24px; border-radius: 22px 22px 0 0; font-family: 'Poppins', sans-serif; text-align: center; transform: translateY(100%); transition: transform 0.3s ease; }
        .confirm-overlay.show .confirm-box { transform: translateY(0); }
        .confirm-box h3 { font-size: 20px; margin-bottom: 8px; color: #222; }
        .confirm-box p { font-size: 14px; color: #666; margin-bottom: 20px; }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-actions button { flex: 1; padding: 14px; border-radius: 12px; border: none; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; }
        .confirm-cancel { background: #f1f1f1; color: #333; }
        .confirm-ok { background: #159447; color: white; }
    `;
    document.head.appendChild(style);
}

function showToast(message) {
    ensurePopupStyles();
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function showConfirmModal(title, message, confirmText, onConfirm) {
    ensurePopupStyles();
    const old = document.querySelector(".confirm-overlay");
    if (old) old.remove();
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-box">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="confirm-cancel">Cancel</button>
                <button class="confirm-ok">${confirmText}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add("show"), 10);
    overlay.querySelector(".confirm-cancel").onclick = () => overlay.remove();
    overlay.querySelector(".confirm-ok").onclick = () => { overlay.remove(); onConfirm(); };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// PRODUCTS
const productCards = document.querySelectorAll(".card");

productCards.forEach((card, index) => {
    const name = card.querySelector("h3").textContent.trim();
    const priceText = card.querySelector(".price").textContent;
    const price = Number(priceText.replace(/[^\d.]/g, ""));
    const image = card.querySelector("img")?.src || "";

    card.dataset.productId = index;

    const actions = document.createElement("div");
    actions.className = "product-actions";
    actions.innerHTML = `<button class="add-cart-btn" onclick="changeQuantity(${index}, 1)">+ ADD</button>`;
    card.querySelector(".card-content").appendChild(actions);

    card.dataset.name = name;
    card.dataset.price = price;
    card.dataset.image = image;
});

// CHANGE QUANTITY
function changeQuantity(id, amount) {
    const card = document.querySelector(`.card[data-product-id="${id}"]`);
    if (!card) return;

    const aisle = getAisleName().toLowerCase();
    const uniqueId = aisle + "-" + id; // e.g. "dairy-0", "bread-0" - so they don't clash

    if (!cart[uniqueId]) {
        cart[uniqueId] = {
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image,
            quantity: 0,
            aisle: getAisleName() // <-- STICKER: "I came from Dairy"
        };
    }

    cart[uniqueId].quantity += amount;

    if (cart[uniqueId].quantity <= 0) {
        delete cart[uniqueId];
    }

    saveCart();
    updateProductButton(id);
    updateCart();
}

// UPDATE PRODUCT BUTTON
function updateProductButton(id) {
    const card = document.querySelector(`.card[data-product-id="${id}"]`);
    if (!card) return;
    const actions = card.querySelector(".product-actions");
    if (!actions) return;

    const key = getAisleName().toLowerCase() + "-" + id;
    const quantity = cart[key]?.quantity || 0;

    if (quantity === 0) {
        actions.innerHTML = `<button class="add-cart-btn" onclick="changeQuantity(${id}, 1)">+ ADD</button>`;
    } else {
        actions.innerHTML = `
            <div class="quantity-control">
                <button onclick="changeQuantity(${id}, -1)">−</button>
                <span>${quantity}</span>
                <button onclick="changeQuantity(${id}, 1)">+</button>
            </div>
        `;
    }
}

// CALCULATE TOTALS
function getCartTotals() {
    let items = 0;
    let total = 0;
    Object.values(cart).forEach(item => {
        items += item.quantity;
        total += item.price * item.quantity;
    });
    return { items, total };
}

// UPDATE ENTIRE CART
function updateCart() {
    const { items, total } = getCartTotals();
    const bar = document.getElementById("viewCartBar");
    if (document.getElementById("cartCount")) document.getElementById("cartCount").textContent = items;
    if (document.getElementById("barTotal")) document.getElementById("barTotal").textContent = money(total);
    if (bar) bar.classList.toggle("hidden", items === 0);
    renderCart();
}

// RENDER CART ITEMS
function renderCart() {
    const container = document.getElementById("cartItems");
    const summary = document.getElementById("cartSummary");
    if (!container) return;
    const entries = Object.entries(cart);

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Your basket is empty</h3>
                <p>Add some delicious essentials to get started.</p>
            </div>
        `;
        if (summary) summary.style.display = "none";
        return;
    }

    if (summary) summary.style.display = "block";

    container.innerHTML = entries.map(([id, item]) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${escapeHTML(item.name)}</h4>
                <p>${escapeHTML(item.aisle || "")} • ${money(item.price * item.quantity)}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="changeQuantityFromCart('${id}', -1)">−</button>
                <strong>${item.quantity}</strong>
                <button onclick="changeQuantityFromCart('${id}', 1)">+</button>
            </div>
        </div>
    `).join("");

    const { total } = getCartTotals();
    if (document.getElementById("cartSubtotal")) document.getElementById("cartSubtotal").textContent = money(total);
    if (document.getElementById("cartGrandTotal")) document.getElementById("cartGrandTotal").textContent = money(total);
}

// For changing qty from the cart drawer (works across aisles)
function changeQuantityFromCart(uniqueId, amount) {
    if (!cart[uniqueId]) return;
    cart[uniqueId].quantity += amount;
    if (cart[uniqueId].quantity <= 0) delete cart[uniqueId];
    saveCart();
    // Refresh buttons on this page if that product is here
    productCards.forEach((card, index) => {
        updateProductButton(index);
    });
    updateCart();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
}

function openCart() {
    document.getElementById("cartOverlay").classList.add("active");
    document.body.classList.add("cart-open");
}
function closeCart() {
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.classList.remove("cart-open");
}
function closeCartOutside(event) {
    if (event.target.id === "cartOverlay") closeCart();
}

// CHECKOUT - NO alert()
function checkout() {
    const { items, total } = getCartTotals();
    if (items === 0) {
        showToast("Your basket is empty, add something first!");
        return;
    }
    showConfirmModal(
        "Checkout?",
        `Your order total is ${money(total)} for ${items} item${items > 1 ? "s" : ""}. Ready to go to confirm payment?`,
        "Go to Payment",
        () => {
            window.location.href = "confirmpayment.html";
        }
    );
}

// WHEN PAGE LOADS - restore buttons + cart bar
document.addEventListener("DOMContentLoaded", () => {
    productCards.forEach((card, index) => {
        updateProductButton(index);
    });
    updateCart();
});