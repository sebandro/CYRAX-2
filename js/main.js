let cart = JSON.parse(localStorage.getItem('cart')) || [];
const tuTelefono = "5491112345678"; // <--- ASEGURATE DE PONER TU CELULAR ACÁ

// --- 1. GESTIÓN DEL CARRITO ---
function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) el.innerText = cart.length;
}

function toggleCart() {
    const sc = document.getElementById('side-cart');
    const ov = document.getElementById('overlay');
    if (sc) sc.classList.toggle('active');
    if (ov) ov.classList.toggle('active');
    renderSideCart();
}

function addToCart(name, price, img) {
    cart.push({ name, price, img });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Abrir el carrito automáticamente para que el usuario vea que se agregó
    const sc = document.getElementById('side-cart');
    if (sc) sc.classList.add('active');
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.add('active');
    
    renderSideCart();
}

function renderSideCart() {
    const container = document.getElementById('cart-items-side');
    const totalEl = document.getElementById('cart-total-side');
    if (!container) return;

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div style="display:flex; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <img src="${item.img}" style="width:50px; aspect-ratio:2/3; object-fit:cover; margin-right:15px;">
                <div style="flex-grow:1">
                    <p style="font-size:12px; font-weight:bold; margin:0;">${item.name}</p>
                    <p style="margin:0;">$${item.price.toLocaleString('es-AR')}</p>
                </div>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
            </div>`;
    }).join('');
    
    if (totalEl) totalEl.innerText = `$${total.toLocaleString('es-AR')}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderSideCart();
    updateCartCount();
}

// --- 2. FINALIZAR COMPRA (WHATSAPP) ---
function goToCheckout() {
    if (cart.length === 0) return alert("El carrito está vacío");
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = "flex";
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = "none";
}

// Escuchador para el formulario de WhatsApp (si existe en la página)
document.addEventListener("submit", function(e) {
    if (e.target && e.target.id === 'form-datos') {
        e.preventDefault();
        let total = 0;
        let itemsMsj = cart.map(i => {
            total += i.price;
            return `- ${i.name} ($${i.price.toLocaleString('es-AR')})`;
        }).join('\n');

        const msj = `¡Hola CYRAX! 👋\n\n` +
                    `*DATOS DE ENVÍO:*\n` +
                    `Nombre: ${document.getElementById('nombre').value}\n` +
                    `Dirección: ${document.getElementById('direccion').value}\n\n` +
                    `*PEDIDO:*\n${itemsMsj}\n\n` +
                    `*TOTAL: $${total.toLocaleString('es-AR')}*`;

        window.open(`https://wa.me/${tuTelefono}?text=${encodeURIComponent(msj)}`, '_blank');
    }
});

// --- 3. CARRUSELES Y SLIDERS ---
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // Carrusel Banner (Automático)
    const slides = document.querySelectorAll(".slide");
    if (slides.length > 0) {
        let sIdx = 0;
        setInterval(() => {
            slides[sIdx].classList.remove("active");
            sIdx = (sIdx + 1) % slides.length;
            slides[sIdx].classList.add("active");
        }, 4000);
    }

    // Sliders de Productos (Flechas)
    document.querySelectorAll(".product-slider").forEach(slider => {
        const imgs = slider.querySelectorAll(".product-img");
        const next = slider.querySelector(".next");
        const prev = slider.querySelector(".prev");
        let iIdx = 0;

        if (imgs.length > 0 && next && prev) {
            next.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                imgs[iIdx].classList.remove("active");
                iIdx = (iIdx + 1) % imgs.length;
                imgs[iIdx].classList.add("active");
            };
            prev.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                imgs[iIdx].classList.remove("active");
                iIdx = (iIdx - 1 + imgs.length) % imgs.length;
                imgs[iIdx].classList.add("active");
            };
        }
    });
});
