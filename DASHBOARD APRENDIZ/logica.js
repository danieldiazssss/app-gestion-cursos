import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBO4IGGTwcPCk10eormyOUaPh0gCaiOWSU",
    authDomain: "slide-dash.firebaseapp.com",
    projectId: "slide-dash",
    storageBucket: "slide-dash.firebasestorage.app",
    messagingSenderId: "438458321951",
    appId: "1:438458321951:web:3ee01acc0ef06a57cdd92a",
    measurementId: "G-9MH1414LF4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Escuchador de cambio de usuario
onAuthStateChanged(auth, async (user) => {
    const nameTxt = document.getElementById('user-name');
    const emailTxt = document.getElementById('user-email');

    if (user) {
        // Ponemos el correo de inmediato
        emailTxt.innerText = user.email;

        try {
            // Buscamos en Firestore el documento con el UID del usuario
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Prioridad de nombre: Firestore > Perfil Auth > Email
                const nombreAMostrar = data.nombre || data.usuario || user.displayName || user.email.split('@')[0];
                nameTxt.innerText = nombreAMostrar.toUpperCase();

                // Actualizamos las barras con datos de la DB (si no existen pone 0)
                actualizarProgreso('word', data.progresoWord || 0);
                actualizarProgreso('excel', data.progresoExcel || 0);
                actualizarProgreso('pp', data.progresoPP || 0);
                actualizarProgreso('canva', data.progresoCanva || 0);
            } else {
                // Si no hay datos en la base de datos aún
                nameTxt.innerText = (user.displayName || "NUEVO APRENDIZ").toUpperCase();
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
            nameTxt.innerText = "ERROR DE CARGA";
        }
    } else {
        // Si no hay nadie logueado, al login
        window.location.href = "../../USERS/AUTH/login.html";
    }
});

function actualizarProgreso(id, valor) {
    const bar = document.getElementById(`${id}-bar`);
    const txt = document.getElementById(`${id}-txt`);
    if (bar && txt) {
        bar.style.width = valor + "%";
        txt.innerText = valor + "%";
    }
}

// Botón de cerrar sesión
document.getElementById('logout-btn').onclick = () => {
    signOut(auth).then(() => {
        window.location.href = "../../index.html";
    });
};