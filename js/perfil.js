// --- OBSERVADOR ÚNICO: PERFIL + FAVORITOS + RESEÑAS ---
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Sesión activa en perfil:", user.email);
        
        // --- LLAMADA A RESEÑAS (Ponela aquí arriba) ---
        cargarMisReseñas(user.uid); 

        const userRef = db.collection('usuarios').doc(user.uid);
        
        // 1. Lógica de Interfaz y Foto
        const avatarLetra = document.getElementById('avatar-letra');
        const userPhotoImg = document.getElementById('user-photo');
        const displayEmail = document.getElementById('perfil-display-email');
        const inputEmail = document.getElementById('p-email');

        if (displayEmail) displayEmail.innerText = user.email;
        if (inputEmail) inputEmail.value = user.email;

        if (user.photoURL && userPhotoImg) {
            userPhotoImg.src = user.photoURL;
            userPhotoImg.style.display = 'block';
            if (avatarLetra) avatarLetra.style.display = 'none';
        } else if (avatarLetra) {
            avatarLetra.innerText = user.email.charAt(0).toUpperCase();
            avatarLetra.style.display = 'block';
            if (userPhotoImg) userPhotoImg.style.display = 'none';
        }

        // 2. Carga de datos desde Firestore y Favoritos
        userRef.get().then((doc) => {
            if (doc.exists) {
                const d = doc.data();
                
                // Rellenar campos de texto (con protección por si no existen los IDs)
                if(document.getElementById('perfil-display-name')) document.getElementById('perfil-display-name').innerText = d.nombreCompleto || user.displayName || "Usuario Syrax";
                if(document.getElementById('p-nombre')) document.getElementById('p-nombre').value = d.nombreCompleto || user.displayName || "";
                if(document.getElementById('p-telefono')) document.getElementById('p-telefono').value = d.telefono || "";
                if(document.getElementById('p-calle')) document.getElementById('p-calle').value = d.calle || "";
                if(document.getElementById('p-altura')) document.getElementById('p-altura').value = d.altura || "";
                if(document.getElementById('p-entrecalles')) document.getElementById('p-entrecalles').value = d.entrecalles || "";
                if(document.getElementById('p-ciudad')) document.getElementById('p-ciudad').value = d.ciudad || "";
                if(document.getElementById('p-cp')) document.getElementById('p-cp').value = d.cp || "";

                // CARGAR FAVORITOS
                const listaIds = d.favoritos || [];
                if (typeof ejecutarCargaFavoritos === 'function') {
                    ejecutarCargaFavoritos(listaIds); 
                }

            } else {
                if(document.getElementById('perfil-display-name')) document.getElementById('perfil-display-name').innerText = user.displayName || "Nuevo Usuario";
                if (typeof ejecutarCargaFavoritos === 'function') {
                    ejecutarCargaFavoritos([]);
                }
            }
        }).catch(err => console.error("Error al traer datos de usuario:", err));

        // 3. Configurar el evento de Guardar
        // Corregimos el error: si la función no existe, que no rompa el código
        if (typeof configurarFormularioPerfil === 'function') {
            configurarFormularioPerfil(userRef);
        } else {
            console.warn("La función configurarFormularioPerfil no está definida aún.");
        }

    } else {
        window.location.href = 'login.html';
    }
});






////////////////////////////
/*   CARGAR FAVORITOS    */
//////////////////////////


async function ejecutarCargaFavoritos(listaIds) {
    const grid = document.getElementById('favoritos-grid');
    if (!grid) return;

    if (listaIds.length === 0) {
        grid.innerHTML = '<p>Aún no tenés productos favoritos. ¡Explorá la tienda!</p>';
        return;
    }

    grid.innerHTML = ''; // Limpiamos "Cargando..."
    
    // Usamos Set para evitar duplicados visuales por error en el array
    const idsUnicos = [...new Set(listaIds)];

    for (const productoId of idsUnicos) {
        try {
            const productoDoc = await db.collection("inventario").doc(productoId).get();
            if (productoDoc.exists) {
                const p = productoDoc.data();
                // Aquí llamas a tu función que crea el HTML de la tarjeta
                if (typeof renderizarTarjetaFavorito === 'function') {
                    renderizarTarjetaFavorito(productoId, p, grid);
                }
            }
        } catch (error) {
            console.error("Error al buscar producto favorito:", productoId, error);
        }
    }
}

// Reutilizamos tu lógica de tarjetas pero simplificada para el perfil
function renderizarTarjetaFavorito(id, p, contenedor) {
    const valorLiquidacion = String(p.Liquidacion || p.liquidacion || "").toLowerCase().trim();
    const esLiquidacionDoc = (valorLiquidacion === "true");

    let badgeHTML = "";
    let tachadoHTML = "";
    let val1 = Number(p.precio) || 0;
    let val2 = Number(p.precioOriginal) || 0;
    let precioFinal, precioViejo;

    if (val1 > 0 && val2 > 0) {
        precioFinal = Math.min(val1, val2);
        precioViejo = Math.max(val1, val2);
    } else {
        precioFinal = val1 || val2;
        precioViejo = 0;
    }

    if (esLiquidacionDoc && precioViejo > precioFinal) {
        const desc = Math.round(((precioViejo - precioFinal) / precioViejo) * 100);
        badgeHTML = `<span class="fav-badge">-${desc}% OFF 🔥</span>`;
        tachadoHTML = `<span class="fav-old-price">$${precioViejo.toLocaleString('es-AR')}</span>`;
    }

    const imagen = Array.isArray(p.imagenTarjeta) ? p.imagenTarjeta[0] : (p.imagenPrincipal || 'assets/img/placeholder.jpg');

    const html = `
        <div class="fav-card" id="fav-${id}">
            <div class="fav-image-container">
                ${badgeHTML}
                <a href="producto.html?id=${id}">
                    <img src="${imagen}" class="fav-img" alt="${p.nombre}">
                </a>
                <button class="fav-delete-btn" onclick="eliminarFavorito('${id}')" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            
            <div class="fav-content">
                <h3 class="fav-title">${p.nombre || 'Producto Syrax'}</h3>
                
                <div class="fav-price-box">
                    ${tachadoHTML}
                    <p class="fav-current-price">$${precioFinal.toLocaleString('es-AR')}</p>
                </div>
                
                <a href="producto.html?id=${id}" class="fav-link-view">
                    <button class="fav-view-btn">VER PRODUCTO</button>
                </a>
            </div>
        </div>
    `;

    contenedor.insertAdjacentHTML('beforeend', html);
}

////////////////////////////
/*   ELIMINAR FAVORITO   */
//////////////////////////

async function eliminarFavorito(id) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // REEMPLAZO: Ahora usa tu estilo personalizado
    const confirmacion = await confirmarSyrax("¿Querés quitar este producto de tus favoritos?");

    if (confirmacion) {
        try {
            const userRef = db.collection("usuarios").doc(user.uid);
            await userRef.update({
                favoritos: firebase.firestore.FieldValue.arrayRemove(id)
            });

            // Animación de salida antes de remover
            const tarjeta = document.getElementById(`fav-${id}`);
            if (tarjeta) {
                tarjeta.style.transition = "all 0.4s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.9)";
                setTimeout(() => tarjeta.remove(), 400);
            }

            mostrarAviso("Eliminado de Favoritos 💔");
        } catch (error) {
            console.error("Error al eliminar favorito:", error);
            mostrarAviso("Error al intentar eliminar.");
        }
    }
}




//////////////////////////
/*  CARGAR MIS RESEÑAS */
////////////////////////

async function cargarMisReseñas(uid) {
    console.log("Ejecutando cargarMisReseñas para el UID:", uid);
    const container = document.getElementById('reseñas-usuario-container');
    if (!container) return;
    
    container.innerHTML = '<p class="status-msg">Buscando tus opiniones...</p>';

    try {
        const querySnapshot = await db.collection("opiniones")
            .where("usuarioId", "==", uid)
            .orderBy("fecha", "desc")
            .get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="status-msg">Aún no escribiste ninguna reseña.</p>';
            return;
        }

        // --- NUEVO: Traemos la lista de reseñas ocultadas localmente ---
        const reseñasOcultas = JSON.parse(localStorage.getItem(`ocultas_${uid}`)) || [];

        container.innerHTML = '';
        let contadorVisibles = 0;

       // ... (dentro de tu querySnapshot.forEach en cargarMisReseñas)
        querySnapshot.forEach((doc) => {
        const idReseña = doc.id;

        // Usamos el uid que vino por parámetro en la función
        const reseñasOcultas = JSON.parse(localStorage.getItem(`ocultas_${uid}`)) || [];

        if (reseñasOcultas.includes(idReseña)) {
        return; 
    }

        const r = doc.data();
    // LE PASAMOS EL UID COMO CUARTO PARÁMETRO
        renderizarItemReseña(r, container, idReseña, uid);
        contadorVisibles++;
});

        // Si el usuario ocultó todas sus reseñas manualmente, mostramos el mensaje de vacío
        if (contadorVisibles === 0) {
            container.innerHTML = '<p class="status-msg">Aún no escribiste ninguna reseña.</p>';
        }

    } catch (error) {
        console.error("Error al obtener reseñas:", error);
        container.innerHTML = '<p class="status-msg">Error al cargar las reseñas.</p>';
    }
}



// Agregamos 'uid' al final de los parámetros
function renderizarItemReseña(r, contenedor, idReseña, uid) {

    const estrellas = "⭐".repeat(r.estrellas || 0); 
    
    const respuestaHTML = r.respuestaAdmin 
        ? `<div class="res-admin-box">
             <span class="res-admin-tag">Respuesta de Syrax</span>
             <p>${r.respuestaAdmin}</p>
           </div>` 
        : `<p class="res-espera">Esperando respuesta del equipo...</p>`;

    const html = `
        <div class="res-card">

            <button class="res-delete-btn"
                    onclick="eliminarReseña('${idReseña}', this, '${uid}')"
                    title="Eliminar reseña">
                <i class="fas fa-times"></i>
            </button>

            <div class="res-header">
                <div class="res-info">
                    <span class="res-prod-name">
                        ${r.nombreProducto || 'Producto'}
                    </span>
                    <div class="res-stars">
                        ${estrellas}
                    </div>
                </div>
            </div>

            <div class="res-body">
                <p class="res-comentario">
                    "${r.comentario}"
                </p>
                ${respuestaHTML}
            </div>

        </div>
    `;
    
    contenedor.insertAdjacentHTML('beforeend', html);
}


function eliminarReseña(idReseña, boton) {
    // Cambiá el cartel de confirmación si usás uno customizado
    const confirmar = confirm("¿Querés dejar de ver esta reseña en tu perfil?");
    if (!confirmar) return;

    // Conseguimos el UID del usuario actual para que sus ocultas no se mezclen con otro login
    const uid = window.usuarioActual ? window.usuarioActual.uid : 'invitado';

    try {
        // 1. Obtener la lista actual de ocultas de este usuario
        let reseñasOcultas = JSON.parse(localStorage.getItem(`ocultas_${uid}`)) || [];

        // 2. Si el ID no estaba guardado, lo agregamos
        if (!reseñasOcultas.includes(idReseña)) {
            reseñasOcultas.push(idReseña);
        }

        // 3. Guardamos la nueva lista en el LocalStorage
        localStorage.setItem(`ocultas_${uid}`, JSON.stringify(reseñasOcultas));

        // 4. ELIMINAR VISUALMENTE DE LA PANTALLA ACTUAL
        const card = boton.closest('.res-card');
        if (card) {
            card.remove();
        }

        // 5. Check por si era la última que quedaba a la vista
        const container = document.getElementById('reseñas-usuario-container');
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="status-msg">Aún no escribiste ninguna reseña.</p>';
        }

        // Opcional: Podés usar tu función mostrarAviso aquí
        console.log("Reseña ocultada de la vista del perfil.");

    } catch (error) {
        console.error("Error al ocultar la reseña:", error);
    }
}






/////////////////////////////////////////////////////////////////////
/*  CONFIRMAR SYRAX, IGUAL QUE MOSTRARAVISO PERO DE CONFIRMACION  */
///////////////////////////////////////////////////////////////////

function confirmarSyrax(mensaje) {
    return new Promise((resolve) => {
        // 1. Creamos un fondo oscuro (Overlay) para bloquear la pantalla
        const overlay = document.createElement('div');
        overlay.id = 'syrax-confirm-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        // 2. Creamos el modal
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#000',
            color: '#fff',
            padding: '25px',
            borderRadius: '8px',
            border: '1px solid #ff5a80',
            textAlign: 'center',
            minWidth: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        });

        modal.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px;"><strong>SYRAX:</strong><br>${mensaje}</div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btn-si-confirm" style="background: #ff5a80; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.3s;">SÍ, QUITAR</button>
                <button id="btn-no-confirm" style="background: #333; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; transition: 0.3s;">CANCELAR</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 3. ASIGNACIÓN DIRECTA DE EVENTOS (Esto evita que se trabe)
        const btnSi = modal.querySelector('#btn-si-confirm');
        const btnNo = modal.querySelector('#btn-no-confirm');

        btnSi.onclick = () => {
            overlay.remove();
            resolve(true);
        };

        btnNo.onclick = () => {
            overlay.remove();
            resolve(false);
        };
        
        // También cerramos si toca el fondo oscuro
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        };
    });
}




 ////////////////////////////////
        /*     MOSTRAR AVISO        */
        ////////////////////////////////
function mostrarAviso(mensaje) {
    // 1. Creamos el elemento del aviso
    const aviso = document.createElement('div');
    aviso.innerHTML = `<strong>SYRAX:</strong> ${mensaje}`;
    
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
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid #ff5a80', // El color rosa de tu marca
        transition: 'all 0.5s ease'
    });

    document.body.appendChild(aviso);

    // 3. Lo borramos después de 3 segundos
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.remove(), 500);
    }, 3000);
}
