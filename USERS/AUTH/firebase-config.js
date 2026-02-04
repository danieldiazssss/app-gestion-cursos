// Este archivo contiene tu configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBO4IGGTwcPCk10eormyOUaPh0gCaiOWSU",
    authDomain: "slide-dash.firebaseapp.com",
    projectId: "slide-dash",
    storageBucket: "slide-dash.firebasestorage.app",
    messagingSenderId: "438458321951",
    appId: "1:438458321951:web:3ee01acc0ef06a57cdd92a",
    measurementId: "G-9MH1414LF4"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la app para que otros archivos puedan usarla
export { app };