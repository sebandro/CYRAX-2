
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const btnAuth = document.getElementById('btn-auth');
const toggleAuth = document.getElementById('toggle-auth');

let isLogin = true;

// Intercambiar entre Login y Registro
toggleAuth.addEventListener('click', () => {
    isLogin = !isLogin;
    authTitle.innerText = isLogin ? "INICIAR SESIÓN" : "CREAR CUENTA";
    btnAuth.innerText = isLogin ? "ENTRAR" : "REGISTRARME";
    toggleAuth.innerHTML = isLogin ? "¿No tenés cuenta? <span>Registrate aquí</span>" : "¿Ya tenés cuenta? <span>Iniciá sesión</span>";
});

// Manejar el envío del formulario
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLogin) {
        // LOGIN
        auth.signInWithEmailAndPassword(email, password)
            .then(() => window.location.href = "index.html")
            .catch(err => alert("Error: " + err.message));
    } else {
        // REGISTRO
        auth.createUserWithEmailAndPassword(email, password)
            .then((cred) => {
                // Crear el documento del usuario en Firestore
                return db.collection('usuarios').doc(cred.user.uid).set({
                    email: email,
                    nombre: "",
                    direccion: "",
                    favoritos: []
                });
            })
            .then(() => window.location.href = "index.html")
            .catch(err => alert("Error al registrar: " + err.message));
    }
});

// Login con Google
document.getElementById('btn-google').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Verificar si el usuario ya existe en Firestore
            const userRef = db.collection('usuarios').doc(result.user.uid);
            userRef.get().then((doc) => {
                if (!doc.exists) {
                    userRef.set({
                        email: result.user.email,
                        nombre: result.user.displayName,
                        direccion: "",
                        favoritos: []
                    });
                }
            });
            window.location.href = "index.html";
        })
        .catch(err => console.error(err));
});