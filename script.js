class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.size = 4;
        this.hasWon = false;
        this.highScore = this.loadHighScore();
        this.currentTheme = this.loadTheme();
        this.init();
        this.bindEvents();
        this.applyTheme();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.hasWon = false;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.updateScore();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.trackEvent('game_start');
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
        document.getElementById('high-score').textContent = this.highScore;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            document.getElementById('high-score').textContent = this.highScore;
        }
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
            this.moveCount++;
            
            // Check for win (only show once)
            if (!this.hasWon && this.checkWin()) {
                this.hasWon = true;
                this.trackEvent('game_win', { score: this.score, moves: this.moveCount });
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
            this.trackEvent('game_over', { 
                score: this.score, 
                moves: this.moveCount,
                duration: Math.round((Date.now() - this.startTime) / 1000)
            });
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
            
            let moveAttempted = false;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > 30) {
                    this.addSwipeEffect();
                    this.move(diffX > 0 ? 'left' : 'right');
                    moveAttempted = true;
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > 30) {
                    this.addSwipeEffect();
                    this.move(diffY > 0 ? 'up' : 'down');
                    moveAttempted = true;
                }
            }
            
            // Check for game over on mobile even if no move was attempted
            if (!moveAttempted && this.checkLoss()) {
                setTimeout(() => {
                    alert('Game Over! No more moves available.');
                    this.restart();
                }, 100);
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

    loadHighScore() {
        return parseInt(localStorage.getItem('2048-highscore') || '0');
    }

    saveHighScore() {
        localStorage.setItem('2048-highscore', this.highScore.toString());
    }

    shareScore() {
        const text = `I scored ${this.score} points in 2048! Can you beat it?`;
        if (navigator.share) {
            navigator.share({
                title: '2048 Game',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.href}`);
            alert('Score copied to clipboard!');
        }
    }

    loadTheme() {
        return localStorage.getItem('2048-theme') || 'default';
    }

    saveTheme() {
        localStorage.setItem('2048-theme', this.currentTheme);
    }

    toggleTheme() {
        const themes = ['default', 'theme-dark', 'theme-neon'];
        const currentIndex = themes.indexOf(this.currentTheme);
        this.currentTheme = themes[(currentIndex + 1) % themes.length];
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        document.body.className = this.currentTheme === 'default' ? '' : this.currentTheme;
    }

    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    async toggleLeaderboard() {
        const leaderboard = document.getElementById('leaderboard');
        if (leaderboard.classList.contains('hidden')) {
            leaderboard.classList.remove('hidden');
            await this.loadLeaderboard();
        } else {
            leaderboard.classList.add('hidden');
        }
    }

    async loadLeaderboard() {
        const listElement = document.getElementById('leaderboard-list');
        listElement.innerHTML = 'Loading...';
        
        try {
            // Replace with your actual API Gateway URL after deployment
            const response = await fetch('API_GATEWAY_URL/leaderboard');
            const scores = await response.json();
            
            if (scores.length === 0) {
                listElement.innerHTML = '<p>No scores yet. Be the first!</p>';
                return;
            }
            
            listElement.innerHTML = scores.map((score, index) => 
                `<div class="leaderboard-entry">
                    <span>#${index + 1} ${score.playerName}</span>
                    <span>${score.score.toLocaleString()}</span>
                </div>`
            ).join('');
        } catch (error) {
            listElement.innerHTML = '<p>Failed to load leaderboard</p>';
            console.error('Leaderboard error:', error);
        }
    }

    async submitScore() {
        const playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        if (this.score === 0) {
            alert('Play a game first!');
            return;
        }
        
        try {
            // Replace with your actual API Gateway URL after deployment
            const response = await fetch('API_GATEWAY_URL/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerName,
                    score: this.score
                })
            });
            
            if (response.ok) {
                alert('Score submitted successfully!');
                document.getElementById('player-name').value = '';
                await this.loadLeaderboard();
            } else {
                alert('Failed to submit score');
            }
        } catch (error) {
            alert('Failed to submit score');
            console.error('Submit score error:', error);
        }
    }

    restart() {
        this.init();
    }
}

const game = new Game2048();