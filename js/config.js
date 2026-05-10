// assets/js/config.js
const firebaseConfig = {
    apiKey: "AIzaSyD-5tZiKhMO2iA4n-ZNg4Tizd-I5_VUuKU",
    authDomain: "syrax-tienda.firebaseapp.com",
    projectId: "syrax-tienda",
    storageBucket: "syrax-tienda.firebasestorage.app",
    messagingSenderId: "326236336734",
    appId: "1:326236336734:web:19e3d0fe08394ad473bacf"
};

// Inicialización única
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Definimos las herramientas que usaremos
const db = firebase.firestore();
const auth = firebase.auth();