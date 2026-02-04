
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const itemsElement = document.getElementById('items');
const livesElement = document.getElementById('lives');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let score = 0;
let itemsCaught = 0;
let lives = 3;
let gameInterval;
let gameRunning = false;
let isQuestionActive = false; 
let availableQuestions = [];
let fallingObjects = [];


const questions = [{
    question: "¿Qué tipo de contenido NO puedes crear directamente en Canva?",
    options: ["Publicaciones para redes sociales", "Presentaciones", "Hojas de cálculo complejas", "Tarjetas de visita"],
    answer: 2
}, {
    question: "¿Qué función se utiliza para eliminar el fondo de una imagen en Canva Pro?",
    options: ["Recortar", "Ajustar", "Editor de fotos", "Removedor de fondos"],
    answer: 3
}, {
    question: "Para colaborar en un diseño en tiempo real con otra persona, ¿qué opción de uso compartido debes seleccionar?",
    options: ["Compartir con un enlace para ver", "Compartir con un enlace de edición", "Descargar como PDF", "Enviar por correo electrónico"],
    answer: 1
}, {
    question: "¿Cuál de los siguientes elementos es un tipo de plantilla de diseño que se encuentra en Canva?",
    options: ["Diagrama de flujo", "Lienzo en blanco", "Código de programación", "Animación 3D"],
    answer: 0
}, {
    question: "¿Qué herramienta te permite aplicar una paleta de colores a todo un diseño con un solo clic?",
    options: ["Estilos", "Filtros", "Cuadrícula", "Líneas de guía"],
    answer: 0
}, {
    question: "¿Cuál de estos formatos de archivo es el más adecuado para diseños con fondo transparente?",
    options: ["JPG", "PDF", "SVG", "PNG"],
    answer: 3
}, {
    question: "¿Qué es un 'marco' en Canva?",
    options: ["Un borde decorativo para el diseño", "Un espacio reservado para fotos que puedes arrastrar y soltar", "La herramienta para dibujar formas", "Una capa para organizar elementos"],
    answer: 1
}, {
    question: "¿Qué función te permite alinear y distribuir varios elementos de forma equitativa en tu diseño?",
    options: ["Posición", "Agrupar", "Duplicar", "Bloquear"],
    answer: 0
}, {
    question: "Si quieres descargar una animación para redes sociales, ¿qué formato de archivo se recomienda para mantener el movimiento?",
    options: ["PNG", "GIF", "JPG", "PDF"],
    answer: 1
}, {
    question: "¿Cuál es la forma más rápida de añadir un texto preformateado con una fuente y estilo específicos?",
    options: ["Añadir una forma de texto", "Usar la herramienta 'Subir'", "Usar la herramienta 'Combinaciones de fuentes'", "Pegar texto desde otra aplicación"],
    answer: 2
}];


class FallingObject {
    constructor(x, y, type, question) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = type === 'marble' ? 20 : 30;
        this.speed = Math.random() * 2 + 1;
        this.question = question;
        this.color = this.getColor();
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.05 - 0.025;
    }

    getColor() {
        const colors = {
            'marble': ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF'],
            'shoe': ['#8B4513', '#A52A2A', '#D2691E', '#CD853F'],
            'ball': ['#32CD32', '#228B22', '#7CFC00', '#ADFF2F'],
            'box': ['#FFD700', '#FFA500', '#FF8C00', '#DAA520']
        };
        return colors[this.type][Math.floor(Math.random() * colors[this.type].length)];
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch (this.type) {
            case 'marble':
                this.drawMarble();
                break;
            case 'shoe':
                this.drawShoe();
                break;
            case 'ball':
                this.drawBall();
                break;
            case 'box':
                this.drawBox();
                break;
        }

        ctx.restore();
    }

    drawMarble() {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-this.size / 3, -this.size / 3, this.size / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }

    drawShoe() {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);

        ctx.beginPath();
        ctx.moveTo(-this.size / 2, -this.size / 4);
        ctx.lineTo(-this.size / 4, -this.size / 2);
        ctx.lineTo(this.size / 2, -this.size / 2);
        ctx.lineTo(this.size / 2, -this.size / 4);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size / 4, -this.size / 4);
        ctx.lineTo(this.size / 4, -this.size / 4);
        ctx.stroke();
    }

    drawBall() {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();
    }

    drawBox() {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, 0);
        ctx.lineTo(this.size / 2, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(0, this.size / 2);
        ctx.stroke();
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + this.size) {
            return false;
        }

        this.draw();
        return true;
    }

    isClicked(mouseX, mouseY) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance <= this.size;
    }
}


function initGame() {
    score = 0;
    itemsCaught = 0;
    lives = 3;
    fallingObjects = [];
    availableQuestions = [...questions];
    isQuestionActive = false; 

    scoreElement.textContent = score;
    itemsElement.textContent = itemsCaught;
    livesElement.textContent = lives;

    questionElement.textContent = "¡Haz clic en Comenzar para iniciar!";
    optionsElement.innerHTML = "";
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    startBtn.textContent = "Comenzar";
    startBtn.disabled = false;
}


function createFallingObject() {
    if (!gameRunning || availableQuestions.length === 0) return;

    const x = Math.random() * (canvas.width - 60) + 30;
    const y = -50;

    const types = ['marble', 'shoe', 'ball', 'box'];
    const type = types[Math.floor(Math.random() * types.length)];

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[questionIndex];

    availableQuestions.splice(questionIndex, 1);

    fallingObjects.push(new FallingObject(x, y, type, question));
}


function showQuestion(question) {
    currentQuestion = question;
    isQuestionActive = true; 
    questionElement.textContent = question.question;

    optionsElement.innerHTML = "";
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => checkAnswer(index));
        optionsElement.appendChild(optionElement);
    });
}


function checkAnswer(selectedIndex) {
    if (!isQuestionActive) return;

    if (selectedIndex === currentQuestion.answer) {
        score += 10;
        scoreElement.textContent = score;
        feedbackElement.textContent = "¡Correcto! +10 puntos";
        feedbackElement.className = "feedback correct";
    } else {
        lives--;
        livesElement.textContent = lives;
        feedbackElement.textContent = "Incorrecto. La respuesta era: " + currentQuestion.options[currentQuestion.answer];
        feedbackElement.className = "feedback incorrect";

        if (lives <= 0) {
            endGame();
        }
    }

    isQuestionActive = false; 
    currentQuestion = null;

    setTimeout(() => {
        if (lives > 0) {
            feedbackElement.textContent = "";
            feedbackElement.className = "feedback";
            questionElement.textContent = "Atrapa otro objeto para más preguntas";
            optionsElement.innerHTML = "";
        }
    }, 3000);
}


function gameLoop() {
    if (!gameRunning) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(113, 42, 213, 0.6)');
    gradient.addColorStop(1, 'rgba(85, 220, 80, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        if (!fallingObjects[i].update()) {
            fallingObjects.splice(i, 1);
        }
    }

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Preguntas: ${availableQuestions.length}`, 10, 25);

    requestAnimationFrame(gameLoop);
}


function startGame() {
    if (gameRunning) return;

    initGame();
    gameRunning = true;

    requestAnimationFrame(gameLoop);
    gameInterval = setInterval(createFallingObject, 1500);

    startBtn.textContent = "Jugando...";
    startBtn.disabled = true;
}


function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);

    questionElement.textContent = "¡Juego terminado!";
    optionsElement.innerHTML = "";
    feedbackElement.textContent = `Puntuación final: ${score} puntos`;

    startBtn.textContent = "Comenzar";
    startBtn.disabled = false;
}


canvas.addEventListener('click', (event) => {
 
    if (!gameRunning || isQuestionActive) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        if (fallingObjects[i].isClicked(mouseX, mouseY)) {
            itemsCaught++;
            itemsElement.textContent = itemsCaught;

            showQuestion(fallingObjects[i].question);

            fallingObjects.splice(i, 1);

            break;
        }
    }
});


startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', initGame);


window.onload = initGame;