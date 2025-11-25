class ConnectFour {
    constructor(rows = 12, cols = 12) {
        this.rows = rows;
        this.cols = cols;
        this.board = this.createBoard();
        this.gameOver = false;
        this.turn = 0; // 0 for Player 1 (Green), 1 for Player 2 (Yellow)
        this.aiPlayer = 1; // AI plays as Yellow
        this.depth = 3; // Default depth for Minimax
        this.winningCells = [];
    }

    createBoard() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    dropPiece(col, piece) {
        if (this.isValidLocation(col)) {
            const row = this.getNextOpenRow(col);
            this.board[row][col] = piece;
            return { row, col };
        }
        return null;
    }

    isValidLocation(col) {
        return col >= 0 && col < this.cols && this.board[this.rows - 1][col] === 0;
    }

    getNextOpenRow(col) {
        for (let r = 0; r < this.rows; r++) {
            if (this.board[r][col] === 0) {
                return r;
            }
        }
        return -1;
    }

    winningMove(piece) {
        this.winningCells = [];

        // Check horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (this.board[r][c] === piece &&
                    this.board[r][c + 1] === piece &&
                    this.board[r][c + 2] === piece &&
                    this.board[r][c + 3] === piece) {
                    this.winningCells = [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
                    return true;
                }
            }
        }

        // Check vertical
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 3; r++) {
                if (this.board[r][c] === piece &&
                    this.board[r + 1][c] === piece &&
                    this.board[r + 2][c] === piece &&
                    this.board[r + 3][c] === piece) {
                    this.winningCells = [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
                    return true;
                }
            }
        }

        // Check positive diagonal
        for (let r = 0; r < this.rows - 3; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (this.board[r][c] === piece &&
                    this.board[r + 1][c + 1] === piece &&
                    this.board[r + 2][c + 2] === piece &&
                    this.board[r + 3][c + 3] === piece) {
                    this.winningCells = [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
                    return true;
                }
            }
        }

        // Check negative diagonal
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (this.board[r][c] === piece &&
                    this.board[r - 1][c + 1] === piece &&
                    this.board[r - 2][c + 2] === piece &&
                    this.board[r - 3][c + 3] === piece) {
                    this.winningCells = [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]];
                    return true;
                }
            }
        }

        return false;
    }

    isBoardFull() {
        for (let c = 0; c < this.cols; c++) {
            if (this.board[this.rows - 1][c] === 0) {
                return false;
            }
        }
        return true;
    }

    evaluateWindow(window, piece) {
        let score = 0;
        const oppPiece = piece === 1 ? 2 : 1;

        const pieceCount = window.filter(cell => cell === piece).length;
        const emptyCount = window.filter(cell => cell === 0).length;
        const oppCount = window.filter(cell => cell === oppPiece).length;

        if (pieceCount === 4) score += 100;
        else if (pieceCount === 3 && emptyCount === 1) score += 5;
        else if (pieceCount === 2 && emptyCount === 2) score += 2;

        if (oppCount === 3 && emptyCount === 1) score -= 4;

        return score;
    }

    scorePosition(piece) {
        let score = 0;

        // Score center column
        const centerArray = this.board.map(row => row[Math.floor(this.cols / 2)]);
        const centerCount = centerArray.filter(cell => cell === piece).length;
        score += centerCount * 3;

        // Score horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [this.board[r][c], this.board[r][c + 1], this.board[r][c + 2], this.board[r][c + 3]];
                score += this.evaluateWindow(window, piece);
            }
        }

        // Score vertical
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 3; r++) {
                const window = [this.board[r][c], this.board[r + 1][c], this.board[r + 2][c], this.board[r + 3][c]];
                score += this.evaluateWindow(window, piece);
            }
        }

        // Score positive diagonal
        for (let r = 0; r < this.rows - 3; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [
                    this.board[r][c],
                    this.board[r + 1][c + 1],
                    this.board[r + 2][c + 2],
                    this.board[r + 3][c + 3]
                ];
                score += this.evaluateWindow(window, piece);
            }
        }

        // Score negative diagonal
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [
                    this.board[r][c],
                    this.board[r - 1][c + 1],
                    this.board[r - 2][c + 2],
                    this.board[r - 3][c + 3]
                ];
                score += this.evaluateWindow(window, piece);
            }
        }

        return score;
    }

    getValidLocations() {
        const validLocations = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.isValidLocation(col)) {
                validLocations.push(col);
            }
        }
        return validLocations;
    }

    isTerminalNode() {
        return this.winningMove(1) || this.winningMove(2) || this.isBoardFull();
    }

    minimax(depth, alpha, beta, maximizingPlayer) {
        const validLocations = this.getValidLocations();
        const isTerminal = this.isTerminalNode();

        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (this.winningMove(2)) {
                    return [null, 100000000000000];
                } else if (this.winningMove(1)) {
                    return [null, -10000000000000];
                } else {
                    return [null, 0];
                }
            } else {
                return [null, this.scorePosition(2)];
            }
        }

        if (maximizingPlayer) {
            let value = -Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            
            for (const col of validLocations) {
                const row = this.getNextOpenRow(col);
                const originalValue = this.board[row][col];
                this.board[row][col] = 2;
                
                const newScore = this.minimax(depth - 1, alpha, beta, false)[1];
                this.board[row][col] = originalValue;

                if (newScore > value) {
                    value = newScore;
                    column = col;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return [column, value];
        } else {
            let value = Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            
            for (const col of validLocations) {
                const row = this.getNextOpenRow(col);
                const originalValue = this.board[row][col];
                this.board[row][col] = 1;
                
                const newScore = this.minimax(depth - 1, alpha, beta, true)[1];
                this.board[row][col] = originalValue;

                if (newScore < value) {
                    value = newScore;
                    column = col;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return [column, value];
        }
    }

    aiMove() {
        const [col] = this.minimax(this.depth, -Infinity, Infinity, true);
        return col;
    }

    reset() {
        this.board = this.createBoard();
        this.gameOver = false;
        this.turn = 0;
        this.winningCells = [];
    }
}

// Global game instance
let game;
let gameMode = '';

// DOM Elements
const menuElement = document.getElementById('menu');
const gameElement = document.getElementById('game');
const gameOverElement = document.getElementById('gameOver');
const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');

function startGame(mode) {
    gameMode = mode;
    game = new ConnectFour();
    
    // Set AI difficulty
    const difficulty = document.getElementById('difficulty');
    game.depth = parseInt(difficulty.value);
    
    menuElement.classList.add('hidden');
    gameElement.classList.remove('hidden');
    
    createBoard();
    updateTurnIndicator();
}

function showMenu() {
    gameElement.classList.add('hidden');
    gameOverElement.classList.add('hidden');
    menuElement.classList.remove('hidden');
}

function restartGame() {
    game.reset();
    gameOverElement.classList.add('hidden');
    createBoard();
    updateTurnIndicator();
}

function createBoard() {
    boardElement.innerHTML = '';
    
    for (let r = game.rows - 1; r >= 0; r--) {
        for (let c = 0; c < game.cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (game.board[r][c] === 1) {
                cell.classList.add('green');
            } else if (game.board[r][c] === 2) {
                cell.classList.add('yellow');
            }
            
            // Mark winning cells
            if (game.winningCells.some(([winR, winC]) => winR === r && winC === c)) {
                cell.classList.add('winning');
            }
            
            cell.addEventListener('click', () => handleCellClick(c));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(col) {
    if (game.gameOver) return;
    
    // In PVC mode, only allow human moves when it's their turn
    if (gameMode === 'PVC' && game.turn === 1) return;
    
    const move = game.dropPiece(col, game.turn + 1);
    
    if (move) {
        updateBoard();
        
        if (game.winningMove(game.turn + 1)) {
            game.gameOver = true;
            showGameOver(game.turn + 1);
        } else if (game.isBoardFull()) {
            game.gameOver = true;
            showGameOver(0);
        } else {
            game.turn = (game.turn + 1) % 2;
            updateTurnIndicator();
            
            // AI move in PVC mode
            if (gameMode === 'PVC' && game.turn === 1 && !game.gameOver) {
                setTimeout(makeAIMove, 500);
            }
        }
    }
}

function makeAIMove() {
    if (game.gameOver) return;
    
    const col = game.aiMove();
    const move = game.dropPiece(col, 2);
    
    if (move) {
        updateBoard();
        
        if (game.winningMove(2)) {
            game.gameOver = true;
            showGameOver(2);
        } else if (game.isBoardFull()) {
            game.gameOver = true;
            showGameOver(0);
        } else {
            game.turn = 0;
            updateTurnIndicator();
        }
    }
}

function updateBoard() {
    createBoard(); // Recreate board to show updates
}

function updateTurnIndicator() {
    const colorSpan = turnIndicator.querySelector('.player-color');
    const textSpan = turnIndicator.querySelector('span:last-child');
    
    if (game.turn === 0) {
        colorSpan.className = 'player-color green';
        textSpan.textContent = "Green's Turn";
    } else {
        colorSpan.className = 'player-color yellow';
        if (gameMode === 'PVP') {
            textSpan.textContent = "Yellow's Turn";
        } else {
            textSpan.textContent = "AI's Turn (Thinking...)";
        }
    }
}

function showGameOver(winner) {
    gameOverElement.classList.remove('hidden');
    
    if (winner === 1) {
        gameOverTitle.textContent = "Game Over!";
        gameOverTitle.className = "win-green";
        gameOverMessage.innerHTML = '<span class="win-green">Green Player Wins!</span>';
    } else if (winner === 2) {
        gameOverTitle.textContent = "Game Over!";
        gameOverTitle.className = "win-yellow";
        if (gameMode === 'PVP') {
            gameOverMessage.innerHTML = '<span class="win-yellow">Yellow Player Wins!</span>';
        } else {
            gameOverMessage.innerHTML = '<span class="win-yellow">AI Wins!</span>';
        }
    } else {
        gameOverTitle.textContent = "Game Over!";
        gameOverTitle.className = "";
        gameOverMessage.textContent = "It's a Draw!";
    }
    
    // Highlight winning cells
    createBoard();
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    console.log("Connect Four 12x12 loaded successfully!");
});