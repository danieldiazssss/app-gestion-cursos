import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Configuración de Firebase
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

// Elementos del DOM
const usersTableBody = document.getElementById('users-table-body');
const adminNameElement = document.getElementById('adminName');
const userModalElement = document.getElementById('userModal');
const saveUserBtn = document.getElementById('saveUserBtn');
const botnSalir = document.getElementById('botnx');

let userModal;
let usersData = [];
let charts = {};
let currentAdminId = null;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'success' ? 'success' : 'danger'}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${icon} me-2 fs-5"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Agregar estilo CSS para la animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .custom-notification {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// ============================================
// INICIALIZACIÓN Y AUTENTICACIÓN
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("=== DASHBOARD ADMIN INICIADO ===");
    
    // Inicializar modal de Bootstrap
    if (userModalElement && window.bootstrap) {
        userModal = new bootstrap.Modal(userModalElement);
        console.log("✅ Modal de Bootstrap inicializado");
    }

    // Verificación de autenticación y permisos de admin
    onAuthStateChanged(auth, async (user) => {
        console.log("Estado de autenticación:", user ? "Usuario conectado" : "No autenticado");
        
        if (!user) {
            console.error("❌ No hay usuario autenticado. Redirigiendo...");
            showNotification("Debes iniciar sesión para acceder al dashboard.", 'error');
            setTimeout(() => {
                window.location.href = '../../USERS/AUTH/login.html';
            }, 1500);
            return;
        }

        console.log("Usuario UID:", user.uid);
        console.log("Email:", user.email);

        try {
            // Verificar si es admin
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (!adminDocSnap.exists()) {
                console.error("❌ Usuario no es administrador");
                showNotification("Acceso denegado. No tienes permisos de administrador.", 'error');
                await signOut(auth);
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1500);
                return;
            }

            console.log("✅ Usuario ES administrador");
            currentAdminId = user.uid;
            const adminData = adminDocSnap.data();
            
            // Mostrar nombre del admin
            if (adminNameElement) {
                adminNameElement.textContent = `Bienvenido, ${adminData.name || user.email}`;
            }

            // Cargar usuarios
            loadUsers();

        } catch (error) {
            console.error("❌ Error verificando permisos:", error);
            showNotification("Error al verificar permisos. Contacta al soporte.", 'error');
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);
        }
    });

    // ============================================
    // FUNCIÓN PARA CARGAR USUARIOS
    // ============================================

    const loadUsers = () => {
        console.log("📥 Cargando usuarios desde Firestore...");
        
        const usersCollectionRef = collection(db, "users");
        
        onSnapshot(usersCollectionRef, (querySnapshot) => {
            console.log(`📊 Total de usuarios encontrados: ${querySnapshot.size}`);
            
            usersData = [];
            
            if (querySnapshot.empty) {
                usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">
                            <p class="text-muted">No hay usuarios registrados aún.</p>
                        </td>
                    </tr>
                `;
                actualizarEstadisticas();
                return;
            }

            usersTableBody.innerHTML = '';
            let counter = 1;
            
            querySnapshot.forEach((docSnap) => {
                const user = docSnap.data();
                const userId = docSnap.id;

                const name = user.name || 'N/A';
                const email = user.email || 'N/A';
                const ficha = user.ficha || 'No especificado';
                const formacion = user.formacion || 'No especificado';
                
                let createdAt = 'N/A';
                if (user.createdAt) {
                    try {
                        const fecha = user.createdAt.toDate();
                        createdAt = fecha.toLocaleDateString('es-ES');
                    } catch (error) {
                        createdAt = 'Fecha inválida';
                    }
                }
                
                const progressCount = user.progress ? user.progress.length : 0;
                const progressPercentage = ((progressCount / 8) * 100).toFixed(1);

                usersData.push({
                    id: userId,
                    numero: counter,
                    nombre: name,
                    email: email,
                    ficha: ficha,
                    formacion: formacion,
                    fechaRegistro: createdAt,
                    progreso: `${progressCount}/8`,
                    porcentaje: `${progressPercentage}%`,
                    progresoNum: progressCount
                });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${counter}</td>
                    <td>${name}</td>
                    <td>${email}</td>
                    <td>${ficha}</td>
                    <td>${formacion}</td>
                    <td>${createdAt}</td>
                    <td>
                        <div class="progress" style="height: 25px;">
                            <div class="progress-bar bg-success" role="progressbar" 
                                 style="width: ${progressPercentage}%"
                                 aria-valuenow="${progressCount}" aria-valuemin="0" aria-valuemax="8">
                                ${progressCount} / 8
                            </div>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-warning btn-sm me-1 edit-btn" data-id="${userId}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${userId}" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                usersTableBody.appendChild(tr);
                counter++;
            });

            console.log("✅ Usuarios cargados en la tabla");
            actualizarEstadisticas();
            crearGraficos();
            
        }, (error) => {
            console.error("❌ Error al cargar usuarios:", error);
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        <p>Error al cargar usuarios: ${error.message}</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                    </td>
                </tr>
            `;
        });
    };

    // ============================================
    // EVENT DELEGATION PARA EDITAR/ELIMINAR
    // ============================================

    // Usar event delegation en el documento completo
    document.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.edit-btn, .delete-btn');
        if (!targetBtn) return;
        
        const userId = targetBtn.dataset.id;
        
        // Verificar que el usuario actual sea admin
        if (!currentAdminId) {
            showNotification("No tienes permisos para realizar esta acción.", 'error');
            return;
        }

        if (targetBtn.classList.contains('edit-btn')) {
            console.log("✏️ Editando usuario:", userId);
            
            try {
                const userDocRef = doc(db, "users", userId);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const user = userDocSnap.data();
                    
                    document.getElementById('userId').value = userId;
                    document.getElementById('userName').value = user.name || '';
                    document.getElementById('userEmail').value = user.email || '';
                    document.getElementById('userFicha').value = user.ficha || '';
                    document.getElementById('userFormacion').value = user.formacion || '';
                    document.getElementById('userPassword').value = '';

                    const progressContainer = document.getElementById('progressContainer');
                    if (progressContainer) {
                        const progressCount = user.progress ? user.progress.length : 0;
                        const progressPercentage = ((progressCount / 8) * 100).toFixed(1);
                        progressContainer.innerHTML = `
                            <div class="progress" style="height: 25px;">
                                <div class="progress-bar bg-success" role="progressbar" 
                                     style="width: ${progressPercentage}%"
                                     aria-valuenow="${progressCount}" aria-valuemin="0" aria-valuemax="8">
                                    ${progressCount} / 8 módulos (${progressPercentage}%)
                                </div>
                            </div>
                            <small class="text-muted mt-1 d-block">El progreso se actualiza automáticamente</small>
                        `;
                    }

                    if (userModal) {
                        userModal.show();
                    }
                } else {
                    showNotification("Usuario no encontrado.", 'error');
                }
            } catch (error) {
                console.error("Error al cargar datos del usuario:", error);
                showNotification("Error al cargar datos del usuario: " + error.message, 'error');
            }
            
        } else if (targetBtn.classList.contains('delete-btn')) {
            console.log("🗑️ Eliminando usuario:", userId);
            
            // Encontrar el usuario en los datos
            const userToDelete = usersData.find(u => u.id === userId);
            const userName = userToDelete ? userToDelete.nombre : 'este usuario';
            const userEmail = userToDelete ? userToDelete.email : 'N/A';
            
            const confirmMessage = `¿Estás seguro de eliminar a ${userName}?\n\n📧 Email: ${userEmail}\n\n⚠️ Esta acción NO se puede deshacer.`;
            
            if (confirm(confirmMessage)) {
                try {
                    // Guardar estado original
                    const originalHTML = targetBtn.innerHTML;
                    const originalTitle = targetBtn.title;
                    
                    // Mostrar indicador de carga
                    targetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    targetBtn.title = "Eliminando...";
                    targetBtn.disabled = true;
                    targetBtn.classList.add('disabled');
                    
                    const userDocRef = doc(db, "users", userId);
                    await deleteDoc(userDocRef);
                    
                    console.log("✅ Usuario eliminado");
                    showNotification(`Usuario "${userName}" eliminado correctamente.`, 'success');
                    
                    // No restaurar el botón - se eliminará cuando se recargue la tabla
                    
                } catch (error) {
                    console.error("❌ Error al eliminar usuario:", error);
                    
                    let errorMsg = "Error al eliminar usuario: ";
                    if (error.code === 'permission-denied') {
                        errorMsg += "No tienes permisos para eliminar usuarios.";
                    } else if (error.code === 'not-found') {
                        errorMsg += "El usuario ya no existe.";
                    } else {
                        errorMsg += error.message;
                    }
                    
                    showNotification(errorMsg, 'error');
                    
                    // Restaurar botón
                    if (targetBtn.parentElement) {
                        targetBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                        targetBtn.title = originalTitle;
                        targetBtn.disabled = false;
                        targetBtn.classList.remove('disabled');
                    }
                }
            }
        }
    });

    // ============================================
    // GUARDAR CAMBIOS DEL USUARIO
    // ============================================

    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', async () => {
            const userId = document.getElementById('userId').value;
            
            if (!userId) {
                showNotification("Error: No se encontró el ID del usuario.", 'error');
                return;
            }

            const userDocRef = doc(db, "users", userId);
            const newName = document.getElementById('userName').value.trim();
            const newEmail = document.getElementById('userEmail').value.trim();
            const newFicha = document.getElementById('userFicha').value.trim();
            const newFormacion = document.getElementById('userFormacion').value.trim();
            const newPassword = document.getElementById('userPassword').value.trim();

            // Validaciones
            if (!newName || !newEmail) {
                showNotification("Nombre y email son obligatorios.", 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                showNotification("Por favor, ingresa un email válido.", 'error');
                return;
            }

            console.log("💾 Guardando cambios para usuario:", userId);

            try {
                // Mostrar indicador de carga
                saveUserBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                saveUserBtn.disabled = true;

                const updateData = {
                    name: newName,
                    email: newEmail,
                    ficha: newFicha || "No especificado",
                    formacion: newFormacion || "No especificado",
                    updatedAt: new Date()
                };

                // Solo actualizar contraseña si se proporcionó
                if (newPassword) {
                    updateData.password = newPassword;
                }

                await updateDoc(userDocRef, updateData);
                
                console.log("✅ Usuario actualizado correctamente");
                showNotification("Usuario actualizado correctamente.", 'success');
                
                if (userModal) {
                    userModal.hide();
                }
                
                saveUserBtn.innerHTML = 'Guardar';
                saveUserBtn.disabled = false;
                document.getElementById('userPassword').value = '';
                
            } catch (error) {
                console.error("❌ Error al actualizar usuario:", error);
                
                let mensajeError = "Error al actualizar usuario.";
                if (error.code === 'permission-denied') {
                    mensajeError += " No tienes permisos para editar usuarios.";
                } else if (error.code === 'not-found') {
                    mensajeError += " El usuario no existe.";
                } else {
                    mensajeError += ` ${error.message}`;
                }
                
                showNotification(mensajeError, 'error');
                saveUserBtn.innerHTML = 'Guardar';
                saveUserBtn.disabled = false;
            }
        });
    }

    // ============================================
    // CERRAR SESIÓN - VERSIÓN CORREGIDA
    // ============================================

    if (botnSalir) {
        botnSalir.addEventListener('click', async () => {
            console.log("🚪 Intentando cerrar sesión...");
            
            // Verificar si hay un usuario autenticado
            const currentUser = auth.currentUser;
            if (!currentUser) {
                showNotification("No hay sesión activa.", 'info');
                window.location.href = '../../index.html';
                return;
            }
            
            if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                try {
                    // Guardar estado original
                    const originalHTML = botnSalir.innerHTML;
                    const originalText = botnSalir.textContent;
                    
                    // Mostrar indicador de carga
                    botnSalir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando...';
                    botnSalir.disabled = true;
                    botnSalir.classList.add('disabled');
                    
                    console.log("🔐 Cerrando sesión para usuario:", currentUser.uid);
                    
                    // Intentar cerrar sesión
                    await signOut(auth);
                    
                    console.log("✅ Sesión cerrada exitosamente");
                    showNotification("Sesión cerrada correctamente. Redirigiendo...", 'success');
                    
                    // Redirigir después de un breve momento
                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1000);
                    
                } catch (error) {
                    console.error("❌ Error al cerrar sesión:", error);
                    console.error("Código de error:", error.code);
                    console.error("Mensaje:", error.message);
                    
                    let errorMsg = "Error al cerrar sesión: ";
                    
                    switch(error.code) {
                        case 'auth/network-request-failed':
                            errorMsg += "Problema de conexión a internet.";
                            break;
                        case 'auth/too-many-requests':
                            errorMsg += "Demasiados intentos. Intenta más tarde.";
                            break;
                        default:
                            errorMsg += error.message;
                    }
                    
                    showNotification(errorMsg, 'error');
                    
                    // Restaurar botón
                    botnSalir.innerHTML = '<i class="fas fa-sign-out-alt"></i> Salir';
                    botnSalir.disabled = false;
                    botnSalir.classList.remove('disabled');
                    
                    // Forzar redirección si el error persiste
                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 3000);
                }
            }
        });
    }

    console.log("=== DASHBOARD ADMIN CONFIGURADO ===");
});

// ============================================
// FUNCIONES PARA ESTADÍSTICAS Y GRÁFICOS
// ============================================

/**
 * Actualizar estadísticas en las tarjetas KPI
 */
function actualizarEstadisticas() {
    if (usersData.length === 0) {
        document.getElementById('totalStudents').textContent = '0';
        document.getElementById('completedCourses').textContent = '0';
        document.getElementById('avgProgress').textContent = '0%';
        document.getElementById('todayRegistrations').textContent = '0';
        return;
    }

    const total = usersData.length;
    const completados = usersData.filter(user => user.progresoNum === 8).length;
    const sumaProgreso = usersData.reduce((sum, user) => sum + user.progresoNum, 0);
    const promedioProgreso = total > 0 ? ((sumaProgreso / total / 8) * 100).toFixed(1) : 0;
    
    const hoy = new Date();
    const hoyFormatted = hoy.toLocaleDateString('es-ES');
    const registrosHoy = usersData.filter(user => 
        user.fechaRegistro && user.fechaRegistro !== 'N/A' && 
        user.fechaRegistro === hoyFormatted
    ).length;
    
    document.getElementById('totalStudents').textContent = total;
    document.getElementById('completedCourses').textContent = completados;
    document.getElementById('avgProgress').textContent = promedioProgreso + '%';
    document.getElementById('todayRegistrations').textContent = registrosHoy;
}

/**
 * Crear todos los gráficos
 */
function crearGraficos() {
    if (usersData.length === 0) {
        console.log("⚠️ No hay datos para crear gráficos");
        
        const canvasIds = ['progressChart', 'formacionChart', 'registrosChart'];
        canvasIds.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No hay datos disponibles', canvas.width/2, canvas.height/2);
            }
        });
        
        return;
    }
    
    crearGraficoProgreso();
    crearGraficoFormaciones();
    crearGraficoRegistros();
}

/**
 * Gráfico de Distribución de Progreso (Barras)
 */
function crearGraficoProgreso() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const rangos = {
        '0-25%': 0,
        '26-50%': 0,
        '51-75%': 0,
        '76-100%': 0
    };
    
    usersData.forEach(user => {
        const porcentaje = (user.progresoNum / 8) * 100;
        if (porcentaje <= 25) rangos['0-25%']++;
        else if (porcentaje <= 50) rangos['26-50%']++;
        else if (porcentaje <= 75) rangos['51-75%']++;
        else rangos['76-100%']++;
    });
    
    if (charts.progressChart) {
        charts.progressChart.destroy();
    }
    
    charts.progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(rangos),
            datasets: [{
                label: 'Estudiantes',
                data: Object.values(rangos),
                backgroundColor: [
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(49, 125, 211, 0.7)',
                    'rgba(40, 167, 69, 0.7)'
                ],
                borderColor: [
                    'rgb(220, 53, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(49, 125, 211)',
                    'rgb(40, 167, 69)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#d903ff',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = usersData.length;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${value} estudiantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff'
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

/**
 * Gráfico de Estudiantes por Formación (Dona)
 */
function crearGraficoFormaciones() {
    const ctx = document.getElementById('formacionChart');
    if (!ctx) return;
    
    const formaciones = {};
    usersData.forEach(user => {
        const formacion = user.formacion || 'No especificado';
        formaciones[formacion] = (formaciones[formacion] || 0) + 1;
    });
    
    const formacionesOrdenadas = Object.entries(formaciones)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    if (charts.formacionChart) {
        charts.formacionChart.destroy();
    }
    
    const colores = [
        'rgba(138, 43, 226, 0.8)',
        'rgba(49, 125, 211, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(23, 162, 184, 0.8)',
        'rgba(255, 152, 0, 0.8)'
    ];
    
    charts.formacionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(formacionesOrdenadas),
            datasets: [{
                data: Object.values(formacionesOrdenadas),
                backgroundColor: colores.slice(0, Object.keys(formacionesOrdenadas).length),
                borderWidth: 3,
                borderColor: 'rgba(0, 0, 0, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ffffff',
                        padding: 15,
                        font: { size: 11 },
                        boxWidth: 15,
                        boxHeight: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#d903ff',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = usersData.length;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Gráfico de Registros por Mes (Línea)
 */
function crearGraficoRegistros() {
    const ctx = document.getElementById('registrosChart');
    if (!ctx) return;
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const registrosPorMes = new Array(12).fill(0);
    const añoActual = new Date().getFullYear();
    
    usersData.forEach(user => {
        if (!user.fechaRegistro || user.fechaRegistro === 'N/A') return;
        
        try {
            const [dia, mes, año] = user.fechaRegistro.split('/');
            const añoUsuario = parseInt(año);
            const mesIndex = parseInt(mes) - 1;
            
            if (añoUsuario === añoActual && mesIndex >= 0 && mesIndex < 12) {
                registrosPorMes[mesIndex]++;
            }
        } catch (error) {
            console.warn("Error al procesar fecha:", user.fechaRegistro);
        }
    });
    
    if (charts.registrosChart) {
        charts.registrosChart.destroy();
    }
    
    charts.registrosChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Nuevos Registros',
                data: registrosPorMes,
                borderColor: 'rgb(217, 3, 255)',
                backgroundColor: 'rgba(217, 3, 255, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: 'rgb(217, 3, 255)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgb(49, 125, 211)',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#d903ff',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            return `Mes: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Registros: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff'
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: {
                        display: true,
                        text: 'Número de Estudiantes',
                        color: '#ffffff'
                    }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: {
                        display: true,
                        text: 'Meses del Año',
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// ============================================
// FUNCIONES DE EXPORTACIÓN
// ============================================

/**
 * Exportar a Excel usando SheetJS (xlsx)
 */
window.exportarRecetasExcel = function() {
    console.log("📊 Exportando a Excel...");
    
    if (usersData.length === 0) {
        showNotification("No hay datos para exportar", 'error');
        return;
    }

    try {
        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';
        event.target.disabled = true;

        const wb = XLSX.utils.book_new();
        const dataParaExcel = [
            ['#', 'Nombre', 'Email', 'Número de Ficha', 'Formación', 'Fecha Registro', 'Progreso', 'Porcentaje']
        ];
        
        usersData.forEach(user => {
            dataParaExcel.push([
                user.numero,
                user.nombre,
                user.email,
                user.ficha,
                user.formacion,
                user.fechaRegistro,
                user.progreso,
                user.porcentaje
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(dataParaExcel);
        ws['!cols'] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 30 },
            { wch: 18 },
            { wch: 25 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
        
        const fecha = new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
        
        const nombreArchivo = `Estudiantes_SlideDash_${fecha}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo);
        
        console.log("✅ Excel exportado:", nombreArchivo);
        showNotification("Archivo Excel descargado exitosamente", 'success');
        
        setTimeout(() => {
            event.target.innerHTML = originalText;
            event.target.disabled = false;
        }, 1000);
        
    } catch (error) {
        console.error("❌ Error al exportar Excel:", error);
        showNotification("Error al exportar a Excel: " + error.message, 'error');
        event.target.innerHTML = originalText;
        event.target.disabled = false;
    }
};

/**
 * Exportar a PDF usando jsPDF y jsPDF-AutoTable
 */
window.exportarRecetasPDF = function() {
    console.log("📄 Exportando a PDF...");
    
    if (usersData.length === 0) {
        showNotification("No hay datos para exportar", 'error');
        return;
    }

    try {
        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';
        event.target.disabled = true;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(20);
        doc.setTextColor(138, 43, 226);
        doc.setFont("helvetica", "bold");
        doc.text('SLIDE DASH - Estudiantes Registrados', 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        const fechaActual = new Date().toLocaleString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado: ${fechaActual}`, 14, 28);
        
        const total = usersData.length;
        const completados = usersData.filter(user => user.progresoNum === 8).length;
        const sumaProgreso = usersData.reduce((sum, user) => sum + user.progresoNum, 0);
        const promedioProgreso = total > 0 ? ((sumaProgreso / total / 8) * 100).toFixed(1) : 0;
        
        doc.setFontSize(10);
        doc.text(`Total Estudiantes: ${total} | Cursos Completados: ${completados} | Progreso Promedio: ${promedioProgreso}%`, 14, 36);
        
        const tablaDatos = usersData.map(user => [
            user.numero,
            user.nombre,
            user.email,
            user.ficha,
            user.formacion,
            user.fechaRegistro,
            user.progreso,
            user.porcentaje
        ]);
        
        doc.autoTable({
            head: [['#', 'Nombre', 'Email', 'Ficha', 'Formación', 'Fecha Registro', 'Progreso', '%']],
            body: tablaDatos,
            startY: 45,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [138, 43, 226],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 45, left: 14, right: 14 },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 35 },
                2: { cellWidth: 45 },
                3: { cellWidth: 25 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
                6: { cellWidth: 20 },
                7: { cellWidth: 15 }
            }
        });
        
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
        
        const fecha = new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
        
        const nombreArchivo = `Estudiantes_SlideDash_${fecha}.pdf`;
        doc.save(nombreArchivo);
        
        console.log("✅ PDF exportado:", nombreArchivo);
        showNotification("Archivo PDF descargado exitosamente", 'success');
        
        setTimeout(() => {
            event.target.innerHTML = originalText;
            event.target.disabled = false;
        }, 1000);
        
    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        showNotification("Error al exportar a PDF: " + error.message, 'error');
        event.target.innerHTML = originalText;
        event.target.disabled = false;
    }
};

// Función para recargar datos
window.recargarDatos = function() {
    console.log("🔄 Recargando datos manualmente...");
    location.reload();
};

// Exportar funciones para uso global
window.actualizarEstadisticas = actualizarEstadisticas;
window.crearGraficos = crearGraficos;