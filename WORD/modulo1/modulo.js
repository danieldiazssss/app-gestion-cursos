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

// Configuración de imágenes para el juego de memoria
const memoryImages = {
    1: "https://cdn-icons-png.flaticon.com/128/3917/3917759.png", // Negrita
    2: "https://cdn-icons-png.flaticon.com/128/3917/3917757.png", // Cursiva
    3: "https://cdn-icons-png.flaticon.com/128/3917/3917758.png", // Subrayado
    4: "https://cdn-icons-png.flaticon.com/128/3917/3917764.png", // Guardar
    5: "https://cdn-icons-png.flaticon.com/128/3917/3917765.png", // Abrir
    6: "https://cdn-icons-png.flaticon.com/128/3917/3917763.png", // Imagen
    7: "https://cdn-icons-png.flaticon.com/128/3917/3917762.png", // Tabla
    8: "https://cdn-icons-png.flaticon.com/128/3917/3917761.png"  // Alinear
};

const fallbackImages = {
    1: "https://img.icons8.com/color/96/000000/bold.png",
    2: "https://img.icons8.com/color/96/000000/italic.png",
    3: "https://img.icons8.com/color/96/000000/underline.png",
    4: "https://img.icons8.com/color/96/000000/save.png",
    5: "https://img.icons8.com/color/96/000000/open.png",
    6: "https://img.icons8.com/color/96/000000/image.png",
    7: "https://img.icons8.com/color/96/000000/table.png",
    8: "https://img.icons8.com/color/96/000000/align-left.png"
};

const quizQuestions = [
    {
        question: "¿Cuál es la extensión principal de los archivos de Word?",
        options: [".txt", ".docx", ".pdf", ".ppt"],
        correct: 1,
        explanation: "¡Correcto! .docx es la extensión moderna de Word desde 2007"
    },
    {
        question: "¿Qué combinación de teclas sirve para GUARDAR un archivo en Word?",
        options: ["Ctrl+G", "Ctrl+S", "Ctrl+P", "Alt+F4"],
        correct: 0, // CAMBIADO DE 1 A 0 - Ahora Ctrl+G es la respuesta correcta
        explanation: "¡Correcto! Ctrl+G es el atajo para guardar en Word. Ctrl+S es para 'Seleccionar todo'"
    },
    {
        question: "¿Cómo se llama la barra con todas las herramientas en Word?",
        options: ["Barra de estado", "Cinta de opciones", "Menú inicio", "Panel lateral"],
        correct: 1,
        explanation: "¡Excelente! La Cinta de opciones es donde están todas las herramientas"
    },
    {
        question: "¿Qué herramienta usas para hacer texto en NEGRITA?",
        options: ["Cursiva (I)", "Subrayado (U)", "Negrita (B)", "Tachado"],
        correct: 2,
        explanation: "¡Muy bien! La B es para Bold (Negrita) en inglés"
    },
    {
        question: "¿En qué pestaña encuentras la opción para insertar imágenes?",
        options: ["Inicio", "Insertar", "Diseño", "Referencias"],
        correct: 1,
        explanation: "¡Correcto! En la pestaña Insertar están todas las opciones de contenido"
    }
];

const memoryTools = [
    { id: 1, name: "Negrita", desc: "B", shortcut: "Ctrl+B" },
    { id: 2, name: "Cursiva", desc: "I", shortcut: "Ctrl+I" },
    { id: 3, name: "Subrayado", desc: "U", shortcut: "Ctrl+U" },
    { id: 4, name: "Guardar", desc: "💾", shortcut: "Ctrl+G" }, // CAMBIADO: De Ctrl+S a Ctrl+G
    { id: 5, name: "Abrir", desc: "📂", shortcut: "Ctrl+O" },
    { id: 6, name: "Imagen", desc: "🖼️", shortcut: "Insertar → Imagen" },
    { id: 7, name: "Tabla", desc: "📊", shortcut: "Insertar → Tabla" },
    { id: 8, name: "Alinear", desc: "↔️", shortcut: "Pestaña Inicio" }
];
window.onload = function () {
    initQuiz();
    initDragAndDrop();
    updateScoreDisplay();
    console.log("Página cargada correctamente!");
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
        levelElement.textContent = 'Experto';
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

function switchGame(gameType, event) {
    const games = document.querySelectorAll('.game-section');
    games.forEach(game => game.classList.add('game-hidden'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${gameType}-game`).classList.remove('game-hidden');
    
    if (event) {
        event.target.classList.add('active');
    }
    
    currentGame = gameType;
    const gameNames = {
        'quiz': 'Quiz Rápido',
        'memory': 'Memoria Tools',
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
            🎉 ¡Felicidades! Has completado el Quiz
            <br>
            🏆 Puntuación final: ${currentScore} puntos
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

function loadImageWithFallback(toolId) {
    const img = document.createElement('img');
    img.style.width = '60px';
    img.style.height = '60px';
    img.style.objectFit = 'contain';
    img.style.marginBottom = '10px';
    
    img.src = memoryImages[toolId];
    
    img.onerror = function() {
        console.log(`Fallback para imagen ${toolId}`);
        this.src = fallbackImages[toolId] || "https://cdn-icons-png.flaticon.com/128/3917/3917759.png";
    };
    
    return img;
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
        
        card.innerHTML = '<div class="card-front">❓</div>';
        
        const backContent = document.createElement('div');
        backContent.className = 'card-back';
        backContent.style.display = 'none';
        backContent.style.textAlign = 'center';
        backContent.style.padding = '15px';
        
        const img = loadImageWithFallback(tool.id);
        backContent.appendChild(img);
        
        const toolName = document.createElement('div');
        toolName.style.fontWeight = 'bold';
        toolName.style.fontSize = '16px';
        toolName.style.marginBottom = '5px';
        toolName.textContent = tool.name;
        backContent.appendChild(toolName);
        
        const shortcut = document.createElement('div');
        shortcut.style.fontSize = '14px';
        shortcut.style.color = '#4CAF50';
        shortcut.textContent = tool.shortcut;
        backContent.appendChild(shortcut);
        
        card.appendChild(backContent);
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
    card.querySelector('.card-front').style.display = 'none';
    card.querySelector('.card-back').style.display = 'block';
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
        first.card.querySelector('.card-front').style.display = 'block';
        first.card.querySelector('.card-back').style.display = 'none';
        second.card.querySelector('.card-front').style.display = 'block';
        second.card.querySelector('.card-back').style.display = 'none';
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
    const bonus = Math.max(100 - memoryTime, 20);
    addScore(bonus);

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = `
        <div class="celebration" style="grid-column: 1 / -1;">
            🎉 ¡Excelente memoria!
            <br>⏱️ Tiempo: ${memoryTime}s
            <br> Intentos: ${memoryAttempts}
            <br> Bonus: +${bonus} puntos
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
    documentFontSize = 16;
    addScore(20);
}

function saveDocument() {
    const content = document.getElementById('document-content').innerHTML;
    addScore(50);
    showMessage('📄 ¡Documento guardado exitosamente!', 'success', 'simulator');
}

function resetDocument() {
    document.getElementById('document-content').innerHTML = `
        ¡Bienvenido al simulador de Word! 🎉
        
        Prueba estas acciones:
        1. Selecciona texto y hazlo NEGRITA
        2. Cambia el COLOR del texto
        3. Prueba la CURSIVA y el SUBRAYADO
        4. Alinea el texto al CENTRO
        5. Aumenta el TAMAÑO de letra
        
        ¡Experimenta con todas las herramientas! Cada acción te dará puntos extra. 💎
    `;
    documentFontSize = 16;
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
        showMessage('❌ Esa herramienta no pertenece a esta categoría', 'error', 'drag');
    }
}

function showDragComplete() {
    const dragGame = document.getElementById('drag-game');
    dragGame.innerHTML = `
        <div class="celebration">
            ¡Perfecto! Has clasificado todas las herramientas correctamente
            <br>
            🏆 ¡Bonus de +100 puntos!
            <br>
            <button class="nav-btn" onclick="resetDragGame()" style="margin-top: 20px;">
                🔄 Jugar de Nuevo
            </button>
        </div>
    `;
    addScore(100);
}

function resetDragGame() {
    dragCorrectCount = 0;
    document.getElementById('drag-game').innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00d4ff;"> Arrastra las herramientas a su lugar correcto</h2>
            <p style="font-size: 18px;">Identifica dónde pertenece cada herramienta en Word</p>
        </div>
        
        <div class="drag-container">
            <div class="tools-bank">
                <h3 style="color: #00d4ff; text-align: center; margin-bottom: 20px;"> Herramientas Disponibles</h3>
                <div class="drag-tool" draggable="true" data-category="formato">Negrita (B)</div>
                <div class="drag-tool" draggable="true" data-category="formato">Cursiva (I)</div>
                <div class="drag-tool" draggable="true" data-category="formato">Subrayado (U)</div>
                <div class="drag-tool" draggable="true" data-category="formato">Alinear texto</div>
                <div class="drag-tool" draggable="true" data-category="archivo">Guardar (Ctrl+S)</div>
                <div class="drag-tool" draggable="true" data-category="archivo">Abrir (Ctrl+O)</div>
                <div class="drag-tool" draggable="true" data-category="insertar">Imagen</div>
                <div class="drag-tool" draggable="true" data-category="insertar">Tabla</div>
            </div>
            
            <div class="word-interface">
                <h3 style="text-align: center; margin-bottom: 20px;"> Categorías de Word</h3>
                <div class="drop-zone" data-accepts="formato">
                    FORMATO DE TEXTO
                    <small style="display: block; margin-top: 5px;">Herramientas para cambiar la apariencia del texto</small>
                </div>
                <div class="drop-zone" data-accepts="archivo">
                    OPERACIONES DE ARCHIVO
                    <small style="display: block; margin-top: 5px;">Acciones para manejar documentos</small>
                </div>
                <div class="drop-zone" data-accepts="insertar">
                    INSERTAR ELEMENTOS
                    <small style="display: block; margin-top: 5px;">Agregar contenido multimedia</small>
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

// Funciones del reproductor de video
const video = document.querySelector('video');
const overlay = document.querySelector('.video-overlay');
const playButton = document.querySelector('.play-button');

if (video) {
    video.addEventListener('play', function () {
        overlay.style.display = 'none';
    });

    video.addEventListener('pause', function () {
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

// Añadir estilos CSS dinámicos
const style = document.createElement('style');
style.textContent = `
    .memory-card {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        cursor: pointer;
        border-radius: 10px;
        background: linear-gradient(145deg, #667eea, #764ba2);
        color: white;
        transition: all 0.3s ease;
        transform-style: preserve-3d;
        position: relative;
        height: 140px;
    }
    
    .memory-card:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .memory-card.flipped {
        background: white;
        color: #333;
    }
    
    .memory-card.matched {
        background: linear-gradient(145deg, #4CAF50, #2E7D32);
        color: white;
        cursor: default;
        transform: scale(1);
    }
    
    .card-front, .card-back {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
    
    .memory-card img {
        max-width: 60px;
        max-height: 60px;
        margin-bottom: 10px;
    }
    
    .memory-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        max-width: 600px;
        margin: 0 auto;
    }
    
    @media (max-width: 768px) {
        .memory-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    @media (max-width: 480px) {
        .memory-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;
document.head.appendChild(style);