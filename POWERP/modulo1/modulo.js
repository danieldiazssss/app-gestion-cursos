let currentScore = 0;
let currentQuestionIndex = 0;
let currentGame = 'quiz';



// Variables para el juego Tres en Raya
let tablero = Array(9).fill(null);
let jugadorActual = 'X';
let preguntaActual = null;
let modoIA = null;
let juegoActivo = false;
let probabilidadIA = 0;

// Preguntas del quiz para el juego Tres en Raya
const preguntas = [{
    pregunta: "¿Qué atajo crea una nueva diapositiva en PowerPoint?",
    opciones: ["Ctrl + M", "Ctrl + N", "Alt + F4"],
    respuesta: "Ctrl + M"
}, {
    pregunta: "¿Qué tecla inicia la presentación desde el inicio?",
    opciones: ["F5", "F12", "Ctrl + S"],
    respuesta: "F5"
}, {
    pregunta: "¿Cómo se llama el área para colocar contenido en una diapositiva?",
    opciones: ["Marcador de posición", "Cuadro de texto", "Widget"],
    respuesta: "Marcador de posición"
}];
const quizQuestions = [{
    question: "📊 ¿Qué es PowerPoint?",
    options: [
        "Un programa de hojas de cálculo",
        "Un software de presentaciones",
        "Un editor de imágenes",
        "Un lenguaje de programación"
    ],
    correct: 1,
    explanation: "¡Correcto! PowerPoint es un software para crear presentaciones multimedia."
}, {
    question: "🧑‍💻 ¿Qué extensión tienen los archivos de PowerPoint?",
    options: [".docx", ".pptx", ".xlsx", ".ppt"],
    correct: 1,
    explanation: "¡Exacto! .pptx es la extensión moderna de PowerPoint."
}, {
    question: "🎨 ¿Qué puedes insertar en una diapositiva?",
    options: [
        "Solo texto",
        "Texto e imágenes",
        "Texto, imágenes, gráficos y multimedia",
        "Solo gráficos"
    ],
    correct: 2,
    explanation: "¡Muy bien! PowerPoint permite insertar diversos elementos multimedia."
}];

// --- Inicialización y Eventos ---
document.addEventListener('DOMContentLoaded', function() {
    loadQuizQuestion();
    setupMatchDragAndDrop();
    setupDragAndDropEvents();
});


// --- Funciones de Puntuación y Nivel ---
function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = currentScore;
    showScorePopup(points);
    updateLevel();
}

function showScorePopup(points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points} Puntos! 🎉`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1500);
}

function updateLevel() {
    const levelElement = document.getElementById('level');
    if (currentScore >= 100) {
        levelElement.textContent = 'Experto';
    } else if (currentScore >= 50) {
        levelElement.textContent = 'Intermedio';
    } else {
        levelElement.textContent = 'Principiante';
    }
}

// --- Lógica del Quiz ---
function switchGame(gameId) {
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.add('game-hidden');
    });

    document.getElementById(`${gameId}-game`).classList.remove('game-hidden');
    document.getElementById('current-game').textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.nav-btn[onclick="switchGame('${gameId}')"]`).classList.add('active');

    if (gameId === 'quiz') loadQuizQuestion();
    if (gameId === 'match') resetMatchGame();
    if (gameId === 'slide') resetSlideDesign();
    if (gameId === 'tresenraya') {
        reiniciarJuegoTresEnRaya();
        document.getElementById('modo-selector').style.display = 'block';
        document.getElementById('juego-container').style.display = 'none';
    }
}

function loadQuizQuestion() {
    const questionElement = document.getElementById('quiz-question');
    const optionsElement = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('next-question');

    nextBtn.style.display = 'none';
    optionsElement.innerHTML = '';

    if (currentQuestionIndex >= quizQuestions.length) {
        questionElement.textContent = "¡Quiz completado! 🎉";
        optionsElement.innerHTML = `<div class="celebration">Puntuación final: ${currentScore}</div>`;
        setTimeout(() => {
            currentQuestionIndex = 0;
            loadQuizQuestion();
        }, 3000);
        return;
    }

    const current = quizQuestions[currentQuestionIndex];
    questionElement.textContent = current.question;

    current.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => checkQuizAnswer(index);
        optionsElement.appendChild(optionDiv);
    });
}

function checkQuizAnswer(selectedIndex) {
    const options = document.querySelectorAll('.quiz-option');
    const current = quizQuestions[currentQuestionIndex];
    const nextBtn = document.getElementById('next-question');

    options.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        if (index === current.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });

    if (selectedIndex === current.correct) {
        updateScore(10);
        const successMsg = document.createElement('div');
        successMsg.className = 'info-message correct-info';
        successMsg.textContent = current.explanation;
        options[current.correct].appendChild(successMsg);
    } else {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'info-message incorrect-info';
        errorMsg.textContent = "Incorrecto. " + current.explanation;
        options[selectedIndex].appendChild(errorMsg);
    }

    nextBtn.style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuizQuestion();
}

// --- Lógica de Relacionar Conceptos ---
function resetMatchGame() {
    const definitions = document.querySelectorAll('.match-definition');
    const termsContainer = document.querySelector('.terms-column');
    const terms = document.querySelectorAll('.match-term');

    terms.forEach(term => termsContainer.appendChild(term));

    terms.forEach(term => {
        term.style.opacity = '1';
        term.setAttribute('draggable', 'true');
    });

    definitions.forEach(def => def.classList.remove('matched'));

    setupMatchDragAndDrop();
}

function setupMatchDragAndDrop() {
    const terms = document.querySelectorAll('.match-term');
    const definitions = document.querySelectorAll('.match-definition');

    terms.forEach(term => {
        term.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-match'));
            this.classList.add('dragging');
        });

        term.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });

    definitions.forEach(def => {
        def.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        def.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        def.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            const matchId = e.dataTransfer.getData('text/plain');
            const term = document.querySelector(`.match-term[data-match="${matchId}"]`);

            if (this.getAttribute('data-match') === matchId && !this.querySelector('.match-term')) {
                this.appendChild(term);
                term.setAttribute('draggable', 'false');
                term.style.opacity = '0.7';
                updateScore(5);
            }
        });
    });
}

function checkMatchGame() {
    let termsInPlace = 0;
    document.querySelectorAll('.match-definition').forEach(def => {
        const matchId = def.getAttribute('data-match');
        const term = def.querySelector('.match-term');
        if (term && term.getAttribute('data-match') === matchId) {
            termsInPlace++;
        }
    });

    if (termsInPlace === 4) {
        updateScore(30);
        alert("¡Perfecto! Has relacionado todos los conceptos correctamente.");
    } else {
        alert(`Has acertado ${termsInPlace} de 4. ¡Intenta de nuevo!`);
    }
}

// --- Lógica de Diseño de Diapositivas ---
function resetSlideDesign() {
    const slidePreview = document.querySelector('.slide-preview');
    slidePreview.innerHTML = `
        <div class="slide-dropzone" id="title-dropzone"></div>
        <div class="slide-dropzone" id="content-dropzone"></div>
        <div class="slide-dropzone" id="image-dropzone"></div>
    `;
    setupDragAndDropEvents();
}

function setupDragAndDropEvents() {
    const elements = document.querySelectorAll('.slide-element');
    const dropZones = document.querySelectorAll('.slide-dropzone');

    elements.forEach(element => {
        element.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-type'));
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            const type = e.dataTransfer.getData('text/plain');
            const element = document.querySelector(`.slide-element[data-type="${type}"]`);
            const acceptedType = this.id.split('-')[0];

            if (this.children.length === 0) {
                const clone = element.cloneNode(true);
                clone.setAttribute('draggable', 'false');
                this.appendChild(clone);
                updateScore(5);
            } else {
                alert("¡Ya hay un elemento en esta zona!");
            }
        });
    });
}

function checkSlideDesign() {
    const titleZone = document.getElementById('title-dropzone');
    const contentZone = document.getElementById('content-dropzone');
    const imageZone = document.getElementById('image-dropzone');

    let correctCount = 0;
    if (titleZone.children.length > 0) correctCount++;
    if (contentZone.children.length > 0) correctCount++;
    if (imageZone.children.length > 0) correctCount++;

    if (correctCount === 3) {
        alert("¡Diseño Perfecto! Tienes título, contenido e imagen.");
        updateScore(20);
    } else if (correctCount >= 2) {
        alert("¡Buen diseño! Tienes los elementos básicos.");
        updateScore(10);
    } else {
        alert("Una diapositiva básica necesita al menos título y contenido. ¡Intenta de nuevo!");
    }
}

// --- Lógica del Juego Tres en Raya (Unificado) ---
function iniciarJuego(modo) {
    modoIA = modo;
    probabilidadIA = modo === 'facil' ? 0.3 : modo === 'normal' ? 0.5 : 0.8;
    juegoActivo = true;
    document.getElementById('modo-selector').style.display = 'none';
    document.getElementById('juego-container').style.display = 'block';
    reiniciarJuegoTresEnRaya();
}

function reiniciarJuegoTresEnRaya() {
    tablero = Array(9).fill(null);
    jugadorActual = 'X';
    document.getElementById('turno').textContent = 'Turno: Jugador X (⚡)';
    document.getElementById('pregunta-container').innerHTML = '';
    preguntaActual = null;

    const tableroHTML = document.getElementById('tablero');
    tableroHTML.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const celda = document.createElement('div');
        celda.className = 'celda';
        celda.dataset.index = i;
        celda.addEventListener('click', () => manejarClickCelda(i));
        tableroHTML.appendChild(celda);
    }
}

function manejarClickCelda(index) {
    if (tablero[index] || preguntaActual || !juegoActivo || jugadorActual === 'O') return;
    
    if (jugadorActual === 'X') {
        mostrarPregunta(index);
    }
}

function mostrarPregunta(indexCelda) {
    preguntaActual = {
        ...preguntas[Math.floor(Math.random() * preguntas.length)],
        indexCelda: indexCelda
    };

    const container = document.getElementById('pregunta-container');
    container.innerHTML = `
        <p><strong>${preguntaActual.pregunta}</strong></p>
        ${preguntaActual.opciones.map(opcion => `
            <button onclick="verificarRespuesta('${opcion}')">${opcion}</button>
        `).join('')}
    `;
}

function verificarRespuesta(opcion) {
    const esCorrecta = opcion === preguntaActual.respuesta;
    const container = document.getElementById('pregunta-container');
    
    if (esCorrecta) {
        tablero[preguntaActual.indexCelda] = jugadorActual;
        actualizarTablero();
        updateScore(15);
        
        if (hayGanador()) {
            alert(`¡Jugador ${jugadorActual} gana!`);
            reiniciarJuegoTresEnRaya();
            return;
        }
        
        if (hayEmpate()) {
            alert("¡Empate!");
            reiniciarJuegoTresEnRaya();
            return;
        }
    } else {
        updateScore(-5);
        alert("Respuesta incorrecta. Pierdes tu turno.");
    }
    
    cambiarTurno();
    container.innerHTML = '';
    preguntaActual = null;
    
    if (modoIA && jugadorActual === 'O') {
        setTimeout(turnoIA, 1000);
    }
}

function turnoIA() {
    if (!juegoActivo || jugadorActual !== 'O') return;
    
    const celdasVacias = tablero.map((v, i) => v === null ? i : null).filter(v => v !== null);

    let movimientoIA = -1;

    // IA inteligente (con probabilidad)
    if (Math.random() < probabilidadIA) {
        movimientoIA = encontrarMejorMovimiento('O');
        if (movimientoIA === -1) {
            movimientoIA = encontrarMejorMovimiento('X');
        }
        if (movimientoIA === -1) {
            if (tablero[4] === null) {
                movimientoIA = 4;
            } else {
                const esquinas = [0, 2, 6, 8];
                const esquinasVacias = esquinas.filter(i => tablero[i] === null);
                if (esquinasVacias.length > 0) {
                    movimientoIA = esquinasVacias[Math.floor(Math.random() * esquinasVacias.length)];
                }
            }
        }
    }
    
    // IA aleatoria (si no hay jugada inteligente o la probabilidad no se cumple)
    if (movimientoIA === -1) {
        movimientoIA = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
    }

    if (movimientoIA !== null && movimientoIA !== undefined) {
        tablero[movimientoIA] = 'O';
        actualizarTablero();
        
        if (hayGanador()) {
            alert("¡La IA gana!");
            reiniciarJuegoTresEnRaya();
            return;
        }
        if (hayEmpate()) {
            alert("¡Empate!");
            reiniciarJuegoTresEnRaya();
            return;
        }
    }
    
    cambiarTurno();
}

function encontrarMejorMovimiento(jugador) {
    const celdasVacias = tablero.map((val, i) => val === null ? i : null).filter(val => val !== null);
    for (let i = 0; i < celdasVacias.length; i++) {
        const index = celdasVacias[i];
        tablero[index] = jugador;
        if (hayGanador()) {
            tablero[index] = null;
            return index;
        }
        tablero[index] = null;
    }
    return -1;
}

function actualizarTablero() {
    document.querySelectorAll('.celda').forEach((celda, i) => {
        celda.textContent = tablero[i];
    });
}

function cambiarTurno() {
    jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
    document.getElementById('turno').textContent = `Turno: Jugador ${jugadorActual} (${jugadorActual === 'X' ? '⚡' : '🎯'})`;
}

function hayGanador() {
    const lineas = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return lineas.some(([a, b, c]) => tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]);
}

function hayEmpate() {
    return !tablero.includes(null) && !hayGanador();
}