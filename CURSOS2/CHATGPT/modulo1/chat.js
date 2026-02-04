document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const questionElement = document.getElementById('question');
    const optionsElements = document.querySelectorAll('.option');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const currentQuestionElement = document.getElementById('current');
    const totalQuestionsElement = document.getElementById('total');
    const resultMessageElement = document.getElementById('result-message');
    const progressBar = document.querySelector('.progress');
    const notification = document.getElementById('notification');

    // Variables del juego
    let currentQuestion = 0;
    let score = 0;
    let questions = [];
    let selectedOption = null;

    // Preguntas sobre ChatGPT
    const chatGPTQuestions = [
        {
            question: "¿En qué año fue lanzado ChatGPT al público?",
            options: [
                "2020",
                "2021",
                "2022",
                "2023"
            ],
            correct: 2
        },
        {
            question: "¿Qué empresa desarrolló ChatGPT?",
            options: [
                "Google",
                "OpenAI",
                "Microsoft",
                "Facebook"
            ],
            correct: 1
        },
        {
            question: "¿Qué significa GPT en ChatGPT?",
            options: [
                "General Purpose Technology",
                "Generative Pre-trained Transformer",
                "Global Processing Technique",
                "Guided Program Training"
            ],
            correct: 1
        },
        {
            question: "¿Qué versión de GPT potenció la primera versión pública de ChatGPT?",
            options: [
                "GPT-2",
                "GPT-3",
                "GPT-3.5",
                "GPT-4"
            ],
            correct: 2
        },
        {
            question: "¿Cuál de estas NO es una capacidad principal de ChatGPT?",
            options: [
                "Traducir idiomas",
                "Generar código de programación",
                "Crear contenido visual",
                "Responder preguntas complejas"
            ],
            correct: 2
        },
        {
            question: "¿Qué técnica utiliza ChatGPT para mejorar sus respuestas?",
            options: [
                "Aprendizaje por refuerzo con feedback humano",
                "Programación manual de respuestas",
                "Búsqueda en internet en tiempo real",
                "Análisis de emociones por cámara web"
            ],
            correct: 0
        },
        {
            question: "¿Qué límite importante tiene ChatGPT?",
            options: [
                "Solo funciona en inglés",
                "No puede recordar conversaciones anteriores",
                "Requiere hardware especial para funcionar",
                "Solo puede ser usado por empresas"
            ],
            correct: 1
        },
        {
            question: "¿Qué significa que ChatGPT tenga una 'ventana de contexto'?",
            options: [
                "El tiempo que tarda en responder",
                "La cantidad de texto que puede procesar en una conversación",
                "El número de usuarios que pueden usarlo simultáneamente",
                "El tamaño de la pantalla donde se visualiza"
            ],
            correct: 1
        },
        {
            question: "¿Qué tecnología subyacente permite a ChatGPT generar texto coherente?",
            options: [
                "Redes neuronales convolucionales",
                "Modelos de lenguaje de gran escala",
                "Algoritmos de compresión de datos",
                "Sistemas expertos basados en reglas"
            ],
            correct: 1
        },
        {
            question: "¿Cuál de estas es una preocupación ética común sobre ChatGPT?",
            options: [
                "Puede consumir demasiada energía eléctrica",
                "Puede generar información inexacta o sesgada",
                "Puede volverse consciente y rebelarse",
                "Puede reemplazar completamente a los humanos en todos los trabajos"
            ],
            correct: 1
        }
    ];

    // Inicializar el juego
    function initGame() {
        questions = [...chatGPTQuestions];
        totalQuestionsElement.textContent = questions.length;
        resetGame();
        showScreen(startScreen);
    }

    // Reiniciar el juego
    function resetGame() {
        currentQuestion = 0;
        score = 0;
        scoreElement.textContent = score;
        updateProgressBar();
    }

    // Mostrar una pantalla específica
    function showScreen(screen) {
        startScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        endScreen.classList.remove('active');
        screen.classList.add('active');
    }

    // Cargar pregunta actual
    function loadQuestion() {
        resetOptions();
        const question = questions[currentQuestion];
        questionElement.textContent = question.question;
        currentQuestionElement.textContent = currentQuestion + 1;
        
        optionsElements.forEach((option, index) => {
            const optionText = option.querySelector('.option-text');
            optionText.textContent = question.options[index];
        });
        
        nextBtn.disabled = true;
        selectedOption = null;
    }

    // Reiniciar opciones
    function resetOptions() {
        optionsElements.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });
    }

    // Actualizar barra de progreso
    function updateProgressBar() {
        const progress = ((currentQuestion) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Mostrar notificación
    function showNotification(message, isSuccess = true) {
        notification.textContent = message;
        notification.style.background = isSuccess ? '#19c37d' : '#ff4d4d';
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Finalizar el juego
    function finishGame() {
        finalScoreElement.textContent = score;
        
        let message = "";
        if (score >= 8) {
            message = "¡Excelente! Eres un experto en ChatGPT.";
        } else if (score >= 5) {
            message = "¡Buen trabajo! Tienes un conocimiento decente sobre ChatGPT.";
        } else {
            message = "Sigue aprendiendo sobre ChatGPT. ¡Es una tecnología fascinante!";
        }
        
        resultMessageElement.textContent = message;
        showScreen(endScreen);
    }

    // Event Listeners
    startBtn.addEventListener('click', () => {
        showScreen(gameScreen);
        loadQuestion();
    });

    restartBtn.addEventListener('click', () => {
        resetGame();
        showScreen(gameScreen);
        loadQuestion();
    });

    nextBtn.addEventListener('click', () => {
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            updateProgressBar();
            loadQuestion();
        } else {
            finishGame();
        }
    });

    optionsElements.forEach(option => {
        option.addEventListener('click', () => {
            if (selectedOption !== null) return;
            
            selectedOption = parseInt(option.dataset.index);
            option.classList.add('selected');
            nextBtn.disabled = false;
            
            const correctIndex = questions[currentQuestion].correct;
            
            if (selectedOption === correctIndex) {
                option.classList.add('correct');
                score++;
                scoreElement.textContent = score;
                showNotification("¡Correcto! +1 punto", true);
            } else {
                option.classList.add('incorrect');
                optionsElements[correctIndex].classList.add('correct');
                showNotification("Incorrecto. La respuesta correcta es: " + questions[currentQuestion].options[correctIndex], false);
            }
        });
    });

    // Inicializar el juego
    initGame();
});