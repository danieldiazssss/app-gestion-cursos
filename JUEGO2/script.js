

const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const nextPieceContext = nextPieceCanvas.getContext('2d');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    '#ff0040', '#ff8000', '#ffff00',
    '#00ff80', '#0080ff', '#8000ff', '#ff00ff'
];

const PIECES = [
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]], 
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]], 
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], 
    [[1, 1], [1, 1]],             
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], 
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], 
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]]  
];

let board = [];
let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isGameRunning = false;
let animationFrameId;


function createBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece() {
    const randomPiece = Math.floor(Math.random() * PIECES.length);
    const shape = PIECES[randomPiece];
    return {
        shape,
        color: randomPiece + 1,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0 
    };
}

function drawPiece(ctx, piece) {
    if (!piece) return;
    const { shape, x, y, color } = piece;
    shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value > 0 && y + r >= 0) {
                const blockX = (x + c) * BLOCK_SIZE;
                const blockY = (y + r) * BLOCK_SIZE;

                ctx.shadowColor = COLORS[color - 1];
                ctx.shadowBlur = 10;
                const gradient = ctx.createLinearGradient(blockX, blockY, blockX + BLOCK_SIZE, blockY + BLOCK_SIZE);
                gradient.addColorStop(0, COLORS[color - 1]);
                gradient.addColorStop(1, '#222');

                ctx.fillStyle = gradient;
                ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);

                ctx.strokeStyle = COLORS[color - 1];
                ctx.lineWidth = 2;
                ctx.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);

                ctx.shadowBlur = 0;
            }
        });
    });
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 10, 20, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 10, 0.9)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value > 0) {
                const blockX = c * BLOCK_SIZE;
                const blockY = r * BLOCK_SIZE;

                context.shadowColor = COLORS[value - 1];
                context.shadowBlur = 8;

                const gradient = context.createLinearGradient(blockX, blockY, blockX + BLOCK_SIZE, blockY + BLOCK_SIZE);
                gradient.addColorStop(0, COLORS[value - 1]);
                gradient.addColorStop(1, '#111');

                context.fillStyle = gradient;
                context.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);

                context.strokeStyle = COLORS[value - 1];
                context.lineWidth = 1;
                context.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);

                context.shadowBlur = 0;
            }
        });
    });

    drawPiece(context, currentPiece);
}

function drawNextPiece() {
    nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    nextPieceContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    if (nextPiece) {
        const preview = { ...nextPiece, x: 1, y: 1 };
        drawPiece(nextPieceContext, preview);
    }
}


function dropPiece() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        lockPiece();
        checkLines();


        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();

     
        if (collision()) {
            isGameOver = true;
            endGame();
            return;
        }
    }
}

function lockPiece() {
    const { shape, x, y, color } = currentPiece;

    shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value > 0) {
               
                if (y + r >= 0 && y + r < ROWS && x + c >= 0 && x + c < COLS) {
                    board[y + r][x + c] = color;
                }
            }
        });
    });
}

function collision() {
    const { shape, x, y } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] > 0) {
                let newX = x + c;
                let newY = y + r;
                if (
                    newX < 0 || newX >= COLS || newY >= ROWS ||
                    (newY >= 0 && board[newY][newX] > 0)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rotatePiece() {
    const { shape } = currentPiece;
    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    currentPiece.shape = rotated;
    if (collision()) {
        currentPiece.shape = shape; 
    }
}

function checkLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(v => v > 0)) {
            linesCleared++;
            for (let y = r; y > 0; y--) {
                board[y] = [...board[y - 1]];
            }
            board[0].fill(0);
            r++;
        }
    }
    if (linesCleared > 0) {
        addLineCompleteEffect();
        updateScore(linesCleared);
    }
}

function updateScore(lines) {
    const scoreMap = [0, 100, 300, 500, 800];
    score += scoreMap[lines];
    scoreElement.textContent = score;

    if (score >= level * 1000) {
        level++;
        levelElement.textContent = level;
        dropInterval = Math.max(dropInterval * 0.9, 100);
    }
}

function update(time = 0) {
    if (!isGameRunning || isGameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        dropPiece();
        dropCounter = 0;
    }

    drawBoard();
    animationFrameId = requestAnimationFrame(update);
}


document.addEventListener('keydown', e => {
    if (!isGameRunning || isGameOver) return;
    if (e.key === 'ArrowLeft') {
        currentPiece.x--;
        if (collision()) currentPiece.x++;
    } else if (e.key === 'ArrowRight') {
        currentPiece.x++;
        if (collision()) currentPiece.x--;
    } else if (e.key === 'ArrowDown') {
        dropPiece();
    } else if (e.key === 'ArrowUp' || e.key === ' ') {
        rotatePiece();
    }
    drawBoard();
});


window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
});


function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    isGameOver = false;
    score = 0;
    level = 1;
    dropInterval = 1000;
    scoreElement.textContent = '0';
    levelElement.textContent = '1';
    createBoard();
    currentPiece = createPiece();
    nextPiece = createPiece();
    drawNextPiece();
    update();
    startButton.style.display = 'none';
    if (gameOverOverlay) gameOverOverlay.style.display = 'none';
}

function endGame() {
    isGameRunning = false;
    isGameOver = true;
    cancelAnimationFrame(animationFrameId);
    

    setTimeout(() => {
        alert("¡Game Over! 😵 Tu puntuación final: " + score);
    }, 100);
    

    if (gameOverOverlay && finalScoreElement) {
        finalScoreElement.textContent = score;
        gameOverOverlay.style.display = 'flex';
    }
    

    startButton.style.display = 'block';
}

function restartGame() {
    startButton.style.display = 'block';
    if (gameOverOverlay) gameOverOverlay.style.display = 'none';
    startGame();
}

startButton.addEventListener('click', startGame);
if (restartButton) restartButton.addEventListener('click', restartGame);


function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        particlesContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 8000);
    }, 300);
}

function addLineCompleteEffect() {
    canvas.style.filter = 'brightness(1.5) saturate(2)';
    setTimeout(() => {
        canvas.style.filter = 'brightness(1) saturate(1)';
    }, 200);
}


drawNextPiece();
createParticles();