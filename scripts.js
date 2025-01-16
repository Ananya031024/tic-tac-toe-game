const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');
const difficultySelect = document.getElementById('difficulty');
const playAgainstAI = document.getElementById('playAgainstAI');
const playAgainstPlayer = document.getElementById('playAgainstPlayer');

let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let gameMode = ''; // 'player' or 'ai'
let difficulty = 'medium'; // 'easy', 'medium', 'hard'
let score = { X: 0, O: 0, draw: 0 };

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Minimax Algorithm for AI (Hard)
function minimax(boardState, depth, isMaximizingPlayer) {
    let winner = checkWinner();
    if (winner === 'X') return -10 + depth;
    if (winner === 'O') return 10 - depth;
    if (!boardState.includes('')) return 0;

    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = isMaximizingPlayer ? 'O' : 'X';
            let score = minimax(boardState, depth + 1, !isMaximizingPlayer);
            boardState[i] = '';
            bestScore = isMaximizingPlayer ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }
    return bestScore;
}

// AI Move Function (Hard)
function aiMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = 'O';
            let score = minimax(boardState, 0, false);
            boardState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== null) {
        boardState[move] = 'O';
        cells[move].textContent = 'O';
        checkWinner();
        switchPlayer();
    }
}

// Difficulty-specific AI behavior (Easy/Medium/Hard)
function aiMoveByDifficulty() {
    if (difficulty === 'easy') {
        easyAI();
    } else if (difficulty === 'medium') {
        mediumAI();
    } else if (difficulty === 'hard') {
        aiMove();
    }
}

// Easy AI - random move
function easyAI() {
    let availableMoves = [];
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            availableMoves.push(i);
        }
    }
    if (availableMoves.length > 0) {
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        boardState[randomMove] = 'O';
        cells[randomMove].textContent = 'O';
        checkWinner();
        switchPlayer();
    }
}

// Medium AI - Block winning move, or random
function mediumAI() {
    let bestMove = null;
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = 'O';
            if (checkWinner() === 'O') {
                bestMove = i;
                break;
            }
            boardState[i] = '';
        }
    }

    if (bestMove === null) {
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'X';
                if (checkWinner() === 'X') {
                    bestMove = i;
                    break;
                }
                boardState[i] = '';
            }
        }
    }

    if (bestMove === null) {
        easyAI();
    } else {
        boardState[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
        checkWinner();
        switchPlayer();
    }
}

// Switch player turn
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameMode === 'player') {
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    } else if (gameMode === 'ai' && currentPlayer === 'X') {
        statusDisplay.textContent = `Player X's Turn (AI is Player O)`;
        aiMoveByDifficulty();
    }
}

// Check winner
function checkWinner() {
    let winner = null;

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            winner = boardState[a];
            break;
        }
    }

    if (winner) {
        gameActive = false;
        statusDisplay.textContent = `${winner} Wins!`;
        updateScore(winner);
        return winner;
    }

    if (!boardState.includes('')) {
        gameActive = false;
        statusDisplay.textContent = "It's a Draw!";
        updateScore('draw');
    }

    return null;
}

// Update score after each game
function updateScore(winner) {
    if (winner === 'X') {
        score.X++;
        scoreX.textContent = score.X;
    } else if (winner === 'O') {
        score.O++;
        scoreO.textContent = score.O;
    } else {
        score.draw++;
        scoreDraw.textContent = score.draw;
    }
}

// Restart Game
function restartGame() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    cells.forEach(cell => cell.textContent = '');
    statusDisplay.textContent = "Player X's Turn";
}

// Set game mode
function setGameMode(mode) {
    gameMode = mode;
    restartGame();
    if (gameMode === 'ai' && currentPlayer === 'X') {
        statusDisplay.textContent = "Player X's Turn (AI is Player O)";
        aiMoveByDifficulty();
    }
}

// Set difficulty level
function setDifficulty(level) {
    difficulty = level;
}

// Handle cell click
function handleCellClick(index) {
    if (boardState[index] !== '' || !gameActive) return;

    boardState[index] = currentPlayer;
    cells[index].textContent = currentPlayer;

    checkWinner();

    if (gameActive && gameMode === 'ai' && currentPlayer === 'X') {
        switchPlayer();
        aiMoveByDifficulty();
    } else {
        switchPlayer();
    }
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});

// Event listeners for buttons
restartBtn.addEventListener('click', restartGame);
playAgainstAI.addEventListener('click', () => setGameMode('ai'));
playAgainstPlayer.addEventListener('click', () => setGameMode('player'));
difficultySelect.addEventListener('change', () => setDifficulty(difficultySelect.value));

statusDisplay.textContent = "Player X's Turn";

