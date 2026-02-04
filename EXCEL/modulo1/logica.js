
        let currentScore = 0;
        let currentQuestionIndex = 0;
        let currentGame = 'quiz';
        let memoryCards = [];
        let flippedCards = [];
        let memoryTime = 0;
        let memoryAttempts = 0;
        let memoryTimer;
        let dragCorrectCount = 0;
        let selectedCell = null;
        let spreadsheetData = {};


        const quizQuestions = [{
            question: "📊 ¿Cuál es la extensión principal de los archivos de Excel?",
            options: [".txt", ".xlsx", ".pdf", ".doc"],
            correct: 1,
            explanation: "¡Correcto! .xlsx es la extensión moderna de Excel desde 2007"
        }, {
            question: "🧮 ¿Qué símbolo debe ir al inicio de una fórmula en Excel?",
            options: ["#", "=", "@", "$"],
            correct: 1,
            explanation: "¡Perfecto! El signo = indica que es una fórmula"
        }, {
            question: "📊 ¿Cuál es la función correcta para sumar un rango en Excel?",
            options: ["SUMAR(A1:A5)", "SUMA(A1:A5)", "ADD(A1:A5)", "TOTAL(A1:A5)"],
            correct: 1,
            explanation: "¡Excelente! SUMA() es la función correcta en español"
        }, {
            question: "🔢 ¿Cómo se llama la intersección de una fila y columna?",
            options: ["Campo", "Celda", "Registro", "Dato"],
            correct: 1,
            explanation: "¡Muy bien! Una celda es donde se cruzan fila y columna"
        }, {
            question: "📈 ¿Qué función usarías para encontrar el valor más grande en un rango de celdas?",
            options: ["GRANDE()", "MAX()", "SUPER()", "ALTO()"],
            correct: 1,
            explanation: "Correcto, la función MAX() devuelve el valor máximo de un conjunto de datos"
        }];

        const excelParts = [
            { name: "Barra de fórmulas", key: "barra-formulas" },
            { name: "Pestañas de hojas", key: "hojas" },
            { name: "Celda activa", key: "celda-activa" },
            { name: "Barra de menús", key: "barra-menus" }
        ];
        let currentPartIndex = 0;


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
            setTimeout(() => {
                popup.remove();
            }, 1500);
        }

        function updateLevel() {
            let level = 'Principiante';
            if (currentScore >= 50 && currentScore < 100) {
                level = 'Intermedio';
            } else if (currentScore >= 100) {
                level = 'Experto';
            }
            document.getElementById('level').textContent = level;
        }


        function switchGame(gameId) {
            const gameSections = document.querySelectorAll('.game-section');
            gameSections.forEach(section => {
                section.classList.add('game-hidden');
            });

            document.getElementById(`${gameId}-game`).classList.remove('game-hidden');
            document.getElementById('current-game').textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);

            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.nav-btn[onclick="switchGame('${gameId}')"]`).classList.add('active');

         
            if (gameId === 'quiz') loadQuizQuestion();
            if (gameId === 'match') resetMatchGame();
            if (gameId === 'formula') resetFormulaGame();
            if (gameId === 'identify') resetIdentifyGame();
        }

     
        function loadQuizQuestion() {
            const questionElement = document.getElementById('quiz-question');
            const optionsElement = document.getElementById('quiz-options');
            const nextBtn = document.getElementById('next-question');
            nextBtn.style.display = 'none';
            optionsElement.innerHTML = '';

            if (currentQuestionIndex >= quizQuestions.length) {
                questionElement.textContent = "¡Has completado el Quiz! 🎉 Reiniciando...";
                optionsElement.innerHTML = `<div class="celebration">¡Misión Cumplida!</div>`;
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
                successMsg.className = 'success-message';
                successMsg.textContent = current.explanation;
                options[current.correct].appendChild(successMsg);
            } else {
    
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = current.explanation;
                options[selectedIndex].appendChild(errorMsg);
            }

            nextBtn.style.display = 'block';
        }

        function nextQuestion() {
            currentQuestionIndex++;
            loadQuizQuestion();
        }

   
        function resetMatchGame() {
            document.querySelectorAll('.match-term').forEach(term => {
                term.style.opacity = '1';
                term.style.textDecoration = 'none';
            });

 
            setupMatchDragAndDrop();
        }

        function setupMatchDragAndDrop() {
            const terms = document.querySelectorAll('.match-term');
            const definitions = document.querySelectorAll('.match-definition');

            terms.forEach(term => {
                term.setAttribute('draggable', 'true');

                term.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', this.getAttribute('data-match'));
                    this.classList.add('dragging');
                });

                term.addEventListener('dragend', function () {
                    this.classList.remove('dragging');
                });
            });

            definitions.forEach(def => {
                def.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    this.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
                });

                def.addEventListener('dragleave', function () {
                    this.style.backgroundColor = '';
                });

                def.addEventListener('drop', function (e) {
                    e.preventDefault();
                    this.style.backgroundColor = '';

                    const matchId = e.dataTransfer.getData('text/plain');
                    const term = document.querySelector(`.match-term[data-match="${matchId}"]`);

                    if (this.getAttribute('data-match') === matchId) {
                        this.appendChild(term);
                        term.style.opacity = '0.7';
                    }
                });
            });
        }

        function checkMatchGame() {
            let allCorrect = true;

            document.querySelectorAll('.match-definition').forEach(def => {
                const matchId = def.getAttribute('data-match');
                const term = def.querySelector('.match-term');

                if (!term || term.getAttribute('data-match') !== matchId) {
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                updateScore(30);
                alert("¡Perfecto! Has relacionado todos los conceptos correctamente.");
            } else {
                alert("Algunas relaciones no son correctas. ¡Intenta de nuevo!");
            }
        }


        function resetFormulaGame() {
            document.querySelectorAll('.formula-dropzone').forEach(zone => {
                zone.innerHTML = '';
                zone.classList.remove('correct', 'incorrect');
            });

     
            setupFormulaDragAndDrop();
        }

        function setupFormulaDragAndDrop() {
            const pieces = document.querySelectorAll('.formula-piece');
            const dropZones = document.querySelectorAll('.formula-dropzone');

            pieces.forEach(piece => {
                piece.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', this.getAttribute('data-value'));
                    this.classList.add('dragging');
                });

                piece.addEventListener('dragend', function () {
                    this.classList.remove('dragging');
                });
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    this.classList.add('drag-over');
                });

                zone.addEventListener('dragleave', function () {
                    this.classList.remove('drag-over');
                });

                zone.addEventListener('drop', function (e) {
                    e.preventDefault();
                    this.classList.remove('drag-over');

                    const value = e.dataTransfer.getData('text/plain');
                    const piece = document.querySelector(`.formula-piece[data-value="${value}"]`);

               
                    if (this.children.length === 0) {
                        const clone = piece.cloneNode(true);
                        clone.setAttribute('draggable', 'false');
                        this.appendChild(clone);
                    }
                });
            });
        }

        function checkFormulaGame() {
            let allCorrect = true;

            document.querySelectorAll('.formula-dropzone').forEach(zone => {
                const expected = zone.getAttribute('data-expected');
                const piece = zone.querySelector('.formula-piece');

                if (piece && piece.getAttribute('data-value') === expected) {
                    zone.classList.add('correct');
                    zone.classList.remove('incorrect');
                } else {
                    zone.classList.add('incorrect');
                    zone.classList.remove('correct');
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                updateScore(25);
                alert("¡Fórmula correcta! 🎉");
            } else {
                alert("Revisa las partes de la fórmula. Algo no está bien.");
            }
        }


        function resetIdentifyGame() {
            currentPartIndex = 0;
            document.getElementById('target-part').textContent = excelParts[0].name;
        }

        function nextIdentifyPart() {
            currentPartIndex = (currentPartIndex + 1) % excelParts.length;
            document.getElementById('target-part').textContent = excelParts[currentPartIndex].name;
        }

        document.addEventListener('click', function (e) {
            if (currentGame === 'identify') {
                const targetPart = excelParts[currentPartIndex].key;

              
                if (e.target.tagName === 'IMG') {
                    updateScore(15);
                    alert(`¡Correcto! Has identificado la ${excelParts[currentPartIndex].name}`);
                    nextIdentifyPart();
                }
            }
        });

 
        const video = document.querySelector('video');
        const playButton = document.querySelector('.play-button');
        const overlay = document.querySelector('.video-overlay');

        function togglePlay() {
            if (video.paused) {
                video.play();
                overlay.style.opacity = 0;
            } else {
                video.pause();
                overlay.style.opacity = 1;
            }
        }

        video.addEventListener('play', () => {
            playButton.style.display = 'none';
        });

        video.addEventListener('pause', () => {
            playButton.style.display = 'flex';
        });

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                video.requestFullscreen().catch(err => {
                    alert(`Error al intentar el modo de pantalla completa: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }

        function toggleMute() {
            video.muted = !video.muted;
            const btn = document.querySelector('.control-btn:nth-child(2)');
            btn.textContent = video.muted ? 'Desilenciar' : 'Silenciar';
        }

        let playbackSpeed = 1;

        function changeSpeed() {
            playbackSpeed = playbackSpeed === 1 ? 1.5 : (playbackSpeed === 1.5 ? 2 : 1);
            video.playbackRate = playbackSpeed;
            const btn = document.querySelector('.control-btn:nth-child(3)');
            btn.textContent = `Velocidad: x${playbackSpeed}`;
        }

 
        document.addEventListener('DOMContentLoaded', () => {
            loadQuizQuestion();
            setupMatchDragAndDrop();
            setupFormulaDragAndDrop();
            resetIdentifyGame();
        });