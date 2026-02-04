// ============================================
// SISTEMA DE PROGRESO - PARA MÓDULOS
// ============================================
// Este archivo contiene las funciones necesarias para guardar
// el progreso del usuario cuando completa módulos

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
// MARCAR MÓDULO COMO COMPLETADO
// ============================================
/**
 * Marca un módulo como completado en Firestore
 * @param {string} cursoId - ID del curso (ej: "word", "excel")
 * @param {string} moduloId - ID del módulo (ej: "modulo1", "modulo2")
 * @param {number} totalModulos - Total de módulos del curso
 */
export async function marcarModuloCompletado(cursoId, moduloId, totalModulos = 5) {
    const user = auth.currentUser;
    
    if (!user) {
        console.error("❌ No hay usuario autenticado");
        return false;
    }
    
    try {
        console.log(`📝 Marcando ${moduloId} de ${cursoId} como completado...`);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            console.error("❌ Documento de usuario no existe");
            return false;
        }
        
        const userData = userDoc.data();
        const progress = userData.progress || {};
        const cursoProgress = progress[cursoId] || {
            startedAt: serverTimestamp(),
            completedAt: null,
            modulesCompleted: [],
            percentage: 0,
            lastAccessed: serverTimestamp()
        };
        
        // Agregar módulo si no está completado
        if (!cursoProgress.modulesCompleted.includes(moduloId)) {
            cursoProgress.modulesCompleted.push(moduloId);
        }
        
        // Calcular porcentaje
        const modulosCompletados = cursoProgress.modulesCompleted.length;
        cursoProgress.percentage = Math.round((modulosCompletados / totalModulos) * 100);
        
        // Verificar si el curso está completado
        if (cursoProgress.percentage === 100) {
            cursoProgress.completedAt = serverTimestamp();
        }
        
        // Actualizar timestamp de último acceso
        cursoProgress.lastAccessed = serverTimestamp();
        
        // Actualizar progreso del curso
        progress[cursoId] = cursoProgress;
        
        // Calcular estadísticas globales
        const stats = calcularEstadisticas(progress);
        
        // Guardar en Firestore
        await updateDoc(userDocRef, {
            progress: progress,
            stats: stats
        });
        
        console.log("✅ Progreso guardado exitosamente");
        
        // Mostrar notificación
        mostrarNotificacion(`¡${moduloId} completado!`, cursoProgress.percentage);
        
        return true;
        
    } catch (error) {
        console.error("❌ Error al guardar progreso:", error);
        return false;
    }
}

// ============================================
// CALCULAR ESTADÍSTICAS GLOBALES
// ============================================
function calcularEstadisticas(progress) {
    let totalModulesCompleted = 0;
    let totalCoursesStarted = 0;
    let totalCoursesCompleted = 0;
    
    Object.values(progress).forEach(curso => {
        totalCoursesStarted++;
        totalModulesCompleted += curso.modulesCompleted.length;
        
        if (curso.percentage === 100) {
            totalCoursesCompleted++;
        }
    });
    
    return {
        totalModulesCompleted,
        totalCoursesStarted,
        totalCoursesCompleted
    };
}

// ============================================
// VERIFICAR SI MÓDULO ESTÁ COMPLETADO
// ============================================
/**
 * Verifica si un módulo ya fue completado
 * @param {string} cursoId - ID del curso
 * @param {string} moduloId - ID del módulo
 * @returns {Promise<boolean>}
 */
export async function verificarModuloCompletado(cursoId, moduloId) {
    const user = auth.currentUser;
    
    if (!user) return false;
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) return false;
        
        const userData = userDoc.data();
        const progress = userData.progress || {};
        const cursoProgress = progress[cursoId];
        
        if (!cursoProgress) return false;
        
        return cursoProgress.modulesCompleted.includes(moduloId);
        
    } catch (error) {
        console.error("Error al verificar módulo:", error);
        return false;
    }
}

// ============================================
// OBTENER PROGRESO DEL CURSO
// ============================================
/**
 * Obtiene el progreso completo de un curso
 * @param {string} cursoId - ID del curso
 * @returns {Promise<object|null>}
 */
export async function obtenerProgresoCurso(cursoId) {
    const user = auth.currentUser;
    
    if (!user) return null;
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) return null;
        
        const userData = userDoc.data();
        const progress = userData.progress || {};
        
        return progress[cursoId] || null;
        
    } catch (error) {
        console.error("Error al obtener progreso:", error);
        return null;
    }
}

// ============================================
// MOSTRAR NOTIFICACIÓN
// ============================================
function mostrarNotificacion(mensaje, porcentaje) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'progress-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">✅</div>
            <div class="notification-text">
                <strong>${mensaje}</strong>
                <p>Progreso: ${porcentaje}%</p>
            </div>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .progress-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%);
                border: 2px solid #8a2be2;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(138, 43, 226, 0.5);
                z-index: 10000;
                animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s;
                min-width: 300px;
            }
            
            .notification-content {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .notification-icon {
                font-size: 40px;
            }
            
            .notification-text strong {
                color: #ffffff;
                font-size: 16px;
                display: block;
                margin-bottom: 5px;
            }
            
            .notification-text p {
                color: #a050ee;
                font-size: 14px;
                margin: 0;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// CREAR BOTÓN DE COMPLETAR MÓDULO
// ============================================
/**
 * Crea un botón para marcar módulo como completado
 * @param {string} cursoId - ID del curso
 * @param {string} moduloId - ID del módulo
 * @param {number} totalModulos - Total de módulos
 * @returns {HTMLElement}
 */
export function crearBotonCompletarModulo(cursoId, moduloId, totalModulos = 5) {
    const button = document.createElement('button');
    button.className = 'btn-completar-modulo';
    button.innerHTML = '<i class="fas fa-check"></i> Marcar como completado';
    
    // Verificar si ya está completado
    verificarModuloCompletado(cursoId, moduloId).then(estaCompletado => {
        if (estaCompletado) {
            button.innerHTML = '<i class="fas fa-check-double"></i> ¡Completado!';
            button.classList.add('completado');
            button.disabled = true;
        }
    });
    
    // Evento click
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        const exito = await marcarModuloCompletado(cursoId, moduloId, totalModulos);
        
        if (exito) {
            button.innerHTML = '<i class="fas fa-check-double"></i> ¡Completado!';
            button.classList.add('completado');
        } else {
            button.innerHTML = '<i class="fas fa-times"></i> Error';
            button.disabled = false;
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-check"></i> Marcar como completado';
            }, 2000);
        }
    });
    
    // Agregar estilos del botón
    if (!document.getElementById('btn-completar-styles')) {
        const style = document.createElement('style');
        style.id = 'btn-completar-styles';
        style.textContent = `
            .btn-completar-modulo {
                padding: 15px 30px;
                background: linear-gradient(135deg, #8a2be2 0%, #a050ee 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }
            
            .btn-completar-modulo:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(138, 43, 226, 0.4);
            }
            
            .btn-completar-modulo:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .btn-completar-modulo.completado {
                background: linear-gradient(135deg, #1fa233 0%, #0b7e15 100%);
            }
        `;
        document.head.appendChild(style);
    }
    
    return button;
}