
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";


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

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const ficha = document.getElementById('ficha').value;
            const formacion = document.getElementById('formacion').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageElement = document.getElementById('message');

            if (password !== confirmPassword) {
                messageElement.textContent = 'Las contraseñas no coinciden.';
                messageElement.style.color = 'red';
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    email: email,
                    name: name,
                    ficha: ficha,
                    formacion: formacion,
                    createdAt: new Date(),
                    progress: []
                });

              
                await signOut(auth);

                messageElement.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
                messageElement.style.color = '#4CAF50';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error("Error al registrar:", error);
                if (error.code === 'auth/email-already-in-use') {
                    messageElement.textContent = 'El correo ya está en uso.';
                } else if (error.code === 'auth/weak-password') {
                    messageElement.textContent = 'La contraseña es demasiado débil (debe tener al menos 6 caracteres).';
                } else {
                    messageElement.textContent = 'Error al registrar. Inténtalo de nuevo.';
                }
                messageElement.style.color = 'red';
            }
        });
    }

 
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const isAdmin = document.getElementById('isAdmin')?.checked;
            const messageElement = document.getElementById('message');

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (isAdmin) {
                    const adminRef = doc(db, "admins", user.uid);
                    const adminDoc = await getDoc(adminRef);

                    if (!adminDoc.exists()) {
                        await signOut(auth);
                        messageElement.textContent = "No tienes permisos de administrador.";
                        return;
                    }
                    window.location.href = '../ADMIN/dashboard.html';
                } else {
                    window.location.href = '../../index.html';
                }

            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                messageElement.textContent = "Credenciales incorrectas o usuario no registrado.";
            }
        });
    }
});
document.getElementById("registerForm").addEventListener("submit", function(e) {
    const terms = document.getElementById("terms");

    if (!terms.checked) {
        e.preventDefault();
        document.getElementById("message").textContent = "Debes aceptar los Términos y Condiciones para continuar.";
        return;
    }
});
