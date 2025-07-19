class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.size = 4;
        this.init();
        this.bindEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScore();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        const container = document.querySelector('.tile-container');
        container.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    tile.style.left = `${j * 117 + 10}px`;
                    tile.style.top = `${i * 117 + 10}px`;
                    container.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    move(direction) {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const row = direction === 'left' ? newGrid[i] : newGrid[i].slice().reverse();
                const newRow = this.processLine(row);
                if (direction === 'left') {
                    newGrid[i] = newRow;
                } else {
                    newGrid[i] = newRow.reverse();
                }
                if (JSON.stringify(this.grid[i]) !== JSON.stringify(newGrid[i])) {
                    moved = true;
                }
            }
        } else {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    column.push(newGrid[i][j]);
                }
                const processedColumn = direction === 'up' ? this.processLine(column) : this.processLine(column.reverse()).reverse();
                for (let i = 0; i < this.size; i++) {
                    if (this.grid[i][j] !== processedColumn[i]) {
                        moved = true;
                    }
                    newGrid[i][j] = processedColumn[i];
                }
            }
        }

        if (moved) {
            this.grid = newGrid;
            
            // Check for win
            if (this.checkWin()) {
                setTimeout(() => {
                    if (confirm('You won! Reached 2048! Continue playing?')) {
                        // Continue playing
                    } else {
                        this.restart();
                    }
                }, 100);
            }
            
            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
        }
        
        // Always check for loss after any move attempt
        if (this.checkLoss()) {
            setTimeout(() => {
                alert('Game Over! No more moves available.');
                this.restart();
            }, 100);
        }
    }

    processLine(line) {
        const filtered = line.filter(val => val !== 0);
        const merged = [];
        let i = 0;
        
        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                merged.push(filtered[i] * 2);
                this.score += filtered[i] * 2;
                i += 2;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }
        
        while (merged.length < this.size) {
            merged.push(0);
        }
        
        return merged;
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });

        // Touch events for mobile
        let startX, startY;
        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.createRipple(e.touches[0].clientX, e.touches[0].clientY);
        });
        
        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > 30) {
                    this.addSwipeEffect();
                    this.move(diffX > 0 ? 'left' : 'right');
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > 30) {
                    this.addSwipeEffect();
                    this.move(diffY > 0 ? 'up' : 'down');
                }
            }
            
            startX = startY = null;
        });
    }

    createRipple(x, y) {
        const gameContainer = document.querySelector('.game-container');
        const rect = gameContainer.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x - rect.left - 20}px`;
        ripple.style.top = `${y - rect.top - 20}px`;
        gameContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    addSwipeEffect() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            gameContainer.style.transform = 'scale(1)';
        }, 100);
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkLoss() {
        // Check if grid is full
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        return true;
    }

    restart() {
        this.init();
    }
}

const game = new Game2048();