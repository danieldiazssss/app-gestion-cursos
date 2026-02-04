import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const badWords = [
    'puta', 'puto', 'putas', 'putos', 'mierda', 'cabrón', 'cabrona', 'cabronazo',
    'joder', 'jodido', 'pendejo', 'pendeja', 'verga', 'vergas', 'maricón', 'marica',
    'hijoputa', 'hijo de puta', 'concha', 'conchatumadre', 'picha', 'carajo', 'chingar',
    'chingado', 'pito', 'zorra', 'gilipollas', 'subnormal', 'retrasado', 'imbécil',
    'coño', 'coños', 'pene', 'vagina', 'tetas', 'teta', 'culo', 'culos', 'pajero',
    'pajera', 'follar', 'follando', 'negro', 'negra', 'indio', 'india', 'gordo', 'gorda',
    'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'whore', 'motherfucker',
    'bastard', 'slut', 'cock', 'damn', 'hell', 'piss', 'nigger', 'fag', 'faggot',
    'p*ta', 'm*erda', 'j*der', 'c*bron', 'p*ndej*', 'v*rga', 'm*ric*n', 'h*j*puta',
    'c*nch*', 'p*cha', 'c*raj*', 'ch*ngar', 'p*to', 'z*rra', 'f*ck', 's*it', 'a*shole',
    'b*tch', 'd*ck', 'p*ssy', 'n*gga', 'n*gger',
    'pt', 'mrd', 'jdr', 'cbrn', 'vrg', 'mrcn', 'hjpt', 'cnch', 'crj', 'chngr', 'fck',
    'sht', 'bch', 'dck', 'ngr', 'niga'
];

function filterBadWords(text) {
    if (!text) return text;
    let filteredText = text;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
}

function updateCornerAvatar(avatarUrl, userName = "Usuario") {
    const avatarCorner = document.getElementById('avatar-corner');
    if (avatarCorner) {
        avatarCorner.innerHTML = `
            <img src="${avatarUrl}" alt="${userName}" id="corner-avatar-img">
            <span class="avatar-name">${userName}</span>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
   
    setTimeout(() => {
        const spinner = document.getElementById("loading-overlay");
        const content = document.getElementById("mainContent");
        
        if (spinner) {
            spinner.style.display = 'none';
            console.log("✅ Spinner ocultado");
        }
        
        if (content) {
            content.classList.remove('content-hidden');
            content.classList.add('content-visible');
            console.log("✅ Contenido mostrado");
        }
    }, 500);

    const añoElement = document.getElementById("año");
    if (añoElement) {
        añoElement.textContent = new Date().getFullYear();
    }

    const commentForm = document.getElementById("formComentario");
    const commentList = document.getElementById("listaComentarios");
    if (commentForm && commentList) {
        commentForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const nameInput = document.getElementById("nombre");
            const messageInput = document.getElementById("mensaje");
            const filteredName = filterBadWords(nameInput.value.trim());
            const filteredMessage = filterBadWords(messageInput.value.trim());

            if (!filteredName || !filteredMessage) {
                alert('Por favor completa ambos campos.');
                return;
            }

            try {
                await addDoc(collection(db, "comentarios"), {
                    nombre: filteredName,
                    mensaje: filteredMessage,
                    timestamp: serverTimestamp()
                });
                commentForm.reset();
            } catch (e) {
                console.error("Error al agregar documento: ", e);
                alert("Hubo un error al publicar el comentario. Inténtalo de nuevo.");
            }
        });

        const q = query(collection(db, "comentarios"), orderBy("timestamp", "desc"));
        onSnapshot(q, (querySnapshot) => {
            commentList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const comentario = doc.data();
                const newComment = document.createElement("div");
                newComment.className = 'comentario';
                const timestamp = comentario.timestamp ? comentario.timestamp.toDate().toLocaleString() : 'Fecha no disponible';
                newComment.innerHTML = `
                    <h3>${comentario.nombre}</h3>
                    <p>${comentario.mensaje}</p>
                    <small>${timestamp}</small>
                `;
                commentList.appendChild(newComment);
            });
        });
    }

    const authLinks = document.getElementById('auth-links');
    const profileLinks = document.getElementById('profile-links');
    const userProfileLink = document.getElementById('user-profile-link');
    const logoutBtn = document.getElementById('logout-btn');
    const adminDashboardLink = document.getElementById('admin-dashboard-link');

    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
        updateCornerAvatar(savedAvatar, localStorage.getItem('user_name'));
    }

    onAuthStateChanged(auth, async (user) => {
        console.log("=== ESTADO DE AUTENTICACIÓN ===");
        console.log("Usuario:", user ? user.email : "No autenticado");
        console.log("UID:", user ? user.uid : "N/A");
        
        if (user) {
            if (authLinks && profileLinks) {
                authLinks.style.display = 'none';
                profileLinks.style.display = 'flex';
                profileLinks.style.visibility = 'visible';
                profileLinks.style.opacity = '1';
                console.log("✅ Links de perfil mostrados");
            }

            try {
                console.log("📥 Obteniendo datos del usuario...");
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log("✅ Datos del usuario obtenidos:", userData);
                    
                    const fullName = userData.name || user.email;
                    const firstName = fullName.split(' ')[0];
                    
                    if (userProfileLink) {
                        userProfileLink.textContent = firstName;
                        console.log("✅ Nombre actualizado en el link:", firstName);
                    }
                    
                    localStorage.setItem('user_name', firstName);
                    localStorage.setItem('user_email', user.email);
                } else {
                    console.warn("⚠️ No se encontró documento del usuario en Firestore");
                    const fallbackName = user.email.split('@')[0];
                    if (userProfileLink) {
                        userProfileLink.textContent = fallbackName;
                    }
                    localStorage.setItem('user_name', fallbackName);
                }

                console.log("🔍 Verificando permisos de admin...");
                const adminDocRef = doc(db, "admins", user.uid);
                const adminDocSnap = await getDoc(adminDocRef);
                
                if (adminDocSnap.exists()) {
                    console.log("✅ Usuario ES ADMIN - Mostrando dashboard");
                    if (adminDashboardLink) {
                        adminDashboardLink.style.display = 'inline-block';
                        adminDashboardLink.style.visibility = 'visible';
                        adminDashboardLink.style.opacity = '1';
                    }
                } else {
                    console.log("ℹ️ Usuario NO es admin");
                    if (adminDashboardLink) {
                        adminDashboardLink.style.display = 'none';
                    }
                }

            } catch (error) {
                console.error("❌ Error al obtener datos:", error);
                console.error("Detalles del error:", error.message);
                
                const fallbackName = user.email.split('@')[0];
                if (userProfileLink) {
                    userProfileLink.textContent = fallbackName;
                }
            }

        } else {
            console.log("❌ Usuario no autenticado");
            
            if (authLinks && profileLinks && adminDashboardLink) {
                authLinks.style.display = 'flex';
                profileLinks.style.display = 'none';
                adminDashboardLink.style.display = 'none';
            }
            
            localStorage.removeItem('user_avatar');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
        }
        
        console.log("=== FIN VERIFICACIÓN ===");
    });

    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🚪 Intentando cerrar sesión...");
            
            try {
                await signOut(auth);
                console.log("✅ Sesión cerrada exitosamente");
                
                localStorage.removeItem('user_avatar');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_email');
              
                window.location.href = './USERS/AUTH/login.html';
            } catch (error) {
                console.error("❌ Error al cerrar sesión:", error);
                alert("Error al cerrar sesión. Por favor intenta de nuevo.");
            }
        });
    }

    if (userProfileLink) {
        userProfileLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("👤 Click en perfil");
            const currentUser = auth.currentUser;
            
            if (currentUser) {
                console.log("✅ Redirigiendo a perfil");
                window.location.href = './DASHBOARD APRENDIZ/index.html';
            } else {
                console.log("❌ No hay usuario, redirigiendo a login");
                window.location.href = './USERS/AUTH/login.html';
            }
        });
    }

    if (adminDashboardLink) {
        adminDashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("👑 Click en admin dashboard");
            window.location.href = './USERS/ADMIN/dashboard.html';
        });
    }
});

window.addEventListener('load', () => {
    console.log("🎯 Window load - Ocultando spinner...");
    
    const spinner = document.getElementById("loading-overlay");
    const content = document.getElementById("mainContent");
    
    if (spinner) {
        spinner.style.display = 'none';
        spinner.style.visibility = 'hidden';
        spinner.style.opacity = '0';
        console.log("✅ Spinner forzadamente ocultado");
    }
    
    if (content) {
        content.classList.remove('content-hidden');
        content.classList.add('content-visible');
        content.style.display = 'block';
        content.style.visibility = 'visible';
        content.style.opacity = '1';
        console.log("✅ Contenido forzadamente mostrado");
    }
});

setTimeout(() => {
    const spinner = document.getElementById("loading-overlay");
    if (spinner && window.getComputedStyle(spinner).display !== 'none') {
        console.warn("⚠️ Spinner aún visible después de 3s, forzando...");
        spinner.style.display = 'none';
        spinner.remove(); 
        
        const content = document.getElementById("mainContent");
        if (content) {
            content.classList.add('content-visible');
            content.style.opacity = '1';
        }
    }
}, 3000);

// ============================================
// SISTEMA DE BLOQUEO PARA INVITADOS
// ============================================

// Función para mostrar modal de login con diseño mejorado
function showLoginModalForCourses(tipo) {
    let modal = document.getElementById('loginModalCourses');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginModalCourses';
        
        let mensaje = '';
        if (tipo === 'curso') {
            mensaje = 'Para acceder a los cursos y guardar tu progreso necesitas iniciar sesión';
        } else if (tipo === 'juego') {
            mensaje = 'Para acceder a este juego necesitas iniciar sesión';
        } else if (tipo === 'comentario') {
            mensaje = 'Para dejar comentarios necesitas iniciar sesión';
        }
        
        modal.innerHTML = `
            <div class="modal-overlay-courses">
                <div class="modal-content-courses">
                    <div class="modal-icon">🔒</div>
                    <h2>Acceso Restringido</h2>
                    <p>${mensaje}</p>
                    <div class="modal-buttons-courses">
                        <button id="goToLoginCourses" class="btn-login-courses">
                            Iniciar Sesión
                        </button>
                        <button id="goToRegisterCourses" class="btn-register-courses">
                            Registrarse
                        </button>
                        <button id="closeModalCourses" class="btn-close-courses">
                            Cancelar
                        </button>
                    </div>
                    <p class="modal-footer-text">
                        ¡Es gratis y solo toma 1 minuto!
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        addModalStylesForCourses();
        
        document.getElementById('goToLoginCourses').addEventListener('click', () => {
            window.location.href = './USERS/AUTH/login.html';
        });
        
        document.getElementById('goToRegisterCourses').addEventListener('click', () => {
            window.location.href = './USERS/AUTH/register.html';
        });
        
        document.getElementById('closeModalCourses').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay-courses')) {
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = 'flex';
}

function addModalStylesForCourses() {
    if (!document.getElementById('modal-styles-courses')) {
        const style = document.createElement('style');
        style.id = 'modal-styles-courses';
        style.textContent = `
            #loginModalCourses {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
            }
            
            .modal-overlay-courses {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content-courses {
                background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%);
                border: 2px solid #8a2be2;
                border-radius: 20px;
                padding: 40px;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
                position: relative;
                animation: slideIn 0.4s ease;
            }
            
            .modal-icon {
                font-size: 60px;
                margin-bottom: 20px;
                animation: float 3s ease infinite;
            }
            
            .modal-content-courses h2 {
                font-family: 'pixel', sans-serif;
                font-size: 28px;
                color: #ffffff;
                margin-bottom: 15px;
                background: linear-gradient(135deg, #f5f5f5 0%, #a050ee 50%, #f5f5f5 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .modal-content-courses p {
                font-family: 'Roboto', sans-serif;
                font-size: 16px;
                color: #e0e0e0;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .modal-buttons-courses {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .modal-buttons-courses button {
                padding: 15px 30px;
                border: none;
                border-radius: 12px;
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn-login-courses {
                background: linear-gradient(135deg, #8a2be2 0%, #a050ee 100%);
                color: white;
                box-shadow: 0 4px 10px rgba(138, 43, 226, 0.3);
            }
            
            .btn-login-courses:hover {
                background: linear-gradient(135deg, #a050ee 0%, #8a2be2 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(138, 43, 226, 0.4);
            }
            
            .btn-register-courses {
                background: linear-gradient(135deg, #000000 0%, #000000 100%);
                color: white;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            }
            
            .btn-register-courses:hover {
                background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
                color : black;
            }
            
            .btn-close-courses {
                background: transparent;
                color: #e0e0e0;
                border: 2px solid #8a2be2;
            }
            
            .btn-close-courses:hover {
                background: rgba(138, 43, 226, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(138, 43, 226, 0.2);
            }
            
            .modal-footer-text {
                margin-top: 25px;
                font-size: 14px;
                color: #a050ee;
                font-weight: 500;
                font-family: 'Roboto', sans-serif;
            }
            
            /* Animaciones */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @media (max-width: 600px) {
                .modal-content-courses {
                    padding: 35px 25px;
                }
                
                .modal-content-courses h2 {
                    font-size: 24px;
                }
                
                .modal-content-courses p {
                    font-size: 15px;
                }
                
                .modal-icon {
                    font-size: 50px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}   
// Inicialización del bloqueo
let bloqueoInicializado = false;

function inicializarBloqueo() {
    if (bloqueoInicializado) {
        console.log("⚠️ Bloqueo ya inicializado, evitando duplicación");
        return;
    }
    
    console.log("🔐 Inicializando sistema de bloqueo para invitados...");
    
    // BLOQUEO DE CURSOS
    const courseCards = document.querySelectorAll('.cars1');
    
    if (courseCards.length > 0) {
        console.log(`📚 Encontradas ${courseCards.length} cartas de cursos`);
        
        courseCards.forEach((card, index) => {
            const originalHref = card.getAttribute('href');
            card.removeAttribute('href');
            card.style.cursor = 'pointer';
            
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const currentUser = auth.currentUser;
                console.log(`🔍 Click en curso ${index + 1}, Usuario:`, currentUser ? currentUser.email : "Invitado");
                
                if (currentUser) {
                    console.log("✅ Permitiendo acceso al curso");
                    window.location.href = originalHref;
                } else {
                    console.log("❌ Bloqueando acceso al curso");
                    showLoginModalForCourses('curso');
                }
            });
        });
    }
    
    // BLOQUEO DE JUEGOS (EXCEPTO AHORCADO)
    const gameCards = document.querySelectorAll('.game-card');
    
    if (gameCards.length > 0) {
        console.log(`🎮 Encontradas ${gameCards.length} cartas de juegos`);
        
        gameCards.forEach((card, index) => {
            const originalHref = card.getAttribute('href');
            const gameTitle = card.querySelector('.card-title')?.textContent.trim();
            
            console.log(`🎮 Juego ${index}: ${gameTitle}`);
            
            if (index !== 0) {
                card.removeAttribute('href');
                card.style.cursor = 'pointer';
                card.style.opacity = '0.8';
                card.style.position = 'relative';
                
                const lockIcon = document.createElement('div');
                lockIcon.innerHTML = '🔒';
                lockIcon.style.cssText = `
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 28px;
                    background: rgba(0,0,0,0.7);
                    padding: 10px 14px;
                    border-radius: 50%;
                    z-index: 10;
                `;
                card.appendChild(lockIcon);
                
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const currentUser = auth.currentUser;
                    console.log(`🔍 Click en ${gameTitle}, Usuario:`, currentUser ? currentUser.email : "Invitado");
                    
                    if (currentUser) {
                        console.log("✅ Permitiendo acceso al juego");
                        window.location.href = originalHref;
                    } else {
                        console.log("❌ Bloqueando acceso al juego:", gameTitle);
                        showLoginModalForCourses('juego');
                    }
                });
            } else {
                console.log("ℹ️ El Ahorcado disponible para todos");
            }
        });
    }
    
    // BLOQUEO DE COMENTARIOS
    const commentForm = document.getElementById('formComentario');
    const nombreInput = document.getElementById('nombre');
    const mensajeInput = document.getElementById('mensaje');
    
    if (commentForm && nombreInput && mensajeInput) {
        console.log("💬 Configurando bloqueo de comentarios");
        
        function actualizarEstadoComentarios() {
            const currentUser = auth.currentUser;
            
            if (currentUser) {
                nombreInput.disabled = false;
                mensajeInput.disabled = false;
                nombreInput.placeholder = "Tu nombre";
                mensajeInput.placeholder = "Escribe tu comentario aquí...";
                nombreInput.style.cursor = "text";
                mensajeInput.style.cursor = "text";
                console.log("✅ Comentarios habilitados para:", currentUser.email);
            } else {
                nombreInput.disabled = true;
                mensajeInput.disabled = true;
                nombreInput.placeholder = "Inicia sesión para comentar";
                mensajeInput.placeholder = "Inicia sesión para comentar";
                nombreInput.style.cursor = "not-allowed";
                mensajeInput.style.cursor = "not-allowed";
                
                const showModalOnClick = (e) => {
                    e.preventDefault();
                    showLoginModalForCourses('comentario');
                };
                
                nombreInput.addEventListener('click', showModalOnClick);
                mensajeInput.addEventListener('click', showModalOnClick);
                
                console.log("❌ Comentarios bloqueados para invitado");
            }
        }
        
        actualizarEstadoComentarios();
        
        onAuthStateChanged(auth, () => {
            actualizarEstadoComentarios();
        });
        
        commentForm.addEventListener('submit', (e) => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                e.preventDefault();
                showLoginModalForCourses('comentario');
            }
        });
    }
    
    bloqueoInicializado = true;
    console.log("🔐 Sistema de bloqueo activado exitosamente");
}

// Ejecutar después de que Firebase esté listo
setTimeout(() => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        inicializarBloqueo();
    } else {
        document.addEventListener('DOMContentLoaded', inicializarBloqueo);
    }
}, 1000);