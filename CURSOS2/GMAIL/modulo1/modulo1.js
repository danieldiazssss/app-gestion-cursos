document.addEventListener('DOMContentLoaded', () => {
   
    let score = 0;
    let level = 1;
    let currentQuizQuestion = 0;
    let gamesCompleted = {
        quiz: false,
        inbox: false,
        drag: false,
    };
    let quizCorrectAnswers = 0;

  
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const currentGameElement = document.getElementById('current-game');
    const gameSections = document.querySelectorAll('.game-section');
    const navButtons = document.querySelectorAll('.nav-btn');


    const quizQuestions = [
        {
            question: "¿Qué botón usas para enviar un nuevo correo electrónico?",
            options: ["Recibidos", "Redactar", "Enviados", "Borradores"],
            correctAnswer: "Redactar"
        },
        {
            question: "¿Dónde puedes encontrar los correos que has marcado como importantes?",
            options: ["Spam", "Etiquetas", "Destacados", "Papelera"],
            correctAnswer: "Destacados"
        },
        {
            question: "¿Qué acción realizas para quitar un correo de tu bandeja sin borrarlo?",
            options: ["Archivar", "Eliminar", "Marcar como spam", "Posponer"],
            correctAnswer: "Archivar"
        },
        {
            question: "La barra de búsqueda de Gmail sirve para:",
            options: ["Enviar un correo", "Buscar correos específicos", "Cambiar de cuenta", "Configurar el tema"],
            correctAnswer: "Buscar correos específicos"
        }
    ];

    const levelNames = {
        1: "Principiante",
        2: "Explorador",
        3: "Avanzado",
        4: "Experto"
    };

  
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        checkLevelUp();
    }

    function checkLevelUp() {
        if (score >= 50 && level === 1) {
            level = 2;
            levelElement.textContent = levelNames[2];
            showFeedback("¡Subiste de nivel! Ahora eres un Explorador. 🎉", "correct");
        } else if (score >= 100 && level === 2) {
            level = 3;
            levelElement.textContent = levelNames[3];
            showFeedback("¡Felicidades, llegaste al nivel Avanzado! 🚀", "correct");
        } else if (score >= 150 && level === 3) {
            level = 4;
            levelElement.textContent = levelNames[4];
            showFeedback("¡Eres un Experto en Gmail! ¡Increíble! 👑", "correct");
        }
    }

    function showFeedback(message, type) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback ${type}`;
        feedbackDiv.textContent = message;
        document.body.appendChild(feedbackDiv);

        setTimeout(() => {
            feedbackDiv.remove();
        }, 3000);
    }


    window.switchGame = (gameId) => {
        gameSections.forEach(section => section.classList.add('game-hidden'));
        document.getElementById(`${gameId}-game`).classList.remove('game-hidden');

        navButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`button[onclick="switchGame('${gameId}')"]`).classList.add('active');

        currentGameElement.textContent = document.querySelector(`button[onclick="switchGame('${gameId}')"]`).textContent;
      
        if (gameId === 'quiz') {
            loadQuizQuestion();
        }
    };


    const quizQuestionElement = document.getElementById('quiz-question');
    const quizOptionsElement = document.getElementById('quiz-options');
    const nextQuestionBtn = document.getElementById('next-question');

    function loadQuizQuestion() {
        if (currentQuizQuestion < quizQuestions.length) {
            const q = quizQuestions[currentQuizQuestion];
            quizQuestionElement.textContent = q.question;
            quizOptionsElement.innerHTML = '';
            nextQuestionBtn.style.display = 'none';

        
            const shuffledOptions = q.options.sort(() => Math.random() - 0.5);

            shuffledOptions.forEach(option => {
                const btn = document.createElement('button');
                btn.textContent = option;
                btn.className = 'option-btn';
                btn.onclick = () => checkQuizAnswer(btn, q.correctAnswer);
                quizOptionsElement.appendChild(btn);
            });
        } else {
            quizQuestionElement.textContent = `¡Quiz Finalizado! Obtuviste ${quizCorrectAnswers} de ${quizQuestions.length} correctas.`;
            quizOptionsElement.innerHTML = '';
            nextQuestionBtn.style.display = 'none';
            gamesCompleted.quiz = true;
            checkAllGamesCompleted();
        }
    }

    function checkQuizAnswer(selectedBtn, correctAnswer) {
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('incorrect');
            }
        });

        if (selectedBtn.textContent === correctAnswer) {
            updateScore(15);
            quizCorrectAnswers++;
            showFeedback("¡Respuesta Correcta! +15 puntos ✨", "correct");
        } else {
            showFeedback("Incorrecto. La respuesta correcta era: " + correctAnswer, "incorrect");
        }

        nextQuestionBtn.style.display = 'block';
    }

    window.nextQuestion = () => {
        currentQuizQuestion++;
        loadQuizQuestion();
    };


    const emails = document.querySelectorAll('#inbox-game .email');
    const actions = document.querySelectorAll('#inbox-game .action');
    let correctDrops = 0;

    emails.forEach(email => {
        email.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.action);
        });
    });

    actions.forEach(action => {
        action.addEventListener('dragover', (e) => {
            e.preventDefault();
            action.classList.add('hovered');
        });

        action.addEventListener('dragleave', () => {
            action.classList.remove('hovered');
        });

        action.addEventListener('drop', (e) => {
            e.preventDefault();
            action.classList.remove('hovered');
            const droppedAction = e.dataTransfer.getData('text/plain');
            const targetAction = e.target.dataset.action;

            if (droppedAction === targetAction) {
                e.target.classList.add('correct-drop');
                const emailToMove = document.querySelector(`.email[data-action="${droppedAction}"]`);
                e.target.innerHTML = `<strong>¡Correcto!</strong> ${emailToMove.textContent}`;
                emailToMove.style.display = 'none';
                correctDrops++;
            } else {
                showFeedback("¡Incorrecto! Esa no es la acción adecuada. 😕", "incorrect");
            }
        });
    });

    window.checkInboxGame = () => {
        if (correctDrops === emails.length) {
            updateScore(40);
            showFeedback("¡Bandeja organizada con éxito! 🎉 +40 puntos", "correct");
            gamesCompleted.inbox = true;
            checkAllGamesCompleted();
        } else {
            showFeedback("Aún te faltan correos por organizar. ¡Inténtalo de nuevo!", "incorrect");
        }
    };

 
    const dragElements = document.querySelectorAll('#drag-game .element');
    const dropzones = document.querySelectorAll('#drag-game .dropzone');
    let dragCorrectDrops = 0;

    dragElements.forEach(element => {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.element);
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('hovered');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('hovered');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('hovered');
            const droppedElement = e.dataTransfer.getData('text/plain');
            const targetElement = e.target.dataset.element;

            if (droppedElement === targetElement) {
                e.target.classList.add('correct-drop');
                const elementToMove = document.querySelector(`.element[data-element="${droppedElement}"]`);
                elementToMove.style.display = 'none';
                e.target.textContent = elementToMove.textContent;
                dragCorrectDrops++;
            } else {
                showFeedback("¡Esa pieza no encaja! 🤔", "incorrect");
            }
        });
    });

    window.checkDragGame = () => {
        if (dragCorrectDrops === dragElements.length) {
            updateScore(30);
            showFeedback("¡Interfaz de Gmail completa! 🎨 +30 puntos", "correct");
            gamesCompleted.drag = true;
            checkAllGamesCompleted();
        } else {
            showFeedback("¡Te faltan elementos por colocar! Sigue intentándolo. 😉", "incorrect");
        }
    };


    function checkAllGamesCompleted() {
        const allCompleted = Object.values(gamesCompleted).every(status => status);
        if (allCompleted) {
            showFeedback("¡Felicidades! ¡Has completado todas las actividades del Módulo 1! 🏅", "correct");
           
        }
    }

  
    switchGame('quiz');
});