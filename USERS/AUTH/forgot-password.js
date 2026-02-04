
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { app } from './firebase-config.js'; // Asegúrate de tener tu configuración de Firebase en un archivo separado

const auth = getAuth(app);

const forgotForm = document.getElementById('forgotForm');
const messageElement = document.getElementById('message');

forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    try {
        await sendPasswordResetEmail(auth, email);
        messageElement.textContent = 'Si el email está registrado, se ha enviado un enlace para restablecer la contraseña.';
        messageElement.style.color = 'green';
    } catch (error) {
        console.error("Error al enviar el email:", error);
        messageElement.textContent = 'Ocurrió un error. Inténtalo de nuevo.';
        messageElement.style.color = 'red';
    }
});