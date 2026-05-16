

// --- OBSERVADOR ÚNICO Y CENTRAL DE AUTENTICACIÓN ---
firebase.auth().onAuthStateChanged((user) => {
    // 1. VARIABLES GLOBALES Y ELEMENTOS
    window.usuarioActual = user; 
    const userText = document.getElementById('user-text');
    const userDropdown = document.getElementById('user-dropdown');
    const loginLink = document.querySelector('a[href="login.html"]');
    const campoNombre = document.getElementById('nombre'); // Para detectar Checkout

    const userTextMobile = document.getElementById('user-text-mobile');
    const userDropdownMobile = document.getElementById('user-dropdown-mobile');

    if (user) {
        // --- A. LÓGICA DE INTERFAZ ---
        const nombre = user.displayName ? user.displayName.split(' ')[0] : 'Mi Cuenta';
        
        if (userText) userText.innerText = `Hola, ${nombre}`;
        if (userDropdown) userDropdown.style.opacity = "1";

        /* FOTO PC */

        const pcPhoto = document.getElementById('user-photo-pc');

        const pcIcon = document.querySelector('.pc-user-icon');

        if (pcPhoto && user.photoURL) {

        pcPhoto.src = user.photoURL;

        pcPhoto.style.display = "block";

        if (pcIcon) {
        pcIcon.style.display = "none";
    }
}
        
        if (userTextMobile) userTextMobile.innerText = `Hola, ${nombre}`;

        const mobilePhoto = document.getElementById('user-photo-mobile');
        const mobileIcon = document.querySelector('.mobile-user-icon');

        if (mobilePhoto && user.photoURL) {

        mobilePhoto.src = user.photoURL;

        mobilePhoto.style.display = "block";

        if (mobileIcon) {
        mobileIcon.style.display = "none";
    }
}
        
        if (loginLink) {
            loginLink.innerHTML = `<i class="fas fa-user"></i> Hola, ${nombre}`;
            loginLink.href = "perfil.html";
        }

        // --- B. LÓGICA DE CHECKOUT / AUTO-RELLENADO ---
        if (campoNombre) {
            console.log("Checkout detectado: Iniciando auto-rellenado y Píxel...");
            
            const carrito = JSON.parse(localStorage.getItem('cart')) || [];
            const total = carrito.reduce((acc, i) => acc + ((i.price || 0) * (i.cantidad || 1)), 0);
            
            fbq('track', 'InitiateCheckout', {
                content_ids: carrito.map(i => i.id),
                content_type: 'product',
                value: total,
                currency: 'ARS',
                external_id: user.uid
            });

            db.collection('usuarios').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const d = doc.data();
                    campoNombre.value = d.nombreCompleto || "";
                    if(document.getElementById('telefono')) document.getElementById('telefono').value = d.telefono || "";
                    if(document.getElementById('email')) document.getElementById('email').value = user.email || "";
                    if(document.getElementById('calle')) document.getElementById('calle').value = d.calle || "";
                    if(document.getElementById('altura')) document.getElementById('altura').value = d.altura || "";
                    if(document.getElementById('entre_calles')) document.getElementById('entre_calles').value = d.entrecalles || "";
                    if(document.getElementById('ciudad')) document.getElementById('ciudad').value = d.ciudad || "";
                    if(document.getElementById('codigo_postal')) document.getElementById('codigo_postal').value = d.cp || "";
                }
            });
        }

        // --- C. NUEVA LÓGICA: PINTAR FAVORITOS AUTOMÁTICAMENTE ---
        // Buscamos los favoritos guardados en el array del usuario
        db.collection('usuarios').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const favoritos = doc.data().favoritos || [];
                favoritos.forEach(id => {
                    // Llamamos a la función visual que creamos antes
                    if (typeof actualizarVisualFavorito === 'function') {
                        actualizarVisualFavorito(id, true);
                    }
                });
            }
        }).catch(err => console.error("Error al cargar favoritos iniciales:", err));

        // --- D. CARGAR PRODUCTOS ---

    } else {
        // --- E. LÓGICA MODO INVITADO ---
        if (userText) userText.innerText = "Ingresar";
        if (userDropdown) userDropdown.style.opacity = "0";

        /* RESET FOTO PC */

        const pcPhoto = document.getElementById('user-photo-pc');

        const pcIcon = document.querySelector('.pc-user-icon');

        if (pcPhoto) {
        pcPhoto.style.display = "none";
}

        if (pcIcon) {
        pcIcon.style.display = "flex";
}

        // Reset Móvil
        if (userTextMobile) userTextMobile.innerText = "INGRESAR";
        if (userDropdownMobile) userDropdownMobile.style.display = "none";

        const mobilePhoto = document.getElementById('user-photo-mobile');
        const mobileIcon = document.querySelector('.mobile-user-icon');

        if (mobilePhoto) {
        mobilePhoto.style.display = "none";
}

        if (mobileIcon) {
        mobileIcon.style.display = "flex";
}
        
        if (loginLink) {
            loginLink.innerHTML = `<i class="fas fa-user"></i> Ingresar`;
            loginLink.href = "login.html";
        }

        if (!sessionStorage.getItem('modalMostrado')) {
            setTimeout(() => {
                if (!firebase.auth().currentUser && typeof abrirTuModalLogin === 'function') {
                    abrirTuModalLogin();
                    sessionStorage.setItem('modalMostrado', 'true');
                }
            }, 5000);
        }

    }
});









function abrirTuModalLogin() {
    const paginaActual = window.location.pathname;

    // Evitamos que se abra si ya estamos en login o registro
    if (!paginaActual.includes('login.html') && !paginaActual.includes('registro.html')) {
        // --- AQUÍ USAMOS TU ID REAL: user-link ---
        const botonIngresar = document.getElementById('user-link');

        if (botonIngresar) {
            console.log("Syrax: Botón 'user-link' encontrado. Abriendo modal de beneficios...");
            botonIngresar.click();
            // Registramos el evento en Meta para saber que funcionó la invitación
            fbq('track', 'ViewContent', {
                content_name: 'Invitación a Registro Automática',
                content_category: 'Engagement'
            });
        } else {
            console.warn("Syrax: No se encontró el elemento con ID 'user-link'.");
        }
    }
}




// Las dejamos acá arriba para que sean globales
let loginModal, userLink, closeModal, authForm, btnlogoutmobile, toggleAuth, authTitle, btnAuth, btnLogout, btnGoogle;
let isLogin = true;

// Esta función se activa cuando la página CARGÓ COMPLETAMENTE
window.addEventListener('DOMContentLoaded', () => {
    
    // Asignamos los elementos del HTML a las variables
    loginModal = document.getElementById("login-modal");
    userLink = document.getElementById("user-link");
    closeModal = document.querySelector(".close-modal");
    authForm = document.getElementById('auth-form');
    toggleAuth = document.getElementById('toggle-auth');
    authTitle = document.getElementById('auth-title');
    btnAuth = document.getElementById('btn-auth');
    btnLogout = document.getElementById('btn-logout');
    btnGoogle = document.getElementById('btn-google');
    btnlogoutmobile = document.getElementById('btn-logout-mobile');

    // --- 2. CONTROL DEL MODAL ---
    if (userLink) {
        userLink.onclick = (e) => {
            e.preventDefault();
            if (!firebase.auth().currentUser) {
                loginModal.style.display = "block";
            }
        };
    }

    if (closeModal) {
        closeModal.onclick = () => loginModal.style.display = "none";
    }

    // --- 3. SWITCH LOGIN / REGISTRO ---
    if (toggleAuth) {
        toggleAuth.addEventListener('click', () => {
            isLogin = !isLogin;
            authTitle.innerText = isLogin ? "INICIAR SESIÓN" : "CREAR CUENTA";
            btnAuth.innerText = isLogin ? "ENTRAR" : "REGISTRARME";
            toggleAuth.innerHTML = isLogin 
                ? "¿No tenés cuenta? <span>Registrate aquí</span>" 
                : "¿Ya tenés cuenta? <span>Iniciá sesión</span>";
        });
    }

    // --- 4. LOGOUT ---
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.reload(); 
            });
        };
    }

/* LOGOUT MOBILE */

if (btnlogoutmobile) {

    btnlogoutmobile.onclick = (e) => {

        e.preventDefault();

        firebase.auth().signOut().then(() => {

            window.location.reload();

        });

    };

}

    // --- 5. AUTENTICACIÓN GOOGLE ---
    if (btnGoogle) {
        btnGoogle.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    const userRef = db.collection('usuarios').doc(user.uid);
                    
                    userRef.get().then((doc) => {
                        if (!doc.exists) {
                            fbq('track', 'CompleteRegistration', { content_name: 'Registro Google', status: 'success' });
                            userRef.set({
                                email: user.email,
                                nombreCompleto: user.displayName,
                                favoritos: [],
                                fechaRegistro: new Date(),
                                datosCompletos: false
                            }).then(() => {
                                mostrarAviso("¡Bienvenido! Completá tu dirección en el perfil.");
                                window.location.href = 'perfil.html';
                            });
                        } else {
                            fbq('track', 'Lead', { content_name: 'Login Google' });
                            if (loginModal) loginModal.style.display = "none";
                        }
                    });
                }).catch(err => console.error("Error Google:", err));
        });
    }

    // --- 6. FORMULARIO MANUAL ---
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (isLogin) {
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(() => {
                        fbq('track', 'Lead', { content_name: 'Login Email' });
                        if (loginModal) loginModal.style.display = "none";
                    }).catch(err => alert("Error: " + err.message));
            } else {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((cred) => {
                        fbq('track', 'CompleteRegistration', { content_name: 'Registro Manual', status: 'success' });
                        return db.collection('usuarios').doc(cred.user.uid).set({
                            email: email,
                            nombre: "",
                            favoritos: [],
                            fechaRegistro: new Date(),
                            ubicacion: "Rafael Castillo"
                        });
                    }).catch(err => alert("Error: " + err.message));
            }
        });
    }
});






















window.tarifasDesdeFirestore = window.tarifasDesdeFirestore || {};
let envioSeleccionado = 0; 
let cart = JSON.parse(localStorage.getItem('cart')) || [];


  const coberturaMotoLocal = {
    // ZONA MORÓN ($6.000)
    "1708": "moto_moron", "1706": "moto_moron", "1712": "moto_moron", "1684": "moto_moron",
    
    // ZONA 1 ($7.000)
    "1686": "moto_zona1", "1688": "moto_zona1", "1714": "moto_zona1", "1713": "moto_zona1",
    "1678": "moto_zona1", "1702": "moto_zona1", "1692": "moto_zona1", "1657": "moto_zona1",
    "1682": "moto_zona1", "1690": "moto_zona1", "1674": "moto_zona1", "1676": "moto_zona1",
    "1675": "moto_zona1", "1691": "moto_zona1", "1650": "moto_zona1", "1655": "moto_zona1",
    "1651": "moto_zona1", "1653": "moto_zona1", "1672": "moto_zona1", "1754": "moto_zona1",
    "1704": "moto_zona1", "1752": "moto_zona1", "1768": "moto_zona1", "1770": "moto_zona1",
    "1772": "moto_zona1", "1766": "moto_zona1",

    // ZONA 2 ($9.000) - CABA y GBA Sur/Oeste
    "1663": "moto_zona2", "1661": "moto_zona2", "1665": "moto_zona2", "1613": "moto_zona2",
    "1615": "moto_zona2", "1667": "moto_zona2", "1614": "moto_zona2", "1648": "moto_zona2",
    "1611": "moto_zona2", "1617": "moto_zona2", "1618": "moto_zona2", "1621": "moto_zona2",
    "1642": "moto_zona2", "1641": "moto_zona2", "1643": "moto_zona2", "1609": "moto_zona2",
    "1640": "moto_zona2", "1607": "moto_zona2", "1636": "moto_zona2", "1602": "moto_zona2",
    "1604": "moto_zona2", "1637": "moto_zona2", "1605": "moto_zona2", "1638": "moto_zona2",
    "1603": "moto_zona2", "1606": "moto_zona2", "1744": "moto_zona2", "1742": "moto_zona2",
    "1722": "moto_zona2", "1718": "moto_zona2", "1716": "moto_zona2", "1723": "moto_zona2",
    "1757": "moto_zona2", "1759": "moto_zona2", "1765": "moto_zona2", "1755": "moto_zona2",
    "1763": "moto_zona2", "1778": "moto_zona2", "1824": "moto_zona2", "1870": "moto_zona2",
    "1825": "moto_zona2", "1826": "moto_zona2", "1822": "moto_zona2", "1832": "moto_zona2",
    "1828": "moto_zona2", "1834": "moto_zona2", "1836": "moto_zona2", "1871": "moto_zona2",
    "1872": "moto_zona2", "1874": "moto_zona2", "1875": "moto_zona2", "1878": "moto_zona2",
    "1876": "moto_zona2", "1882": "moto_zona2", "1881": "moto_zona2", "1884": "moto_zona2",
    "1885": "moto_zona2", "1890": "moto_zona2", "1894": "moto_zona2", "1888": "moto_zona2",
    "1889": "moto_zona2", "1891": "moto_zona2", "1846": "moto_zona2", "1852": "moto_zona2",
    "1849": "moto_zona2", "1856": "moto_zona2", "1854": "moto_zona2", "1847": "moto_zona2",
    "1842": "moto_zona2", "1839": "moto_zona2", "1804": "moto_zona2", "1805": "moto_zona2",
    "1838": "moto_zona2", "1812": "moto_zona2", "1802": "moto_zona2", "1806": "moto_zona2",

    // ZONA 3 ($12.000) - Luján, Pilar, La Plata, etc.
    "2800": "moto_zona3", "2806": "moto_zona3", "2804": "moto_zona3", "1625": "moto_zona3",
    "1619": "moto_zona3", "1623": "moto_zona3", "1627": "moto_zona3", "1629": "moto_zona3",
    "1669": "moto_zona3", "1635": "moto_zona3", "1633": "moto_zona3", "1631": "moto_zona3",
    "6700": "moto_zona3", "6706": "moto_zona3", "6708": "moto_zona3", "6701": "moto_zona3",
    "1921": "moto_zona3", "1748": "moto_zona3", "1727": "moto_zona3", "1814": "moto_zona3",
    "1815": "moto_zona3", "1865": "moto_zona3", "1864": "moto_zona3", "1984": "moto_zona3",
    "1862": "moto_zona3", "1925": "moto_zona3", "1931": "moto_zona3", "1923": "moto_zona3",
    "1896": "moto_zona3", "1897": "moto_zona3", "1900": "moto_zona3", "1903": "moto_zona3",
    "1901": "moto_zona3", "1599": "moto_zone3",
};



document.addEventListener('DOMContentLoaded', () => {
    // Verificamos que 'db' exista (viene del script del HTML)
    if (typeof db !== 'undefined') {
        
        // Ejecutamos tus funciones de carrito y checkout
        if (typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
        if (typeof actualizarInterfazCarrito === 'function') actualizarInterfazCarrito();
        
        // Si hay un banner de oferta, lo activamos
        if (typeof controlarBannerOferta === 'function') controlarBannerOferta();
    }
});





// --- 1. GESTIÓN DEL CARRITO ---

function goToCheckout() {
    // Leemos de localStorage para estar seguros
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (currentCart.length === 0) {
        return mostrarAviso("El carrito está vacío");
    }
    
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = "flex";
}



function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = "none";
    }
}










function toggleCart(forceOpen = false) {
    const sc = document.getElementById('side-cart');
    const ov = document.getElementById('overlay');
    
    if (forceOpen === true) {
        // Si le pedimos que abra sí o sí (al comprar)
        if (sc) sc.classList.add('active');
        if (ov) ov.classList.add('active');
    } else {
        // Si no le pasamos nada (clic en la X o el carrito del header), funciona como siempre
        if (sc) sc.classList.toggle('active');
        if (ov) ov.classList.toggle('active');
    }
    actualizarInterfazCarrito();
}



//////////////////////////
/* PREPARA EL CARRITO  */
////////////////////////

function prepareAddToCart(id, nombre, precio, precioOriginal, imagen) {
    const talleElem = document.getElementById('talle-selector');
    const cantidadElem = document.getElementById('product-qty');
    const colorDisplay = document.getElementById('color-name-display');

    // --- LÓGICA DE PRECIOS IGUAL A CARGARPRODUCTOS ---
    let val1 = Number(precio) || 0;
    let val2 = Number(precioOriginal) || 0;
    let precioFinal;

    // Si ambos existen, elije el más bajo. Si no, usa el que tenga valor.
    if (val1 > 0 && val2 > 0) {
        precioFinal = Math.min(val1, val2);
    } else {
        precioFinal = val1 || val2;
    }

    const talle = talleElem ? talleElem.value : "Único";
    const color = colorDisplay ? colorDisplay.innerText.toLowerCase() : "Único";
    const cantidadNueva = cantidadElem ? parseInt(cantidadElem.value) : 1;

    let carrito = JSON.parse(localStorage.getItem("cart")) || [];
    
    const itemExistente = carrito.find(item => 
        item.id === id && item.color === color && item.talle === talle
    );

    const cantidadPrevia = itemExistente ? itemExistente.cantidad : 0;
    const totalFinal = cantidadPrevia + cantidadNueva;

    // Validación de Stock
    if (totalFinal > window.stockMaximoActual) {
        const disponibles = window.stockMaximoActual - cantidadPrevia;
        if (disponibles <= 0) {
            mostrarAviso(`¡Stock agotado! Ya tenés el máximo de ${window.stockMaximoActual} unidades.`);
        } else {
            mostrarAviso(`Solo podés agregar ${disponibles} unidades más.`);
        }
        return false;
    }

    // Si pasó todo, enviamos al carrito con el precio correcto
    if (typeof addToCart === "function") {
        addToCart(id, nombre, precioFinal, imagen, color, talle, cantidadNueva);
        
        if (cantidadElem) cantidadElem.value = 1;
        return true;
    }
    
    return false;
}

//////////
/* FIN */
////////

//////////////////////////////////
/* AGREGA PRODUCTOS AL CARRITO */
////////////////////////////////


function addToCart(id, nombre, precio, imagen, color, talle, cantidad) {
    // 1. Obtenemos lo que ya hay (o un array vacío si no hay nada)
    let carrito = JSON.parse(localStorage.getItem("cart")) || [];

    // 2. Buscamos si el producto exacto ya está adentro
    const index = carrito.findIndex(item => 
        item.id === id && item.color === color && item.talle === talle
    );

    if (index !== -1) {
        // Si ya está, le sumamos la nueva cantidad
        carrito[index].cantidad += cantidad;
    } else {
        // Si no está, lo agregamos como nuevo objeto
        carrito.push({
            id: id,
            name: nombre,
            price: precio,
            img: imagen,
            color: color,
            talle: talle,
            cantidad: cantidad
        });
    }

    // 3. GUARDAR EN LOCALSTORAGE (La parte más importante)
    localStorage.setItem("cart", JSON.stringify(carrito));

    // 4. ACTUALIZAR TODO (Usando la función unificada que creamos antes)
    if (typeof actualizarInterfazCarrito === "function") {
        actualizarInterfazCarrito();
    }

    console.log("Producto guardado con éxito:", nombre);
}

/////////////////////
/*    FIN         */
///////////////////




// Variable global para controlar el límite de unidades
function changeQty(valor) {
    const input = document.getElementById('product-qty');
    if (!input) return;

    let actual = parseInt(input.value);
    let nuevo = actual + valor;

    // Usamos window.stockMaximoActual que se actualiza desde el main.js
    let limiteRespetar = window.stockMaximoActual || 1; 

    if (nuevo >= 1 && nuevo <= limiteRespetar) {
        input.value = nuevo;
    } else if (nuevo > limiteRespetar) {
        mostrarAviso("Lo sentimos, no hay más stock disponible de este modelo.");
    }
}







function actualizarInterfazCarrito() {
    // 1. SELECTORES DE ELEMENTOS
    const container = document.getElementById('cart-items-side');
    const totalEl = document.getElementById('cart-total-side');
    const countBadge = document.getElementById('cart-count');

    // 2. LEER DATOS SIEMPRE DEL STORAGE
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- PARTE A: ACTUALIZAR EL CONTADOR (Badge) ---
    const totalPrendas = currentCart.reduce((total, item) => total + (item.cantidad || 1), 0);
    
    if (countBadge) {
        countBadge.innerText = totalPrendas;
        countBadge.style.display = totalPrendas > 0 ? 'flex' : 'none';
    }

    // --- PARTE B: ACTUALIZAR EL CONTENIDO DEL SIDEBAR ---
    if (!container) return; // Si no estamos en una página con sidebar, cortamos acá

    if (currentCart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío</p>';
        if (totalEl) {
            totalEl.innerHTML = `
                <div class="cart-total" style="display:flex; justify-content:space-between; font-weight:bold; padding:10px 0; border-top:2px solid #000;">
                    <span>TOTAL:</span>
                    <span>$0</span>
                </div>
            `;
        }
        return;
    }

    let totalCalculado = 0;
    
    container.innerHTML = currentCart.map((item, index) => {
        const precioSeguro = (item && item.price) ? item.price : 0;
        const cantidadSegura = (item && item.cantidad) ? item.cantidad : 1;
        totalCalculado += (precioSeguro * cantidadSegura);
        
        return `
        <div style="display:flex; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
            <img src="${item.img || ''}" style="width:50px; aspect-ratio:2/3; object-fit:cover; margin-right:15px; border-radius:4px;">
            <div style="flex-grow:1">
                <p style="font-size:12px; font-weight:bold; margin:0; text-transform:uppercase;">${item.name || 'Producto'}</p>
                <p style="margin:2px 0; font-size:10px; color: #666; text-transform: uppercase;">
                    Talle: ${item.talle || ' - '} | Color: ${item.color || ' - '}
                </p>
                <p style="margin:2px 0 0 0; font-size:14px; font-weight: 500;">
                    $${precioSeguro.toLocaleString('es-AR')} <span style="font-size:12px; color:#888;">x ${cantidadSegura}</span>
                </p>
            </div>
            <button class="remove-item" onclick="removeItem(${index})" style="background:none; border:none; cursor:pointer; font-size:18px; color:#999;">×</button>
        </div>`;
    }).join('');
    
    // Actualizar el total visual
    if (totalEl) {
        totalEl.innerHTML = `
            <div class="cart-total" style="display:flex; justify-content:space-between; font-weight:bold; padding:10px 0; border-top:2px solid #000;">
                <span>TOTAL:</span>
                <span>$${totalCalculado.toLocaleString('es-AR')}</span>
            </div>
        `;
    }
}





window.removeItem = (index) => {
    // 1. Cargamos el carrito actual
    let carrito = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (carrito[index]) {
        // 2. Si la cantidad es mayor a 1, restamos una unidad
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
        } else {
            // 3. Si hay solo 1, borramos la fila entera del array
            carrito.splice(index, 1);
        }
    }
    
    // 4. Guardamos los cambios
    localStorage.setItem('cart', JSON.stringify(carrito));
    
    // 5. Sincronizamos todas las partes de la web
    if (typeof actualizarInterfazCarrito === 'function') actualizarInterfazCarrito();
    if (typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
};






    ////////////////////////////////////
    /*FUNCION ENVIAR MSJ POR WHATSAPP*/
    ///////////////////////////////////


async function enviarWhatsApp() {
    // 1. Capturamos campos del formulario
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        calle: document.getElementById('calle').value.trim(),
        altura: document.getElementById('altura').value.trim(),
        cp: document.getElementById('codigo_postal').value.trim().toUpperCase(),
        entreCalles: document.getElementById('entre_calles').value.trim(),
        ciudad: document.getElementById('ciudad').value.trim()
    };

    // 2. Validaciones
    if (!datos.nombre || !datos.telefono || !datos.calle || !datos.altura || !datos.cp) {
        return mostrarAviso("Por favor, completa los datos de envío obligatorios.");
    }

    let carrito = JSON.parse(localStorage.getItem('cart')) || [];
    if (carrito.length === 0) return mostrarAviso("Tu carrito está vacío.");

    try {
        // --- LÓGICA DE COSTOS Y SERVICIO ---
        const subtotal = carrito.reduce((acc, item) => acc + ((item.price || 0) * (item.cantidad || 1)), 0);
        const envio = window.envioSeleccionado || 0;
        
        let servicioTexto = "";
        const avisoTexto = document.getElementById('aviso-cobertura').innerText.toUpperCase();

        if (envio === 0) {
            servicioTexto = "Retiro por Domicilio";
        } else if (avisoTexto.includes("MOTO")) {
            servicioTexto = "Moto Mensajería (Syrax Express)";
        } else if (avisoTexto.includes("REGIONAL")) {
            servicioTexto = "Correo Argentino Regional";
        } else {
            servicioTexto = "Correo Argentino Nacional";
        }

        const totalFinal = subtotal + envio;
        const direccionFinal = `${datos.calle} ${datos.altura}`;

        // --- BLOQUE FIRESTORE CORREGIDO (Versión 8) ---
        // Cambiamos addDoc por .collection().add()
        await db.collection("pedidos_pendientes").add({
            cliente: { 
                ...datos, 
                direccionCompleta: direccionFinal 
            },
            productos: carrito,
            envio: {
                costo: envio,
                servicio: servicioTexto
            },
            // Usamos el timestamp de servidor para mejor orden cronológico
            fecha: firebase.firestore.FieldValue.serverTimestamp(), 
            subtotal: subtotal,
            total: totalFinal
        });
        
        if (typeof descontarStockGlobal === "function") {
            await descontarStockGlobal(carrito); 
        }

        // 4. Armamos la lista para WhatsApp
        let listaProductos = "";
        carrito.forEach(item => {
            const subtotalItem = (item.price || 0) * (item.cantidad || 1);
            listaProductos += `✅ *${item.name}*\n`;
            listaProductos += `   Talle: ${item.talle} | Color: ${item.color}\n`;
            listaProductos += `   Cant: ${item.cantidad} x $${item.price.toLocaleString('es-AR')} = *$${subtotalItem.toLocaleString('es-AR')}*\n\n`;
        });

        const miNumero = "5491128787578";

        const textoWhatsApp = `🛍️ *NUEVO PEDIDO - SYRAX*

👤 *CLIENTE:* ${datos.nombre}
📱 *TEL:* ${datos.telefono}

📦 *PRODUCTOS:*
${listaProductos}
---------------------------
*SUBTOTAL:* $${subtotal.toLocaleString('es-AR')}
*ENVÍO (${servicioTexto}):* ${envio === 0 ? "GRATIS" : "$" + envio.toLocaleString('es-AR')}
*💰 TOTAL A PAGAR: $${totalFinal.toLocaleString('es-AR')}*
---------------------------

📍 *DIRECCIÓN:* ${direccionFinal}
🏙️ *CIUDAD:* ${datos.ciudad}
📮 *C.P.:* ${datos.cp}
🛤️ *ENTRE CALLES:* ${datos.entreCalles}
    `;

        // --- EVENTO META: PURCHASE CON IDENTIDAD ---
        const usuarioActivo = firebase.auth().currentUser;
        
        if (typeof fbq === 'function') {
            fbq('track', 'Purchase', {
                content_ids: carrito.map(item => item.id),
                content_type: 'product',
                value: totalFinal,
                currency: 'ARS',
                num_items: carrito.length,
                content_name: 'Pedido Syrax WhatsApp',
                external_id: usuarioActivo ? usuarioActivo.uid : 'invitado', 
                user_email: usuarioActivo ? usuarioActivo.email : datos.email,
                client_name: datos.nombre 
            });
        }

        const mensajeFinal = encodeURIComponent(textoWhatsApp);

        // Abrir WhatsApp
        window.open(`https://wa.me/${miNumero}?text=${mensajeFinal}`, '_blank');
        
        // Limpiar y recargar
        localStorage.removeItem('cart');
        setTimeout(() => { location.reload(); }, 1500);

    } catch (error) {
        console.error("Error al procesar el pedido:", error);
        mostrarAviso("Hubo un problema al guardar tu pedido.");
    }
}







        ////////////////////////////
        /*  FUNCION CALCULAR ENVIO*/
        ////////////////////////////



let tarifasEnVivo = {}; // Variable global para guardar los precios

// 1. EL ESCUCHADOR (Se activa una sola vez al cargar la página)
function sincronizarLogisticaEnVivo() {
    db.collection("configuracion").doc("envios").onSnapshot((doc) => {
        if (doc.exists) {
            tarifasEnVivo = doc.data();
            console.log("Syrax: Tarifas sincronizadas ✅");
            
            // Si el usuario ya escribió un CP, recalculamos con los nuevos precios
            const inputCP = document.getElementById('codigo_postal');
            if (inputCP && inputCP.value.length >= 5) {
                calcularEnvioInteligente();
            }
        }
    });
}

// 2. EL CÁLCULO (Es tu función, pero usando 'tarifasEnVivo')
function calcularEnvioInteligente() {
    const inputCP = document.getElementById('codigo_postal');
    if (!inputCP) return;
    
    let cpOriginal = inputCP.value.trim().toUpperCase();

    // Validación de formato (Tu lógica de letra + 4 números)
    const letraEncontrada = cpOriginal.match(/[A-Z]/);
    const numerosEncontrados = cpOriginal.replace(/[^0-9]/g, '').substring(0, 4);
    const letra = letraEncontrada ? letraEncontrada[0] : "";
    const numeros = numerosEncontrados;
    const cpLimpio = letra + numeros;

    if (inputCP.value.toUpperCase() !== cpLimpio) inputCP.value = cpLimpio;

    const selectorServicio = document.getElementById('selector-servicio-envio');
    const infoTiempo = document.getElementById('info-tiempo-envio');
    const avisoEnvio = document.getElementById('aviso-cobertura');
    const selectTipo = document.getElementById('tipo-servicio');

    if (cpLimpio.length < 5) {
        if (selectorServicio) selectorServicio.style.display = "none";
        if (avisoEnvio) avisoEnvio.innerHTML = `<span style="color: #666; font-size: 11px;">Formato: Una letra y 4 números (Ej: B1755)</span>`;
        if (infoTiempo) infoTiempo.innerHTML = "";
        window.envioSeleccionado = 0;
        return;
    }

    // --- LÓGICA DE PRECIOS EN VIVO ---
    if (coberturaMotoLocal[numeros] || letra === "C") {
        selectorServicio.style.display = "block";
        if (!selectTipo.innerHTML.includes('value="moto"')) {
            selectTipo.innerHTML = `
                <option value="retiro">RETIRO POR DOMICILIO (GRATIS)</option>
                <option value="moto">ENVÍO POR MOTOMENSAJERIA EXPRESS </option>
            `;
        }

        if (selectTipo.value === "retiro") {
            window.envioSeleccionado = 0;
            avisoEnvio.innerHTML = `<span style="color: #d4af37; font-weight: bold;">🏠 RETIRO POR DOMICILIO (GRATIS)</span>`;
            infoTiempo.innerHTML = `<strong>Tiempo:</strong> ${tarifasEnVivo.tiempo_retiro || "Coordinar"}`;
        } else {
            const zonaKey = letra === "C" ? "moto_zona2" : coberturaMotoLocal[numeros];
            window.envioSeleccionado = tarifasEnVivo[zonaKey] || 0;
            avisoEnvio.innerHTML = `<span style="color: #d4af37; font-weight: bold;">🛵 ENVÍO POR MOTO (SYRAX EXPRESS)</span>`;
            infoTiempo.innerHTML = `<strong>Llega:</strong> ${tarifasEnVivo.tiempo_moto}<br><strong>Costo:</strong> $${window.envioSeleccionado.toLocaleString('es-AR')}`;
        }
    } else {
        selectorServicio.style.display = "block";
        if (!selectTipo.innerHTML.includes('value="clasica"')) {
            selectTipo.innerHTML = `
                <option value="clasica">CORREO ARGENTINO - CLÁSICA</option>
                <option value="prioritaria">CORREO ARGENTINO - PRIORITARIA</option>
            `;
        }
        
        const esRegional = (letra === "B" || letra === "C");
        avisoEnvio.innerHTML = `<span style="color: #28a745; font-weight: bold;">✓ CORREO ARGENTINO ${esRegional ? 'REGIONAL' : 'NACIONAL'}</span>`;
        
        // CORRECCIÓN: Aquí usamos la data de Correo en vivo
        if (selectTipo.value === "prioritaria") {
            window.envioSeleccionado = tarifasEnVivo.nacional_prioritaria || 0;
            infoTiempo.innerHTML = `<strong>Tiempo:</strong> ${tarifasEnVivo.tiempo_prioritaria}<br><strong>Costo:</strong> $${window.envioSeleccionado.toLocaleString('es-AR')}`;
        } else {
            window.envioSeleccionado = tarifasEnVivo.nacional_clasica || 0;
            infoTiempo.innerHTML = `<strong>Tiempo:</strong> ${tarifasEnVivo.tiempo_clasica}<br><strong>Costo:</strong> $${window.envioSeleccionado.toLocaleString('es-AR')}`;
        }
    }

    if (typeof renderCheckoutSummary === "function") renderCheckoutSummary();
}




////////////////////////
/*termina la funcnion*/
/////////////////////////


        ///////////////////////
        /* tarifa de envios*/
        /////////////////////////

async function cargarTarifasEnvio() {
    try {
        // En v8 no usamos docRef ni getDoc, lo hacemos todo en una línea
        const docSnap = await db.collection("configuracion").doc("envios").get();
        
        if (docSnap.exists) { // Ojo: en v8 es .exists (sin paréntesis)
            window.tarifasDesdeFirestore = docSnap.data();
            console.log("✅ Tarifas cargadas:", window.tarifasDesdeFirestore);
        } else {
            console.warn("⚠️ No se encontró el documento 'envios' en Firestore");
        }
    } catch (e) {
        console.error("❌ Error cargando tarifas:", e);
    }
}

// La llamamos igual que antes
cargarTarifasEnvio();


    /////////////////////////////////
    /* ACTUALIZAR PRECIO DEL CORREO*/
    //////////////////////////////////

function actualizarPrecioCorreo(esRegional) {
    const selectTipo = document.getElementById('tipo-servicio');
    const infoTiempo = document.getElementById('info-tiempo-envio');
    
    // VALIDACIÓN DE SEGURIDAD: Si el select no existe o las tarifas no cargaron, frenamos.
    if (!selectTipo || !tarifasDesdeFirestore) return;

    const base = esRegional ? "regional" : "nacional";
    
    // Verificamos qué eligió el usuario en el selector
    const velocidad = selectTipo.value === 'prioritaria' ? 'prioritaria' : 'clasica';
    const keyFinal = `${base}_${velocidad}`;
    
    // Asignamos el costo (si no existe en Firestore, ponemos 0)
    window.envioSeleccionado = tarifasDesdeFirestore[keyFinal] || 0;
    
    // Buscamos el tiempo (si no existe, ponemos el texto por defecto)
    const tiempo = tarifasDesdeFirestore[`tiempo_${velocidad}`] || "3 a 6 días hábiles";
    
    // Mostramos en pantalla
    infoTiempo.innerHTML = `<strong>Llega en:</strong> ${tiempo}<br><strong>Costo:</strong> $${window.envioSeleccionado.toLocaleString('es-AR')}`;
}





        ////////////////////////////////
        /*     MOSTRAR AVISO        */
        ////////////////////////////////
function mostrarAviso(mensaje) {
    // 1. Creamos el elemento del aviso
    const aviso = document.createElement('div');
    aviso.innerHTML = `<strong>SYRAX: </strong> ${mensaje}`;
    
    // 2. Le damos estilos directos (podes moverlos a tu CSS si preferís)
  Object.assign(aviso.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '4px',
    zIndex: '10000',

    fontSize: window.innerWidth <= 768 ? '12px' : '14px',

    whiteSpace: 'nowrap',
    maxWidth: '90vw',

    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #ff5a80',
    transition: 'all 0.5s ease'
});

    document.body.appendChild(aviso);

    // 3. Lo borramos después de 3 segundos
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.remove(), 500);
    }, 3000);
}

 
    


function moverSlider(btn, direccion) {
    // Evitamos que el click abra el link del producto
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Buscamos el contenedor del slider actual
    const slider = btn.closest('.product-slider');
    const imgs = slider.querySelectorAll('.product-img');
    
    if (imgs.length <= 1) return;

    // Encontramos la imagen que se ve ahora
    let iIdx = Array.from(imgs).findIndex(img => img.classList.contains('active'));

    // Si no encuentra ninguna activa por error, ponemos la primera
    if (iIdx === -1) iIdx = 0;

    // Quitamos la clase 'active'
    imgs[iIdx].classList.remove('active');

    // Calculamos la siguiente (matemática circular)
    iIdx = (iIdx + direccion + imgs.length) % imgs.length;

    // Mostramos la nueva
    imgs[iIdx].classList.add('active');
}












const btnMenu = document.getElementById('btn-menu');
const menuCategorias = document.getElementById('menu-categorias');

// Solo si AMBOS existen, activamos el clic
if (btnMenu && menuCategorias) {
    btnMenu.addEventListener('click', () => {
        menuCategorias.classList.toggle('active');
    });
}






////////////////////////////////////////////
// --- 3. MOSTRAR RESUMEN EN EL CHECKOUT ---
////////////////////////////////////////////

function renderCheckoutSummary() {
    const container = document.getElementById('lista-checkout');
    const totalEl = document.getElementById('total-monto');
    
    // Sincronización con el carrito
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!container) return;

    if (savedCart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>Tu carrito está vacío</p>";
        if (totalEl) totalEl.innerText = "$0";
        return;
    }

    let totalCalculado = 0;

    container.innerHTML = savedCart.map((item, index) => {
        const subtotalItem = (item.price || 0) * (item.cantidad || 1);
        totalCalculado += subtotalItem;

        return `
            <div class="checkout-item">
                <div class="checkout-item-info">
                    <span class="checkout-item-name">${item.name}</span>
                    <div class="checkout-item-details">
                        <span>Talle: ${item.talle || 'Único'}</span>
                        <span>Color: ${item.color || 'Único'}</span>
                        <span>Cant: ${item.cantidad || 1}</span>
                    </div>
                </div>

                <div class="checkout-item-right">
                    <span class="checkout-item-price">$${subtotalItem.toLocaleString('es-AR')}</span>
                    <button class="btn-remove-item" onclick="removeItem(${index})">
                        ✕
                    </button>
                </div>
            </div>`;
    }).join('');

    if (totalEl) {
        totalEl.innerText = `$${totalCalculado.toLocaleString('es-AR')}`;
    }
}



//////////////////////////////////////////////////////////////////////////////////
// 2. FUNCIÓN DE ELIMINACIÓN (Sincronizada para que funcione en Checkout y Carrito)
//////////////////////////////////////////////////////////////////////////////////
window.removeItem = (index) => {
    let savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Borramos el elemento
    savedCart.splice(index, 1);
    
    // Guardamos
    localStorage.setItem('cart', JSON.stringify(savedCart));
    
    // REDIBUJAMOS TODO: Así se actualiza el resumen y el carrito lateral al mismo tiempo
    renderCheckoutSummary();
    
    if (typeof actualizarInterfazCarrito === "function") actualizarInterfazCarrito();
    
};

// Mantenemos esto para que cargue al abrir la página
document.addEventListener('DOMContentLoaded', renderCheckoutSummary);








///////////////////////////////////////////////
// FUNCIÓN PARA MOSTRAR PRODUCTOS RELACIONADOS
//////////////////////////////////////////////

async function renderRelated(categoria, productoActualId, subcategoria = null) {
    const relatedContainer = document.getElementById("related-container"); 
    if (!relatedContainer) return;

    try {
        // IMPORTANTE: Usamos el "db" que ya tenés inicializado en tu main.js
        let ref = db.collection("inventario").where("categoria", "==", categoria);
        
        // Si tiene subcategoría, filtramos aún más para que sean MUY relacionados
        if (subcategoria) {
            ref = ref.where("subcategoria", "==", subcategoria);
        }

        const querySnapshot = await ref.limit(6).get();
        let html = "";

        querySnapshot.forEach((doc) => {
            // No mostramos el producto que el usuario ya está viendo
            if (doc.id !== productoActualId) { 
                const p = doc.data();
                
                // Lógica de fotos: prioridad a imagenTarjeta (que es la de lista)
                let fotoPortada = "assets/img/placeholder.jpg";
                
                if (p.imagenTarjeta && p.imagenTarjeta.length > 0) {
                    fotoPortada = p.imagenTarjeta[0];
                } else if (p.imagenPrincipal) {
                    fotoPortada = p.imagenPrincipal;
                } else if (p.variantes) {
                    // Si no hay fotos generales, sacamos la del primer color
                    const colores = Object.keys(p.variantes);
                    if (colores.length > 0) {
                        const primerColor = colores[0];
                        if (p.variantes[primerColor].fotos && p.variantes[primerColor].fotos.length > 0) {
                            fotoPortada = p.variantes[primerColor].fotos[0];
                        }
                    }
                }

                html += `
                    <div class="related-item">
                        <a href="producto.html?id=${doc.id}" style="text-decoration: none; color: inherit;">
                            <div class="related-img-wrapper">
                                <img src="${fotoPortada}" alt="${p.nombre}">
                            </div>
                            <h3>${p.nombre}</h3>
                            <p>$${(p.precio || 0).toLocaleString("es-AR")}</p>
                        </a>
                    </div>
                `;
            }
        });

        relatedContainer.innerHTML = html || "<p>Explorá más productos en nuestra tienda.</p>";

    } catch (error) {
        console.error("Error cargando relacionados en Syrax:", error);
    }
}









//////////////////////////////////////////////////////////////////
// --- ESCUCHA DE CLIC EN BOTONES DE PRODUCTO (VERSIÓN FIRESTORE) ---
///////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const btnAgregar = document.getElementById('add-cart');
    const btnComprar = document.getElementById('buy-now');

    if (btnAgregar) {
        btnAgregar.onclick = (e) => { 
            e.preventDefault();

            // 1. Capturamos los datos básicos
            const idActual = window.productoId || new URLSearchParams(window.location.search).get("id");
            const nombreVisible = document.getElementById('product-name')?.innerText;
            const precioTexto = document.getElementById('product-price')?.innerText;
            const imagenVisible = document.getElementById('product-img')?.src;

            // 2. CAPTURAMOS COLOR Y TALLE
            const colorActual = document.getElementById("color-name-display")?.innerText.toLowerCase();
            const talleElegido = document.getElementById("talle-selector")?.value;

            const precioLimpio = precioTexto ? parseFloat(precioTexto.replace(/[^0-9.-]+/g,"")) : 0;

            if (idActual && nombreVisible && talleElegido) {
                if (btnAgregar.getAttribute('data-loading') === 'true') return;
                btnAgregar.setAttribute('data-loading', 'true');

                // Validamos y agregamos
                if (typeof prepareAddToCart === "function") {
                    prepareAddToCart(idActual, nombreVisible, precioLimpio, imagenVisible, colorActual, talleElegido);
                }

                setTimeout(() => {
                    btnAgregar.setAttribute('data-loading', 'false');
                }, 500);
            } else {
                mostrarAviso("Por favor, seleccioná un talle.");
            }
        };
    }

 if (btnComprar) {
    btnComprar.onclick = (e) => {
        e.preventDefault();
        
        // 1. Capturamos los elementos del DOM
        const idActual = window.productoId || new URLSearchParams(window.location.search).get("id");
        const nombre = document.getElementById('product-name')?.innerText;
        const precioText = document.getElementById('product-price')?.innerText;
        const imagen = document.getElementById('product-img')?.src;
        const colorActual = document.getElementById("color-name-display")?.innerText.toLowerCase();
        const talleElegido = document.getElementById("talle-selector")?.value;

        // 2. LIMPIEZA DE PRECIO CORREGIDA (Evita quitar los ceros de los miles)
        // Quitamos el '$' y los puntos de miles, luego cambiamos coma por punto si existiera
        const precioLimpio = precioText 
            ? parseFloat(precioText.replace('$', '').replace(/\./g, '').replace(',', '.')) 
            : 0;

        if (talleElegido) {
            // 3. Ejecutamos la validación de stock y agregado
            const pudoAgregar = prepareAddToCart(idActual, nombre, precioLimpio, imagen, colorActual, talleElegido);
            
            if (pudoAgregar) {
                // Pequeño delay para asegurar que se guardó en localStorage antes de saltar
                setTimeout(() => {
                    window.location.href = 'checkout.html';
                }, 400);
            }
        } else {
            mostrarAviso("Por favor, seleccioná un talle.");
        }}
    };
});






/////////////////////////////////////////////////////////////
// FUNCIÓN PARA CAMBIAR LA FOTO GRANDE AL TOCAR LAS MINIATURAS
//////////////////////////////////////////////////////////////

function changeMainImage(elemento, rutaImagen) {
    const mainImg = document.getElementById("product-img");
    
    if (mainImg) {
        // 1. Cambiamos la ruta de la imagen grande
        mainImg.src = rutaImagen;
        
        // 2. Manejo visual de la miniatura activa (el bordecito)
        // Buscamos todas las miniaturas y les sacamos la clase 'active'
        const todasLasMinis = document.querySelectorAll('.thumb-wrapper');
        todasLasMinis.forEach(mini => mini.classList.remove('active'));
        
        // Se la ponemos solo a la que tocamos
        elemento.classList.add('active');
        
        console.log("Cambiando imagen a:", rutaImagen); // Esto es para que veas en consola si funciona
    } else {
        console.error("No se encontró el elemento con ID 'product-img'");
    }
}



        ////////////////////////////////////////////
        /*ZOOM DE IMAGEN DE PAGINA DE PRODUCTO*/
        ///////////////////////////////////////////

const imgContainer = document.querySelector('.product-image-card');
const productImg = document.getElementById('product-img');

if (imgContainer && productImg) {

    // SOLO PC
    if (window.innerWidth > 768) {

        imgContainer.addEventListener('mousemove', (e) => {
            const rect = imgContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            productImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            productImg.style.transform = "scale(2)";
        });

        imgContainer.addEventListener('mouseleave', () => {
            productImg.style.transform = "scale(1)";
            productImg.style.transformOrigin = "center center";
        });
    }
}
if (imgContainer && productImg) {

    // SOLO MOBILE
    if (window.innerWidth <= 768) {

        let zoom = false;

        imgContainer.addEventListener('click', (e) => {

            zoom = !zoom;

            if (!zoom) {
                productImg.style.transform = "scale(1)";
                productImg.style.transformOrigin = "center center";
                return;
            }

            const rect = imgContainer.getBoundingClientRect();

            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            productImg.style.transformOrigin = `${x}% ${y}%`;
            productImg.style.transform = "scale(2)";
        });

        imgContainer.addEventListener('touchmove', (e) => {
            if (!zoom) return;

            const touch = e.touches[0];
            const rect = imgContainer.getBoundingClientRect();

            const x = ((touch.clientX - rect.left) / rect.width) * 100;
            const y = ((touch.clientY - rect.top) / rect.height) * 100;

            productImg.style.transformOrigin = `${x}% ${y}%`;
        });
    }
}



    





            /////////////////////////////////
            /*descontar stock de productos*/
            ///////////////////////////////

 async function descontarStockGlobal(carrito) {
    console.log("Iniciando descuento de stock en Syrax Express...");

    for (const item of carrito) {
        try {
           const idProducto = item.id;

// FORZAMOS FORMATO: Color a minúscula y Talle a MAYÚSCULA
const color = item.color ? item.color.toLowerCase().trim() : null;
const talle = item.talle ? item.talle.toUpperCase().trim() : null; 
const cantidad = Number(item.cantidad) || 1;

if (idProducto && talle && color) {
    const docRef = db.collection("inventario").doc(idProducto);
    const caminoStock = `variantes.${color}.stock.talles.${talle}`;

    await docRef.update({
        [caminoStock]: firebase.firestore.FieldValue.increment(-cantidad)
    });

                console.log(`✅ Stock restado en Syrax: ${idProducto} (${color} - ${talle}) x${cantidad}`);
            } else {
                console.warn("⚠️ Datos insuficientes para el descuento:", item);
            }
        } catch (error) {
            console.error("❌ Error al descontar stock en Syrax:", item.name, error);
        }
    }
}
            
        















//////////////////////////////////////////////////
// --- FUNCIÓN MAESTRA PARA DETALLE DE PRODUCTO ---
/////////////////////////////////////////////////

async function inicializarPaginaProducto(db) {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get("id");
   
    if (!productoId) {
        console.warn("No se encontró ID de producto en la URL.");
        return;
    }

    window.productoId = productoId;
    const productNameElem = document.getElementById("product-name");
    if (!productNameElem) return;

    // --- ESCUCHADOR EN TIEMPO REAL (onSnapshot) ---
    // Se activa cada vez que modificás este producto en el Admin
    db.collection("inventario").doc(productoId).onSnapshot(async (docSnap) => {
        if (!docSnap.exists) {
            console.error("El producto ya no existe en Syrax Express.");
            return;
        }

        const p = docSnap.data();
        window.product = p;
        const usuarioActivo = firebase.auth().currentUser;

        // 1. --- ACTUALIZAR FAVORITOS ---
        const btnFav = document.getElementById("btn-favorito-detalle");
        if (btnFav) {
            btnFav.onclick = () => toggleFavorito(productoId, btnFav);
            if (usuarioActivo) {
                // Obtenemos favoritos una vez para marcar el estado inicial
                const userDoc = await db.collection("usuarios").doc(usuarioActivo.uid).get();
                if (userDoc.exists) {
                    const favs = userDoc.data().favoritos || [];
                    const esFav = favs.some(f => String(f).trim() === String(productoId).trim());
                    if (esFav) {
                        btnFav.classList.add('active');
                        if (btnFav.querySelector('i')) btnFav.querySelector('i').className = 'fas fa-heart';
                    }
                }
            }
        }

        // 2. --- ACTUALIZAR PRECIOS Y WHATSAPP ---
        const pTachado = typeof p.precio === 'string' ? parseFloat(p.precio.replace(/\./g, '').replace(',', '.')) : (p.precio || 0);
        const pOferta = typeof p.precioOriginal === 'string' ? parseFloat(p.precioOriginal.replace(/\./g, '').replace(',', '.')) : (p.precioOriginal || 0);
        const esLiquidacion = p.liquidacion === true;
        const pFinal = (esLiquidacion && pOferta > 0) ? pOferta : pTachado;

        // Link de WhatsApp dinámico
        const btnWs = document.getElementById("btn-whatsapp-detalle");
        if (btnWs) {
            const mensajeWS = encodeURIComponent(`¡Hola! Mirá esto en *Syrax* 🚀\n*${p.nombre}*\n$${pFinal.toLocaleString('es-AR')}\n${window.location.href}`);
            btnWs.href = `https://wa.me/?text=${mensajeWS}`;
        }

        // Precios en pantalla
        const productPriceElem = document.getElementById("product-price");
        const tagDescuento = document.getElementById("descuento-tag-producto");

        if (productPriceElem) {
            if (esLiquidacion && pTachado > 0 && pOferta > 0) {
                const porcentaje = Math.round(100 - (pOferta * 100 / pTachado));
                productPriceElem.innerHTML = `<span class="precio-tachado">$${pTachado.toLocaleString("es-AR")}</span> <span class="precio-actual">$${pOferta.toLocaleString("es-AR")}</span>`;
                if (tagDescuento) {
                    tagDescuento.innerText = `-${porcentaje}% OFF🔥`;
                    tagDescuento.style.display = 'inline-block';
                }
            } else {
                productPriceElem.innerText = "$" + pTachado.toLocaleString("es-AR");
                if (tagDescuento) tagDescuento.style.display = 'none';
            }
        }

        // 3. --- ACTUALIZAR TEXTOS E INFO ---
        productNameElem.innerText = p.nombre || "Producto sin nombre";
        
        const productDescElem = document.getElementById("product-desc");
        if (productDescElem) productDescElem.innerText = p.descripcion || "Sin descripción disponible.";
       
        const catElem = document.getElementById("product-category");
        if (catElem && p.categoria) catElem.innerText = p.categoria.toUpperCase();

        // 4. --- ACTUALIZAR VARIANTES (COLORES/FOTOS) ---
        const colorContainer = document.getElementById("color-options");
        if (colorContainer && p.variantes) {
            const estadoActual = colorContainer.innerHTML; // Guardamos para no resetear si no hubo cambios
            let nuevoContenido = "";
            
            Object.keys(p.variantes).forEach((color) => {
                if (p.variantes[color].fotos?.length > 0) {
                    nuevoContenido += `<img src="${p.variantes[color].fotos[0]}" class="color-variant-thumb" data-color="${color}">`;
                }
            });

            // Solo refrescamos si las variantes cambiaron para no interrumpir la selección del usuario
            if (estadoActual !== nuevoContenido) {
                colorContainer.innerHTML = "";
                Object.keys(p.variantes).forEach((color, index) => {
                    if (p.variantes[color].fotos?.length > 0) {
                        const btnColor = document.createElement('img');
                        btnColor.src = p.variantes[color].fotos[0];
                        btnColor.classList.add('color-variant-thumb');
                        btnColor.onclick = () => typeof manejarCambioVariante === 'function' && manejarCambioVariante(p, color, btnColor);
                        colorContainer.appendChild(btnColor);
                        if (index === 0) btnColor.click();
                    }
                });
            }
        }

        // 5. --- PIXEL DE FACEBOOK (Track ViewContent) ---
        if (typeof fbq === 'function') {
            fbq('track', 'ViewContent', {
                content_name: p.nombre,
                content_ids: [productoId],
                content_type: 'product',
                value: pFinal,
                currency: 'ARS'
            });
        }

        // 6. --- CARGAR RELACIONADOS Y RESEÑAS ---
        // (Se ejecutan solo la primera vez o si cambian significativamente)
        if (typeof renderRelated === 'function') renderRelated(p.categoria, productoId);
        if (typeof activarSistemaReseñas === 'function') activarSistemaReseñas(db, productoId);

    }, (error) => { console.error("Error Real-Time Syrax:", error); });
}



    ///////////////////////////////////
    /*  CAMBIO DE PRODUCTO*/
    ///////////////////////////////////
function manejarCambioVariante(producto, color, elemento) {
    const infoColor = producto.variantes[color];
    if (!infoColor) return;

    // 1. ACTUALIZAR NOMBRE DEL COLOR EN EL TEXTO
    const colorDisplay = document.getElementById("color-name-display");
    if (colorDisplay) {
        colorDisplay.innerText = color.toUpperCase();
    }

    // Efecto visual de miniatura activa
    document.querySelectorAll('.color-variant-thumb').forEach(el => el.classList.remove('active'));
    if (elemento) elemento.classList.add('active');

    // 2. ACTUALIZAR FOTOS
    const mainImg = document.getElementById("product-img");
    if (mainImg && infoColor.fotos) {
        mainImg.src = infoColor.fotos[0];
    }

    const thumbContainer = document.getElementById("thumbnails-container");
    if (thumbContainer && infoColor.fotos) {
        thumbContainer.innerHTML = infoColor.fotos.map((img, i) => `
            <div class="thumb-wrapper ${i === 0 ? 'active' : ''}" onclick="window.changeMainImage(this, '${img}')">
                <img src="${img}">
            </div>`).join('');
    }

    // 3. TALLES Y STOCK (CON ORDENAMIENTO)
    const talleSelector = document.getElementById("talle-selector");
    if (talleSelector) {
        talleSelector.innerHTML = "";
        
        const listaTalles = infoColor.stock?.talles || infoColor.talles || {};
        const tallesEnDB = Object.keys(listaTalles);
        const ordenDeseado = ["S", "M", "L", "XL", "XXL"];
        
        const tallesOrdenados = ordenDeseado.filter(t => tallesEnDB.includes(t));

        tallesOrdenados.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; 
            opt.innerText = t;
            talleSelector.appendChild(opt);
        });

        // 4. FUNCIÓN INTERNA REVISAR (Para validar stock y configurar precios)
        const revisar = () => {
            const elegido = talleSelector.value;
            const stockDisponible = listaTalles[elegido] || 0;
            window.stockMaximoActual = stockDisponible; 

            const btnAdd = document.getElementById("add-cart");
            const btnBuy = document.querySelector(".buy-now-btn") || document.getElementById("buy-now");
            const inputCant = document.getElementById("product-qty");

            // --- LÓGICA DE PRECIO FINAL (Liquidación vs Normal) ---
            let val1 = Number(producto.precio) || 0;
            let val2 = Number(producto.precioOriginal) || 0;
            let precioFinal;

            if (val1 > 0 && val2 > 0) {
                precioFinal = Math.min(val1, val2);
            } else {
                precioFinal = val1 || val2;
            }

            const sinStock = stockDisponible <= 0;

            if (sinStock) {
                if (btnAdd) {
                    btnAdd.innerText = "SIN STOCK";
                    btnAdd.disabled = true;
                    btnAdd.style.opacity = "0.5";
                    btnAdd.style.cursor = "not-allowed";
                }
                if (btnBuy) {
                    btnBuy.disabled = true;
                    btnBuy.style.opacity = "0.5";
                    btnBuy.style.cursor = "not-allowed";
                }
            } else {
                if (btnAdd) {
                    btnAdd.innerText = "AGREGAR AL CARRITO";
                    btnAdd.disabled = false;
                    btnAdd.style.opacity = "1";
                    btnAdd.style.cursor = "pointer";

                    btnAdd.onclick = () => {
                        if (typeof window.prepareAddToCart === 'function') {
                            // Guardamos el resultado en la constante 'exito'
                            const exito = window.prepareAddToCart(
                                window.productoId, 
                                producto.nombre, 
                                producto.precio, 
                                producto.precioOriginal, 
                                infoColor.fotos[0], 
                                color, 
                                elegido
                            );

                            // --- APERTURA AUTOMÁTICA DEL CARRITO (side-cart) ---
                            if (exito && typeof window.toggleCart === 'function') {
                                window.toggleCart(true); // Abre el carrito y el overlay
                            }

                            // --- EVENTO META: ADD TO CART CON PRECIO REAL ---
                            const usuarioActivo = firebase.auth().currentUser;

                            fbq('track', 'AddToCart', {
                                content_name: producto.nombre,
                                content_ids: [window.productoId], 
                                content_type: 'product',
                                value: precioFinal, 
                                currency: 'ARS',
                                content_category: producto.categoria || 'Indumentaria',
                                status: 'success',
                                external_id: usuarioActivo ? usuarioActivo.uid : 'invitado',
                                user_data: {
                                    em: usuarioActivo ? usuarioActivo.email : 'anonimo'
                                }
                            });

                            console.log(`Carrito: Agregado ${producto.nombre} a $${precioFinal}`);
                        }
                    };
                }
                if (btnBuy) {
                    btnBuy.disabled = false;
                    btnBuy.style.opacity = "1";
                    btnBuy.style.cursor = "pointer";
                }
                
                if (inputCant) {
                    let valorActual = parseInt(inputCant.value) || 1;
                    if (valorActual > stockDisponible) {
                        inputCant.value = stockDisponible;
                    } else if (valorActual === 0 && stockDisponible > 0) {
                        inputCant.value = 1;
                    }
                }
            }
        };

        talleSelector.onchange = revisar;
        revisar();
    }
}



    //////////////////////////
    /* FUNCION DE RESEÑAS*/
    ///////////////////////////

   function activarSistemaReseñas(db, productoId) {
    // --- 1. DEFINICIÓN DE ELEMENTOS ---
    const reviewsList = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('new-review-form');
    const showFormBtn = document.getElementById('show-form-btn');
    const formContainer = document.getElementById('review-form-container');

    // Verificación de seguridad básica
    if (!productoId) {
        console.error("Error: Falta productoId para cargar las reseñas.");
        return;
    }

    // --- 2. LÓGICA PARA MOSTRAR/OCULTAR EL FORMULARIO ---
    if (showFormBtn && formContainer) {
        showFormBtn.onclick = () => {
            if (formContainer.style.display === "none" || formContainer.style.display === "") {
                formContainer.style.display = "block";
                showFormBtn.innerText = "CERRAR FORMULARIO";
                
                // Ocultamos el campo de nombre si el usuario está logueado
                const user = firebase.auth().currentUser;
                const nombreInput = document.getElementById('rev-name');
                if (user && nombreInput) {
                    nombreInput.style.display = "none";
                }
            } else {
                formContainer.style.display = "none";
                showFormBtn.innerText = "DEJAR MI OPINIÓN";
            }
        };
    }

    if (!reviewForm || !reviewsList) return;

    // --- 3. LEER RESEÑAS EN TIEMPO REAL ---
    db.collection("opiniones")
      .where("productoId", "==", productoId)
      .orderBy("fecha", "desc")
      .onSnapshot((snap) => {
          reviewsList.innerHTML = '';
          if (snap.empty) {
              reviewsList.innerHTML = '<p style="text-align:center; color:#888;">Sé el primero en dejar una opinión.</p>';
              return;
          }
        snap.forEach(doc => {
    const res = doc.data();
    reviewsList.innerHTML += `
        <div class="review-card" style="margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div class="review-header" style="display: flex !important; align-items: center !important; gap: 12px !important; margin-bottom: 8px !important; justify-content: flex-start !important;">
                ${res.foto ? `<img src="${res.foto}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; flex-shrink: 0;">` : ''}
                <span class="review-name" style="font-weight: bold; color: #000; font-size: 1rem; margin: 0 !important; white-space: nowrap;">${res.nombre}</span>
            </div>
            <div class="stars" style="color: #FFD700; margin-bottom: 8px; font-size: 0.9rem;">
                ${"⭐".repeat(res.estrellas || 5)}
            </div>
            <p class="review-text" style="font-style: italic; color: #444; margin: 0; line-height: 1.4;">"${res.comentario}"</p>
            ${res.respuestaAdmin ? `
                <div class="admin-reply-container" style="margin-top: 15px; padding: 12px; background-color: #f9f9f9; border-left: 4px solid #ff0000; border-radius: 0 4px 4px 0;">
                    <span style="color: #ff0000; font-weight: 900; font-size: 0.7rem; display: block; margin-bottom: 5px; text-transform: uppercase;">Respuesta de Syrax Oficial 🔥</span>
                    <p style="margin: 0; font-size: 0.9rem; color: #222;">${res.respuestaAdmin}</p>
                </div>
            ` : ''}
        </div>`;
});
      });

    // --- 4. GUARDAR NUEVA RESEÑA (Identidad Automática) ---
    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const user = firebase.auth().currentUser;
        
        // Si no hay usuario, redirigimos al login
        if (!user) {
            if (typeof abrirTuModalLogin === 'function') {
                abrirTuModalLogin();
            } else {
                mostrarAviso("Iniciá sesión para dejar tu opinión.");
            }
            return;
        }

        const comentarioInput = document.getElementById('rev-text');
        const estrellasInput = document.getElementById('rev-rating');
        const nombreProducto = document.querySelector('h1')?.innerText || "Producto Syrax";

        if (!comentarioInput || !estrellasInput) return;

        try {
            const btn = reviewForm.querySelector('button');
            if (btn) btn.disabled = true;

            await db.collection("opiniones").add({
                usuarioId: user.uid,
                nombre: user.displayName || "Cliente Syrax", 
                foto: user.photoURL || "",
                nombreProducto: nombreProducto,
                comentario: comentarioInput.value.trim(),
                estrellas: parseInt(estrellasInput.value),
                productoId: productoId,
                fecha: firebase.firestore.FieldValue.serverTimestamp(),
                respuestaAdmin: null
            });

            if (typeof mostrarAviso === 'function') {
                mostrarAviso("¡Gracias por tu opinión!");
            }

            reviewForm.reset();
            if (formContainer) formContainer.style.display = "none";
            if (showFormBtn) showFormBtn.innerText = "DEJAR MI OPINIÓN";
            if (btn) btn.disabled = false;

        } catch (error) {
            console.error("Error al guardar reseña:", error);
            const btn = reviewForm.querySelector('button');
            if (btn) btn.disabled = false;
        }
    };
}



    ////////////////////////////////////////////////
    /*cargar tarjeta de productos automaticamente*/
    ////////////////////////////////////////////////

    let syraxUnsubscribe = null;

async function cargarProductos(categoriaFiltro = null, soloLiquidacion = false, subcategoriaFiltro = null) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    // 2. MATAR SUSCRIPCIÓN PREVIA: Si ya había un filtro activo, lo cortamos para que no se pisen
    if (syraxUnsubscribe) {
        console.log("🛑 Cortando conexión anterior para aplicar nuevo filtro...");
        syraxUnsubscribe();
    }

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Sincronizando con Syrax Express...</p>';

    // Favoritos
    const user = firebase.auth().currentUser;
    let listaFavoritos = [];
    if (user) {
        try {
            const userDoc = await db.collection("usuarios").doc(user.uid).get();
            if (userDoc.exists) {
                listaFavoritos = Array.isArray(userDoc.data().favoritos) ? userDoc.data().favoritos : [];
            }
        } catch (e) { console.error("Error favoritos:", e); }
    }

    console.log("🚀 EJECUTANDO FILTRO ÚNICO:", { categoriaFiltro, soloLiquidacion, subcategoriaFiltro });

    // 3. GUARDAR LA NUEVA SUSCRIPCIÓN
    syraxUnsubscribe = db.collection("inventario").onSnapshot((querySnapshot) => {
        grid.innerHTML = '';
        let retrasoCascarada = 0;
        let productosVisibles = 0;

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;

            // --- LÓGICA DE FILTROS ---
            const catDoc = String(p.categoria || "").toLowerCase().trim();
            const subDoc = String(p.subcategoria || "").toLowerCase().trim();
            const catFiltroNorm = categoriaFiltro ? categoriaFiltro.toLowerCase().trim() : null;
            const subFiltroNorm = subcategoriaFiltro ? subcategoriaFiltro.toLowerCase().trim() : null;
            
            const valorLiq = String(p.Liquidacion || p.liquidacion || "").toLowerCase().trim();
            const esLiqDoc = (p.liquidacion === true || p.Liquidacion === true || valorLiq === "true");

            // --- EJECUCIÓN DE FILTROS ---
            if (soloLiquidacion && !esLiqDoc) return;
            if (catFiltroNorm && catDoc !== catFiltroNorm) return;
            if (subFiltroNorm && subDoc !== subFiltroNorm) return;

            // Si pasó los filtros, sumamos
            productosVisibles++;

            // --- LÓGICA DE PRECIOS Y FAVORITOS ---
            const esFavorito = listaFavoritos.some(favId => String(favId).trim() === String(id).trim());
            const iconoClase = esFavorito ? 'fas' : 'far';
            const botonClase = esFavorito ? 'active' : '';

            let val1 = Number(p.precio) || 0;
            let val2 = Number(p.precioOriginal) || 0;
            let precioFinal = (val1 > 0 && val2 > 0) ? Math.min(val1, val2) : (val1 || val2);
            let precioViejo = (val1 > 0 && val2 > 0) ? Math.max(val1, val2) : 0;
            
            let badgeHTML = "";
            let tachadoHTML = "";
            if (esLiqDoc && precioViejo > precioFinal) {
                const desc = Math.round(((precioViejo - precioFinal) / precioViejo) * 100);
                badgeHTML = `<span class="badge-off">-${desc}% OFF 🔥</span>`;
                tachadoHTML = `<span class="old-price">$${precioViejo.toLocaleString('es-AR')}</span>`;
            }

            // --- IMÁGENES ---
            let fotos = Array.isArray(p.imagenTarjeta) ? p.imagenTarjeta : [p.imagenPrincipal || 'assets/img/placeholder.jpg'];
            let imagenesHTML = fotos.map((ruta, index) =>
                `<img src="${ruta}" class="product-img ${index === 0 ? 'active' : ''}" alt="${p.nombre}">`
            ).join('');

            retrasoCascarada += 0.05;
            const urlProducto = `${window.location.origin}/producto.html?id=${id}`;
            const mensajeWS = encodeURIComponent(`¡Hola! Mirá esto en *Syrax Express* 🚀\n\n*Producto:* ${p.nombre}\n*Precio:* $${precioFinal.toLocaleString('es-AR')}\n\n${urlProducto}`);

            grid.innerHTML += `
                <div class="product-card" data-id="${id}" style="animation-delay: ${retrasoCascarada}s">
                    <div class="product-slider">
                        ${badgeHTML}
                        <button class="prev" onclick="moverSlider(this, -1)">❮</button>
                        <a href="producto.html?id=${id}">${imagenesHTML}</a>
                        <button class="next" onclick="moverSlider(this, 1)">❯</button>
                    </div>
                    <div class="product-info">
                        <div class="product-text-group">
                            <h3>${p.nombre || 'Producto Syrax'}</h3>
                            <div class="price-container">
                                ${tachadoHTML}
                                <p class="price">$${precioFinal.toLocaleString('es-AR')}</p>
                            </div>
                        </div>
                        <div class="product-buttons">
                            <button class="fav-btn-inline ${botonClase}"  data-id="${id}" onclick="toggleFavorito('${id}', this)">
                                <i class="${iconoClase} fa-heart"></i>
                            </button>
                            <a href="https://wa.me/?text=${mensajeWS}" target="_blank" class="share-ws-btn">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <a href="producto.html?id=${id}" style="flex-grow: 1;">
                                <button class="buy-btn">VER PRODUCTO</button>
                            </a>
                        </div>
                    </div>
                </div>`;
        });

        console.log(`✅ Filtro aplicado. Mostrando ${productosVisibles} productos.`);

        if (productosVisibles === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay productos en esta sección.</p>';
        }
    }, (error) => {
        console.error("Error Syrax:", error);
        grid.innerHTML = '<p>Error al conectar con el inventario.</p>';
    });
}

///////////////////////////////////////////////
// Función para actualizar el texto del mensaje
///////////////////////////////////////////////

async function actualizarTextoHeader() {
    const nuevoTexto = document.getElementById('header-texto').value;
    if (!nuevoTexto) return alert("Escribí un mensaje primero");

    try {
        await db.collection("configuracion").doc("liquidacion").set({
            mensaje: nuevoTexto
        }, { merge: true });
        alert("Texto actualizado correctamente");
    } catch (error) {
        console.error("Error:", error);
    }
}


    ////////////////////////////////////////////////////////////////////////////////////
    /* BANNER DE PAGINA DE texto infinito( de aca se elige a donde dirigir a la persona)*/
    ////////////////////////////////////////////////////////////////////////////////////

async function inicializarBannerSyrax() {
    const bannerDiv = document.getElementById('banner-ofertas');
    const textoP = document.getElementById('texto-banner-ofertas');
    
    if (!bannerDiv || !textoP) return;

    try {
        const doc = await db.collection("configuracion").doc("banner").get();
        
        if (doc.exists && doc.data().activo) {
            const data = doc.data();
            
            // 1. Configuramos el Link
            const linkDestino = data.oferta_banner_link || "liquidacion.html";
            
            // 2. Preparamos el Texto Infinito
            const mensajes = data.texto ? data.texto.toUpperCase().split(";") : ["¡BIENVENIDOS A SYRAX!"];
            const espacios = data.espacios || 30;
            const separador = "\u00A0".repeat(espacios) + "|" + "\u00A0".repeat(espacios);
            
            const tiraCompleta = mensajes
                .map(m => m.trim())
                .filter(m => m !== "")
                .join(separador) + separador;

            // 3. Inyectamos el texto (repetido para que no haya huecos)
            textoP.textContent = tiraCompleta.repeat(10);
            
            // 4. Convertimos el contenedor en un link real
            // Envolvemos el contenido en un <a> o usamos onclick
            bannerDiv.style.cursor = "pointer";
            bannerDiv.onclick = () => { window.location.href = linkDestino; };

            // 5. Ajustamos la velocidad (opcional si usás variables CSS)
            if (data.velocidad) {
                textoP.style.animationDuration = `${data.velocidad}s`;
            }

            bannerDiv.style.display = 'flex';
        } else {
            bannerDiv.style.display = 'none';
        }
    } catch (error) {
        console.error("Error al sincronizar Banner:", error);
    }
}

// Llamala solo una vez cuando carga la página
document.addEventListener('DOMContentLoaded', inicializarBannerSyrax);



////////////////////
/*  HERO SLIDER  */
//////////////////

async function sincronizarSliderPrincipal() {
    // --- ESCUCHADOR EN TIEMPO REAL ---
    db.collection("configuracion").doc("slider_principal").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            let hayAlMenosUno = false;

            // Limpiamos intervalos previos si existen para que no se acelere el slider
            if (window.sliderInterval) clearInterval(window.sliderInterval);

            for (let i = 1; i <= 5; i++) {
                const img = document.getElementById(`slide${i}_img`);
                const txt = document.getElementById(`slide${i}_titulo`);
                const btn = document.getElementById(`slide${i}_btn_link`);
                const contenedor = img ? img.closest('.slide') : null;

                const urlImg = data[`slide${i}_img`];

                if (urlImg && urlImg.length > 5) {
                    if (img) img.src = urlImg;
                    if (txt) txt.innerText = data[`slide${i}_titulo`] || "";
                    
                    // LÓGICA DEL BOTÓN
                    if (btn) {
                        const textoBoton = data[`slide${i}_btn`];
                        const linkBoton = data[`slide${i}_link`];

                        if (textoBoton && textoBoton.trim() !== "") {
                            btn.innerText = textoBoton;
                            btn.href = linkBoton || "#";
                            btn.style.display = "inline-block";
                        } else {
                            btn.style.display = "none";
                        }
                    }

                    if (contenedor) {
                        contenedor.style.display = "flex";
                        contenedor.classList.remove('active');
                        // El primero que encontremos será el activo inicial
                        if (!hayAlMenosUno) {
                            contenedor.classList.add('active');
                            hayAlMenosUno = true;
                            window.currentSlide = i - 1; // Reseteamos el índice para el movimiento
                        }
                    }
                } else if (contenedor) {
                    contenedor.style.display = "none";
                    contenedor.classList.remove('active');
                }
            }

            // Si hay contenido, arrancamos la animación
            if (hayAlMenosUno && typeof iniciarMovimientoSlider === 'function') {
                iniciarMovimientoSlider();
            }
            
            console.log("Syrax: Hero Slider sincronizado.");
        }
    }, (error) => {
        console.error("Error en tiempo real del slider:", error);
    });
}

    //////////////////////////////
    /*  SLIDER PRINCIPAL GIGANTE*/
    //////////////////////////////

function iniciarMovimientoSlider() {
    if (window.intervaloSliderSyrax) clearInterval(window.intervaloSliderSyrax);

    window.intervaloSliderSyrax = setInterval(() => {
        // Buscamos todos los slides que NO están ocultos (o sea, los que tienen imagen)
        const slides = Array.from(document.querySelectorAll('.slide')).filter(s => 
            getComputedStyle(s).display !== 'none'
        );

        if (slides.length <= 1) return;

        const actual = document.querySelector('.slide.active');
        let indexSiguiente = slides.indexOf(actual) + 1;

        if (indexSiguiente >= slides.length) indexSiguiente = 0;

        actual.classList.remove('active');
        slides[indexSiguiente].classList.add('active');

    }, 5000); // 5 segundos
}






////////////////////////////////////////////////////////
// Función para cambio manual DE SLIDER GIGANTE(Flechas)
///////////////////////////////////////////////////////


function cambiarSlideManual(direccion) {
    // 1. Frenamos el movimiento automático un momento
    if (window.intervaloSliderSyrax) clearInterval(window.intervaloSliderSyrax);

    // 2. Buscamos los slides que están activos (visibles)
    const slides = Array.from(document.querySelectorAll('.slide')).filter(s => 
        getComputedStyle(s).display !== 'none'
    );

    if (slides.length <= 1) return;

    const actual = document.querySelector('.slide.active');
    let nuevoIndex = slides.indexOf(actual) + direccion;

    // Lógica circular (si llega al final, vuelve al principio y viceversa)
    if (nuevoIndex >= slides.length) nuevoIndex = 0;
    if (nuevoIndex < 0) nuevoIndex = slides.length - 1;

    // 3. Cambiamos la clase active
    actual.classList.remove('active');
    slides[nuevoIndex].classList.add('active');

    // 4. Reiniciamos el movimiento automático después del clic
    iniciarMovimientoSlider();
}





/////////////////////////////////////
/*    ABRE LA SUBCATEGORIA         */
////////////////////////////////////


document.querySelectorAll('.dropdown-toggle').forEach(item => {
    item.addEventListener('click', function(e) {
        // Solo si estamos en una pantalla chica (celular/tablet)
        if (window.innerWidth <= 1024) {
            e.preventDefault(); // Evita que el link haga scroll o navegue
            
            // Buscamos el menú de subcategorías que está justo al lado
            const dropdown = this.nextElementSibling;
            
            // Toggle: si está abierto lo cierra, si está cerrado lo abre
            if (dropdown.style.display === "block") {
                dropdown.style.display = "none";
                this.querySelector('i').style.transform = "rotate(0deg)";
            } else {
                dropdown.style.display = "block";
                this.querySelector('i').style.transform = "rotate(180deg)";
            }
        }
    });
});







/*===================================================*/
/* FUNCION QUE CONTROLA EL BANNER DE OFERTA DE ARRIBA*/
/*====================================================*/

async function sincronizarBanner() {
    const container = document.getElementById('banner-ofertas');
    const textoP = document.getElementById('texto-banner-ofertas');
    
    if (!container || !textoP) return;

    // --- ESCUCHADOR EN TIEMPO REAL ---
    db.collection("configuracion").doc("banner").onSnapshot((doc) => {
        if (doc.exists && doc.data().activo) {
            const data = doc.data();
            
            // 1. OBTENCIÓN Y LIMPIEZA
            const textoSucio = data.texto || "BIENVENIDOS A SYRAX";
            const listaMensajes = textoSucio.toUpperCase().split(/\s*;\s*/);

            // 2. CONFIGURACIÓN DE DINAMISMO
            const cantidadEspacios = parseInt(data.espacios) || 40; 
            const velocidad = data.velocidad || 25;
            
            // 3. GENERACIÓN DE LA TIRA DE TEXTO
            const nbs = "\u00A0"; 
            const separadorOficial = nbs.repeat(cantidadEspacios);
            const tiraNueva = (listaMensajes.join(separadorOficial) + separadorOficial).repeat(5);

            // 4. ACTUALIZACIÓN INTELIGENTE
            // Solo cambiamos el DOM si el texto o la velocidad son distintos
            // Esto evita que la animación "salte" innecesariamente
            if (textoP.textContent !== tiraNueva) {
                textoP.textContent = tiraNueva;
            }
            
            if (textoP.style.animationDuration !== `${velocidad}s`) {
                textoP.style.animationDuration = `${velocidad}s`;
            }
            
            container.style.display = 'block';
            console.log("Syrax: Banner infinito actualizado en vivo 🚀");
        } else {
            container.style.display = 'none';
        }
    }, (error) => {
        console.error("Error en tiempo real del banner:", error);
    });
}

// Se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', sincronizarBanner);






////////////////////////
/*filtra los productos*/
////////////////////////






/*===============*/
/*   FAVORITOS */
/*===============*/


async function toggleFavorito(id, btn) {
    const user = firebase.auth().currentUser;

    if (!user) {
        if (typeof abrirTuModalLogin === "function") {
            abrirTuModalLogin();
        } else {
            if (typeof mostrarAviso === "function") mostrarAviso("Iniciá sesión para guardar favoritos");
        }
        return;
    }

    const userRef = db.collection("usuarios").doc(user.uid);
    const idLimpio = String(id).trim();

    try {
        const doc = await userRef.get();
        const data = doc.data() || {};
        const favoritos = data.favoritos || [];

        // Verificamos si ya existe
        const yaEsFavorito = favoritos.some(favId => String(favId).trim() === idLimpio);

        if (yaEsFavorito) {
            // ELIMINAR
            await userRef.update({
                favoritos: firebase.firestore.FieldValue.arrayRemove(idLimpio)
            });
            actualizarVisualFavorito(idLimpio, false, btn);
            if (typeof mostrarAviso === "function") mostrarAviso("Eliminado de Favoritos 💔");
        } else {
            // AGREGAR
            await userRef.update({
                favoritos: firebase.firestore.FieldValue.arrayUnion(idLimpio)
            });
            actualizarVisualFavorito(idLimpio, true, btn);
            if (typeof mostrarAviso === "function") mostrarAviso("Agregado a Favoritos ♥️");
            
            if (typeof fbq === 'function') {
                fbq('track', 'AddToWishlist', {
                    content_ids: [idLimpio],
                    content_type: 'product',
                    external_id: user.uid
                });
            }
        }
    } catch (error) {
        console.error("Error al gestionar favorito:", error);
    }
}


////////////////////////////////////////////////////
/*   FUNCION PARA QUE QUEDE MARCADO EL FAVORITO  */
//////////////////////////////////////////////////

function actualizarVisualFavorito(id, estado, btn = null) {
    const idLimpio = String(id).trim();
    
    // Agregamos .fav-btn-inline que es la que usás en el inicio
    const botones = btn ? [btn] : document.querySelectorAll(`.fav-btn[data-id="${idLimpio}"], .fav-btn-inline[data-id="${idLimpio}"]`);

    botones.forEach(b => {
        const icon = b.querySelector('i');
        if (estado) {
            b.classList.add('active');
            if (icon) {
                icon.classList.replace('far', 'fas'); // Más limpio que remove/add
            }
        } else {
            b.classList.remove('active');
            if (icon) {
                icon.classList.replace('fas', 'far');
            }
        }
    });
}







document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Capturamos las variables de la URL
    const cat = params.get('categoria') || params.get('cat');
    const sub = params.get('subcategoria') || params.get('sub');
    const esLiqPage = path.includes('liquidacion.html');

    console.log("🛠️ Controlador Central Syrax - Página:", path);

    // 1. INICIADOR DEL HERO SLIDER (Solo en Inicio)
    if (path === '/' || path.includes('index.html')) {
        if (typeof sincronizarSliderPrincipal === 'function') {
            console.log("📸 Iniciando Hero Slider...");
            sincronizarSliderPrincipal();
        }
    }

    // 2. INICIADOR DE PÁGINA DE PRODUCTO (Solo si estamos en producto.html)
    if (path.includes('producto.html')) {
        if (typeof inicializarPaginaProducto === 'function') {
            console.log("📦 Iniciando detalles del producto...");
            inicializarPaginaProducto(db);
        }
    }

    // 3. CARGA DE PRODUCTOS (Catálogo / Liquidación / Inicio)
    // Agregamos index y "/" para que los productos destacados se carguen en el home
    if (path.includes('productos.html') || esLiqPage || path === '/' || path.includes('index.html')) {
        console.log("🎯 Disparando carga única de productos...");
        cargarProductos(cat, esLiqPage, sub);
    }
});



////////////////////////////
// EMPIEZA JS PARA CELULAR
//////////////////////////

/////////////////////////////////////
/* abrir menu hamburguesa celular */
///////////////////////////////////

document.addEventListener('click', function (e) {
    // 1. Si tocamos el botón de hamburguesa (Abrir)
    if (e.target.closest('.menu-mobile-btn')) {
        document.querySelector('.nav-links').classList.add('active');
    }

    // 2. Si tocamos el botón de cerrar (La X)
    if (e.target.closest('.menu-close-mobile')) {
        document.querySelector('.nav-links').classList.remove('active');
    }

    // 3. Si tocamos una categoría con dropdown
    if (e.target.closest('.dropdown-toggle')) {
        e.preventDefault();
        const parent = e.target.closest('.dropdown');
        
        // Opcional: Cerrar otros dropdowns al abrir uno nuevo
        document.querySelectorAll('.dropdown').forEach(d => {
            if (d !== parent) d.classList.remove('open');
        });

        parent.classList.toggle('open');
        console.log("Dropdown tocado");
    }
});


// Función para abrir/cerrar el menú usuario en el celu
document.addEventListener('click', function(e) {
    const mobileLink = document.getElementById('user-link-mobile');
    const mobileDropdown = document.getElementById('user-dropdown-mobile');

    // Si toca el nombre del usuario logueado en móvil
    if (mobileLink && mobileLink.contains(e.target)) {
        // Solo si el texto no es "INGRESAR" (es decir, está logueado)
        if (!mobileLink.innerText.includes("INGRESAR")) {
            e.preventDefault();
            mobileDropdown.classList.toggle('show-menu');
        }
    }
});
//FIN




