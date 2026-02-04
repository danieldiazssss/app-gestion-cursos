// -------------------------------
//   AHORCADO GENERAL / MUNDIAL
// -------------------------------

// Palabras variadas de cultura general, países, objetos, animales, comidas, curiosidades, etc.
const words = [
    "ELEFANTE", "MANZANA", "JAPON", "SUSHI", "VIKINGO",
    "EVEREST", "PINGUINO", "FUTBOL", "KOALA", "ORQUESTA",
    "PIRAMIDE", "UNIVERSO", "MICROSCOPIO", "FARAON", "ESPACIO",
    "GUITARRA", "TELESCOPIO", "HURACAN", "TORTUGA", "BRASIL",
    "COLOMBIA", "ARGENTINA", "MEXICO", "CHINA", "RUSIA",
    "INDONESIA", "CANADA", "EGIPTO", "GRECIA", "KENIA",
    "AREPA", "TAMAL", "PAELLA", "RAMEN", "PIZZA",
    "AMAZONAS", "CARIBE", "SAHARA", "OCEANO", "PLANETA",
    "GALAXIA", "COMETA", "VOLCAN", "SELVA", "GLACIAR",
    "MARIPOSA", "CANGURO", "LEOPARDO", "DELFIN", "GORILA",
    "ROBLES", "MURCIELAGO", "CASCADA", "TEMPLO", "CASTILLO",
    "ESMERALDA", "RUBI", "DIAMANTE", "DRAGON", "UNICORNIO",
    "BIBLIOTECA", "MUSEO", "TEATRO", "HOSPITAL", "AEROPUERTO",
    "AVION", "BARCO", "CARRO", "MOTOCICLETA", "TREN",
    "PINTURA", "ESCULTURA", "CINE", "POESIA", "HISTORIA",
    "MITOLOGIA", "LENGUAJE", "MATEMATICAS", "BIOLOGIA", "QUIMICA",
    "TIGRE", "PERRO", "GATO", "CABALLO", "PANDA",
    "ZORRO", "RANA", "JIRAFA", "BUFALO", "AGUILA",
    "TORTA", "CHOCOLATE", "HELADO", "CAFETERIA", "PANADERIA",
    "SATURNO", "JUPITER", "MARTE", "NEPTUNO", "VENUS",
    "LLAMA", "CONEJO", "CANGREJO", "BALLENA", "LEON"
];

let currentWord = "";
let guessedWord = [];
let wrongGuesses = 0;
let gameEnded = false;
const maxWrongGuesses = 6;

// Elementos del DOM
const wordDisplay = document.getElementById("word-display");
const messageDisplay = document.getElementById("message");
const lettersContainer = document.getElementById("letters-container");
const gameEndModal = document.getElementById("game-end-modal");
const modalTitle = document.getElementById("modal-title");
const modalWord = document.getElementById("modal-word");
const restartBtn = document.getElementById("restart-btn");
const stickmanParts = document.querySelectorAll(".stickman-part");

// Inicializar juego
function initGame() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    guessedWord = Array(currentWord.length).fill("_");
    wrongGuesses = 0;
    gameEnded = false;

    updateWordDisplay();
    createLetterButtons();
    hideStickmanParts();
    messageDisplay.textContent = "¡Adivina la palabra!";
    gameEndModal.style.display = "none";
}

// Actualizar la palabra en pantalla
function updateWordDisplay() {
    wordDisplay.textContent = guessedWord.join(" ");
}

// Crear botones de letras
function createLetterButtons() {
    lettersContainer.innerHTML = "";
    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

    for (let letter of alphabet) {
        const button = document.createElement("button");
        button.className = "letter-btn";
        button.textContent = letter;
        button.addEventListener("click", () => guessLetter(letter, button));
        lettersContainer.appendChild(button);
    }
}

// Lógica para adivinar letras
function guessLetter(letter, button) {
    if (gameEnded || button.disabled) return;

    button.disabled = true;

    if (currentWord.includes(letter)) {
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === letter) {
                guessedWord[i] = letter;
            }
        }
        updateWordDisplay();
        messageDisplay.textContent = "¡Correcto! 🎯";

        if (!guessedWord.includes("_")) {
            endGame(true);
        }
    } else {
        wrongGuesses++;
        showStickmanPart(wrongGuesses - 1);
        messageDisplay.textContent = `Fallaste... Intentos restantes: ${maxWrongGuesses - wrongGuesses}`;

        if (wrongGuesses >= maxWrongGuesses) {
            endGame(false);
        }
    }
}

// Mostrar parte del ahorcado
function showStickmanPart(index) {
    if (index < stickmanParts.length) {
        stickmanParts[index].classList.add("show");
    }
}

// Ocultar partes
function hideStickmanParts() {
    stickmanParts.forEach(part => part.classList.remove("show"));
}

// Final del juego
function endGame(won) {
    gameEnded = true;

    if (won) {
        modalTitle.textContent = "¡GANASTE! 🎉";
        modalWord.textContent = `La palabra era: ${currentWord}`;
    } else {
        modalTitle.textContent = "¡PERDISTE! 💀";
        modalWord.textContent = `La palabra era: ${currentWord}`;
        guessedWord = currentWord.split("");
        updateWordDisplay();
    }

    gameEndModal.style.display = "flex";
}

// Reiniciar
restartBtn.addEventListener("click", initGame);

// Cerrar modal con ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && gameEndModal.style.display === "flex") initGame();
});

// Arrancar juego
initGame();
