// ============================================
// IMPORTACIONES DE FIREBASE
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
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

// ============================================
// DATOS DE CURSOS DISPONIBLES
// ============================================
const CURSOS_DISPONIBLES = {
    word: {
        nombre: "Word",
        icono: "📝",
        url: "../WORD/word.html",
        totalModulos: 5
    },
    excel: {
        nombre: "Excel",
        icono: "📊",
        url: "../EXCEL/excel.html",
        totalModulos: 5
    },
    powerpoint: {
        nombre: "PowerPoint",
        icono: "📽️",
        url: "../POWERP/powerp.html",
        totalModulos: 5
    },
    outlook: {
        nombre: "Outlook",
        icono: "📧",
        url: "../OUTLOOK/outlook.html",
        totalModulos: 5
    },
    publisher: {
        nombre: "Publisher",
        icono: "📰",
        url: "../ACCES/acces.html",
        totalModulos: 5
    },
    gmail: {
        nombre: "Gmail",
        icono: "✉️",
        url: "../CURSOS2/GMAIL/index.html",
        totalModulos: 5
    },
    canva: {
        nombre: "Canva",
        icono: "🎨",
        url: "../CURSOS2/CANVA/index.html",
        totalModulos: 5
    },
    chatgpt: {
        nombre: "ChatGPT",
        icono: "🤖",
        url: "../CURSOS2/CHATGPT/index.html",
        totalModulos: 5
    },
    googlemeet: {
        nombre: "Google Meet",
        icono: "📹",
        url: "../CURSOS2/GOOGLEMEET/index.html",
        totalModulos: 5
    },
    drive: {
        nombre: "Google Drive",
        icono: "☁️",
        url: "../CURSOS2/DRIVE/index.html",
        totalModulos: 5
    }
};

// ============================================
// BADGES/LOGROS DISPONIBLES
// ============================================
const BADGES_DISPONIBLES = {
    primer_curso: {
        nombre: "Primer Paso",
        descripcion: "Completaste tu primer curso",
        icono: "🎯",
        condicion: (stats) => stats.totalCoursesCompleted >= 1
    },
    cinco_modulos: {
        nombre: "Aprendiz Dedicado",
        descripcion: "Completaste 5 módulos",
        icono: "📚",
        condicion: (stats) => stats.totalModulesCompleted >= 5
    },
    diez_modulos: {
        nombre: "Estudioso",
        descripcion: "Completaste 10 módulos",
        icono: "📖",
        condicion: (stats) => stats.totalModulesCompleted >= 10
    },
    tres_cursos: {
        nombre: "Experto en Formación",
        descripcion: "Completaste 3 cursos",
        icono: "🏆",
        condicion: (stats) => stats.totalCoursesCompleted >= 3
    },
    cinco_cursos: {
        nombre: "Maestro Digital",
        descripcion: "Completaste 5 cursos",
        icono: "👑",
        condicion: (stats) => stats.totalCoursesCompleted >= 5
    },
    todos_cursos: {
        nombre: "Perfeccionista",
        descripcion: "Completaste todos los cursos",
        icono: "⭐",
        condicion: (stats) => stats.totalCoursesCompleted >= 10
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let userData = null;
let userProgress = null;
let userStats = null;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Ocultar spinner y mostrar contenido
function hideLoadingShowContent() {
    const spinner = document.getElementById("loading-overlay");
    const content = document.getElementById("mainContent");
    
    if (spinner) {
        spinner.style.display = 'none';
    }
    
    if (content) {
        content.classList.remove('content-hidden');
        content.classList.add('content-visible');
    }
}

// Formatear fecha
function formatDate(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Calcular porcentaje de progreso
function calcularPorcentaje(modulosCompletados, totalModulos) {
    if (totalModulos === 0) return 0;
    return Math.round((modulosCompletados / totalModulos) * 100);
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================
async function cargarDatosUsuario(userId) {
    try {
        console.log("📥 Cargando datos del usuario...");
        
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            userData = userDocSnap.data();
            userProgress = userData.progress || {};
            userStats = userData.stats || {
                totalModulesCompleted: 0,
                totalCoursesStarted: 0,
                totalCoursesCompleted: 0
            };
            
            console.log("✅ Datos cargados:", userData);
            return true;
        } else {
            console.error("❌ No se encontró el documento del usuario");
            return false;
        }
    } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        return false;
    }
}

// ============================================
// RENDERIZAR INFORMACIÓN DEL PERFIL
// ============================================
function renderizarPerfil(user) {
    // Avatar
    const avatarElement = document.getElementById('user-avatar');
    if (avatarElement && userData.name) {
        const initials = userData.name.split(' ').map(n => n[0]).join('');
        avatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=8a2be2&color=fff&size=150&bold=true`;
    }
    
    // Nombre
    const nameElement = document.getElementById('user-name');
    if (nameElement) {
        nameElement.textContent = userData.name || user.email;
    }
    
    // Email
    const emailElement = document.getElementById('user-email');
    if (emailElement) {
        emailElement.innerHTML = `<i class="fas fa-envelope"></i> ${user.email}`;
    }
    
    // Ficha
    const fichaElement = document.getElementById('user-ficha');
    if (fichaElement) {
        fichaElement.innerHTML = `<i class="fas fa-id-card"></i> Ficha: <span>${userData.ficha || 'No especificada'}</span>`;
    }
    
    // Formación
    const formacionElement = document.getElementById('user-formacion');
    if (formacionElement) {
        formacionElement.innerHTML = `<i class="fas fa-graduation-cap"></i> <span>${userData.formacion || 'No especificada'}</span>`;
    }
    
    // Fecha de registro
    const joinedElement = document.getElementById('user-joined');
    if (joinedElement) {
        joinedElement.innerHTML = `<i class="fas fa-calendar"></i> Miembro desde: <span>${formatDate(userData.createdAt)}</span>`;
    }
}

// ============================================
// RENDERIZAR ESTADÍSTICAS
// ============================================
function renderizarEstadisticas() {
    // Cursos iniciados
    const cursosIniciados = Object.keys(userProgress).length;
    document.getElementById('stat-courses-started').textContent = cursosIniciados;
    
    // Cursos completados
    const cursosCompletados = Object.values(userProgress).filter(curso => curso.percentage === 100).length;
    document.getElementById('stat-courses-completed').textContent = cursosCompletados;
    
    // Módulos completados
    const modulosCompletados = userStats.totalModulesCompleted || 0;
    document.getElementById('stat-modules-completed').textContent = modulosCompletados;
    
    // Badges desbloqueados
    const badgesDesbloqueados = calcularBadgesDesbloqueados();
    document.getElementById('stat-badges').textContent = badgesDesbloqueados.length;
}

// ============================================
// RENDERIZAR PROGRESO GENERAL
// ============================================
function renderizarProgresoGeneral() {
    const totalModulosDisponibles = Object.values(CURSOS_DISPONIBLES).reduce((sum, curso) => sum + curso.totalModulos, 0);
    const modulosCompletados = userStats.totalModulesCompleted || 0;
    const porcentaje = calcularPorcentaje(modulosCompletados, totalModulosDisponibles);
    
    // Actualizar barra de progreso con animación
    setTimeout(() => {
        const progressBar = document.getElementById('overall-progress-bar');
        const progressText = document.getElementById('overall-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${porcentaje}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${porcentaje}%`;
        }
    }, 100);
    
    // Actualizar textos
    document.getElementById('total-modules').textContent = modulosCompletados;
    document.getElementById('total-available').textContent = totalModulosDisponibles;
}

// ============================================
// RENDERIZAR CURSOS
// ============================================
function renderizarCursos() {
    const cursosEnProgreso = document.getElementById('courses-in-progress');
    const cursosCompletados = document.getElementById('courses-completed');
    const todosCursos = document.getElementById('all-courses');
    
    // Limpiar contenedores
    cursosEnProgreso.innerHTML = '';
    cursosCompletados.innerHTML = '';
    todosCursos.innerHTML = '';
    
    let hayEnProgreso = false;
    let hayCompletados = false;
    
    // Iterar sobre todos los cursos disponibles
    Object.entries(CURSOS_DISPONIBLES).forEach(([cursoId, cursoInfo]) => {
        const progresoCurso = userProgress[cursoId];
        const card = crearCardCurso(cursoId, cursoInfo, progresoCurso);
        
        // Agregar a "Todos los cursos"
        todosCursos.appendChild(card.cloneNode(true));
        
        if (progresoCurso) {
            if (progresoCurso.percentage === 100) {
                // Curso completado
                cursosCompletados.appendChild(card.cloneNode(true));
                hayCompletados = true;
            } else {
                // Curso en progreso
                cursosEnProgreso.appendChild(card.cloneNode(true));
                hayEnProgreso = true;
            }
        }
    });
    
    // Mostrar mensaje si no hay cursos en progreso
    if (!hayEnProgreso) {
        cursosEnProgreso.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No has iniciado ningún curso aún</p>
                <a href="../index.html" class="btn-primary">Explorar Cursos</a>
            </div>
        `;
    }
    
    // Mostrar mensaje si no hay cursos completados
    if (!hayCompletados) {
        cursosCompletados.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-medal"></i>
                <p>Aún no has completado ningún curso</p>
                <p class="small-text">¡Sigue aprendiendo!</p>
            </div>
        `;
    }
}

// Crear card de curso
function crearCardCurso(cursoId, cursoInfo, progreso) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const modulosCompletados = progreso ? progreso.modulesCompleted.length : 0;
    const porcentaje = progreso ? progreso.percentage : 0;
    const estaCompletado = porcentaje === 100;
    
    card.innerHTML = `
        ${estaCompletado ? '<div class="completed-badge"><i class="fas fa-check"></i> Completado</div>' : ''}
        <div class="course-header">
            <div class="course-icon">
                ${cursoInfo.icono}
            </div>
            <div class="course-title">
                <h3>${cursoInfo.nombre}</h3>
                <p>${modulosCompletados}/${cursoInfo.totalModulos} módulos</p>
            </div>
        </div>
        <div class="course-progress">
            <div class="mini-progress-bar">
                <div class="mini-progress-fill" style="width: ${porcentaje}%"></div>
            </div>
            <p>${porcentaje}% completado</p>
        </div>
        <div class="course-actions">
            ${estaCompletado 
                ? `<a href="${cursoInfo.url}" class="btn-view"><i class="fas fa-eye"></i> Ver curso</a>`
                : progreso
                    ? `<a href="${cursoInfo.url}" class="btn-continue"><i class="fas fa-play"></i> Continuar</a>`
                    : `<a href="${cursoInfo.url}" class="btn-continue"><i class="fas fa-rocket"></i> Comenzar</a>`
            }
        </div>
    `;
    
    return card;
}

// ============================================
// CALCULAR Y RENDERIZAR BADGES
// ============================================
function calcularBadgesDesbloqueados() {
    const badgesDesbloqueados = [];
    
    Object.entries(BADGES_DISPONIBLES).forEach(([badgeId, badgeInfo]) => {
        if (badgeInfo.condicion(userStats)) {
            badgesDesbloqueados.push(badgeId);
        }
    });
    
    return badgesDesbloqueados;
}

function renderizarBadges() {
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = '';
    
    const badgesDesbloqueados = calcularBadgesDesbloqueados();
    
    if (badgesDesbloqueados.length === 0) {
        badgesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-award"></i>
                <p>Completa cursos y módulos para desbloquear logros</p>
            </div>
        `;
        return;
    }
    
    Object.entries(BADGES_DISPONIBLES).forEach(([badgeId, badgeInfo]) => {
        const estaDesbloqueado = badgesDesbloqueados.includes(badgeId);
        
        const badgeItem = document.createElement('div');
        badgeItem.className = `badge-item ${estaDesbloqueado ? '' : 'badge-locked'}`;
        badgeItem.innerHTML = `
            <div class="badge-icon">${badgeInfo.icono}</div>
            <h4>${badgeInfo.nombre}</h4>
            <p>${badgeInfo.descripcion}</p>
        `;
        
        badgesContainer.appendChild(badgeItem);
    });
}

// ============================================
// RENDERIZAR ACTIVIDAD RECIENTE
// ============================================
function renderizarActividad() {
    const activityTimeline = document.getElementById('activity-timeline');
    
    // Por ahora mostrar mensaje vacío
    // En el futuro aquí se mostrará actividad real del usuario
    activityTimeline.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clock"></i>
            <p>No hay actividad reciente</p>
        </div>
    `;
}

// ============================================
// SISTEMA DE TABS
// ============================================
function inicializarTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            
            // Mostrar contenido correspondiente
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ============================================
// CERRAR SESIÓN
// ============================================
function configurarCerrarSesion() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                console.log("✅ Sesión cerrada");
                window.location.href = '../USERS/AUTH/login.html';
            } catch (error) {
                console.error("❌ Error al cerrar sesión:", error);
                alert("Error al cerrar sesión");
            }
        });
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Inicializando dashboard...");
    
    // Verificar autenticación
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ Usuario autenticado:", user.email);
            
            // Cargar datos del usuario
            const datosExitosos = await cargarDatosUsuario(user.uid);
            
            if (datosExitosos) {
                // Renderizar todo el dashboard
                renderizarPerfil(user);
                renderizarEstadisticas();
                renderizarProgresoGeneral();
                renderizarCursos();
                renderizarBadges();
                renderizarActividad();
                
                // Inicializar tabs
                inicializarTabs();
                
                // Configurar cerrar sesión
                configurarCerrarSesion();
                
                // Ocultar spinner
                hideLoadingShowContent();
            } else {
                console.error("❌ No se pudieron cargar los datos");
                alert("Error al cargar tu perfil. Por favor intenta de nuevo.");
                window.location.href = '../index.html';
            }
            
        } else {
            console.log("❌ No hay usuario autenticado");
            // Redirigir al login
            window.location.href = '../USERS/AUTH/login.html';
        }
    });
});

// Ocultar spinner también en window.load por seguridad
window.addEventListener('load', () => {
    setTimeout(hideLoadingShowContent, 1000);
});