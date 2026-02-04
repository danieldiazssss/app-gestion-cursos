let currentScore = 0;
let currentQuestionIndex = 0;
let currentGame = 'quiz';
let memoryCards = [];
let flippedCards = [];
let memoryTime = 0;
let memoryAttempts = 0;
let memoryTimer;
let dragCorrectCount = 0;
let documentFontSize = 16;


const quizQuestions = [
    {
        question: "¿Qué combinación de teclas se usa para poner texto en NEGRITA?",
        options: ["Ctrl + N", "Ctrl + B", "Alt + B", "Shift + B"],
        correct: 1,
        explanation: "¡Correcto! Ctrl + B es el atajo para Negrita (B de Bold)"
    },
    {
        question: "¿Qué herramienta usas para inclinar el texto (cursiva)?",
        options: ["Subrayado (U)", "Negrita (B)", "Cursiva (I)", "Tachado (S)"],
        correct: 2,
        explanation: "¡Perfecto! La I es para Itálica (Cursiva)"
    },
    {
        question: "¿Cómo se llama la opción para alinear texto a ambos márgenes?",
        options: ["Centrado", "Justificado", "Derecha", "Distribuido"],
        correct: 1,
        explanation: "¡Excelente! Justificado alinea el texto uniformemente en ambos lados"
    },
    {
        question: "¿Qué opción te permite cambiar el tipo de letra?",
        options: ["Tamaño de fuente", "Color de fuente", "Familia de fuente", "Efectos de texto"],
        correct: 2,
        explanation: "¡Muy bien! La familia de fuente determina el estilo de letra"
    },
    {
        question: "¿Dónde encuentras las opciones de formato de párrafo como interlineado?",
        options: ["Pestaña Insertar", "Pestaña Inicio", "Pestaña Diseño", "Pestaña Referencias"],
        correct: 1,
        explanation: "¡Correcto! En la pestaña Inicio están las opciones de párrafo básicas"
    },
    {
        question: "¿Qué hace la herramienta de subrayado doble?",
        options: ["Subraya dos veces", "Subraya palabras completas", "Cambia el color", "Añade sombra"],
        correct: 0,
        explanation: "¡Bien! Subraya el texto con dos líneas paralelas"
    },
    {
        question: "¿Cómo se llama el espacio entre líneas de texto?",
        options: ["Sangría", "Interlineado", "Margen", "Espaciado"],
        correct: 1,
        explanation: "¡Correcto! Interlineado controla el espacio vertical entre líneas"
    },
    {
        question: "¿Qué formato se usa para tachar texto como si estuviera eliminado?",
        options: ["Subrayado", "Resaltado", "Tachado", "Superíndice"],
        correct: 2,
        explanation: "¡Muy bien! El tachado muestra una línea horizontal sobre el texto"
    }
];


const memoryTools = [
    { id: 1, name: "Negrita", desc: "B" },
    { id: 2, name: "Cursiva", desc: "I" },
    { id: 3, name: "Subrayado", desc: "U" },
    { id: 4, name: "Tachado", desc: "S" },
    { id: 5, name: "Color", desc: "🎨" },
    { id: 6, name: "Tamaño", desc: "A+" },
    { id: 7, name: "Alinear", desc: "↔" },
    { id: 8, name: "Fuente", desc: "Aa" }
];

window.onload = function() {
    initQuiz();
    initDragAndDrop();
    updateScoreDisplay();
    console.log("Módulo 2 - Formato de Texto cargado correctamente!");
};


function addScore(points) {
    currentScore += points;
    updateScoreDisplay();
    showScorePopup(points);
    updateLevel();
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = currentScore;
}

function updateLevel() {
    const levelElement = document.getElementById('level');
    if (currentScore >= 500) {
        levelElement.textContent = 'Maestro del Formato';
        levelElement.style.color = '#ff6b35';
    } else if (currentScore >= 300) {
        levelElement.textContent = 'Avanzado';
        levelElement.style.color = '#f7931e';
    } else if (currentScore >= 150) {
        levelElement.textContent = 'Intermedio';
        levelElement.style.color = '#4CAF50';
    } else {
        levelElement.textContent = 'Principiante';
        levelElement.style.color = '#2196F3';
    }
}

function showScorePopup(points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points} puntos!`;
    document.body.appendChild(popup);

    setTimeout(() => {
        document.body.removeChild(popup);
    }, 1500);
}


function switchGame(gameType) {
    const games = document.querySelectorAll('.game-section');
    games.forEach(game => game.classList.add('game-hidden'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${gameType}-game`).classList.remove('game-hidden');
    
 
    buttons.forEach(btn => {
        if (btn.textContent.includes(gameType.charAt(0).toUpperCase() + gameType.slice(1).toLowerCase())) {
            btn.classList.add('active');
        }
    });
    
    currentGame = gameType;
    const gameNames = {
        'quiz': 'Quiz Formato',
        'memory': 'Memoria Formatos',
        'simulator': 'Simulador Word',
        'drag': 'Arrastrar y Soltar'
    };
    document.getElementById('current-game').textContent = gameNames[gameType];

    if (gameType === 'memory') {
        resetMemoryGame();
    } else if (gameType === 'drag') {
        resetDragGame();
    }
}


function initQuiz() {
    currentQuestionIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showQuizComplete();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('quiz-question').textContent = question.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('next-question').style.display = 'none';
}

function checkAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });

    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        addScore(50);
        showMessage(question.explanation, 'success', 'quiz');
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
        showMessage(`❌ Incorrecto. ${question.explanation}`, 'error', 'quiz');
    }

    document.getElementById('next-question').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function showQuizComplete() {
    const gameArea = document.getElementById('quiz-game');
    gameArea.innerHTML = `
        <div class="celebration">
            🎉 ¡Felicidades! Has completado el Quiz de Formato
            <br>
            🏆 Puntuación final: ${currentScore} puntos
            <br>
            📚 Has aprendido sobre negrita, cursiva, alineación y más!
            <br>
            <button class="nav-btn" onclick="restartQuiz()" style="margin-top: 20px;">
                🔄 Reiniciar Quiz
            </button>
        </div>
    `;
    addScore(100);
}

function restartQuiz() {
    currentQuestionIndex = 0;
    document.getElementById('quiz-game').innerHTML = `
        <div class="quiz-question" id="quiz-question">¡Cargando pregunta...!</div>
        <div class="quiz-options" id="quiz-options"></div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="nav-btn" onclick="nextQuestion()" id="next-question" style="display: none;">
                Siguiente Pregunta ➡️
            </button>
        </div>
    `;
    loadQuestion();
}


function resetMemoryGame() {
    memoryCards = [];
    flippedCards = [];
    memoryTime = 0;
    memoryAttempts = 0;

    const tools = [...memoryTools];
    const pairs = [...tools, ...tools];


    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    pairs.forEach((tool, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.toolId = tool.id;
        card.dataset.cardIndex = index;
        card.innerHTML = '❓';
        card.onclick = () => flipCard(card, tool);
        grid.appendChild(card);
        memoryCards.push(card);
    });

    startMemoryTimer();
    updateMemoryStats();
}

function flipCard(card, tool) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
        return;
    }

    card.classList.add('flipped');
    card.innerHTML = `${tool.desc}`;
    flippedCards.push({ card, tool });

    if (flippedCards.length === 2) {
        memoryAttempts++;
        updateMemoryStats();

        setTimeout(() => {
            checkMemoryMatch();
        }, 1000);
    }
}

function checkMemoryMatch() {
    const [first, second] = flippedCards;

    if (first.tool.id === second.tool.id) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        addScore(30);

        const matchedCards = document.querySelectorAll('.memory-card.matched');
        if (matchedCards.length === memoryCards.length) {
            setTimeout(() => {
                showMemoryComplete();
            }, 500);
        }
    } else {
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');
        first.card.innerHTML = '❓';
        second.card.innerHTML = '❓';
    }

    flippedCards = [];
}

function startMemoryTimer() {
    clearInterval(memoryTimer);
    memoryTimer = setInterval(() => {
        memoryTime++;
        updateMemoryStats();
    }, 1000);
}

function updateMemoryStats() {
    document.getElementById('memory-time').textContent = memoryTime;
    document.getElementById('memory-attempts').textContent = memoryAttempts;
}

function showMemoryComplete() {
    clearInterval(memoryTimer);
    const bonus = Math.max(150 - memoryTime - memoryAttempts * 5, 50);
    addScore(bonus);

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = `
        <div class="celebration" style="grid-column: 1 / -1;">
            🎉 ¡Excelente memoria de formatos!
            <br>⏱️ Tiempo: ${memoryTime}s
            <br> Intentos: ${memoryAttempts}
            <br> Bonus: +${bonus} puntos
            <br>
            <button class="nav-btn" onclick="resetMemoryGame()" style="margin-top: 15px;">
                🔄 Jugar de Nuevo
            </button>
        </div>
    `;
}


function formatText(command) {
    document.execCommand(command, false, null);
    addScore(10);
}

function changeTextColor(color) {
    document.execCommand('foreColor', false, color);
    addScore(15);
}

function changeFontFamily(font) {
    const content = document.getElementById('document-content');
    content.style.fontFamily = font;
    addScore(15);
}

function increaseFontSize() {
    documentFontSize += 2;
    const content = document.getElementById('document-content');
    content.style.fontSize = documentFontSize + 'px';
    addScore(10);
}

function decreaseFontSize() {
    if (documentFontSize > 8) {
        documentFontSize -= 2;
        const content = document.getElementById('document-content');
        content.style.fontSize = documentFontSize + 'px';
        addScore(10);
    }
}

function alignText(alignment) {
    const alignments = {
        'left': 'justifyLeft',
        'center': 'justifyCenter',
        'right': 'justifyRight'
    };
    document.execCommand(alignments[alignment], false, null);
    addScore(15);
}

function clearFormatting() {
    document.execCommand('removeFormat', false, null);
    const content = document.getElementById('document-content');
    content.style.fontSize = '16px';
    content.style.fontFamily = 'Calibri, sans-serif';
    content.style.color = 'black';
    documentFontSize = 16;
    addScore(20);
}

function saveDocument() {
    const content = document.getElementById('document-content').innerHTML;
    addScore(50);
    showMessage('📄 ¡Documento formateado guardado exitosamente!', 'success', 'simulator');
}

function resetDocument() {
    document.getElementById('document-content').innerHTML = `
        ¡Bienvenido al simulador de formato de texto! 🎉
        
        Prueba estas acciones:
        1. Selecciona texto y hazlo NEGRITA
        2. Cambia el COLOR del texto
        3. Prueba la CURSIVA y el SUBRAYADO
        4. Alinea el texto al CENTRO o JUSTIFICADO
        5. Aumenta el TAMAÑO de letra
        6. Cambia la FUENTE del texto
        7. Aplica formato TACHADO

        ¡Experimenta con todas las herramientas! Cada acción te dará puntos extra. 💎
    `;
    documentFontSize = 16;
    const content = document.getElementById('document-content');
    content.style.fontFamily = 'Calibri, sans-serif';
    content.style.color = 'black';
    addScore(10);
}


function initDragAndDrop() {
    const dragTools = document.querySelectorAll('.drag-tool');
    const dropZones = document.querySelectorAll('.drop-zone');

    dragTools.forEach(tool => {
        tool.addEventListener('dragstart', handleDragStart);
        tool.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.category);
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    const draggedCategory = e.dataTransfer.getData('text/plain');
    const acceptedCategory = this.dataset.accepts;
    const draggedHTML = e.dataTransfer.getData('text/html');

    if (draggedCategory === acceptedCategory) {
        this.classList.add('correct');
        this.innerHTML += `<div style="margin-top: 10px; color: #4CAF50; font-weight: bold;">✅ ${draggedHTML.match(/>([^<]+)</)[1]}</div>`;
        addScore(40);
        dragCorrectCount++;
        
        const originalTool = document.querySelector(`[data-category="${draggedCategory}"].dragging`);
        if (originalTool) {
            originalTool.style.opacity = '0.3';
            originalTool.draggable = false;
        }

        if (dragCorrectCount >= 8) {
            setTimeout(showDragComplete, 1000);
        }

    } else {
        this.classList.add('incorrect');
        setTimeout(() => {
            this.classList.remove('incorrect');
        }, 1000);
        showMessage('❌ Esa herramienta no corresponde a esta función', 'error', 'drag');
    }
}

function showDragComplete() {
    const dragGame = document.getElementById('drag-game');
    dragGame.innerHTML = `
        <div class="celebration">
            ¡Perfecto! Has asociado todos los formatos correctamente
            <br>
            🏆 ¡Bonus de +150 puntos!
            <br>
            🎯 Dominas las funciones de formato de texto
            <br>
            <button class="nav-btn" onclick="resetDragGame()" style="margin-top: 20px;">
                🔄 Jugar de Nuevo
            </button>
        </div>
    `;
    addScore(150);
}

function resetDragGame() {
    dragCorrectCount = 0;
    document.getElementById('drag-game').innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00d4ff;"> Arrastra los formatos a su función correcta</h2>
            <p style="font-size: 18px;">Identifica qué hace cada herramienta de formato</p>
        </div>
        
        <div class="drag-container">
            <div class="tools-bank">
                <h3 style="color: #00d4ff; text-align: center; margin-bottom: 20px;"> Herramientas de Formato</h3>
                <div class="drag-tool" draggable="true" data-category="negrita">Negrita</div>
                <div class="drag-tool" draggable="true" data-category="cursiva">Cursiva</div>
                <div class="drag-tool" draggable="true" data-category="subrayado">Subrayado</div>
                <div class="drag-tool" draggable="true" data-category="tachado">Tachado</div>
                <div class="drag-tool" draggable="true" data-category="color">Color de texto</div>
                <div class="drag-tool" draggable="true" data-category="tamaño">Tamaño de fuente</div>
                <div class="drag-tool" draggable="true" data-category="fuente">Tipo de fuente</div>
                <div class="drag-tool" draggable="true" data-category="alineacion">Alineación</div>
            </div>
            
            <div class="word-interface">
                <h3 style="text-align: center; margin-bottom: 20px;">🖥️ Funciones de Formato</h3>
                <div class="drop-zone" data-accepts="negrita">
                    RESALTAR TEXTO
                    <small style="display: block; margin-top: 5px;">Hace el texto más grueso y visible</small>
                </div>
                <div class="drop-zone" data-accepts="cursiva">
                    ENFATIZAR TEXTO
                    <small style="display: block; margin-top: 5px;">Inclina el texto para dar énfasis</small>
                </div>
                <div class="drop-zone" data-accepts="subrayado">
                    SUBRAYAR TEXTO
                    <small style="display: block; margin-top: 5px;">Añade una línea debajo del texto</small>
                </div>
                <div class="drop-zone" data-accepts="tachado">
                    TACHAR TEXTO
                    <small style="display: block; margin-top: 5px;">Muestra texto como eliminado</small>
                </div>
                <div class="drop-zone" data-accepts="color">
                    CAMBIAR COLOR
                    <small style="display: block; margin-top: 5px;">Modifica el color del texto</small>
                </div>
                <div class="drop-zone" data-accepts="tamaño">
                    AJUSTAR TAMAÑO
                    <small style="display: block; margin-top: 5px;">Controla qué tan grande es el texto</small>
                </div>
                <div class="drop-zone" data-accepts="fuente">
                    CAMBIAR FUENTE
                    <small style="display: block; margin-top: 5px;">Selecciona el estilo de letra</small>
                </div>
                <div class="drop-zone" data-accepts="alineacion">
                    ALINEAR TEXTO
                    <small style="display: block; margin-top: 5px;">Posiciona texto a izquierda, centro o derecha</small>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="nav-btn" onclick="resetDragGame()">🔄 Reiniciar Juego</button>
        </div>
    `;

    setTimeout(() => {
        initDragAndDrop();
    }, 100);
}


function showMessage(text, type, gameId) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = text;
    
    let parentElement = document.querySelector('.game-area');
    if (gameId) {
        parentElement = document.getElementById(`${gameId}-game`);
    }

    if (parentElement) {
        parentElement.insertBefore(messageDiv, parentElement.firstChild);
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}


const video = document.querySelector('video');
const overlay = document.querySelector('.video-overlay');
const playButton = document.querySelector('.play-button');

if (video) {
    video.addEventListener('play', function() {
        overlay.style.display = 'none';
    });

    video.addEventListener('pause', function() {
        overlay.style.display = 'flex';
    });
}

function togglePlay() {
    const video = document.querySelector('video');
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function toggleFullscreen() {
    const video = document.querySelector('video');
    if (!document.fullscreenElement) {
        video.requestFullscreen().catch(err => {
            alert(`Error al intentar pantalla completa: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function toggleMute() {
    const video = document.querySelector('video');
    video.muted = !video.muted;
    event.target.textContent = video.muted ? "Desilenciar" : "Silenciar";
}

function changeSpeed() {
    const video = document.querySelector('video');
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    let currentIndex = speeds.indexOf(video.playbackRate);
    currentIndex = (currentIndex + 1) % speeds.length;
    video.playbackRate = speeds[currentIndex];
    event.target.textContent = `Velocidad: ${speeds[currentIndex]}x`;
}